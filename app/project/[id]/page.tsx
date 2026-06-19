import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { auth } from "@clerk/nextjs/server"
import { ProjectStudio } from "@/components/project-studio"

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const { userId } = await auth()

  const project = await prisma.project.findUnique({
    where: { id },
    include: { 
      author: true,
      chatMessages: {
        orderBy: { createdAt: 'asc' }
      }
    },
  })

  if (!project) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isLoggedIn={!!userId} />
      <ProjectStudio project={project} />
    </div>
  )
}
