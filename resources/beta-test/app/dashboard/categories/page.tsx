import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { CategoriesTable } from "@/components/dashboard/categories-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function CategoriesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single()

  if (!userData?.tenant_id) redirect("/auth/login")

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", userData.tenant_id)
    .order("sort_order", { ascending: true })

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Categories"
        description="Organize your products with categories"
        action={
          <Button asChild>
            <Link href="/dashboard/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Add category
            </Link>
          </Button>
        }
      />
      <CategoriesTable categories={categories || []} />
    </div>
  )
}
