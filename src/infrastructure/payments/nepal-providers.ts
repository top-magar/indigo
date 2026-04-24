import crypto from "crypto"
import { db } from "@/infrastructure/db"
import { tenants } from "@/db/schema/tenants"
import { eq } from "drizzle-orm"
import type { PaymentProvider, CreateOrderPayment, PaymentResult, ConfirmPaymentResult } from "./provider"
import type { PaymentStatus } from "@/shared/types/status"

/** Resolve eSewa/Khalti credentials from tenant settings, falling back to env vars */
async function getTenantPaymentConfig(tenantId: string): Promise<Record<string, unknown>> {
  try {
    const [row] = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, tenantId)).limit(1)
    return (row?.settings as Record<string, unknown>)?.payments as Record<string, unknown> ?? {}
  } catch {
    return {}
  }
}

// ── eSewa URLs (same for all tenants — only credentials differ) ──
const ESEWA_PAYMENT_URL = process.env.ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
const ESEWA_STATUS_URL = process.env.ESEWA_STATUS_URL || "https://rc.esewa.com.np/api/epay/transaction/status/"

export class EsewaPaymentProvider implements PaymentProvider {
  readonly name = "esewa"

  async createPayment(input: CreateOrderPayment): Promise<PaymentResult> {
    const cfg = await getTenantPaymentConfig(input.tenantId)
    const merchantCode = (cfg.esewamerchantCode as string) || process.env.ESEWA_MERCHANT_CODE || "EPAYTEST"
    const secret = (cfg.esewaSecret as string) || process.env.ESEWA_SECRET;
    if (!secret) throw new Error("eSewa secret key not configured. Set ESEWA_SECRET env var or configure in payment settings.");

    const { orderId, amount } = input
    const storeSlug = input.metadata?.storeSlug ?? "default"
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/store/${storeSlug}/checkout/callback?gateway=esewa`
    const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL}/store/${storeSlug}/checkout?error=payment_failed`

    const message = `total_amount=${amount},transaction_uuid=${orderId},product_code=${merchantCode}`
    const signature = crypto.createHmac("sha256", secret).update(message).digest("base64")

    const params = new URLSearchParams({
      amount: String(amount),
      tax_amount: "0",
      total_amount: String(amount),
      transaction_uuid: orderId,
      product_code: merchantCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    })

    return {
      success: true,
      paymentId: `esewa_${orderId}`,
      status: "pending",
      redirectUrl: `${ESEWA_PAYMENT_URL}?${params.toString()}`,
    }
  }

  async confirmPayment(paymentId: string, tenantId: string): Promise<ConfirmPaymentResult> {
    const status = await this.getStatus(paymentId, tenantId)
    return { success: status === "paid", status }
  }

  async getStatus(paymentId: string, tenantId: string): Promise<PaymentStatus> {
    const cfg = await getTenantPaymentConfig(tenantId)
    const merchantCode = (cfg.esewamerchantCode as string) || process.env.ESEWA_MERCHANT_CODE || "EPAYTEST"
    const orderId = paymentId.replace("esewa_", "")

    try {
      const params = new URLSearchParams({
        product_code: merchantCode,
        total_amount: "0",
        transaction_uuid: orderId,
      })
      const res = await fetch(`${ESEWA_STATUS_URL}?${params.toString()}`)
      if (!res.ok) return "pending"
      const data = await res.json() as { status: string }
      if (data.status === "COMPLETE") return "paid"
      if (data.status === "FAILED" || data.status === "CANCELED") return "failed"
      return "pending"
    } catch {
      return "pending"
    }
  }
}

// ── Khalti URLs ──
const KHALTI_INITIATE_URL = process.env.KHALTI_PAYMENT_URL || "https://a.khalti.com/api/v2/epayment/initiate/"
const KHALTI_LOOKUP_URL = process.env.KHALTI_LOOKUP_URL || "https://a.khalti.com/api/v2/epayment/lookup/"

export class KhaltiPaymentProvider implements PaymentProvider {
  readonly name = "khalti"

  async createPayment(input: CreateOrderPayment): Promise<PaymentResult> {
    const cfg = await getTenantPaymentConfig(input.tenantId)
    const secretKey = (cfg.khaltiSecretKey as string) || process.env.KHALTI_SECRET_KEY;
    if (!secretKey) throw new Error("Khalti secret key not configured.");
    const storeSlug = input.metadata?.storeSlug ?? "default"
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/store/${storeSlug}/checkout/callback?gateway=khalti`

    try {
      const res = await fetch(KHALTI_INITIATE_URL, {
        method: "POST",
        headers: { Authorization: `Key ${secretKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          return_url: returnUrl,
          website_url: process.env.NEXT_PUBLIC_APP_URL,
          amount: Math.round(input.amount * 100),
          purchase_order_id: input.orderId,
          purchase_order_name: `Order ${input.orderId.slice(0, 8)}`,
          customer_info: { name: input.customerEmail, email: input.customerEmail },
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        return { success: false, paymentId: null, status: "failed", error: `Khalti initiation failed: ${err}` }
      }

      const data = await res.json() as { pidx: string; payment_url: string }
      return { success: true, paymentId: `khalti_${data.pidx}`, status: "pending", redirectUrl: data.payment_url }
    } catch (e) {
      return { success: false, paymentId: null, status: "failed", error: e instanceof Error ? e.message : "Khalti error" }
    }
  }

  async confirmPayment(paymentId: string, tenantId: string): Promise<ConfirmPaymentResult> {
    const status = await this.getStatus(paymentId, tenantId)
    return { success: status === "paid", status }
  }

  async getStatus(paymentId: string, tenantId: string): Promise<PaymentStatus> {
    const cfg = await getTenantPaymentConfig(tenantId)
    const secretKey = (cfg.khaltiSecretKey as string) || process.env.KHALTI_SECRET_KEY;
    if (!secretKey) throw new Error("Khalti secret key not configured.");
    const pidx = paymentId.replace("khalti_", "")

    try {
      const res = await fetch(KHALTI_LOOKUP_URL, {
        method: "POST",
        headers: { Authorization: `Key ${secretKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ pidx }),
      })
      if (!res.ok) return "pending"
      const data = await res.json() as { status: string }
      if (data.status === "Completed") return "paid"
      if (data.status === "Expired" || data.status === "Failed") return "failed"
      if (data.status === "Refunded") return "refunded"
      return "pending"
    } catch {
      return "pending"
    }
  }
}
