/**
 * Khalti Payment Integration (v2 API)
 *
 * Flow: Server initiates → gets payment_url → redirect customer → Khalti callback → server verifies via lookup
 * Docs: https://docs.khalti.com/khalti-epayment/
 */
import { createLogger } from "@/lib/logger";

const log = createLogger("payments:khalti");

const KHALTI_BASE = process.env.KHALTI_ENV === "production"
  ? "https://khalti.com/api/v2"
  : "https://a.khalti.com/api/v2"; // sandbox

interface InitiateInput {
  amount: number; // in paisa (Rs 100 = 10000 paisa)
  purchaseOrderId: string;
  purchaseOrderName: string;
  returnUrl: string;
  websiteUrl: string;
  secretKey: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

interface InitiateResult {
  success: boolean;
  paymentUrl?: string;
  pidx?: string;
  error?: string;
}

/** Initiate Khalti payment — returns a URL to redirect the customer to */
export async function initiateKhaltiPayment(input: InitiateInput): Promise<InitiateResult> {
  try {
    const res = await fetch(`${KHALTI_BASE}/epayment/initiate/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${input.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        return_url: input.returnUrl,
        website_url: input.websiteUrl,
        amount: input.amount,
        purchase_order_id: input.purchaseOrderId,
        purchase_order_name: input.purchaseOrderName,
        ...(input.customerName && { customer_info: {
          name: input.customerName,
          email: input.customerEmail || "",
          phone: input.customerPhone || "",
        }}),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      log.error("Khalti initiate failed:", res.status, err);
      return { success: false, error: err.detail || `Khalti API error: ${res.status}` };
    }

    const data = await res.json();
    log.info(`Khalti payment initiated: pidx=${data.pidx}`);
    return { success: true, paymentUrl: data.payment_url, pidx: data.pidx };
  } catch (err) {
    log.error("Khalti initiate error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to initiate payment" };
  }
}

interface VerifyInput {
  pidx: string;
  secretKey: string;
  expectedAmount: number; // in paisa
  expectedOrderId: string;
}

interface VerifyResult {
  success: boolean;
  transactionId?: string;
  status?: string;
  error?: string;
}

/** Verify Khalti payment via lookup API */
export async function verifyKhaltiPayment(input: VerifyInput): Promise<VerifyResult> {
  try {
    const res = await fetch(`${KHALTI_BASE}/epayment/lookup/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${input.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx: input.pidx }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.detail || `Lookup failed: ${res.status}` };
    }

    const data = await res.json();

    if (data.status !== "Completed") {
      return { success: false, status: data.status, error: `Payment status: ${data.status}` };
    }

    if (data.total_amount !== input.expectedAmount) {
      return { success: false, error: `Amount mismatch: expected ${input.expectedAmount}, got ${data.total_amount}` };
    }

    log.info(`Khalti payment verified: ${data.transaction_id}, status=${data.status}`);
    return { success: true, transactionId: data.transaction_id, status: data.status };
  } catch (err) {
    log.error("Khalti verify error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Verification failed" };
  }
}
