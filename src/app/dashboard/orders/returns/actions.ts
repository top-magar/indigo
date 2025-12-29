"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ReturnStatus, ReturnReason, ItemCondition } from "@/lib/supabase/types"

// ============================================================================
// RETURNS
// ============================================================================

export async function getReturns(tenantId: string, filters?: {
  status?: ReturnStatus
  search?: string
  page?: number
  pageSize?: number
}) {
  const supabase = await createClient()
  const page = filters?.page || 1
  const pageSize = filters?.pageSize || 20
  const offset = (page - 1) * pageSize

  let query = supabase
    .from("returns")
    .select(`
      *,
      order:orders (
        id,
        order_number,
        total,
        currency
      ),
      customer:customers (
        id,
        email,
        first_name,
        last_name
      ),
      return_items (
        *,
        order_item:order_items (
          id,
          product_name,
          product_image,
          quantity,
          unit_price
        )
      )
    `, { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  if (filters?.search) {
    query = query.or(`return_number.ilike.%${filters.search}%,customer_notes.ilike.%${filters.search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return { error: error.message }
  }

  return { data, count }
}

export async function getReturn(returnId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("returns")
    .select(`
      *,
      order:orders (
        *,
        items:order_items (*)
      ),
      customer:customers (*),
      return_items (
        *,
        order_item:order_items (*)
      )
    `)
    .eq("id", returnId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function createReturn(formData: FormData) {
  const supabase = await createClient()
  
  const tenantId = formData.get("tenantId") as string
  const orderId = formData.get("orderId") as string
  const customerId = formData.get("customerId") as string || null
  const reason = formData.get("reason") as ReturnReason || null
  const customerNotes = formData.get("customerNotes") as string || null
  const refundMethod = formData.get("refundMethod") as "original" | "store_credit" | "manual" || "original"
  const shippingPaidBy = formData.get("shippingPaidBy") as "customer" | "store" || "customer"
  const itemsJson = formData.get("items") as string

  // Generate return number
  const { count } = await supabase
    .from("returns")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)

  const returnNumber = `RET-${String((count ?? 0) + 1).padStart(6, "0")}`

  // Create return
  const { data: returnData, error: returnError } = await supabase
    .from("returns")
    .insert({
      tenant_id: tenantId,
      order_id: orderId,
      customer_id: customerId,
      return_number: returnNumber,
      status: "requested",
      reason,
      customer_notes: customerNotes,
      refund_method: refundMethod,
      shipping_paid_by: shippingPaidBy,
    })
    .select()
    .single()

  if (returnError) {
    return { error: returnError.message }
  }

  // Add return items
  if (itemsJson) {
    try {
      const items = JSON.parse(itemsJson) as {
        orderItemId: string
        quantity: number
        reason?: string
        condition?: ItemCondition
      }[]

      if (items.length > 0) {
        const itemInserts = items.map(item => ({
          return_id: returnData.id,
          order_item_id: item.orderItemId,
          quantity: item.quantity,
          reason: item.reason || null,
          condition: item.condition || "unopened",
        }))

        const { error: itemsError } = await supabase
          .from("return_items")
          .insert(itemInserts)

        if (itemsError) {
          // Rollback return creation
          await supabase.from("returns").delete().eq("id", returnData.id)
          return { error: itemsError.message }
        }
      }
    } catch {
      // Invalid JSON
    }
  }

  revalidatePath("/dashboard/orders")
  revalidatePath("/dashboard/orders/returns")
  return { data: returnData }
}

export async function updateReturnStatus(formData: FormData) {
  const supabase = await createClient()
  
  const returnId = formData.get("returnId") as string
  const status = formData.get("status") as ReturnStatus
  const adminNotes = formData.get("adminNotes") as string || null
  const trackingNumber = formData.get("trackingNumber") as string || null
  const refundAmount = formData.get("refundAmount") ? parseFloat(formData.get("refundAmount") as string) : null

  const updates: Record<string, unknown> = { status }

  if (adminNotes) updates.admin_notes = adminNotes
  if (trackingNumber) updates.tracking_number = trackingNumber
  if (refundAmount !== null) updates.refund_amount = refundAmount

  // Set timestamps based on status
  if (status === "received") {
    updates.received_at = new Date().toISOString()
  } else if (status === "refunded" || status === "completed") {
    updates.refunded_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from("returns")
    .update(updates)
    .eq("id", returnId)

  if (error) {
    return { error: error.message }
  }

  // If refunded with store credit, create store credit
  if (status === "refunded" && refundAmount) {
    const { data: returnData } = await supabase
      .from("returns")
      .select("customer_id, tenant_id, refund_method")
      .eq("id", returnId)
      .single()

    if (returnData?.refund_method === "store_credit" && returnData.customer_id) {
      await supabase
        .from("store_credits")
        .insert({
          tenant_id: returnData.tenant_id,
          customer_id: returnData.customer_id,
          amount: refundAmount,
          balance: refundAmount,
          reason: "return_refund",
          source_type: "return",
          source_id: returnId,
        })
    }
  }

  revalidatePath("/dashboard/orders")
  revalidatePath("/dashboard/orders/returns")
  return { success: true }
}

export async function deleteReturn(returnId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("returns")
    .delete()
    .eq("id", returnId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/orders/returns")
  return { success: true }
}

// ============================================================================
// STORE CREDITS
// ============================================================================

export async function getCustomerStoreCredits(customerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("store_credits")
    .select(`
      *,
      transactions:store_credit_transactions (*)
    `)
    .eq("customer_id", customerId)
    .gt("balance", 0)
    .order("created_at", { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function createStoreCredit(formData: FormData) {
  const supabase = await createClient()
  
  const tenantId = formData.get("tenantId") as string
  const customerId = formData.get("customerId") as string
  const amount = parseFloat(formData.get("amount") as string)
  const reason = formData.get("reason") as string || "manual"
  const currencyCode = formData.get("currencyCode") as string || "USD"
  const expiresAt = formData.get("expiresAt") as string || null

  const { data, error } = await supabase
    .from("store_credits")
    .insert({
      tenant_id: tenantId,
      customer_id: customerId,
      amount,
      balance: amount,
      currency_code: currencyCode,
      reason,
      source_type: "manual",
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Create initial transaction
  await supabase
    .from("store_credit_transactions")
    .insert({
      store_credit_id: data.id,
      type: "credit",
      amount,
      balance_after: amount,
      notes: `Initial credit: ${reason}`,
    })

  revalidatePath("/dashboard/customers")
  return { data }
}

export async function useStoreCredit(formData: FormData) {
  const supabase = await createClient()
  
  const storeCreditId = formData.get("storeCreditId") as string
  const amount = parseFloat(formData.get("amount") as string)
  const orderId = formData.get("orderId") as string || null
  const notes = formData.get("notes") as string || null

  // Get current balance
  const { data: credit } = await supabase
    .from("store_credits")
    .select("balance")
    .eq("id", storeCreditId)
    .single()

  if (!credit || credit.balance < amount) {
    return { error: "Insufficient store credit balance" }
  }

  const newBalance = credit.balance - amount

  // Update balance
  const { error: updateError } = await supabase
    .from("store_credits")
    .update({ balance: newBalance })
    .eq("id", storeCreditId)

  if (updateError) {
    return { error: updateError.message }
  }

  // Create transaction
  const { error: txError } = await supabase
    .from("store_credit_transactions")
    .insert({
      store_credit_id: storeCreditId,
      type: "debit",
      amount,
      balance_after: newBalance,
      order_id: orderId,
      notes,
    })

  if (txError) {
    return { error: txError.message }
  }

  revalidatePath("/dashboard/orders")
  return { success: true, newBalance }
}
