import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ShoppingCart } from "lucide-react"

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ order?: string }>
}) {
  const { slug } = await params
  const { order: orderNumber } = await searchParams
  const supabase = await createClient()

  const { data: tenant } = await supabase.from("tenants").select("id, name").eq("slug", slug).single()

  if (!tenant) notFound()

  let order = null
  if (orderNumber) {
    const { data } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("tenant_id", tenant.id)
      .eq("order_number", orderNumber)
      .single()
    order = data
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="mt-6 text-2xl font-bold">Order Confirmed!</h1>
            <p className="mt-2 text-muted-foreground">
              Thank you for your order. We&apos;ll send you an email confirmation shortly.
            </p>

            {order && (
              <div className="mt-6 rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="text-lg font-semibold">{order.order_number}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Total: <span className="font-medium">${Number(order.total).toFixed(2)}</span>
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href={`/store/${slug}/products`}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
