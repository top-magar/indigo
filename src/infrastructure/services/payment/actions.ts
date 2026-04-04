"use server";

/**
 * Payment Service — Local payment providers (eSewa, Khalti, ConnectIPS)
 * 
 * STATUS: NOT IMPLEMENTED
 * Stripe payments are handled via /api/webhooks/stripe.
 * These local providers need actual gateway integration before use.
 */

import { createLogger } from "@/lib/logger";
import { AppError } from "@/shared/errors";

const log = createLogger("infra:payment");

// Types
export interface InitiatePaymentInput {
    orderId: string;
    amount: number;
    provider: 'esewa' | 'khalti' | 'connectips';
    returnUrl: string;
}

export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

export interface RefundInput {
    orderId: string;
    transactionId: string;
    amount: number;
    reason: string;
}

/**
 * Initiate a payment via local provider.
 * NOT IMPLEMENTED — throws until gateway integration is complete.
 */
export async function initiatePayment(
    tenantId: string,
    input: InitiatePaymentInput
): Promise<{ redirectUrl: string }> {
    log.error(`[PaymentService] Local payment provider "${input.provider}" not implemented`);
    throw new AppError(
        `Payment provider "${input.provider}" is not yet integrated. Use Stripe checkout instead.`,
        "NOT_IMPLEMENTED"
    );
}

/**
 * Verify payment callback from local provider.
 * NOT IMPLEMENTED — throws until gateway integration is complete.
 */
export async function verifyPayment(
    tenantId: string,
    orderId: string,
    transactionId: string
): Promise<PaymentResult> {
    log.error(`[PaymentService] verifyPayment called but not implemented — orderId=${orderId}`);
    throw new AppError(
        "Payment verification is not yet implemented for local providers. Use Stripe webhooks.",
        "NOT_IMPLEMENTED"
    );
}

/**
 * Process refund via local provider.
 * NOT IMPLEMENTED — throws until gateway integration is complete.
 */
export async function processRefund(
    tenantId: string,
    input: RefundInput
): Promise<PaymentResult> {
    log.error(`[PaymentService] processRefund called but not implemented — orderId=${input.orderId}`);
    throw new AppError(
        "Refund processing is not yet implemented for local providers. Process refunds via Stripe dashboard.",
        "NOT_IMPLEMENTED"
    );
}
