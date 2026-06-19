import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = await req.json();

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { author: true },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // Optional: Add ownership or credit checks here
    // if (project.author?.clerkId !== userId) {
    //   return new NextResponse("Forbidden", { status: 403 });
    // }

    // Start export process
    await prisma.project.update({
      where: { id: projectId },
      data: {
        exportStatus: "exporting",
        exportProgress: 0,
      },
    });

    await inngest.send({
      name: "project/export.video",
      data: {
        projectId,
      },
    });

    return NextResponse.json({ success: true, status: "exporting" });
  } catch (error) {
    console.error("Export API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
