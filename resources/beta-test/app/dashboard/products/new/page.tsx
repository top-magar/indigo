import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProductForm } from "@/components/dashboard/product-form"

export default async function NewProductPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single()

  if (!userData?.tenant_id) redirect("/auth/login")

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("tenant_id", userData.tenant_id)
    .order("name")

  return (
    <div className="space-y-6">
      <DashboardHeader title="New Product" description="Add a new product to your catalog" />
      <ProductForm tenantId={userData.tenant_id} categories={categories || []} />
    </div>
  )
}
