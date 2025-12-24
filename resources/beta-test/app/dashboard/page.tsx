import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"

async function getDashboardData(tenantId: string) {
  const supabase = await createClient()

  const [products, orders, customers] = await Promise.all([
    supabase.from("products").select("id, status", { count: "exact" }).eq("tenant_id", tenantId),
    supabase
      .from("orders")
      .select("id, total, status, payment_status, created_at, customer_email", { count: "exact" })
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
  ])

  const paidOrders = orders.data?.filter((o) => o.payment_status === "paid") || []
  const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0)

  // Get today's stats
  const today = new Date().toISOString().split("T")[0]
  const todayOrders = orders.data?.filter((o) => o.created_at.split("T")[0] === today) || []
  const todayRevenue = todayOrders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total), 0)

  return {
    products: products.count || 0,
    activeProducts: products.data?.filter((p) => p.status === "active").length || 0,
    orders: orders.count || 0,
    customers: customers.count || 0,
    revenue: totalRevenue,
    todayOrders: todayOrders.length,
    todayRevenue,
    recentOrders: orders.data || [],
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id, tenant:tenants(name, slug, currency)")
    .eq("id", user.id)
    .single()

  if (!userData?.tenant_id) {
    redirect("/auth/login")
  }

  const stats = await getDashboardData(userData.tenant_id)
  const tenant = userData.tenant as { name: string; slug: string; currency: string }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Dashboard" description={`Welcome back to ${tenant?.name || "your store"}`} />
      <DashboardOverview stats={stats} tenant={tenant} />
    </div>
  )
}
