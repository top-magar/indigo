"use client"

import type React from "react"

import { useMemo, useState } from "react"
import type { Order, Product, Customer, OrderItem } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, ArrowUp, ArrowDown } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

interface OrderWithItems extends Order {
  items: OrderItem[]
}

interface AnalyticsDashboardProps {
  orders: OrderWithItems[]
  products: Product[]
  customers: Customer[]
  currency: string
}

type DateRange = "7d" | "30d" | "90d" | "1y"

const COLORS = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#6366f1"]

export function AnalyticsDashboard({ orders, products, customers, currency }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange>("30d")

  const filteredOrders = useMemo(() => {
    const now = new Date()
    const daysMap: Record<DateRange, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 }
    const cutoff = new Date(now.getTime() - daysMap[dateRange] * 24 * 60 * 60 * 1000)
    return orders.filter((order) => new Date(order.created_at) >= cutoff)
  }, [orders, dateRange])

  const previousPeriodOrders = useMemo(() => {
    const now = new Date()
    const daysMap: Record<DateRange, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 }
    const days = daysMap[dateRange]
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const previousCutoff = new Date(cutoff.getTime() - days * 24 * 60 * 60 * 1000)
    return orders.filter((order) => {
      const date = new Date(order.created_at)
      return date >= previousCutoff && date < cutoff
    })
  }, [orders, dateRange])

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders
      .filter((o) => o.payment_status === "paid")
      .reduce((sum, o) => sum + Number(o.total), 0)
    const previousRevenue = previousPeriodOrders
      .filter((o) => o.payment_status === "paid")
      .reduce((sum, o) => sum + Number(o.total), 0)
    const revenueChange =
      previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : totalRevenue > 0 ? 100 : 0

    const totalOrders = filteredOrders.length
    const previousOrders = previousPeriodOrders.length
    const ordersChange =
      previousOrders > 0 ? ((totalOrders - previousOrders) / previousOrders) * 100 : totalOrders > 0 ? 100 : 0

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const previousAvg =
      previousOrders > 0
        ? previousPeriodOrders.filter((o) => o.payment_status === "paid").reduce((sum, o) => sum + Number(o.total), 0) /
          previousOrders
        : 0
    const avgChange =
      previousAvg > 0 ? ((avgOrderValue - previousAvg) / previousAvg) * 100 : avgOrderValue > 0 ? 100 : 0

    const conversionRate = products.length > 0 ? (totalOrders / products.length) * 100 : 0

    return {
      totalRevenue,
      revenueChange,
      totalOrders,
      ordersChange,
      avgOrderValue,
      avgChange,
      conversionRate,
      newCustomers: customers.filter((c) => {
        const cutoff = new Date(
          Date.now() -
            (dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365) * 24 * 60 * 60 * 1000,
        )
        return new Date(c.created_at) >= cutoff
      }).length,
    }
  }, [filteredOrders, previousPeriodOrders, products, customers, dateRange])

  // Revenue over time chart data
  const revenueChartData = useMemo(() => {
    const daysMap: Record<DateRange, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 }
    const days = daysMap[dateRange]
    const data: { date: string; revenue: number; orders: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayOrders = filteredOrders.filter((o) => o.created_at.split("T")[0] === dateStr)
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: dayOrders.filter((o) => o.payment_status === "paid").reduce((sum, o) => sum + Number(o.total), 0),
        orders: dayOrders.length,
      })
    }

    // Group by week if more than 30 days
    if (days > 30) {
      const weeklyData: typeof data = []
      for (let i = 0; i < data.length; i += 7) {
        const week = data.slice(i, i + 7)
        weeklyData.push({
          date: week[0].date,
          revenue: week.reduce((sum, d) => sum + d.revenue, 0),
          orders: week.reduce((sum, d) => sum + d.orders, 0),
        })
      }
      return weeklyData
    }

    return data
  }, [filteredOrders, dateRange])

  // Top products by revenue
  const topProducts = useMemo(() => {
    const productRevenue: Record<string, { name: string; revenue: number; quantity: number }> = {}

    filteredOrders.forEach((order) => {
      if (order.payment_status === "paid" && order.items) {
        order.items.forEach((item) => {
          const key = item.product_id || item.product_name
          if (!productRevenue[key]) {
            productRevenue[key] = { name: item.product_name, revenue: 0, quantity: 0 }
          }
          productRevenue[key].revenue += Number(item.total_price)
          productRevenue[key].quantity += item.quantity
        })
      }
    })

    return Object.values(productRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [filteredOrders])

  // Order status distribution
  const orderStatusData = useMemo(() => {
    const statusCounts: Record<string, number> = {}
    filteredOrders.forEach((order) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
    })
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  }, [filteredOrders])

  // Recent orders for the table
  const recentOrders = filteredOrders.slice(0, 5)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-end">
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={metrics.revenueChange}
          icon={DollarSign}
        />
        <MetricCard
          title="Orders"
          value={metrics.totalOrders.toString()}
          change={metrics.ordersChange}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Average Order"
          value={formatCurrency(metrics.avgOrderValue)}
          change={metrics.avgChange}
          icon={TrendingUp}
        />
        <MetricCard title="New Customers" value={metrics.newCustomers.toString()} icon={Users} />
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>
                {dateRange === "7d" ? "Daily" : dateRange === "30d" ? "Daily" : "Weekly"} revenue for the selected
                period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${v}`}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Orders Over Time</CardTitle>
                <CardDescription>Number of orders placed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
                <CardDescription>Distribution by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {orderStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {orderStatusData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No orders in this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.quantity} sold</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No sales data for this period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from your store</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_email || "Guest"}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="capitalize">
                      {order.status}
                    </Badge>
                    <p className="font-semibold">{formatCurrency(Number(order.total))}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change?: number
  icon: React.ComponentType<{ className?: string }>
}

function MetricCard({ title, value, change, icon: Icon }: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? <ArrowUp className="mr-1 h-4 w-4" /> : <ArrowDown className="mr-1 h-4 w-4" />}
            <span>{Math.abs(change).toFixed(1)}% vs previous period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
