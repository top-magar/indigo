import { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/infrastructure/supabase/server"
import { db } from "@/infrastructure/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { formatCurrency } from "@/shared/utils"
import { AlertTriangle, Package, Truck } from "lucide-react"

import { HeroSection } from "@/components/dashboard/hero-section"
import { EnhancedMetricCard, type EnhancedMetricData } from "@/components/dashboard/enhanced-metric-card"
import { RecentOrdersTable, type OrderData } from "@/components/dashboard/recent-orders-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
  fetchDashboardData,
  calculateGrowth,
  generateSparkline,
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

  const currency = d.tenant.currency || "USD"
  const paidCurrent = d.currentMonthOrders.filter(o => o.paymentStatus === "paid")
  const paidPrevious = d.previousMonthOrders.filter(o => o.paymentStatus === "paid")
  const currentRevenue = paidCurrent.reduce((s, o) => s + Number(o.total), 0)
  const previousRevenue = paidPrevious.reduce((s, o) => s + Number(o.total), 0)
  const currentOrderCount = d.currentMonthOrders.length
  const previousOrderCount = d.previousMonthOrders.length
  const avgOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0
  const prevAvg = previousOrderCount > 0 ? paidPrevious.reduce((s, o) => s + Number(o.total), 0) / previousOrderCount : 0
  const todayPaid = d.todayOrders.filter(o => o.paymentStatus === "paid")
  const userName = d.userName?.split(" ")[0] || user.email?.split("@")[0] || "there"

  // ─── Metrics ───────────────────────────────────────────
  const metrics: EnhancedMetricData[] = [
    { label: "Revenue", value: currentRevenue, change: calculateGrowth(currentRevenue, previousRevenue), changeLabel: "vs last month", icon: "DollarSign", iconColor: "success", href: "/dashboard/analytics", sparklineData: generateSparkline(paidCurrent) },
    { label: "Orders", value: currentOrderCount, change: calculateGrowth(currentOrderCount, previousOrderCount), changeLabel: "vs last month", icon: "ShoppingCart", iconColor: "info", href: "/dashboard/orders", sparklineData: generateSparkline(d.currentMonthOrders), isCurrency: false },
    { label: "Customers", value: d.totalCustomers, change: calculateGrowth(d.newCustomers, d.previousMonthCustomers), changeLabel: `+${d.newCustomers} this month`, icon: "Users", iconColor: "warning", href: "/dashboard/customers", isCurrency: false },
    { label: "Avg. Order", value: avgOrderValue, change: calculateGrowth(avgOrderValue, prevAvg), changeLabel: "vs last month", icon: "TrendingUp", iconColor: "purple", sparklineData: generateSparkline(paidCurrent) },
  ]

  // ─── Needs Attention ───────────────────────────────────
  const pending = d.recentOrders.filter(o => o.status === "pending" || o.status === "confirmed").length
  const lowStock = d.lowStockProducts.filter(p => (p.quantity ?? 0) <= 5).length

  const alerts: { label: string; count: number; href: string; icon: typeof Truck; color: string }[] = []
  if (pending > 0) alerts.push({ label: "orders need processing", count: pending, href: "/dashboard/orders?status=pending", icon: Truck, color: "text-warning" })
  if (lowStock > 0) alerts.push({ label: "products low on stock", count: lowStock, href: "/dashboard/inventory?stock=low", icon: Package, color: "text-destructive" })

  // ─── Recent Orders ─────────────────────────────────────
  const ordersData: OrderData[] = d.recentOrders.slice(0, 8).map(o => ({
    id: o.id, orderNumber: o.orderNumber, customerName: o.customerName ?? undefined,
    customerEmail: o.customerEmail ?? undefined, total: Number(o.total), status: o.status,
    createdAt: o.createdAt?.toISOString() ?? "",
  }))

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <HeroSection
        userName={userName}
        todayRevenue={todayPaid.reduce((s, o) => s + Number(o.total), 0)}
        todayOrders={d.todayOrders.length}
        currency={currency}
        greeting={getGreeting()}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => <EnhancedMetricCard key={i} metric={m} currency={currency} />)}
      </div>

      {/* Needs Attention */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map(a => (
                <Link key={a.label} href={a.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors">
                  <a.icon className={`size-4 shrink-0 ${a.color}`} />
                  <span><span className="font-medium tabular-nums">{a.count}</span> {a.label}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">View</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <RecentOrdersTable orders={ordersData} currency={currency} />
    </div>
  )
}
