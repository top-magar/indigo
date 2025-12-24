import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProductsTable } from "@/components/dashboard/products-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function ProductsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single()

  if (!userData?.tenant_id) redirect("/auth/login")

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(id, name)")
    .eq("tenant_id", userData.tenant_id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Products"
        description="Manage your product catalog"
        action={
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add product
            </Link>
          </Button>
        }
      />
      <ProductsTable products={products || []} />
    </div>
  )
}
