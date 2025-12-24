import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { CategoryForm } from "@/components/dashboard/category-form"

export default async function NewCategoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single()

  if (!userData?.tenant_id) redirect("/auth/login")

  return (
    <div className="space-y-6">
      <DashboardHeader title="New Category" description="Create a new product category" />
      <CategoryForm tenantId={userData.tenant_id} />
    </div>
  )
}
