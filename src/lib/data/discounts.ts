/**
 * Server-side discount data layer for storefront
 */
"use server"

import { createClient } from "@/lib/supabase/server"

interface CartItem {
  productId: string
  variantId?: string | null
  unitPrice: number
  quantity: number
}

interface ApplyVoucherResult {
  valid: boolean
  error?: string
  discountAmount: number
  discountId?: string
  voucherCodeId?: string
  voucherCode?: string
  discountType?: string
  discountValue?: number
  discountName?: string
}

interface ProductSale {
  saleId: string
  saleName: string
  type: "percentage" | "fixed"
  value: number
  salePrice: number
}

/**
 * Apply a voucher code to a cart
 */
export async function applyVoucherToCart(
  tenantId: string,
  code: string,
  cartItems: CartItem[],
  customerId?: string
): Promise<ApplyVoucherResult> {
  const now = new Date()
  const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  try {
    const supabase = await createClient()

    // Find the voucher code
    const { data: voucherCode, error: codeError } = await supabase
      .from("voucher_codes")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("code", code.toUpperCase())
      .single()

    if (codeError || !voucherCode) {
      return { valid: false, error: "Invalid voucher code", discountAmount: 0 }
    }

    if (voucherCode.status !== "active") {
      return { valid: false, error: "This voucher code is no longer valid", discountAmount: 0 }
    }

    // Get the discount
    const { data: discount, error: discountError } = await supabase
      .from("discounts")
      .select("*")
      .eq("id", voucherCode.discount_id)
      .single()

    if (discountError || !discount) {
      return { valid: false, error: "Discount not found", discountAmount: 0 }
    }

    // Validate discount
    if (!discount.is_active) {
      return { valid: false, error: "This discount is no longer active", discountAmount: 0 }
    }

    if (discount.starts_at && new Date(discount.starts_at) > now) {
      return { valid: false, error: "This discount is not yet active", discountAmount: 0 }
    }

    if (discount.ends_at && new Date(discount.ends_at) < now) {
      return { valid: false, error: "This discount has expired", discountAmount: 0 }
    }

    if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
      return { valid: false, error: "This discount has reached its usage limit", discountAmount: 0 }
    }

    if (discount.min_order_amount && subtotal < parseFloat(discount.min_order_amount)) {
      return {
        valid: false,
        error: `Minimum order amount of $${discount.min_order_amount} required`,
        discountAmount: 0,
      }
    }

    if (discount.min_checkout_items_quantity && totalQuantity < discount.min_checkout_items_quantity) {
      return {
        valid: false,
        error: `Minimum ${discount.min_checkout_items_quantity} items required`,
        discountAmount: 0,
      }
    }

    // Check per-code usage limit
    if (voucherCode.usage_limit && voucherCode.used_count >= voucherCode.usage_limit) {
      return { valid: false, error: "This code has reached its usage limit", discountAmount: 0 }
    }

    // Check per-customer usage
    if (customerId && discount.apply_once_per_customer) {
      const { count } = await supabase
        .from("discount_usages")
        .select("*", { count: "exact", head: true })
        .eq("discount_id", discount.id)
        .eq("customer_id", customerId)

      if (count && count > 0) {
        return { valid: false, error: "You have already used this discount", discountAmount: 0 }
      }
    }

    // Calculate discount amount
    const discountValue = parseFloat(discount.value)
    let discountAmount = 0

    if (discount.type === "free_shipping") {
      // Free shipping handled separately
      discountAmount = 0
    } else if (discount.scope === "entire_order") {
      if (discount.type === "percentage") {
        discountAmount = subtotal * (discountValue / 100)
      } else {
        discountAmount = Math.min(discountValue, subtotal)
      }
    } else {
      // Specific products - would need product IDs to calculate
      // For now, apply to entire order
      if (discount.type === "percentage") {
        discountAmount = subtotal * (discountValue / 100)
      } else {
        discountAmount = Math.min(discountValue, subtotal)
      }
    }

    return {
      valid: true,
      discountAmount: Math.round(discountAmount * 100) / 100,
      discountId: discount.id,
      voucherCodeId: voucherCode.id,
      voucherCode: voucherCode.code,
      discountType: discount.type,
      discountValue,
      discountName: discount.name,
    }
  } catch (error) {
    console.error("Failed to apply voucher code:", error)
    return { valid: false, error: "Failed to apply voucher code", discountAmount: 0 }
  }
}

/**
 * Get applicable sales for products
 */
export async function getProductSales(
  tenantId: string,
  productIds: string[]
): Promise<Map<string, ProductSale>> {
  const productSales = new Map<string, ProductSale>()
  const now = new Date()

  try {
    const supabase = await createClient()

    // Get all active sales
    const { data: sales } = await supabase
      .from("discounts")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("kind", "sale")
      .eq("is_active", true)

    if (!sales) return productSales

    // Get product prices
    const { data: products } = await supabase
      .from("products")
      .select("id, price")
      .in("id", productIds)

    const productPrices = new Map(products?.map(p => [p.id, parseFloat(p.price)]) || [])

    for (const sale of sales) {
      // Check date range
      if (sale.starts_at && new Date(sale.starts_at) > now) continue
      if (sale.ends_at && new Date(sale.ends_at) < now) continue

      const applicableProductIds = sale.applicable_product_ids || []
      const applicableCategoryIds = sale.applicable_category_ids || []
      const applicableCollectionIds = sale.applicable_collection_ids || []

      for (const productId of productIds) {
        // Check if sale applies to this product
        const applies = applicableProductIds.includes(productId) ||
          applicableCategoryIds.length > 0 ||
          applicableCollectionIds.length > 0

        if (applies || (applicableProductIds.length === 0 && applicableCategoryIds.length === 0 && applicableCollectionIds.length === 0)) {
          const originalPrice = productPrices.get(productId) || 0
          const saleValue = parseFloat(sale.value)

          let salePrice = originalPrice
          if (sale.type === "percentage") {
            salePrice = originalPrice * (1 - saleValue / 100)
          } else if (sale.type === "fixed") {
            salePrice = Math.max(0, originalPrice - saleValue)
          }

          // Use the best discount if multiple apply
          const existing = productSales.get(productId)
          if (!existing || salePrice < existing.salePrice) {
            productSales.set(productId, {
              saleId: sale.id,
              saleName: sale.name,
              type: sale.type as "percentage" | "fixed",
              value: saleValue,
              salePrice: Math.round(salePrice * 100) / 100,
            })
          }
        }
      }
    }

    return productSales
  } catch (error) {
    console.error("Failed to get product sales:", error)
    return productSales
  }
}

/**
 * Record discount usage after order completion
 */
export async function recordDiscountUsage(
  tenantId: string,
  discountId: string,
  orderId: string,
  discountAmount: number,
  voucherCodeId?: string,
  customerId?: string
): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Record usage
    await supabase.from("discount_usages").insert({
      tenant_id: tenantId,
      discount_id: discountId,
      voucher_code_id: voucherCodeId || null,
      order_id: orderId,
      customer_id: customerId || null,
      discount_amount: discountAmount,
    })

    // Increment discount usage count
    await supabase.rpc("increment_discount_usage", { discount_id: discountId })

    // Increment voucher code usage count if applicable
    if (voucherCodeId) {
      await supabase.rpc("increment_voucher_code_usage", { code_id: voucherCodeId })
    }

    return true
  } catch (error) {
    console.error("Failed to record discount usage:", error)
    return false
  }
}
