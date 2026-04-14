import "server-only"
import { db, withTenant } from "@/infrastructure/db"
import { tenants } from "@/db/schema/tenants"
import { users } from "@/db/schema/users"
import { orders } from "@/db/schema/orders"
import { customers } from "@/db/schema/customers"
import { products } from "@/db/schema/products"
import { eq, and, gte, lte, asc, desc, count, sql } from "drizzle-orm"

function getDateRanges() {
  const now = new Date()
  return {
    currentMonthStart: new Date(now.getFullYear(), now.getMonth(), 1),
    previousMonthStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    previousMonthEnd: new Date(now.getFullYear(), now.getMonth(), 0),
    todayStart: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  }
}

export interface DashboardData {
  tenant: { name: string; currency: string | null; slug: string } | null
  userName: string | null
  currentMonthOrders: Array<{ id: string; total: string; status: string; paymentStatus: string | null; createdAt: Date | null }>
  previousMonthOrders: Array<{ id: string; total: string; status: string; paymentStatus: string | null; createdAt: Date | null }>
  recentOrders: Array<{ id: string; orderNumber: string; total: string; status: string; customerName: string | null; customerEmail: string | null; createdAt: Date | null }>
  todayOrders: Array<{ id: string; total: string; paymentStatus: string | null }>
  totalCustomers: number
  newCustomers: number
  previousMonthCustomers: number
  lowStockProducts: Array<{ id: string; name: string; quantity: number | null; price: string; images: unknown }>
  totalProducts: number
}

export async function fetchDashboardData(userId: string, tenantId: string): Promise<DashboardData> {
  const dates = getDateRanges()

  // Non-tenant-scoped lookups (tenant + user)
  const [tenantRow, userRow] = await Promise.all([
    db.select({ name: tenants.name, currency: tenants.currency, slug: tenants.slug })
      .from(tenants).where(eq(tenants.id, tenantId)).limit(1).then(r => r[0] ?? null),
    db.select({ fullName: users.fullName })
      .from(users).where(eq(users.id, userId)).limit(1).then(r => r[0] ?? null),
  ])

  // Tenant-scoped queries via withTenant (RLS enforced)
  const data = await withTenant(tenantId, async (tx) => {
    const [
      currentMonthOrders,
      previousMonthOrders,
      recentOrders,
      todayOrders,
      [{ value: totalCustomers }],
      [{ value: newCustomers }],
      [{ value: previousMonthCustomers }],
      lowStockProducts,
      [{ value: totalProducts }],
    ] = await Promise.all([
      tx.select({
        id: orders.id, total: orders.total, status: orders.status,
        paymentStatus: orders.paymentStatus, createdAt: orders.createdAt,
      }).from(orders).where(gte(orders.createdAt, dates.currentMonthStart)),

      tx.select({
        id: orders.id, total: orders.total, status: orders.status,
        paymentStatus: orders.paymentStatus, createdAt: orders.createdAt,
      }).from(orders).where(and(
        gte(orders.createdAt, dates.previousMonthStart),
        lte(orders.createdAt, dates.previousMonthEnd),
      )),

      tx.select({
        id: orders.id, orderNumber: orders.orderNumber, total: orders.total,
        status: orders.status, customerName: orders.customerName,
        customerEmail: orders.customerEmail, createdAt: orders.createdAt,
      }).from(orders).orderBy(desc(orders.createdAt)).limit(5),

      tx.select({
        id: orders.id, total: orders.total, paymentStatus: orders.paymentStatus,
      }).from(orders).where(gte(orders.createdAt, dates.todayStart)),

      tx.select({ value: count() }).from(customers),
      tx.select({ value: count() }).from(customers).where(gte(customers.createdAt, dates.currentMonthStart)),
      tx.select({ value: count() }).from(customers).where(and(
        gte(customers.createdAt, dates.previousMonthStart),
        lte(customers.createdAt, dates.previousMonthEnd),
      )),

      tx.select({
        id: products.id, name: products.name, quantity: products.quantity,
        price: products.price, images: products.images,
      }).from(products).where(and(
        eq(products.status, "active"),
        lte(products.quantity, 10),
      )).orderBy(asc(products.quantity)).limit(10),

      tx.select({ value: count() }).from(products),
    ])

    return {
      currentMonthOrders, previousMonthOrders, recentOrders, todayOrders,
      totalCustomers, newCustomers, previousMonthCustomers,
      lowStockProducts, totalProducts,
    }
  })

  return {
    tenant: tenantRow,
    userName: userRow?.fullName ?? null,
    ...data,
  }
}

// ── Metric calculations ──

export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export function generateSparkline(orders: Array<{ createdAt: Date | null; total: string }>, days = 7): number[] {
  const now = new Date()
  const sparkline: number[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayEnd = new Date(dayStart.getTime() + 86400000)
    const dayRevenue = orders
      .filter((o) => { const d = o.createdAt ? new Date(o.createdAt) : null; return d && d >= dayStart && d < dayEnd })
      .reduce((sum, o) => sum + Number(o.total), 0)
    sparkline.push(dayRevenue)
  }
  return sparkline
}

export function generateRevenueChartData(
  currentOrders: Array<{ createdAt: Date | null; total: string }>,
  previousOrders: Array<{ createdAt: Date | null; total: string }>
): Array<{ date: string; current: number; previous: number }> {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const periodDays = Math.ceil(daysInMonth / 6)
  const chartData: Array<{ date: string; current: number; previous: number }> = []

  for (let i = 0; i < 6; i++) {
    const startDay = i * periodDays + 1
    const endDay = Math.min((i + 1) * periodDays, daysInMonth)
    const filterByDay = (o: { createdAt: Date | null }) => {
      const day = o.createdAt ? new Date(o.createdAt).getDate() : 0
      return day >= startDay && day <= endDay
    }
    chartData.push({
      date: `${String(startDay).padStart(2, "0")}/${String(currentMonth + 1).padStart(2, "0")}`,
      current: currentOrders.filter(filterByDay).reduce((s, o) => s + Number(o.total), 0),
      previous: previousOrders.filter(filterByDay).reduce((s, o) => s + Number(o.total), 0),
    })
  }
  return chartData
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}
