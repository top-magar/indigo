"use server"

import { z } from "zod"
import { getAuthenticatedClient } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { ReturnStatus, ItemCondition } from "@/infrastructure/supabase/types"

async function getAuthenticatedTenant() {
  const { user, supabase } = await getAuthenticatedClient();
  return { supabase, tenantId: user.tenantId, userId: user.id };
}

// ============================================================================
// RETURNS
// ============================================================================

export async function getReturns(filters?: {
  status?: ReturnStatus
  search?: string
  page?: number
  pageSize?: number
}) {
  const { supabase, tenantId } = await getAuthenticatedTenant()
  const page = filters?.page || 1
  const pageSize = filters?.pageSize || 20
  const offset = (page - 1) * pageSize

  let query = supabase
    .from("returns")
    .select(`*, order:orders (id, order_number, total, currency), customer:customers (id, email, first_name, last_name), return_items (*, order_item:order_items (id, product_name, product_image, quantity, unit_price))`, { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.search) query = query.or(`return_number.ilike.%${filters.search}%,customer_notes.ilike.%${filters.search}%`)

  const { data, error, count } = await query
  if (error) return { error: error.message }
  return { data, count }
}

export async function getReturn(returnId: string) {
  const validId = z.string().uuid().parse(returnId)
  const { supabase, tenantId } = await getAuthenticatedTenant()

  const { data, error } = await supabase
    .from("returns")
    .select(`*, order:orders (*, items:order_items (*)), customer:customers (*), return_items (*, order_item:order_items (*))`)
    .eq("id", validId)
    .eq("tenant_id", tenantId)
    .single()

  if (error) return { error: error.message }
  return { data }
}

const createReturnSchema = z.object({
  orderId: z.string().uuid(),
  customerId: z.string().uuid().nullable(),
  reason: z.string().nullable(),
  customerNotes: z.string().max(2000).nullable(),
  refundMethod: z.enum(["original", "store_credit", "manual"]).default("original"),
  shippingPaidBy: z.enum(["customer", "store"]).default("customer"),
})

export async function createReturn(formData: FormData) {
  const { supabase, tenantId } = await getAuthenticatedTenant()

  const parsed = createReturnSchema.parse({
    orderId: formData.get("orderId"),
    customerId: formData.get("customerId") || null,
    reason: formData.get("reason") || null,
    customerNotes: formData.get("customerNotes") || null,
    refundMethod: formData.get("refundMethod") || "original",
    shippingPaidBy: formData.get("shippingPaidBy") || "customer",
  })

  const { orderId, customerId, reason, customerNotes, refundMethod, shippingPaidBy } = parsed
  const itemsJson = formData.get("items") as string

  const { count } = await supabase.from("returns").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId)
  const returnNumber = `RET-${String((count ?? 0) + 1).padStart(6, "0")}`

  const { data: returnData, error: returnError } = await supabase
    .from("returns")
    .insert({ tenant_id: tenantId, order_id: orderId, customer_id: customerId, return_number: returnNumber, status: "requested", reason, customer_notes: customerNotes, refund_method: refundMethod, shipping_paid_by: shippingPaidBy })
    .select()
    .single()

  if (returnError) return { error: returnError.message }

  if (itemsJson) {
    try {
      const items = JSON.parse(itemsJson) as { orderItemId: string; quantity: number; reason?: string; condition?: ItemCondition }[]
      if (items.length > 0) {
        const { error: itemsError } = await supabase.from("return_items").insert(items.map(item => ({
          return_id: returnData.id, order_item_id: item.orderItemId, quantity: item.quantity, reason: item.reason || null, condition: item.condition || "unopened",
        })))
        if (itemsError) {
          await supabase.from("returns").delete().eq("id", returnData.id).eq("tenant_id", tenantId)
          return { error: itemsError.message }
        }
      }
    } catch { /* Invalid JSON */ }
  }

  revalidatePath("/dashboard/orders")
  revalidatePath("/dashboard/orders/returns")
  return { data: returnData }
}

export async function updateReturnStatus(formData: FormData) {
  const { supabase, tenantId } = await getAuthenticatedTenant()

  const parsed = z.object({
    returnId: z.string().uuid(),
    status: z.string().min(1),
    adminNotes: z.string().max(2000).nullable(),
    trackingNumber: z.string().max(255).nullable(),
    refundAmount: z.number().min(0).nullable(),
  }).parse({
    returnId: formData.get("returnId"),
    status: formData.get("status"),
    adminNotes: formData.get("adminNotes") || null,
    trackingNumber: formData.get("trackingNumber") || null,
    refundAmount: formData.get("refundAmount") ? parseFloat(formData.get("refundAmount") as string) : null,
  })

  const { returnId, status, adminNotes, trackingNumber, refundAmount } = parsed
  const updates: Record<string, unknown> = { status: status as ReturnStatus }
  if (adminNotes) updates.admin_notes = adminNotes
  if (trackingNumber) updates.tracking_number = trackingNumber
  if (refundAmount !== null) updates.refund_amount = refundAmount
  if (status === "received") updates.received_at = new Date().toISOString()
  else if (status === "refunded" || status === "completed") updates.refunded_at = new Date().toISOString()

  const { error } = await supabase.from("returns").update(updates).eq("id", returnId).eq("tenant_id", tenantId)
  if (error) return { error: error.message }

  if (status === "refunded" && refundAmount) {
    const { data: returnData } = await supabase.from("returns").select("customer_id, refund_method").eq("id", returnId).eq("tenant_id", tenantId).single()
    if (returnData?.refund_method === "store_credit" && returnData.customer_id) {
      await supabase.from("store_credits").insert({ tenant_id: tenantId, customer_id: returnData.customer_id, amount: refundAmount, balance: refundAmount, reason: "return_refund", source_type: "return", source_id: returnId })
    }
  }

  revalidatePath("/dashboard/orders")
  revalidatePath("/dashboard/orders/returns")
  return { success: true }
}

export async function deleteReturn(returnId: string) {
  const validId = z.string().uuid().parse(returnId)
  const { supabase, tenantId } = await getAuthenticatedTenant()

  const { error } = await supabase.from("returns").delete().eq("id", validId).eq("tenant_id", tenantId)
  if (error) return { error: error.message }

  revalidatePath("/dashboard/orders/returns")
  return { success: true }
}

// ============================================================================
// STORE CREDITS
// ============================================================================

export async function getCustomerStoreCredits(customerId: string) {
  const validId = z.string().uuid().parse(customerId)
  const { supabase, tenantId } = await getAuthenticatedTenant()

  const { data, error } = await supabase.from("store_credits").select(`*, transactions:store_credit_transactions (*)`).eq("customer_id", validId).eq("tenant_id", tenantId).gt("balance", 0).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function createStoreCredit(formData: FormData) {
  const { supabase, tenantId } = await getAuthenticatedTenant()

  const parsed = z.object({
    customerId: z.string().uuid(),
    amount: z.number().positive(),
    reason: z.string().default("manual"),
    currencyCode: z.string().length(3).default("USD"),
    expiresAt: z.string().nullable(),
  }).parse({
    customerId: formData.get("customerId"),
    amount: parseFloat(formData.get("amount") as string),
    reason: formData.get("reason") || "manual",
    currencyCode: formData.get("currencyCode") || "USD",
    expiresAt: formData.get("expiresAt") || null,
  })

  const { customerId, amount, reason, currencyCode, expiresAt } = parsed

  const { data, error } = await supabase.from("store_credits").insert({ tenant_id: tenantId, customer_id: customerId, amount, balance: amount, currency_code: currencyCode, reason, source_type: "manual", expires_at: expiresAt }).select().single()
  if (error) return { error: error.message }

  await supabase.from("store_credit_transactions").insert({ store_credit_id: data.id, type: "credit", amount, balance_after: amount, notes: `Initial credit: ${reason}` })

  revalidatePath("/dashboard/customers")
  return { data }
}

export async function useStoreCredit(formData: FormData) {
  const { supabase, tenantId } = await getAuthenticatedTenant()

  const parsed = z.object({
    storeCreditId: z.string().uuid(),
    amount: z.number().positive(),
    orderId: z.string().uuid().nullable(),
    notes: z.string().max(500).nullable(),
  }).parse({
    storeCreditId: formData.get("storeCreditId"),
    amount: parseFloat(formData.get("amount") as string),
    orderId: formData.get("orderId") || null,
    notes: formData.get("notes") || null,
  })

  const { storeCreditId, amount, orderId, notes } = parsed

  const { data: credit } = await supabase.from("store_credits").select("balance").eq("id", storeCreditId).eq("tenant_id", tenantId).single()
  if (!credit || credit.balance < amount) return { error: "Insufficient store credit balance" }

  const newBalance = credit.balance - amount
  const { error: updateError } = await supabase.from("store_credits").update({ balance: newBalance }).eq("id", storeCreditId).eq("tenant_id", tenantId)
  if (updateError) return { error: updateError.message }

  await supabase.from("store_credit_transactions").insert({ store_credit_id: storeCreditId, type: "debit", amount, balance_after: newBalance, order_id: orderId, notes })

  revalidatePath("/dashboard/orders")
  return { success: true, newBalance }
}
