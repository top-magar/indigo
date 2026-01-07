import { createClient } from "@/infrastructure/supabase/server"
import { NextResponse } from "next/server"

// Checkout request validation
interface CheckoutItem {
  productId: string
  productName: string
  productSku?: string
  productImage?: string
  quantity: number
  unitPrice: number
}

interface ShippingAddress {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  phone?: string
}

interface CheckoutRequest {
  tenantId: string
  items: CheckoutItem[]
  customerEmail: string
  customerName: string
  shippingAddress: ShippingAddress
  subtotal: number
  total: number
}

function validateCheckoutRequest(body: unknown): body is CheckoutRequest {
  if (!body || typeof body !== "object") return false
  const req = body as Record<string, unknown>
  
  if (
    typeof req.tenantId !== "string" ||
    typeof req.customerEmail !== "string" ||
    typeof req.customerName !== "string" ||
    typeof req.subtotal !== "number" ||
    typeof req.total !== "number" ||
    !Array.isArray(req.items) ||
    req.items.length === 0 ||
    !req.shippingAddress ||
    typeof req.shippingAddress !== "object"
  ) {
    return false
  }

  return req.items.every((item) => {
    if (!item || typeof item !== "object") return false
    const i = item as Record<string, unknown>
    return (
      typeof i.productId === "string" &&
      typeof i.productName === "string" &&
      typeof i.quantity === "number" &&
      typeof i.unitPrice === "number" &&
      i.quantity > 0
    )
  })
}

export async function POST(request: Request) {
  try {
    // Validate content type
    const contentType = request.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type. Expected application/json" },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate request payload
    if (!validateCheckoutRequest(body)) {
      return NextResponse.json(
        { error: "Invalid checkout request. Missing or invalid fields." },
        { status: 400 }
      )
    }

    const { tenantId, items, customerEmail, customerName, shippingAddress, subtotal, total } = body

    const supabase = await createClient()

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`

    // Create or find customer
    let customerId = null
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("email", customerEmail)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const [firstName, ...lastNameParts] = customerName.split(" ")
      const { data: newCustomer } = await supabase
        .from("customers")
        .insert({
          tenant_id: tenantId,
          email: customerEmail,
          first_name: firstName || null,
          last_name: lastNameParts.join(" ") || null,
          phone: shippingAddress.phone || null,
        })
        .select()
        .single()

      if (newCustomer) {
        customerId = newCustomer.id
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        tenant_id: tenantId,
        customer_id: customerId,
        order_number: orderNumber,
        status: "pending",
        payment_status: "pending",
        fulfillment_status: "unfulfilled",
        subtotal,
        total,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        customer_email: customerEmail,
        customer_name: customerName,
      })
      .select()
      .single()

    if (orderError) {
      throw new Error(orderError.message)
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      tenant_id: tenantId,
      product_id: item.productId,
      product_name: item.productName,
      product_sku: item.productSku || null,
      product_image: item.productImage || null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      throw new Error(itemsError.message)
    }

    // Update product quantities
    for (const item of items) {
      await supabase.rpc("decrement_product_quantity", {
        p_product_id: item.productId,
        p_quantity: item.quantity,
      })
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Checkout failed. Please try again." },
      { status: 500 }
    )
  }
}
