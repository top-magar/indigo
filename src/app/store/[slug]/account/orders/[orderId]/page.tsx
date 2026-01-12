import { createClient } from "@/infrastructure/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  Image as ImageIcon,
} from "lucide-react"

interface OrderItem {
  id: string
  product_name: string
  product_sku: string | null
  product_image: string | null
  variant_title: string | null
  quantity: number
  unit_price: number
  total_price: number
}

interface AddressData {
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  name?: string
  phone?: string
}

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  fulfillment_status: string
  subtotal: number
  discount_total: number
  shipping_total: number
  tax_total: number
  total: number
  currency: string
  shipping_address: AddressData | null
  billing_address: AddressData | null
  customer_email: string | null
  customer_name: string | null
  shipping_method: string | null
  shipping_carrier: string | null
  discount_code: string | null
  discount_name: string | null
  created_at: string
  updated_at: string
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ slug: string; orderId: string }>
}) {
  const { slug, orderId } = await params
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

  // Fetch order with items
  const [orderResult, itemsResult] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("tenant_id", tenant.id)
      .eq("customer_email", user.email)
      .single(),
    supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .eq("tenant_id", tenant.id),
  ])

  const order = orderResult.data as Order | null
  const items = (itemsResult.data || []) as OrderItem[]

  if (!order) {
    notFound()
  }

  const currency = order.currency || tenant.currency || "USD"

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href={`/store/${slug}/account/orders`}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Order {order.order_number}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {formattedDate}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.payment_status} />
          <FulfillmentStatusBadge status={order.fulfillment_status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h4 className="font-medium">{item.product_name}</h4>
                      {item.variant_title && (
                        <p className="text-sm text-muted-foreground">{item.variant_title}</p>
                      )}
                      {item.product_sku && (
                        <p className="text-xs text-muted-foreground">SKU: {item.product_sku}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(item.unit_price)} × {item.quantity}
                      </span>
                      <span className="font-medium">{formatCurrency(item.total_price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shipping Information */}
          {order.shipping_address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Shipping Address
                    </h4>
                    <AddressDisplay address={order.shipping_address} />
                  </div>
                  {order.shipping_method && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Shipping Method
                      </h4>
                      <p className="text-sm">{order.shipping_method}</p>
                      {order.shipping_carrier && (
                        <p className="text-sm text-muted-foreground">
                          Carrier: {order.shipping_carrier}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount_total > 0 && (
                <div className="flex justify-between text-sm text-[var(--ds-green-700)]">
                  <span>
                    Discount
                    {order.discount_code && (
                      <span className="ml-1 text-xs">({order.discount_code})</span>
                    )}
                  </span>
                  <span>-{formatCurrency(order.discount_total)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shipping_total > 0 ? formatCurrency(order.shipping_total) : "Free"}
                </span>
              </div>
              {order.tax_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.tax_total)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {order.customer_name && <p className="font-medium">{order.customer_name}</p>}
              {order.customer_email && (
                <p className="text-muted-foreground">{order.customer_email}</p>
              )}
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">Need Help?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                If you have questions about your order, please contact us.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/store/${slug}`}>Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AddressDisplay({ address }: { address: AddressData }) {
  return (
    <div className="text-sm space-y-1">
      {address.name && <p className="font-medium">{address.name}</p>}
      {address.address && <p>{address.address}</p>}
      {(address.city || address.state || address.postal_code) && (
        <p>
          {[address.city, address.state, address.postal_code].filter(Boolean).join(", ")}
        </p>
      )}
      {address.country && <p>{address.country}</p>}
      {address.phone && <p className="text-muted-foreground">{address.phone}</p>}
    </div>
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

  return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>
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

  return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; orderId: string }>
}) {
  const { slug, orderId } = await params
  const supabase = await createClient()

  const [tenantResult, orderResult] = await Promise.all([
    supabase.from("tenants").select("name").eq("slug", slug).single(),
    supabase.from("orders").select("order_number").eq("id", orderId).single(),
  ])

  const tenant = tenantResult.data
  const order = orderResult.data

  if (!tenant || !order) {
    return { title: "Order Details" }
  }

  return {
    title: `Order ${order.order_number} | ${tenant.name}`,
    description: `View details for order ${order.order_number}`,
  }
}
