import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProductForm } from "@/components/dashboard/product-form"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single()

  if (!userData?.tenant_id) redirect("/auth/login")

  const [productResult, categoriesResult] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).eq("tenant_id", userData.tenant_id).single(),
    supabase.from("categories").select("id, name").eq("tenant_id", userData.tenant_id).order("name"),
  ])

  if (!productResult.data) notFound()

  return (
    <div className="space-y-6">
      <DashboardHeader title="Edit Product" description={`Editing ${productResult.data.name}`} />
      <ProductForm
        tenantId={userData.tenant_id}
        categories={categoriesResult.data || []}
        product={productResult.data}
      />
    </div>
  )
}
