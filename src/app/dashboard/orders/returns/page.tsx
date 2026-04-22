import { redirect } from "next/navigation"
import { createClient } from "@/infrastructure/supabase/server"
import { ReturnsClient } from "./returns-client"

export const metadata = {
  title: "Returns | Dashboard",
  description: "Manage product returns and refunds",
}

interface SearchParams {
  page?: string;
  pageSize?: string;
  status?: string;
  search?: string;
}

export default async function ReturnsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single()
  if (!userData?.tenant_id) redirect("/login")

  const tenantId = userData.tenant_id
  const { data: tenant } = await supabase.from("tenants").select("currency").eq("id", tenantId).single()

  const page = parseInt(params.page || "1") - 1
  const perPage = parseInt(params.pageSize || "20")

  let returns: unknown[] = []
  let statsData: { status: string; refund_amount: number | null }[] = []
  let count = 0

  try {
    let query = supabase
      .from("returns")
      .select(`
        *,
        order:orders (id, order_number, total, currency),
        customer:customers (id, email, first_name, last_name),
        return_items (*, order_item:order_items (id, product_name, product_image, quantity, unit_price))
      `, { count: "exact" })
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .range(page * perPage, (page + 1) * perPage - 1)

    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status)
    }
    if (params.search) {
      query = query.or(`reason.ilike.%${params.search}%`)
    }

    const { data, count: totalCount, error } = await query

    if (!error) {
      returns = data || []
      count = totalCount || 0

      const { data: stats } = await supabase
        .from("returns")
        .select("status, refund_amount")
        .eq("tenant_id", tenantId)

      statsData = stats || []
    }
  } catch {
    // Table doesn't exist yet
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
      currentPage={page + 1}
      pageSize={perPage}
      currency={tenant?.currency || "USD"}
      tenantId={tenantId}
    />
  )
}
