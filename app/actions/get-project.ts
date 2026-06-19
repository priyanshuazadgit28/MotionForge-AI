"use server"

import { prisma } from "@/lib/prisma"

export async function getProjectStatus(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      status: true,
      themeConfig: true,
      remotionCode: true,
      exportStatus: true,
      videoUrl: true,
    }
  })
  
  return project
}
