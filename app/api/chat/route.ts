import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText, tool } from "ai"
import { prisma } from "@/lib/prisma"
import { inngest } from "@/inngest/client"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  console.log("Chat API hit");
  const { userId } = await auth()
  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { messages, projectId } = await req.json()

  // Validate project access
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { author: true }
  })

  if (!project) {
    return new Response("Project not found", { status: 404 })
  }

  // Get the latest message content
  const latestMessage = messages[messages.length - 1]

  // Save the user's message to the database
  if (latestMessage.role === "user") {
    await prisma.chatMessage.create({
      data: {
        role: "user",
        content: latestMessage.content,
        projectId,
      }
    })
  }

  const systemPrompt = `You are a friendly, direct AI bot assisting the user with their motion graphics video titled "${project.title}".
You are talking DIRECTLY to the user. Never refer to the user in the third person (e.g., do NOT say "The user said..."). Always address them as "you".

Current prompt used for this video: ${project.prompt}

When the user asks to make a change:
1. If the request is ambiguous, reply directly to the user asking for clarification (e.g. "What color would you like the background to be?").
2. Once you clearly understand what they want, invoke the \`modifyVideo\` tool with the detailed instructions.
3. Do not call the tool if you are still clarifying.

Be concise, friendly, and helpful. Do not output raw code directly to the user.`

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  })

  const result = await streamText({
    model: google("gemma-4-31b-it"),
    system: systemPrompt,
    messages,
    tools: {
      modifyVideo: tool({
        description: "Trigger a background job to patch the video code with the requested changes. Only call this when the user's request is clear and confirmed.",
        parameters: z.object({
          editInstruction: z.string().describe("A detailed, explicit instruction of what needs to be changed in the video code based on the conversation."),
        }),
        execute: async ({ editInstruction }) => {
          // 1. Create a version snapshot of the current state
          const versionCount = await prisma.projectVersion.count({
            where: { projectId: project.id }
          })
          
          await prisma.projectVersion.create({
            data: {
              version: versionCount + 1,
              projectId: project.id,
              prompt: project.prompt,
              themeConfig: project.themeConfig || {},
              remotionCode: project.remotionCode,
            }
          })

          // 2. Update status to pending
          await prisma.project.update({
            where: { id: project.id },
            data: { status: "pending" }
          })

          // 3. Dispatch Inngest event
          await inngest.send({
            name: "project/modify.video",
            data: { 
              projectId: project.id,
              editInstruction
            }
          })

          return "Video modification job has been successfully triggered. The video is now regenerating."
        },
      }),
    },
    onFinish: async (event) => {
      // Save the AI's response to the database
      // The content might be empty if it only called a tool, so we handle both
      let content = event.text
      if (!content && event.toolCalls && event.toolCalls.length > 0) {
        content = "I'm updating your video now! Please wait a moment while it regenerates."
      }

      if (content) {
        await prisma.chatMessage.create({
          data: {
            role: "ai",
            content: content,
            projectId,
          }
        })
      }
    }
  })

  return result.toDataStreamResponse()
}
