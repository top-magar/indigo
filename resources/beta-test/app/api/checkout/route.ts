import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tenantId, items, customerEmail, customerName, shippingAddress, subtotal, total } = body

    const supabase = await createClient()

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

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
    const orderItems = items.map(
      (item: {
        productId: string
        productName: string
        productSku?: string
        productImage?: string
        quantity: number
        unitPrice: number
      }) => ({
        order_id: order.id,
        tenant_id: tenantId,
        product_id: item.productId,
        product_name: item.productName,
        product_sku: item.productSku || null,
        product_image: item.productImage || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
      }),
    )

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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout failed" }, { status: 500 })
  }
}
