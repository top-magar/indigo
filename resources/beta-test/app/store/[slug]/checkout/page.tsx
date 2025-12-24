import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CheckoutForm } from "@/components/store/checkout-form"

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase.from("tenants").select("*").eq("slug", slug).single()

  if (!tenant) notFound()

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <CheckoutForm tenant={tenant} />
      </div>
    </div>
  )
}
