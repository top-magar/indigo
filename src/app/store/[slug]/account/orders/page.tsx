import { createClient } from "@/infrastructure/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ShoppingBag01Icon,
  ArrowRight01Icon,
  Package01Icon,
} from "@hugeicons/core-free-icons"

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  fulfillment_status: string
  total: number
  currency: string
  items_count: number
  created_at: string
}

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch tenant
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, name, slug, currency")
    .eq("slug", slug)
    .single()

  if (tenantError || !tenant) {
    notFound()
  }

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/store/${slug}`)
  }

  // Fetch orders for this customer
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, payment_status, fulfillment_status, total, currency, items_count, created_at")
    .eq("tenant_id", tenant.id)
    .eq("customer_email", user.email)
    .order("created_at", { ascending: false })

  const currency = tenant.currency || "USD"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order History</h1>
        <p className="text-muted-foreground">
          View and track your orders
        </p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              storeSlug={slug}
              currency={currency}
            />
          ))}
        </div>
      ) : (
        <EmptyOrders storeSlug={slug} />
      )}
    </div>
  )
}

function OrderCard({
  order,
  storeSlug,
  currency,
}: {
  order: Order
  storeSlug: string
  currency: string
}) {
  const formattedDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: order.currency || currency,
  }).format(order.total)

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <HugeiconsIcon icon={Package01Icon} className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{order.order_number}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {formattedDate} · {order.items_count} {order.items_count === 1 ? "item" : "items"}
              </p>
              <div className="flex items-center gap-2">
                <PaymentStatusBadge status={order.payment_status} />
                <FulfillmentStatusBadge status={order.fulfillment_status} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">{formattedTotal}</span>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/store/${storeSlug}/account/orders/${order.id}`}>
                View Details
                <HugeiconsIcon icon={ArrowRight01Icon} className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    confirmed: "default",
    processing: "default",
    shipped: "default",
    delivered: "default",
    cancelled: "destructive",
    refunded: "destructive",
  }

  const labels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
  }

  return (
    <Badge variant={variants[status] || "secondary"}>
      {labels[status] || status}
    </Badge>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "outline",
    paid: "default",
    partially_refunded: "secondary",
    refunded: "destructive",
    failed: "destructive",
  }

  const labels: Record<string, string> = {
    pending: "Payment Pending",
    paid: "Paid",
    partially_refunded: "Partially Refunded",
    refunded: "Refunded",
    failed: "Payment Failed",
  }

  return (
    <Badge variant={variants[status] || "outline"} className="text-[0.6rem]">
      {labels[status] || status}
    </Badge>
  )
}

function FulfillmentStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    unfulfilled: "outline",
    partially_fulfilled: "secondary",
    fulfilled: "default",
  }

  const labels: Record<string, string> = {
    unfulfilled: "Unfulfilled",
    partially_fulfilled: "Partially Fulfilled",
    fulfilled: "Fulfilled",
  }

  return (
    <Badge variant={variants[status] || "outline"} className="text-[0.6rem]">
      {labels[status] || status}
    </Badge>
  )
}

function EmptyOrders({ storeSlug }: { storeSlug: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <HugeiconsIcon icon={ShoppingBag01Icon} className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          When you place an order, it will appear here.
        </p>
        <Button className="mt-6" asChild>
          <Link href={`/store/${storeSlug}/products`}>
            Start Shopping
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("name")
    .eq("slug", slug)
    .single()

  if (!tenant) {
    return { title: "Orders" }
  }

  return {
    title: `Order History | ${tenant.name}`,
    description: `View your order history at ${tenant.name}`,
  }
}
