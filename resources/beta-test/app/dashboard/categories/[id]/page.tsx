import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { CategoryForm } from "@/components/dashboard/category-form"

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single()

  if (!userData?.tenant_id) redirect("/auth/login")

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", userData.tenant_id)
    .single()

  if (!category) notFound()

  return (
    <div className="space-y-6">
      <DashboardHeader title="Edit Category" description={`Editing ${category.name}`} />
      <CategoryForm tenantId={userData.tenant_id} category={category} />
    </div>
  )
}
