import "server-only"
import { createClient } from "@/infrastructure/supabase/server"

function getDateRanges() {
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return {
    currentMonthStart: currentMonthStart.toISOString(),
    previousMonthStart: previousMonthStart.toISOString(),
    previousMonthEnd: previousMonthEnd.toISOString(),
    todayStart: todayStart.toISOString(),
  }
}

export interface DashboardData {
  tenant: { name: string; currency: string; slug: string; status: string } | null
  userName: string | null
  currentMonthOrders: Array<{ id: string; total: number; status: string; payment_status: string; created_at: string }>
  previousMonthOrders: Array<{ id: string; total: number; status: string; payment_status: string; created_at: string }>
  recentOrders: Array<{ id: string; order_number: string; total: number; status: string; customer_name: string; customer_email: string; created_at: string }>
  todayOrders: Array<{ id: string; total: number; payment_status: string }>
  totalCustomers: number
  newCustomers: number
  previousMonthCustomers: number
  lowStockProducts: Array<{ id: string; name: string; quantity: number; price: number; images: unknown }>
  totalProducts: number
}

export async function fetchDashboardData(userId: string, tenantId: string): Promise<DashboardData> {
  const supabase = await createClient()
  const dates = getDateRanges()

  const [
    { data: tenant },
    { data: userData },
    { data: currentMonthOrders },
    { data: previousMonthOrders },
    { data: recentOrders },
    { data: todayOrders },
    { count: totalCustomers },
    { count: newCustomers },
    { count: previousMonthCustomers },
    { data: lowStockProducts },
    { count: totalProducts },
  ] = await Promise.all([
    supabase.from("tenants").select("name, currency, slug, status").eq("id", tenantId).single(),
    supabase.from("users").select("full_name").eq("id", userId).single(),
    supabase.from("orders").select("id, total, status, payment_status, created_at").eq("tenant_id", tenantId).gte("created_at", dates.currentMonthStart),
    supabase.from("orders").select("id, total, status, payment_status, created_at").eq("tenant_id", tenantId).gte("created_at", dates.previousMonthStart).lte("created_at", dates.previousMonthEnd),
    supabase.from("orders").select("id, order_number, total, status, customer_name, customer_email, created_at").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("id, total, payment_status").eq("tenant_id", tenantId).gte("created_at", dates.todayStart),
    supabase.from("customers").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
    supabase.from("customers").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("created_at", dates.currentMonthStart),
    supabase.from("customers").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("created_at", dates.previousMonthStart).lte("created_at", dates.previousMonthEnd),
    supabase.from("products").select("id, name, quantity, price, images").eq("tenant_id", tenantId).eq("status", "active").lte("quantity", 10).order("quantity", { ascending: true }).limit(10),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
  ])

  return {
    tenant,
    userName: userData?.full_name ?? null,
    currentMonthOrders: (currentMonthOrders ?? []) as DashboardData["currentMonthOrders"],
    previousMonthOrders: (previousMonthOrders ?? []) as DashboardData["previousMonthOrders"],
    recentOrders: (recentOrders ?? []) as DashboardData["recentOrders"],
    todayOrders: (todayOrders ?? []) as DashboardData["todayOrders"],
    totalCustomers: totalCustomers ?? 0,
    newCustomers: newCustomers ?? 0,
    previousMonthCustomers: previousMonthCustomers ?? 0,
    lowStockProducts: (lowStockProducts ?? []) as DashboardData["lowStockProducts"],
    totalProducts: totalProducts ?? 0,
  }
}

// ── Metric calculations ──

export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export function generateSparkline(orders: Array<{ created_at: string; total: number }>, days = 7): number[] {
  const now = new Date()
  const sparkline: number[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayEnd = new Date(dayStart.getTime() + 86400000)
    const dayRevenue = orders
      .filter((o) => { const d = new Date(o.created_at); return d >= dayStart && d < dayEnd })
      .reduce((sum, o) => sum + Number(o.total), 0)
    sparkline.push(dayRevenue)
  }
  return sparkline
}

export function generateRevenueChartData(
  currentOrders: Array<{ created_at: string; total: number }>,
  previousOrders: Array<{ created_at: string; total: number }>
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
    const filterByDay = (o: { created_at: string; total: number }) => {
      const day = new Date(o.created_at).getDate()
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
