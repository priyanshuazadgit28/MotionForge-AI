"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { inngest } from "@/inngest/client"
import { aj } from "@/lib/arcjet"
import { request } from "@arcjet/next"

export async function createProject(prompt: string, duration: string, ratio: string) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }

  // ArcJet Protection: Extract request context for Server Actions
  const req = await request()
  let decision;
  try {
    console.log("Calling aj.protect...");
    decision = await aj.protect(req, { userId })
    console.log("aj.protect succeeded.");
  } catch (error) {
    console.error("aj.protect failed:", error);
    throw new Error("ArcJet fetch failed");
  }
  
  if (decision.isDenied()) {
    throw new Error("Too many requests. Please slow down and try again.")
  }

  if (!prompt || !duration || !ratio) {
    throw new Error("Missing required fields")
  }

  // Fetch the Prisma user using the Clerk ID
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    throw new Error("User not found in database. Please sign in again.")
  }

  // Credit Check logic
  const REQUIRED_CREDITS = 0
  if (user.credits < REQUIRED_CREDITS) {
    throw new Error(`Insufficient credits. You need ${REQUIRED_CREDITS} credits, but only have ${user.credits}.`)
  }

  // Atomically deduct credits to prevent race conditions
  await prisma.user.update({
    where: { id: user.id },
    data: { credits: { decrement: REQUIRED_CREDITS } },
  })

  // Generate a basic title from the prompt (up to 30 chars)
  let title = prompt.trim().substring(0, 30)
  if (prompt.length > 30) {
    title += "..."
  }
  
  // Generate a random gradient for the thumbnail placeholder
  const thumbnailGradient = `linear-gradient(135deg, oklch(${Math.random() * 0.2 + 0.1} ${Math.random() * 0.1 + 0.05} ${Math.random() * 360}) 0%, oklch(${Math.random() * 0.3 + 0.1} ${Math.random() * 0.15 + 0.1} ${Math.random() * 360}) 100%)`

  const project = await prisma.project.create({
    data: {
      title,
      prompt,
      duration,
      ratio,
      thumbnailGradient,
      authorId: user.id,
      status: "pending",
      views: 0,
      likes: 0,
    },
  })

  // Dispatch the background generation job
  try {
    console.log("Calling inngest.send...");
    await inngest.send({
      name: "project/generate.video",
      data: { projectId: project.id },
    })
    console.log("inngest.send succeeded.");
  } catch (error) {
    console.error("inngest.send failed:", error);
    throw new Error("Inngest fetch failed");
  }

  // Next.js redirect throws a special error, so it should not be wrapped in a try/catch
  redirect(`/project/${project.id}`)
}

export async function modifyProject(projectId: string, newPrompt: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // ArcJet Protection: Extract request context for Server Actions
  const req = await request()
  const decision = await aj.protect(req, { userId })
  
  if (decision.isDenied()) {
    throw new Error("Too many requests. Please slow down and try again.")
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) throw new Error("User not found in database.")

  // Credit Check logic for Modifications (0 credits)
  const REQUIRED_CREDITS = 0
  if (user.credits < REQUIRED_CREDITS) {
    throw new Error(`Insufficient credits. You need ${REQUIRED_CREDITS} credits to modify, but only have ${user.credits}.`)
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw new Error("Project not found")
  if (project.authorId !== user.id) throw new Error("Unauthorized to modify this project")

  // Atomically deduct credits
  await prisma.user.update({
    where: { id: user.id },
    data: { credits: { decrement: REQUIRED_CREDITS } }
  })

  // Update project status and prompt
  await prisma.project.update({
    where: { id: projectId },
    data: {
      prompt: newPrompt,
      status: "pending",
    }
  })

  // Trigger Inngest to regenerate
  await inngest.send({
    name: "project/generate.video",
    data: { projectId: project.id },
  })
  
  return { success: true }
}
