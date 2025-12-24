import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"

async function getAnalyticsData(tenantId: string) {
  const supabase = await createClient()

  // Get orders with items for analytics
  const { data: orders } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })

  // Get products for top products analysis
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("status", "active")

  // Get customers
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })

  return {
    orders: orders || [],
    products: products || [],
    customers: customers || [],
  }
}

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id, tenant:tenants(name, currency)")
    .eq("id", user.id)
    .single()

  if (!userData?.tenant_id) {
    redirect("/auth/login")
  }

  const data = await getAnalyticsData(userData.tenant_id)
  const currency = (userData.tenant as { currency: string })?.currency || "USD"

  return (
    <div className="space-y-6">
      <DashboardHeader title="Analytics" description="Track your store performance and insights" />
      <AnalyticsDashboard
        orders={data.orders}
        products={data.products}
        customers={data.customers}
        currency={currency}
      />
    </div>
  )
}
