import { SettingsClient } from "@/components/settings-client"
import { Header } from "@/components/header"
import { auth } from "@clerk/nextjs/server"

export default async function SettingsPage() {
  const { userId } = await auth()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isLoggedIn={!!userId} />
      <main className="flex-1 flex justify-center py-12 px-4 sm:px-6">
        <SettingsClient />
      </main>
    </div>
  )
}
