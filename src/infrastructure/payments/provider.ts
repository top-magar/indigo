"use server"

import type { PaymentStatus } from "@/shared/types/status"

// ── Types ──

export type PaymentMethod = "cod" | "bank_transfer" | "esewa" | "khalti"

export interface CreateOrderPayment {
  orderId: string
  tenantId: string
  amount: number
  currency: string
  method: PaymentMethod
  customerEmail: string
  metadata?: Record<string, string>
}

export interface PaymentResult {
  success: boolean
  paymentId: string | null
  status: PaymentStatus
  error?: string
  /** URL to redirect customer to (for eSewa/Khalti) */
  redirectUrl?: string
}

export interface ConfirmPaymentResult {
  success: boolean
  status: PaymentStatus
  error?: string
}

// ── Interface ──

export interface PaymentProvider {
  readonly name: string
  createPayment(input: CreateOrderPayment): Promise<PaymentResult>
  confirmPayment(paymentId: string, tenantId: string): Promise<ConfirmPaymentResult>
  getStatus(paymentId: string, tenantId: string): Promise<PaymentStatus>
}

// ── Manual Payment Provider (COD / Bank Transfer) ──

export class ManualPaymentProvider implements PaymentProvider {
  readonly name = "manual"

  async createPayment(input: CreateOrderPayment): Promise<PaymentResult> {
    // No external payment processing — order is created with pending status
    // Merchant confirms payment manually in dashboard
    return {
      success: true,
      paymentId: `manual_${input.orderId}`,
      status: "pending",
    }
  }

  async confirmPayment(_paymentId: string, _tenantId: string): Promise<ConfirmPaymentResult> {
    return { success: true, status: "paid" }
  }

  async getStatus(_paymentId: string, _tenantId: string): Promise<PaymentStatus> {
    return "pending"
  }
}

// ── Factory ──

import { EsewaPaymentProvider, KhaltiPaymentProvider } from "./nepal-providers"

const providers: Record<PaymentMethod, PaymentProvider> = {
  cod: new ManualPaymentProvider(),
  bank_transfer: new ManualPaymentProvider(),
  esewa: new EsewaPaymentProvider(),
  khalti: new KhaltiPaymentProvider(),
}

export function getPaymentProvider(method?: PaymentMethod): PaymentProvider {
  return providers[method ?? "cod"]
}
