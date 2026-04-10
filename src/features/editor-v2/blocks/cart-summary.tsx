interface CartSummaryProps {
  itemCount: number; subtotal: string; currency: string
  checkoutUrl: string; buttonText: string
}

export function CartSummary({ itemCount, subtotal, currency, checkoutUrl, buttonText }: CartSummaryProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold">Cart Summary</h3>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between"><span>Items</span><span>{itemCount}</span></div>
        <div className="flex justify-between border-t pt-2 font-semibold"><span>Subtotal</span><span>{currency}{subtotal}</span></div>
      </div>
      {buttonText && <a href={checkoutUrl} className="mt-4 block rounded py-2.5 text-center font-medium text-white" style={{ backgroundColor: "var(--store-color-primary, #000)" }}>{buttonText}</a>}
    </div>
  )
}
