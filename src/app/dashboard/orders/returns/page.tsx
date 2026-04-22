import { ReturnsClient } from "./returns-client"
import { auth, getTenantCurrency, getReturns } from "../_lib/queries"

export const metadata = {
  title: "Returns | Dashboard",
  description: "Manage product returns and refunds",
}

export default async function ReturnsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const { supabase, tenantId } = await auth()

  const [currency, { returns, totalCount, stats }] = await Promise.all([
    getTenantCurrency(supabase, tenantId),
    getReturns(tenantId, supabase, params),
  ])

  return (
    <ReturnsClient
      returns={returns as never[]}
      stats={stats}
      totalCount={totalCount}
      currentPage={parseInt(params.page || "1")}
      pageSize={parseInt(params.pageSize || "20")}
      currency={currency}
      tenantId={tenantId}
    />
  )
}
