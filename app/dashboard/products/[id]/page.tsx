import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
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

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", userData.tenant_id)
    .single()

  if (!product) notFound()

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("tenant_id", userData.tenant_id)
    .order("name")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Editing {product.name}</p>
        </div>
      </div>
      <ProductForm tenantId={userData.tenant_id} categories={categories || []} product={product} />
    </div>
  )
}
