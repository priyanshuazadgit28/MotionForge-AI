"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function getUserCredits() {
  const { userId } = await auth()
  if (!userId) return 0

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { credits: true },
  })

  return user?.credits || 0
}
