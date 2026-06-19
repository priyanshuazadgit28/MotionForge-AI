"use client"

import { UserProfile } from "@clerk/nextjs"
import { CreditCard } from "lucide-react"
import { BillingDashboard } from "@/components/billing-dashboard"

export function SettingsClient() {
  return (
    <UserProfile path="/settings" routing="path">
      <UserProfile.Page 
        label="Billing & Credits" 
        labelIcon={<CreditCard className="size-4" />} 
        url="billing"
      >
        <BillingDashboard />
      </UserProfile.Page>
    </UserProfile>
  )
}
