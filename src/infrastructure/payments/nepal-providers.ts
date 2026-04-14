"use server"

import crypto from "crypto"
import type { PaymentProvider, CreateOrderPayment, PaymentResult, ConfirmPaymentResult } from "./provider"
import type { PaymentStatus } from "@/shared/types/status"

// ── eSewa Payment Provider ──

const ESEWA_CONFIG = {
  paymentUrl: process.env.ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  statusUrl: process.env.ESEWA_STATUS_URL || "https://rc.esewa.com.np/api/epay/transaction/status/",
  merchantCode: process.env.ESEWA_MERCHANT_CODE || "EPAYTEST",
  secret: process.env.ESEWA_SECRET || "",
}

function esewaSignature(message: string): string {
  return crypto.createHmac("sha256", ESEWA_CONFIG.secret).update(message).digest("base64")
}

export class EsewaPaymentProvider implements PaymentProvider {
  readonly name = "esewa"

  async createPayment(input: CreateOrderPayment): Promise<PaymentResult> {
    const { orderId, amount } = input
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/store/${input.metadata?.storeSlug ?? "default"}/checkout/callback?gateway=esewa`
    const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL}/store/${input.metadata?.storeSlug ?? "default"}/checkout?error=payment_failed`

    const totalAmount = amount
    const message = `total_amount=${totalAmount},transaction_uuid=${orderId},product_code=${ESEWA_CONFIG.merchantCode}`
    const signature = esewaSignature(message)

    // eSewa uses form POST redirect — return the URL + form data for client-side redirect
    const params = new URLSearchParams({
      amount: String(amount),
      tax_amount: "0",
      total_amount: String(totalAmount),
      transaction_uuid: orderId,
      product_code: ESEWA_CONFIG.merchantCode,
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
      redirectUrl: `${ESEWA_CONFIG.paymentUrl}?${params.toString()}`,
    }
  }

  async confirmPayment(paymentId: string, tenantId: string): Promise<ConfirmPaymentResult> {
    const orderId = paymentId.replace("esewa_", "")
    const status = await this.getStatus(paymentId, tenantId)
    return { success: status === "paid", status }
  }

  async getStatus(paymentId: string, _tenantId: string): Promise<PaymentStatus> {
    const orderId = paymentId.replace("esewa_", "")
    try {
      const params = new URLSearchParams({
        product_code: ESEWA_CONFIG.merchantCode,
        total_amount: "0", // Will be validated by eSewa against their records
        transaction_uuid: orderId,
      })
      const res = await fetch(`${ESEWA_CONFIG.statusUrl}?${params.toString()}`)
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

// ── Khalti Payment Provider ──

const KHALTI_CONFIG = {
  initiateUrl: process.env.KHALTI_PAYMENT_URL || "https://a.khalti.com/api/v2/epayment/initiate/",
  lookupUrl: process.env.KHALTI_LOOKUP_URL || "https://a.khalti.com/api/v2/epayment/lookup/",
  secretKey: process.env.KHALTI_SECRET_KEY || "",
}

export class KhaltiPaymentProvider implements PaymentProvider {
  readonly name = "khalti"

  async createPayment(input: CreateOrderPayment): Promise<PaymentResult> {
    const { orderId, amount, metadata } = input
    const storeSlug = metadata?.storeSlug ?? "default"
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/store/${storeSlug}/checkout/callback?gateway=khalti`

    try {
      const res = await fetch(KHALTI_CONFIG.initiateUrl, {
        method: "POST",
        headers: {
          Authorization: `Key ${KHALTI_CONFIG.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          return_url: returnUrl,
          website_url: process.env.NEXT_PUBLIC_APP_URL,
          amount: Math.round(amount * 100), // Convert NPR to paisa
          purchase_order_id: orderId,
          purchase_order_name: `Order ${orderId.slice(0, 8)}`,
          customer_info: { name: input.customerEmail, email: input.customerEmail },
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        return { success: false, paymentId: null, status: "failed", error: `Khalti initiation failed: ${err}` }
      }

      const data = await res.json() as { pidx: string; payment_url: string }
      return {
        success: true,
        paymentId: `khalti_${data.pidx}`,
        status: "pending",
        redirectUrl: data.payment_url,
      }
    } catch (e) {
      return { success: false, paymentId: null, status: "failed", error: e instanceof Error ? e.message : "Khalti error" }
    }
  }

  async confirmPayment(paymentId: string, _tenantId: string): Promise<ConfirmPaymentResult> {
    const status = await this.getStatus(paymentId, _tenantId)
    return { success: status === "paid", status }
  }

  async getStatus(paymentId: string, _tenantId: string): Promise<PaymentStatus> {
    const pidx = paymentId.replace("khalti_", "")
    try {
      const res = await fetch(KHALTI_CONFIG.lookupUrl, {
        method: "POST",
        headers: {
          Authorization: `Key ${KHALTI_CONFIG.secretKey}`,
          "Content-Type": "application/json",
        },
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
