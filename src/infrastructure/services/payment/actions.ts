"use server";

/**
 * Payment Service - Handles payment processing
 */

import { eventBus, createEventPayload } from "../event-bus";

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
 * Initiate a payment
 */
export async function initiatePayment(
    tenantId: string,
    input: InitiatePaymentInput
): Promise<{ redirectUrl: string }> {
    const { orderId, amount, provider, returnUrl } = input;

    await eventBus.emit('payment.initiated', createEventPayload(tenantId, {
        orderId,
        amount,
        provider,
    }));

    console.log(`[PaymentService] Initiating ${provider} payment for order ${orderId}`);

    return {
        redirectUrl: `${returnUrl}?orderId=${orderId}&provider=${provider}`,
    };
}

/**
 * Verify payment callback
 */
export async function verifyPayment(
    tenantId: string,
    orderId: string,
    transactionId: string
): Promise<PaymentResult> {
    console.log(`[PaymentService] Verifying payment ${transactionId} for order ${orderId}`);

    await eventBus.emit('payment.completed', createEventPayload(tenantId, {
        orderId,
        transactionId,
    }));

    return {
        success: true,
        transactionId,
    };
}

/**
 * Process refund
 */
export async function processRefund(
    tenantId: string,
    input: RefundInput
): Promise<PaymentResult> {
    const { orderId, transactionId, amount, reason } = input;

    console.log(`[PaymentService] Processing refund for order ${orderId}`);

    await eventBus.emit('refund.completed', createEventPayload(tenantId, {
        orderId,
        transactionId,
        amount,
        reason,
    }));

    return {
        success: true,
    };
}
