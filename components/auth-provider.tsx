"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@clerk/nextjs"
import { syncUser } from "@/app/actions/auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId } = useAuth()
  const hasSyncedForUser = useRef<string | null>(null)

  useEffect(() => {
    if (isSignedIn && userId && hasSyncedForUser.current !== userId) {
      // Mark as synced immediately to prevent double calls in React strict mode
      hasSyncedForUser.current = userId
      
      syncUser().then((res) => {
        if (!res.success) {
          console.error("Failed to sync user:", res.message)
          // If it failed, we could optionally reset the ref to try again
          hasSyncedForUser.current = null
        }
      })
    } else if (!isSignedIn) {
      hasSyncedForUser.current = null
    }
  }, [isSignedIn, userId])

  return <>{children}</>
}
