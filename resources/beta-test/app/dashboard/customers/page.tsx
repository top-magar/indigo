import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { CustomersTable } from "@/components/dashboard/customers-table"

export default async function CustomersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single()

  if (!userData?.tenant_id) redirect("/auth/login")

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("tenant_id", userData.tenant_id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <DashboardHeader title="Customers" description="Manage your store customers" />
      <CustomersTable customers={customers || []} />
    </div>
  )
}
