import { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/infrastructure/supabase/server"
import { db } from "@/infrastructure/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { formatCurrency } from "@/shared/utils"
import { ArrowUpRight, ArrowDownRight, Minus, Package, Truck, TrendingUp, Users, DollarSign, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/shared/utils"

import {
  fetchDashboardData,
  calculateGrowth,
  getGreeting,
} from "./_data/queries"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Store overview and key metrics.",
}

// ─── Metric Widget ───────────────────────────────────────

function Metric({ label, value, change, icon: Icon, href }: {
  label: string; value: string; change: number; icon: typeof DollarSign; href?: string;
}) {
  const trend = change > 0 ? "up" : change < 0 ? "down" : "flat"
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground/50" />
      </div>
      <span className="text-xl font-semibold tracking-tight tabular-nums">{value}</span>
      <div className="flex items-center gap-1">
        {trend === "up" && <ArrowUpRight className="size-3 text-success" />}
        {trend === "down" && <ArrowDownRight className="size-3 text-destructive" />}
        {trend === "flat" && <Minus className="size-3 text-muted-foreground" />}
        <span className={cn("text-xs tabular-nums", trend === "up" && "text-success", trend === "down" && "text-destructive", trend === "flat" && "text-muted-foreground")}>
          {change > 0 ? "+" : ""}{change.toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground">vs last month</span>
      </div>
    </>
  )
  const cls = "flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-accent/50"
  return href ? <Link href={href} className={cls}>{content}</Link> : <div className={cls}>{content}</div>
}

// ─── Alert Row ───────────────────────────────────────────

function AlertRow({ icon: Icon, count, label, href, color }: {
  icon: typeof Truck; count: number; label: string; href: string; color: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 py-2 text-sm hover:text-foreground transition-colors group">
      <Icon className={cn("size-4 shrink-0", color)} />
      <span className="text-muted-foreground group-hover:text-foreground"><span className="font-medium text-foreground tabular-nums">{count}</span> {label}</span>
      <span className="ml-auto text-xs text-muted-foreground/50 group-hover:text-muted-foreground">View →</span>
    </Link>
  )
}

// ─── Order Row ───────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-info/10 text-info",
  processing: "bg-info/10 text-info",
  shipped: "bg-ds-teal-700/10 text-ds-teal-700",
  delivered: "bg-success/10 text-success",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
}

function OrderRow({ order, currency }: { order: { id: string; orderNumber: string; customerName?: string; total: number; status: string; createdAt: string }; currency: string }) {
  const ago = getTimeAgo(order.createdAt)
  return (
    <Link href={`/dashboard/orders/${order.id}`} className="flex items-center gap-4 py-2.5 text-sm hover:bg-accent/50 -mx-4 px-4 rounded-md transition-colors">
      <span className="font-medium tabular-nums w-16 shrink-0">#{order.orderNumber}</span>
      <span className="text-muted-foreground truncate flex-1">{order.customerName || "Guest"}</span>
      <span className="font-medium tabular-nums">{formatCurrency(order.total, currency)}</span>
      <Badge className={cn("text-[10px] px-1.5 py-0 capitalize", STATUS_STYLE[order.status] || "bg-muted text-muted-foreground")}>{order.status}</Badge>
      <span className="text-xs text-muted-foreground/50 w-14 text-right shrink-0">{ago}</span>
    </Link>
  )
}

function getTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

// ─── Page ────────────────────────────────────────────────

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
  const paid = d.currentMonthOrders.filter(o => o.paymentStatus === "paid")
  const prevPaid = d.previousMonthOrders.filter(o => o.paymentStatus === "paid")
  const revenue = paid.reduce((s, o) => s + Number(o.total), 0)
  const prevRevenue = prevPaid.reduce((s, o) => s + Number(o.total), 0)
  const orders = d.currentMonthOrders.length
  const prevOrders = d.previousMonthOrders.length
  const aov = orders > 0 ? revenue / orders : 0
  const prevAov = prevOrders > 0 ? prevPaid.reduce((s, o) => s + Number(o.total), 0) / prevOrders : 0
  const todayRevenue = d.todayOrders.filter(o => o.paymentStatus === "paid").reduce((s, o) => s + Number(o.total), 0)
  const userName = d.userName?.split(" ")[0] || user.email?.split("@")[0] || "there"

  // Alerts
  const pendingOrders = d.recentOrders.filter(o => o.status === "pending" || o.status === "confirmed").length
  const lowStock = d.lowStockProducts.filter(p => (p.quantity ?? 0) <= 5).length

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Greeting ── */}
      <div>
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg font-semibold tracking-tight">{getGreeting()}, {userName}</h1>
          <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
        </div>
        <p className="text-sm text-muted-foreground tabular-nums mt-0.5">
          {formatCurrency(todayRevenue, currency)} revenue · {d.todayOrders.length} order{d.todayOrders.length !== 1 ? "s" : ""} today
        </p>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Revenue" value={formatCurrency(revenue, currency)} change={calculateGrowth(revenue, prevRevenue)} icon={DollarSign} href="/dashboard/analytics" />
        <Metric label="Orders" value={orders.toLocaleString()} change={calculateGrowth(orders, prevOrders)} icon={ShoppingCart} href="/dashboard/orders" />
        <Metric label="Customers" value={d.totalCustomers.toLocaleString()} change={calculateGrowth(d.newCustomers, d.previousMonthCustomers)} icon={Users} href="/dashboard/customers" />
        <Metric label="Avg. Order" value={formatCurrency(aov, currency)} change={calculateGrowth(aov, prevAov)} icon={TrendingUp} />
      </div>

      {/* ── Needs Attention + Recent Orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

        {/* Left: Alerts */}
        <div>
          {(pendingOrders > 0 || lowStock > 0) ? (
            <div>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Needs attention</h2>
              <div className="divide-y">
                {pendingOrders > 0 && <AlertRow icon={Truck} count={pendingOrders} label="orders need processing" href="/dashboard/orders?status=pending" color="text-warning" />}
                {lowStock > 0 && <AlertRow icon={Package} count={lowStock} label="products low on stock" href="/dashboard/inventory?stock=low" color="text-destructive" />}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Status</h2>
              <p className="text-sm text-muted-foreground">All caught up. No pending actions.</p>
            </div>
          )}
        </div>

        {/* Right: Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent orders</h2>
            <Link href="/dashboard/orders" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all →</Link>
          </div>
          {d.recentOrders.length > 0 ? (
            <div className="divide-y">
              {d.recentOrders.slice(0, 6).map(o => (
                <OrderRow key={o.id} order={{ id: o.id, orderNumber: o.orderNumber, customerName: o.customerName ?? undefined, total: Number(o.total), status: o.status, createdAt: o.createdAt?.toISOString() ?? "" }} currency={currency} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No orders yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Orders will appear here as customers purchase</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
