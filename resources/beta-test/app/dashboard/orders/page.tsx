import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { OrdersTable } from "@/components/dashboard/orders-table"

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single()

  if (!userData?.tenant_id) redirect("/auth/login")

  const { data: orders } = await supabase
    .from("orders")
    .select("*, items:order_items(*), customer:customers(id, email, first_name, last_name)")
    .eq("tenant_id", userData.tenant_id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <DashboardHeader title="Orders" description="Manage and fulfill customer orders" />
      <OrdersTable orders={orders || []} />
    </div>
  )
}
