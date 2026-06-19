import { inngest } from "./client"
import { prisma } from "@/lib/prisma"
import { GoogleGenAI } from "@google/genai"

// Initialize Gemini client (requires process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI({})

export const generateVideoComponent = inngest.createFunction(
  {
    id: "generate-video-component",
    triggers: [{ event: "project/generate.video" }]
  },
  async ({ event, step }) => {
    const { projectId } = event.data

    // Step 1: Get Project from DB
    const project = await step.run("get-project", async () => {
      const p = await prisma.project.findUnique({ where: { id: projectId } })
      if (!p) throw new Error(`Project ${projectId} not found`)
      return p
    })

    // Step 2: Generate Prompt
    await step.run("update-status-prompt", async () => {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "generating_prompt" },
      })
    })

    const aiPrompt = await step.run("generate-ai-prompt", async () => {
      const response = await ai.models.generateContent({
        model: "gemma-4-31b-it",
        contents: `You are an expert motion graphic director. The user wants a motion graphic video based on this prompt: "${project.prompt}". The video will be ${project.duration} seconds long with an aspect ratio of ${project.ratio}. Write a detailed, visual script and motion description for the video components. Focus on visual elements, shapes, colors, layout, and movement. Keep it concise but descriptive enough for a developer to build the component in Remotion.`
      })
      return response.text
    })

    // Step 3: Generate Theme Config
    await step.run("update-status-theme", async () => {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "generating_theme" },
      })
    })

    const themeConfig = await step.run("generate-theme", async () => {
      const response = await ai.models.generateContent({
        model: "gemma-4-31b-it",
        contents: `Based on the following motion graphic description, generate a JSON object representing the theme configuration (colors, font styles, geometry). Return ONLY valid JSON and no markdown.
Description: ${aiPrompt}`,
        config: {
          responseMimeType: "application/json",
        }
      })
      const text = response.text || "{}"
      return JSON.parse(text)
    })

    // Step 4: Generate Remotion Code
    await step.run("update-status-code", async () => {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "generating_code", aiPrompt, themeConfig },
      })
    })

    const remotionCode = await step.run("generate-remotion-code", async () => {
      // Dynamically load the Remotion agent skill
      let remotionSkill = "";
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const skillPath = path.join(process.cwd(), ".agents/skills/remotion-best-practices/SKILL.md");
        remotionSkill = await fs.readFile(skillPath, "utf-8");
      } catch (err) {
        console.warn("Could not load remotion agent skill", err);
      }

      const response = await ai.models.generateContent({
        model: "gemma-4-31b-it",
        contents: `You are an expert React and Remotion developer. Write the code for a Remotion composition based on the following description and theme configuration.
        
Description: ${aiPrompt}
Theme: ${JSON.stringify(themeConfig)}
Duration: ${project.duration} seconds
Ratio: ${project.ratio}

Here are the strict Remotion rules and best practices you must follow (from our knowledge base):
${remotionSkill}

Additional Rules:
1. The code should export a default React component named "GeneratedComposition".
2. Assume the component will be rendered inside a standard Remotion <Composition>.
3. Use Tailwind CSS utility classes for styling where possible.
4. DO NOT return markdown formatting (like \`\`\`tsx). Return ONLY raw string code.
5. CRITICAL: You are running in a restricted sandbox. You MUST NOT import or use ANY external libraries (like @react-three/fiber, framer-motion, three, etc.). The ONLY allowed imports are 'react', 'remotion', and 'lucide-react'.
6. CRITICAL: Your component receives the theme configuration object as React props. You MUST use these props dynamically for ALL colors, fonts, and styles instead of hardcoding them. The props match the structure of the Theme JSON provided above.
7. CRITICAL: Never use JSX sibling comments like \`<Component /> {/* comment */}\` without wrapping them in a Fragment. To avoid Babel syntax errors, it is highly recommended to NOT use any JSX comments at all. Use standard JS comments outside the JSX tree.`
      })

      // Clean up the response in case it still returned markdown
      let code = response.text || ""
      if (code.startsWith("\`\`\`")) {
        const lines = code.split("\n")
        lines.shift()
        if (lines[lines.length - 1].startsWith("\`\`\`")) lines.pop()
        code = lines.join("\n")
      }
      return code
    })

    // Step 5: Finalize
    await step.run("finalize", async () => {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: "completed",
          remotionCode,
        },
      })
    })

    return { success: true, projectId }
  }
)

export const modifyVideoComponent = inngest.createFunction(
  { 
    id: "modify-video-component", 
    retries: 0,
    triggers: [{ event: "project/modify.video" }]
  },
  async ({ event, step }) => {
    const { projectId, editInstruction } = event.data

    const project = await step.run("get-project", async () => {
      const p = await prisma.project.findUnique({ where: { id: projectId } })
      if (!p) throw new Error("Project not found")
      return p
    })

    const remotionCode = await step.run("patch-remotion-code", async () => {
      // Dynamically load the Remotion agent skill
      let remotionSkill = "";
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const skillPath = path.join(process.cwd(), ".agents/skills/remotion-best-practices/SKILL.md");
        remotionSkill = await fs.readFile(skillPath, "utf-8");
      } catch (err) {
        console.warn("Could not load remotion agent skill", err);
      }

      const response = await ai.models.generateContent({
        model: "gemma-4-31b-it",
        contents: `You are an expert React and Remotion developer. 
You are tasked with modifying an existing Remotion video composition.

Original Prompt for this video: ${project.prompt}
Theme Config: ${JSON.stringify(project.themeConfig)}

Here is the CURRENT Remotion Code:
\`\`\`tsx
${project.remotionCode}
\`\`\`

Here is the EDIT INSTRUCTION from the user:
"${editInstruction}"

Please rewrite the code to incorporate the requested changes.

Here are the strict Remotion rules and best practices you must follow:
${remotionSkill}

Additional Rules:
1. The code should export a default React component named "GeneratedComposition".
2. Assume the component will be rendered inside a standard Remotion <Composition>.
3. Use Tailwind CSS utility classes for styling where possible.
4. DO NOT return markdown formatting (like \`\`\`tsx). Return ONLY raw string code.
5. CRITICAL: You are running in a restricted sandbox. You MUST NOT import or use ANY external libraries (like @react-three/fiber, framer-motion, three, etc.). The ONLY allowed imports are 'react', 'remotion', and 'lucide-react'.
6. CRITICAL: Your component receives the theme configuration object as React props. You MUST use these props dynamically for ALL colors, fonts, and styles instead of hardcoding them.
7. CRITICAL: Never use JSX sibling comments like \`<Component /> {/* comment */}\` without wrapping them in a Fragment. To avoid Babel syntax errors, it is highly recommended to NOT use any JSX comments at all. Use standard JS comments outside the JSX tree.`
      })

      let code = response.text || ""
      if (code.startsWith("\`\`\`")) {
        const lines = code.split("\n")
        lines.shift()
        if (lines[lines.length - 1].startsWith("\`\`\`")) lines.pop()
        code = lines.join("\n")
      }
      return code
    })

    await step.run("finalize", async () => {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: "completed",
          remotionCode,
        },
      })
      
      // Save completion message to chat history so it persists
      await prisma.chatMessage.create({
        data: {
          role: "ai",
          content: "Your modified video is ready! It should be playing on your screen now. Let me know if you need any other changes.",
          projectId,
        }
      })
    })

    return { success: true, projectId }
  }
)

export const exportVideoComponent = inngest.createFunction(
  {
    id: "export-video-component",
    retries: 0,
    triggers: [{ event: "project/export.video" }]
  },
  async ({ event, step }) => {
    const { projectId } = event.data;

    const project = await step.run("get-project", async () => {
      const p = await prisma.project.findUnique({ where: { id: projectId } });
      if (!p) throw new Error("Project not found");
      if (!p.remotionCode) throw new Error("No Remotion code available to export");
      return p;
    });

    // Instead of using detached rendering (which makes it hard to retrieve the file from ephemeral VMs),
    // we can use synchronous rendering inside the Inngest step because Inngest steps run inside Serverless Functions.
    // However, Serverless Functions on Vercel Pro have a 5-minute timeout.
    // Let's use the synchronous renderMediaOnVercel and then upload to Vercel Blob immediately, since the Sandbox SDK 
    // runs the process on a VM and returns the path inside the VM.
    // Wait, the Vercel Sandbox runs the render on an ephemeral Linux VM.
    // `renderMediaOnVercel` returns a `sandboxFilePath`. 
    // But how do we get the file OUT of the Sandbox VM?
    // According to Remotion Vercel Sandbox docs, you can run a custom command after render or use a Blob SDK inside the sandbox.
    // Alternatively, you can use `@vercel/blob` locally IF the Sandbox streams it? No.
    
    // Actually, Remotion's standard workflow is:
    // 1. `renderMediaOnVercel` completes.
    // 2. You call `sandbox.downloadFile(sandboxFilePath, localFilePath)` to download from VM to the Serverless Function.
    // 3. Then upload the local file to `@vercel/blob`.
    
    await step.run("render-and-upload", async () => {
      // Dynamic imports to avoid loading Vercel Sandbox SDKs prematurely
      const { createSandbox, addBundleToSandbox, renderMediaOnVercel } = await import("@remotion/vercel");
      const { put } = await import("@vercel/blob");
      const fs = await import("fs/promises");
      const path = await import("path");

      const sandbox = await createSandbox();

      try {
        const bundleDir = path.join(process.cwd(), ".remotion-bundle");
        
        // Fix for @remotion/vercel bug: The SDK attempts to create subdirectories
        // like "remotion-bundle/public" without first creating the parent directory,
        // resulting in a 400 Bad Request. We explicitly create the parent directory first.
        await sandbox.mkDir("remotion-bundle").catch(() => {});

        await addBundleToSandbox({
          sandbox,
          bundleDir,
        });

        // Synchronous render (blocks until done or function timeout)
        const renderResult = await renderMediaOnVercel({
          sandbox,
          compositionId: "DynamicExportComposition",
          inputProps: {
            code: project.remotionCode,
            themeConfig: project.themeConfig,
          },
        });

        let finalVideoUrl = "";

        if (process.env.BLOB_READ_WRITE_TOKEN) {
          // PRODUCTION LOGIC: Upload from Sandbox straight to Vercel Blob
          const { uploadToVercelBlob } = await import("@remotion/vercel");
          
          const blobUploadResult = await uploadToVercelBlob({
            sandbox,
            sandboxFilePath: renderResult.sandboxFilePath,
            blobPath: `exports/${projectId}.mp4`,
            contentType: "video/mp4",
            blobToken: process.env.BLOB_READ_WRITE_TOKEN,
            access: "public",
          });
          
          finalVideoUrl = blobUploadResult.url;
        } else {
          // LOCAL DEVELOPMENT LOGIC: Download to Next.js public directory
          const localFileName = `${projectId}.mp4`;
          const localFilePath = path.join(process.cwd(), "public", localFileName);
          
          await sandbox.downloadFile(
            { path: renderResult.sandboxFilePath },
            { path: localFilePath }
          );
          
          finalVideoUrl = `/${localFileName}`;
        }

        // Update the project with the final URL
        await prisma.project.update({
          where: { id: projectId },
          data: { 
            exportProgress: 100,
            exportStatus: "completed",
            videoUrl: finalVideoUrl
          },
        });

      } catch (err) {
        console.error("Sandbox render failed", err);
        await prisma.project.update({
          where: { id: projectId },
          data: { exportStatus: "failed" },
        });
        throw err;
      } finally {
        await sandbox.stop();
      }
    });

    return { success: true, projectId };
  }
);
