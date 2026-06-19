"use server"

import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function syncUser() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, message: "No user logged in" }
    }
    
    const primaryEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress || user.emailAddresses[0]?.emailAddress
    
    if (!primaryEmail) {
      return { success: false, message: "User has no email" }
    }
    
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "User"
    const initial = fullName.charAt(0).toUpperCase()
    
    // Upsert user in Prisma
    // We use clerkId as the unique identifier
    await prisma.user.upsert({
      where: { clerkId: user.id },
      update: {
        email: primaryEmail,
        name: fullName,
        initial: initial,
        // we leave avatarGradient and credits as they are on update
      },
      create: {
        clerkId: user.id,
        email: primaryEmail,
        name: fullName,
        initial: initial,
        credits: 100,
        // Generate a random gradient for new users
        avatarGradient: `linear-gradient(135deg, oklch(${Math.random() * 0.2 + 0.6} ${Math.random() * 0.1 + 0.15} ${Math.random() * 360}), oklch(${Math.random() * 0.2 + 0.6} ${Math.random() * 0.1 + 0.15} ${Math.random() * 360}))`,
      },
    })
    
    return { success: true }
  } catch (error) {
    console.error("Error syncing user:", error)
    return { success: false, message: "Internal server error" }
  }
}
