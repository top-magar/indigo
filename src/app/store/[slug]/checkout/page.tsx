import { notFound } from "next/navigation"
import { db } from "@/infrastructure/db"
import { tenants } from "@/db/schema/tenants"
import { eq } from "drizzle-orm"
import { retrieveCart } from "@/features/store/data/cart"
import { CheckoutForm } from "./checkout-form"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1)
  if (!tenant) notFound()

  const cart = await retrieveCart(tenant.id)

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <ShoppingCart className="size-16 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="text-muted-foreground">Add some products to checkout</p>
        <Button asChild>
          <Link href={`/store/${slug}/products`}>Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  const settings = (tenant.settings ?? {}) as Record<string, unknown>
  const taxSettings = (settings.tax ?? {}) as { defaultRate?: number; taxName?: string; displayTaxInCart?: boolean }
  const shippingSettings = (settings.shipping ?? {}) as { zones?: { id: string; name: string; regions: string[]; rates: { price: number; name: string }[] }[]; freeShippingThreshold?: number | null }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <div className="mt-8">
          <CheckoutForm
            tenantId={tenant.id}
            slug={slug}
            cart={cart}
            currency={tenant.currency || "NPR"}
            taxRate={taxSettings.defaultRate ?? 0}
            taxName={taxSettings.taxName ?? "Tax"}
            priceIncludesTax={tenant.priceIncludesTax ?? false}
            showTaxInCart={taxSettings.displayTaxInCart ?? true}
            shippingZones={shippingSettings.zones ?? []}
            freeShippingThreshold={shippingSettings.freeShippingThreshold ?? null}
          />
        </div>
      </div>
    </div>
  )
}
