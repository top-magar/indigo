import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { SettingsForm } from "@/components/dashboard/settings-form"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase.from("users").select("*, tenant:tenants(*)").eq("id", user.id).single()

  if (!userData?.tenant) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Settings" description="Manage your store settings and preferences" />
      <SettingsForm tenant={userData.tenant} user={userData} />
    </div>
  )
}
