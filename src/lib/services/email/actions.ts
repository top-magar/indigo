"use server";

/**
 * Email Service - Handles transactional emails
 * 
 * Integrations planned:
 * - Resend
 * - SendGrid
 */

import { eventBus, createEventPayload, type EventHandler } from "../event-bus";

// Types
export interface SendEmailInput {
    to: string;
    subject: string;
    template: EmailTemplate;
    data: Record<string, unknown>;
}

export type EmailTemplate =
    | 'order_confirmation'
    | 'order_shipped'
    | 'order_completed'
    | 'order_cancelled'
    | 'payment_received'
    | 'refund_processed'
    | 'low_stock_alert'
    | 'welcome';

/**
 * Send an email
 * TODO: Implement actual email provider
 */
export async function sendEmail(input: SendEmailInput): Promise<{ success: boolean }> {
    const { to, subject, template, data } = input;

    // TODO: Integrate with Resend or SendGrid
    console.log(`[EmailService] Sending ${template} email to ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Data:`, data);

    return { success: true };
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(
    customerEmail: string,
    orderId: string,
    orderTotal: number
): Promise<void> {
    await sendEmail({
        to: customerEmail,
        subject: `Order Confirmed - #${orderId.slice(0, 8).toUpperCase()}`,
        template: 'order_confirmation',
        data: { orderId, orderTotal },
    });
}

/**
 * Send order shipped email
 */
export async function sendOrderShipped(
    customerEmail: string,
    orderId: string,
    trackingNumber?: string
): Promise<void> {
    await sendEmail({
        to: customerEmail,
        subject: `Your Order Has Shipped - #${orderId.slice(0, 8).toUpperCase()}`,
        template: 'order_shipped',
        data: { orderId, trackingNumber },
    });
}

/**
 * Register event listeners for automatic emails
 */
export function registerEmailListeners(): void {
    // Order confirmed → send confirmation
    eventBus.on('order.confirmed', async (payload) => {
        const { orderId, customerEmail, totalAmount } = payload.data as {
            orderId: string;
            customerEmail?: string;
            totalAmount?: number;
        };

        if (customerEmail) {
            await sendOrderConfirmation(customerEmail, orderId, totalAmount || 0);
        }
    });

    // Order shipped → send shipping notification
    eventBus.on('order.shipped', async (payload) => {
        const { orderId, customerEmail, trackingNumber } = payload.data as {
            orderId: string;
            customerEmail?: string;
            trackingNumber?: string;
        };

        if (customerEmail) {
            await sendOrderShipped(customerEmail, orderId, trackingNumber);
        }
    });

    // Low stock → alert seller
    eventBus.on('stock.low', async (payload) => {
        console.log(`[EmailService] Low stock alert for variant ${payload.data.variantId}`);
        // TODO: Send low stock alert to seller
    });

    console.log('[EmailService] Event listeners registered');
}
