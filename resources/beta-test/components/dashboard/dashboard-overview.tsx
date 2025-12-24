"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingCart, Users, DollarSign, Plus, Settings, Store, ArrowRight } from "lucide-react"

interface DashboardOverviewProps {
  stats: {
    products: number
    activeProducts: number
    orders: number
    customers: number
    revenue: number
    todayOrders: number
    todayRevenue: number
    recentOrders: Array<{
      id: string
      total: number
      status: string
      payment_status: string
      created_at: string
      customer_email: string | null
    }>
  }
  tenant: {
    name: string
    slug: string
    currency: string
  }
}

export function DashboardOverview({ stats, tenant }: DashboardOverviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: tenant.currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.revenue),
      icon: DollarSign,
      description: `${formatCurrency(stats.todayRevenue)} today`,
      href: "/dashboard/analytics",
    },
    {
      title: "Orders",
      value: stats.orders.toString(),
      icon: ShoppingCart,
      description: `${stats.todayOrders} today`,
      href: "/dashboard/orders",
    },
    {
      title: "Products",
      value: stats.products.toString(),
      icon: Package,
      description: `${stats.activeProducts} active`,
      href: "/dashboard/products",
    },
    {
      title: "Customers",
      value: stats.customers.toString(),
      icon: Users,
      description: "Total registered",
      href: "/dashboard/customers",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from your store</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/orders">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.customer_email || "Guest"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize text-xs">
                        {order.status}
                      </Badge>
                      <span className="font-medium">{formatCurrency(Number(order.total))}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
                <p className="text-xs text-muted-foreground mt-1">Share your store to start receiving orders</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your store</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start h-auto py-3 bg-transparent" asChild>
              <Link href="/dashboard/products/new">
                <Plus className="mr-3 h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium">Add Product</p>
                  <p className="text-xs text-muted-foreground">Create a new product listing</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3 bg-transparent" asChild>
              <Link href={`/store/${tenant.slug}`} target="_blank">
                <Store className="mr-3 h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium">View Storefront</p>
                  <p className="text-xs text-muted-foreground">See your public store</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3 bg-transparent" asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-3 h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium">Store Settings</p>
                  <p className="text-xs text-muted-foreground">Customize branding and options</p>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Store Link Banner */}
      <Card className="bg-gradient-to-r from-sky-500/10 to-violet-500/10 border-sky-500/20">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <div>
            <h3 className="font-semibold">Your Store is Live</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Share your store link with customers:{" "}
              <code className="bg-muted px-2 py-0.5 rounded text-xs">/store/{tenant.slug}</code>
            </p>
          </div>
          <Button asChild>
            <Link href={`/store/${tenant.slug}`} target="_blank">
              Visit Store
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
