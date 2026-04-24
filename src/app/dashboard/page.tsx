import { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/infrastructure/supabase/server"
import { db } from "@/infrastructure/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { formatCurrency } from "@/shared/utils"

import { HeroSection } from "@/components/dashboard/hero-section"
import { EnhancedMetricCard, type EnhancedMetricData } from "@/components/dashboard/enhanced-metric-card"
import { EnhancedRevenueChart } from "@/components/dashboard/enhanced-revenue-chart"
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/activity-feed"
import { SetupChecklist } from "@/components/dashboard/setup-checklist"
import { RecentOrdersTable, type OrderData } from "@/components/dashboard/recent-orders-table"
import { StatCardGridSkeleton } from "@/components/dashboard/skeletons"
import { CopyButton } from "./_components/share-store"

import {
  fetchDashboardData,
  calculateGrowth,
  generateSparkline,
  generateRevenueChartData,
  getGreeting,
} from "./_data/queries"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your store analytics, orders, and performance metrics.",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const userRow = await db.select({ tenantId: users.tenantId })
    .from(users).where(eq(users.id, user.id)).limit(1).then(r => r[0])
  if (!userRow?.tenantId) redirect("/login")

  const d = await fetchDashboardData(user.id, userRow.tenantId)
  if (!d.tenant) redirect("/login")

  const currency = d.tenant.currency || "NPR"
  const paidCurrent = d.currentMonthOrders.filter((o) => o.paymentStatus === "paid")
  const paidPrevious = d.previousMonthOrders.filter((o) => o.paymentStatus === "paid")
  const currentRevenue = paidCurrent.reduce((s, o) => s + Number(o.total), 0)
  const previousRevenue = paidPrevious.reduce((s, o) => s + Number(o.total), 0)
  const currentOrderCount = d.currentMonthOrders.length
  const previousOrderCount = d.previousMonthOrders.length
  const avgOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0
  const prevAvg = previousOrderCount > 0 ? paidPrevious.reduce((s, o) => s + Number(o.total), 0) / previousOrderCount : 0
  const todayPaid = d.todayOrders.filter((o) => o.paymentStatus === "paid")

  const isNewStore = d.totalProducts === 0
  const hasProducts = d.totalProducts > 0
  const hasPayments = d.hasPayments
  const hasDomain = d.hasDomain
  const setupComplete = hasProducts && hasPayments && d.hasStorefront && hasDomain
  const userName = d.userName?.split(" ")[0] || user.email?.split("@")[0] || "there"

  const metrics: EnhancedMetricData[] = [
    { label: "Revenue", value: currentRevenue, change: calculateGrowth(currentRevenue, previousRevenue), changeLabel: "vs last month" },
    { label: "Orders", value: currentOrderCount, change: calculateGrowth(currentOrderCount, previousOrderCount), changeLabel: "vs last month", isCurrency: false },
    { label: "Customers", value: d.totalCustomers, change: calculateGrowth(d.newCustomers, d.previousMonthCustomers), changeLabel: `+${d.newCustomers} this month`, isCurrency: false },
    { label: "Avg. Order", value: avgOrderValue, change: calculateGrowth(avgOrderValue, prevAvg), changeLabel: "vs last month" },
  ]

  const ordersData: OrderData[] = d.recentOrders.map((o) => ({
    id: o.id, orderNumber: o.orderNumber, customerName: o.customerName ?? undefined,
    customerEmail: o.customerEmail ?? undefined, total: Number(o.total), status: o.status, createdAt: o.createdAt?.toISOString() ?? "",
  }))

  const activities: ActivityItem[] = [
    ...d.recentOrders.slice(0, 5).map((o) => ({
      id: `order-${o.id}`, type: "order" as const, title: "New order received",
      description: `${o.customerName || "Guest"} placed an order`, timestamp: o.createdAt?.toISOString() ?? "",
      href: `/dashboard/orders/${o.id}`, metadata: { orderNumber: o.orderNumber, amount: formatCurrency(Number(o.total), currency) },
    })),
    ...d.lowStockProducts.filter((p) => (p.quantity ?? 0) <= 5).slice(0, 3).map((p) => ({
      id: `stock-${p.id}`, type: "alert" as const, title: "Low stock alert",
      description: `${p.name} has only ${p.quantity ?? 0} units left`, timestamp: new Date().toISOString(),
      href: `/dashboard/products/${p.id}`,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="space-y-6">
      <HeroSection
        userName={userName}
        todayRevenue={todayPaid.reduce((s, o) => s + Number(o.total), 0)}
        todayOrders={d.todayOrders.length}
        currency={currency}
        greeting={getGreeting()}
        isNewStore={isNewStore}
      />

      {hasProducts && d.tenant.slug && (() => {
        const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://indigo.store"}/store/${d.tenant.slug}`
        return (
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium">Share your store</p>
                <p className="text-xs text-muted-foreground truncate max-w-xs">{storeUrl}</p>
              </div>
              <div className="flex items-center gap-2">
                <CopyButton url={storeUrl} />
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out my store: ${storeUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md border bg-background size-8 hover:bg-accent"
                >
                  <svg viewBox="0 0 24 24" className="size-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                </a>
              </div>
            </div>
          </div>
        )
      })()}

      {!setupComplete && (
        <SetupChecklist
          storeName={d.tenant.name}
          hasProducts={hasProducts}
          hasPayments={hasPayments}
          hasStorefront={d.hasStorefront}
          hasDomain={hasDomain}
        />
      )}

      {!isNewStore && (
        <>
          <Suspense fallback={<StatCardGridSkeleton count={4} />}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {metrics.map((m, i) => <EnhancedMetricCard key={i} metric={m} currency={currency} />)}
            </div>
            <div className="flex justify-end">
              <Link href="/dashboard/analytics" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                View analytics <ArrowRight className="size-3" />
              </Link>
            </div>
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2">
              <EnhancedRevenueChart data={generateRevenueChartData(paidCurrent, paidPrevious)} currency={currency} totalCurrent={currentRevenue} totalPrevious={previousRevenue} />
            </div>
            <ActivityFeed activities={activities} maxItems={6} />
          </div>

          <RecentOrdersTable orders={ordersData} currency={currency} />
        </>
      )}
    </div>
  )
}
