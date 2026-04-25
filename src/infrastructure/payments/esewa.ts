/**
 * eSewa Payment Integration
 *
 * Flow: Merchant server → redirect to eSewa → customer pays → eSewa redirects back → server verifies
 * Docs: https://developer.esewa.com.np/pages/Epay
 */
import crypto from "crypto";
import { createLogger } from "@/lib/logger";

const log = createLogger("payments:esewa");

const ESEWA_BASE = process.env.ESEWA_ENV === "production"
  ? "https://epay.esewa.com.np"
  : "https://rc-epay.esewa.com.np"; // test environment

const ESEWA_VERIFY = process.env.ESEWA_ENV === "production"
  ? "https://epay.esewa.com.np/api/epay/transaction/status/"
  : "https://rc-epay.esewa.com.np/api/epay/transaction/status/";

interface InitiateInput {
  amount: number;
  taxAmount?: number;
  productServiceCharge?: number;
  productDeliveryCharge?: number;
  transactionUuid: string; // unique order reference
  merchantCode: string;
  merchantSecret: string;
  successUrl: string;
  failureUrl: string;
}

interface InitiateResult {
  redirectUrl: string;
  formData: Record<string, string>;
}

/** Generate HMAC-SHA256 signature for eSewa */
function generateSignature(message: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(message).digest("base64");
}

/** Build the redirect URL and form data for eSewa payment */
export function initiateEsewaPayment(input: InitiateInput): InitiateResult {
  const totalAmount = input.amount + (input.taxAmount ?? 0) + (input.productServiceCharge ?? 0) + (input.productDeliveryCharge ?? 0);

  const signatureMessage = `total_amount=${totalAmount},transaction_uuid=${input.transactionUuid},product_code=${input.merchantCode}`;
  const signature = generateSignature(signatureMessage, input.merchantSecret);

  const formData: Record<string, string> = {
    amount: String(input.amount),
    tax_amount: String(input.taxAmount ?? 0),
    product_service_charge: String(input.productServiceCharge ?? 0),
    product_delivery_charge: String(input.productDeliveryCharge ?? 0),
    total_amount: String(totalAmount),
    transaction_uuid: input.transactionUuid,
    product_code: input.merchantCode,
    success_url: input.successUrl,
    failure_url: input.failureUrl,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature,
  };

  return {
    redirectUrl: `${ESEWA_BASE}/api/epay/main/v2/form`,
    formData,
  };
}

interface VerifyInput {
  encodedData: string; // base64-encoded response from eSewa callback
  merchantCode: string;
  merchantSecret: string;
  expectedAmount: number;
  expectedTransactionUuid: string;
}

interface VerifyResult {
  success: boolean;
  transactionCode?: string;
  error?: string;
}

/** Verify eSewa payment by decoding callback data and checking status API */
export async function verifyEsewaPayment(input: VerifyInput): Promise<VerifyResult> {
  try {
    // Decode the base64 response
    const decoded = JSON.parse(Buffer.from(input.encodedData, "base64").toString("utf-8"));
    const { transaction_uuid, total_amount, transaction_code, status } = decoded;

    if (status !== "COMPLETE") {
      return { success: false, error: `Payment status: ${status}` };
    }

    if (transaction_uuid !== input.expectedTransactionUuid) {
      return { success: false, error: "Transaction UUID mismatch" };
    }

    if (Number(total_amount) !== input.expectedAmount) {
      return { success: false, error: "Amount mismatch" };
    }

    // Double-check with eSewa status API
    const params = new URLSearchParams({
      product_code: input.merchantCode,
      total_amount: String(input.expectedAmount),
      transaction_uuid: input.expectedTransactionUuid,
    });

    const res = await fetch(`${ESEWA_VERIFY}?${params}`, { method: "GET" });
    if (!res.ok) {
      log.error("eSewa status API failed:", res.status);
      return { success: false, error: "Status verification unavailable" };
    }

    const statusData = await res.json();
    if (statusData.status !== "COMPLETE") {
      return { success: false, error: `Verification status: ${statusData.status}` };
    }

    log.info(`eSewa payment verified: ${transaction_code}`);
    return { success: true, transactionCode: transaction_code };
  } catch (err) {
    log.error("eSewa verification failed:", err);
    return { success: false, error: err instanceof Error ? err.message : "Verification failed" };
  }
}
