/**
 * Payment Provider Registry
 *
 * Adding a new provider:
 * 1. Add to PaymentProviderId type below
 * 2. Create src/infrastructure/payments/{provider}.ts with initiate() + verify()
 * 3. Add config schema to PROVIDER_CONFIGS
 * 4. Add to PROVIDER_REGISTRY
 * 5. TypeScript errors will guide you if you miss a step
 */

import { z } from "zod";

// ── Step 1: Every provider must be listed here ──

export type PaymentProviderId = "cod" | "bank_transfer" | "esewa" | "khalti";

// ── Step 2: Config schema per provider (what credentials the merchant enters) ──

export const PROVIDER_CONFIGS: Record<PaymentProviderId, { label: string; fields: z.ZodObject<z.ZodRawShape> | null }> = {
  cod: { label: "Cash on Delivery", fields: null },
  bank_transfer: { label: "Bank Transfer", fields: null },
  esewa: {
    label: "eSewa",
    fields: z.object({
      merchantCode: z.string().min(1, "Merchant code required"),
      merchantSecret: z.string().min(1, "Secret key required"),
    }),
  },
  khalti: {
    label: "Khalti",
    fields: z.object({
      secretKey: z.string().min(1, "Secret key required"),
    }),
  },
};

// ── Step 3: Initiate + Verify contract ──

export interface InitiatePaymentInput {
  amount: number;
  orderId: string;
  orderNumber: string;
  tenantSlug: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  credentials: Record<string, string>;
}

export interface InitiatePaymentResult {
  success: boolean;
  /** For redirect-based providers (eSewa form, Khalti URL) */
  redirectUrl?: string;
  /** For eSewa: form data to POST */
  formData?: Record<string, string>;
  /** For Khalti: pidx to store */
  pidx?: string;
  error?: string;
}

export interface VerifyPaymentInput {
  orderId: string;
  tenantId: string;
  credentials: Record<string, string>;
  callbackData: Record<string, string>;
}

export interface VerifyPaymentResult {
  success: boolean;
  transactionId?: string;
  amount?: number;
  error?: string;
}

export interface PaymentProviderHandler {
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  verify(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
}

// ── Step 4: Register handlers (TypeScript errors if a provider is missing) ──

const HANDLER_FACTORIES: Record<PaymentProviderId, (() => Promise<PaymentProviderHandler>) | null> = {
  cod: null, // no external handler needed
  bank_transfer: null,
  esewa: async () => {
    const { initiateEsewaPayment, verifyEsewaPayment } = await import("./esewa");
    return {
      async initiate(input) {
        const result = initiateEsewaPayment({
          amount: input.amount,
          transactionUuid: input.orderId,
          merchantCode: input.credentials.merchantCode,
          merchantSecret: input.credentials.merchantSecret,
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/store/${input.tenantSlug}/payment/esewa`,
          failureUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/store/${input.tenantSlug}?payment=failed`,
        });
        return { success: true, formData: result.formData, redirectUrl: result.redirectUrl };
      },
      async verify(input) {
        const result = await verifyEsewaPayment({
          encodedData: input.callbackData.data,
          merchantCode: input.credentials.merchantCode,
          merchantSecret: input.credentials.merchantSecret,
          expectedAmount: Number(input.callbackData.amount) || 0,
          expectedTransactionUuid: input.orderId,
        });
        return { success: result.success, transactionId: result.transactionCode, error: result.error };
      },
    };
  },
  khalti: async () => {
    const { initiateKhaltiPayment, verifyKhaltiPayment } = await import("./khalti");
    return {
      async initiate(input) {
        const result = await initiateKhaltiPayment({
          amount: Math.round(input.amount * 100),
          purchaseOrderId: input.orderId,
          purchaseOrderName: `Order ${input.orderNumber}`,
          returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/store/${input.tenantSlug}/payment/khalti`,
          websiteUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/store/${input.tenantSlug}`,
          secretKey: input.credentials.secretKey,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
        });
        if (result.success && result.paymentUrl) {
          return { success: true, redirectUrl: result.paymentUrl, pidx: result.pidx };
        }
        return { success: false, error: result.error || "Failed to initiate payment" };
      },
      async verify(input) {
        const result = await verifyKhaltiPayment({
          pidx: input.callbackData.pidx,
          secretKey: input.credentials.secretKey,
          expectedAmount: Number(input.callbackData.amount) || 0,
          expectedOrderId: input.orderId,
        });
        return { success: result.success, transactionId: result.transactionId, error: result.error };
      },
    };
  },
};

// ── Public API ──

export function getProviderConfig(id: PaymentProviderId) {
  return PROVIDER_CONFIGS[id];
}

export async function getProviderHandler(id: PaymentProviderId): Promise<PaymentProviderHandler | null> {
  const factory = HANDLER_FACTORIES[id];
  if (!factory) return null;
  return factory();
}

export function isOnlineProvider(id: PaymentProviderId): boolean {
  return HANDLER_FACTORIES[id] !== null;
}

export function getAllProviders(): { id: PaymentProviderId; label: string; requiresCredentials: boolean }[] {
  return (Object.keys(PROVIDER_CONFIGS) as PaymentProviderId[]).map(id => ({
    id,
    label: PROVIDER_CONFIGS[id].label,
    requiresCredentials: PROVIDER_CONFIGS[id].fields !== null,
  }));
}
