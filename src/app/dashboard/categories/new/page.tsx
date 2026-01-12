import { createClient } from "@/infrastructure/supabase/server"
import { redirect } from "next/navigation"
import { CategoryForm } from "@/components/dashboard"

export default async function NewCategoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single()

  if (!userData?.tenant_id) redirect("/login")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Category</h1>
          <p className="text-muted-foreground">Create a new category for your products</p>
        </div>
      </div>
      <CategoryForm tenantId={userData.tenant_id} />
    </div>
  )
}
