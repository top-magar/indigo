"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Ticket, X, CheckCircle, Loader2 } from "lucide-react"
import { applyVoucherToCart } from "@/features/store/data/discounts"

interface CartItem {
  productId: string
  variantId?: string | null
  unitPrice: number
  quantity: number
}

interface AppliedVoucher {
  code: string
  discountId: string
  voucherCodeId: string
  discountAmount: number
  discountType: string
  discountValue: number
  discountName: string
}

interface VoucherInputProps {
  tenantId: string
  cartItems: CartItem[]
  customerId?: string
  appliedVoucher: AppliedVoucher | null
  onVoucherApplied: (voucher: AppliedVoucher) => void
  onVoucherRemoved: () => void
}

export function VoucherInput({
  tenantId,
  cartItems,
  customerId,
  appliedVoucher,
  onVoucherApplied,
  onVoucherRemoved,
}: VoucherInputProps) {
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleApply = () => {
    if (!code.trim()) {
      setError("Please enter a voucher code")
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await applyVoucherToCart(tenantId, code.trim(), cartItems, customerId)

      if (result.valid && result.discountId && result.voucherCodeId) {
        onVoucherApplied({
          code: result.voucherCode || code.trim().toUpperCase(),
          discountId: result.discountId,
          voucherCodeId: result.voucherCodeId,
          discountAmount: result.discountAmount,
          discountType: result.discountType || "percentage",
          discountValue: result.discountValue || 0,
          discountName: result.discountName || "Discount",
        })
        setCode("")
      } else {
        setError(result.error || "Invalid voucher code")
      }
    })
  }

  const handleRemove = () => {
    onVoucherRemoved()
    setCode("")
    setError(null)
  }

  if (appliedVoucher) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Voucher Applied</Label>
        <div className="flex items-center justify-between p-3 bg-[var(--ds-green-100)] border border-[var(--ds-green-200)] rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[var(--ds-green-700)]" />
            <div>
              <p className="font-medium text-[var(--ds-green-900)]">{appliedVoucher.code}</p>
              <p className="text-sm text-[var(--ds-green-700)]">
                {appliedVoucher.discountName} - Save ${appliedVoucher.discountAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-[var(--ds-green-800)] hover:text-[var(--ds-green-1000)] hover:bg-[var(--ds-green-200)]"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="voucher-code" className="text-sm font-medium">
        Voucher Code
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          />
          <Input
            id="voucher-code"
            placeholder="Enter code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleApply()
              }
            }}
            className="pl-9 uppercase"
            disabled={isPending}
          />
        </div>
        <Button onClick={handleApply} disabled={isPending || !code.trim()}>
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
