import { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { createClient } from "@/infrastructure/supabase/server"
import { db } from "@/infrastructure/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { formatCurrency } from "@/shared/utils"

import { HeroSection } from "@/components/dashboard/hero-section"
import { EnhancedMetricCard, type EnhancedMetricData } from "@/components/dashboard/enhanced-metric-card"
import { EnhancedRevenueChart } from "@/components/dashboard/enhanced-revenue-chart"
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/activity-feed"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { SetupChecklist } from "@/components/dashboard/setup-checklist"
import { RecentOrdersTable, type OrderData } from "@/components/dashboard/recent-orders-table"
import { StatCardGridSkeleton } from "@/components/dashboard/skeletons"

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

  const metrics: EnhancedMetricData[] = [
    { label: "Revenue", value: currentRevenue, change: calculateGrowth(currentRevenue, previousRevenue), changeLabel: "vs last month", icon: "DollarSign", iconColor: "success", href: "/dashboard/analytics", sparklineData: generateSparkline(paidCurrent) },
    { label: "Orders", value: currentOrderCount, change: calculateGrowth(currentOrderCount, previousOrderCount), changeLabel: "vs last month", icon: "ShoppingCart", iconColor: "info", href: "/dashboard/orders", sparklineData: generateSparkline(d.currentMonthOrders), isCurrency: false },
    { label: "Customers", value: d.totalCustomers, change: calculateGrowth(d.newCustomers, d.previousMonthCustomers), changeLabel: `+${d.newCustomers} this month`, icon: "Users", iconColor: "warning", href: "/dashboard/customers", isCurrency: false, sparklineData: [0, 0, 0, 0, 0, 0, d.newCustomers] },
    { label: "Avg. Order", value: avgOrderValue, change: calculateGrowth(avgOrderValue, prevAvg), changeLabel: "vs last month", icon: "TrendingUp", iconColor: "purple", sparklineData: generateSparkline(paidCurrent) },
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

  const setupProgress = 0
  const userName = d.userName?.split(" ")[0] || user.email?.split("@")[0] || "there"

  return (
    <div className="space-y-4">

      <HeroSection userName={userName} todayRevenue={todayPaid.reduce((s, o) => s + Number(o.total), 0)}
        todayOrders={d.todayOrders.length} currency={currency} storeSlug={d.tenant.slug} greeting={getGreeting()} setupProgress={setupProgress} />

      {d.totalProducts === 0 && (
        <SetupChecklist
          storeName={d.tenant.name}
          hasProducts={d.totalProducts > 0}
          hasPayments={false}
          hasDomain={false}
        />
      )}

      <Suspense fallback={<StatCardGridSkeleton count={4} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => <EnhancedMetricCard key={i} metric={m} currency={currency} />)}
        </div>
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <EnhancedRevenueChart data={generateRevenueChartData(paidCurrent, paidPrevious)} currency={currency} totalCurrent={currentRevenue} totalPrevious={previousRevenue} />
        </div>
        <ActivityFeed activities={activities} maxItems={6} />
      </div>

      <RecentOrdersTable orders={ordersData} currency={currency} />
    </div>
  )
}
