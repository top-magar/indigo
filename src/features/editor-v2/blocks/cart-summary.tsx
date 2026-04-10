"use client"
import { useEffect, useState } from "react"
import { useBlockMode } from "./data-context"

interface CartSummaryProps {
  itemCount: number; subtotal: string; currency: string
  checkoutUrl: string; buttonText: string
}

export function CartSummary({ itemCount, subtotal, currency, checkoutUrl, buttonText }: CartSummaryProps) {
  const { mode, slug } = useBlockMode()
  const [cart, setCart] = useState({ itemCount, subtotal })
  const [loading, setLoading] = useState(mode === "live")

  useEffect(() => {
    if (mode === "editor") { setCart({ itemCount, subtotal }); return }
    fetch(`/api/store/${slug}/cart`)
      .then((r) => r.json())
      .then((d) => setCart({ itemCount: d.data?.itemCount ?? 0, subtotal: d.data?.subtotal ?? "0.00" }))
      .catch(() => setCart({ itemCount: 0, subtotal: "0.00" }))
      .finally(() => setLoading(false))
  }, [mode, slug, itemCount, subtotal])

  if (loading) return <div className="animate-pulse rounded-lg border border-gray-200 p-6"><div className="h-5 w-1/3 rounded bg-gray-200" /><div className="mt-4 space-y-2"><div className="h-4 rounded bg-gray-200" /><div className="h-4 rounded bg-gray-200" /></div></div>

  if (mode === "live" && cart.itemCount === 0) return (
    <div className="rounded-lg border border-gray-200 p-6 text-center text-gray-500">Your cart is empty</div>
  )

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold">Cart Summary</h3>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between"><span>Items</span><span>{cart.itemCount}</span></div>
        <div className="flex justify-between border-t pt-2 font-semibold"><span>Subtotal</span><span>{currency}{cart.subtotal}</span></div>
      </div>
      {buttonText && <a href={checkoutUrl || `/store/${slug}/checkout`} className="mt-4 block rounded py-2.5 text-center font-medium text-white" style={{ backgroundColor: "var(--store-color-primary, #000)" }}>{buttonText}</a>}
    </div>
  )
}
