import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Order Confirmed" }
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ order?: string }>
}) {
  const { slug } = await params
  const { order } = await searchParams

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-12">
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle className="size-10 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thank you for your order. We&apos;ve received your order and will begin processing it shortly.
          </p>
          {order && (
            <p className="font-medium">
              Order Number: <span className="font-mono">{order}</span>
            </p>
          )}
          <div className="flex flex-col gap-2 pt-4">
            <Button asChild>
              <Link href={`/store/${slug}/products`}>Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/store/${slug}`}>Back to Store</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
