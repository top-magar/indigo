import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-muted-foreground">Editing {category.name}</p>
        </div>
      </div>
      <CategoryForm tenantId={userData.tenant_id} category={category} />
    </div>
  )
}
