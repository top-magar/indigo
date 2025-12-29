import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ReturnsClient } from "./returns-client"

export const metadata = {
  title: "Returns | Dashboard",
  description: "Manage product returns and refunds",
}

export default async function ReturnsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get user's tenant
  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single()

  if (!userData?.tenant_id) redirect("/auth/login")

  const tenantId = userData.tenant_id

  // Get tenant info
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, currency")
    .eq("id", tenantId)
    .single()

  // Try to get returns - table may not exist yet
  let returns: unknown[] = []
  let statsData: { status: string; refund_amount: number | null }[] = []
  let count = 0

  try {
    const { data, count: totalCount, error } = await supabase
      .from("returns")
      .select(`
        *,
        order:orders (
          id,
          order_number,
          total,
          currency
        ),
        customer:customers (
          id,
          email,
          first_name,
          last_name
        ),
        return_items (
          *,
          order_item:order_items (
            id,
            product_name,
            product_image,
            quantity,
            unit_price
          )
        )
      `, { count: "exact" })
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (!error) {
      returns = data || []
      count = totalCount || 0

      // Get stats
      const { data: stats } = await supabase
        .from("returns")
        .select("status, refund_amount")
        .eq("tenant_id", tenantId)

      statsData = stats || []
    }
  } catch {
    // Table doesn't exist yet - show empty state
  }

  const stats = {
    total: statsData.length,
    requested: statsData.filter(r => r.status === "requested").length,
    approved: statsData.filter(r => r.status === "approved").length,
    processing: statsData.filter(r => ["received", "processing"].includes(r.status)).length,
    completed: statsData.filter(r => ["refunded", "completed"].includes(r.status)).length,
    rejected: statsData.filter(r => ["rejected", "cancelled"].includes(r.status)).length,
    totalRefunded: statsData
      .filter(r => r.status === "refunded" || r.status === "completed")
      .reduce((sum, r) => sum + (r.refund_amount || 0), 0),
  }

  return (
    <ReturnsClient
      returns={returns as never[]}
      stats={stats}
      totalCount={count}
      currency={tenant?.currency || "USD"}
      tenantId={tenantId}
    />
  )
}
