/**
 * Email Service - Handles transactional emails using Resend
 * 
 * @see https://resend.com/docs
 */

import { Resend } from 'resend';
import { eventBus } from "../event-bus";
import { orderConfirmationTemplate, orderNotificationTemplate } from './templates';
import type { OrderDetails, StoreInfo, EmailResult } from './types';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email (can be overridden per tenant)
const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || 'orders@resend.dev';

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
 * Send a raw email using Resend
 */
export async function sendEmail(input: SendEmailInput): Promise<EmailResult> {
    const { to, subject, template, data } = input;

    if (!to || !isValidEmail(to)) {
        console.warn(`[EmailService] Invalid or missing email address: ${to}`);
        return { success: false, error: 'Invalid email address' };
    }

    if (!process.env.RESEND_API_KEY) {
        console.warn('[EmailService] RESEND_API_KEY not configured, skipping email');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        console.log(`[EmailService] Sending ${template} email to ${to}`);
        
        const { data: result, error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [to],
            subject,
            text: `${subject}\n\n${JSON.stringify(data, null, 2)}`,
        });

        if (error) {
            console.error(`[EmailService] Failed to send email:`, error);
            return { success: false, error: error.message };
        }

        console.log(`[EmailService] Email sent successfully:`, result?.id);
        return { success: true, messageId: result?.id };
    } catch (error) {
        console.error(`[EmailService] Error sending email:`, error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        };
    }
}


/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
    to: string,
    order: OrderDetails,
    store: StoreInfo
): Promise<EmailResult> {
    if (!to || !isValidEmail(to)) {
        console.warn(`[EmailService] Invalid customer email for order confirmation: ${to}`);
        return { success: false, error: 'Invalid customer email address' };
    }

    if (!process.env.RESEND_API_KEY) {
        console.warn('[EmailService] RESEND_API_KEY not configured, skipping order confirmation email');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const html = orderConfirmationTemplate(order, store);
        const subject = `Order Confirmed - #${order.orderNumber}`;

        console.log(`[EmailService] Sending order confirmation to ${to} for order #${order.orderNumber}`);

        const { data: result, error } = await resend.emails.send({
            from: `${store.name} <${DEFAULT_FROM_EMAIL}>`,
            to: [to],
            subject,
            html,
        });

        if (error) {
            console.error(`[EmailService] Failed to send order confirmation:`, error);
            return { success: false, error: error.message };
        }

        console.log(`[EmailService] Order confirmation sent successfully:`, result?.id);
        return { success: true, messageId: result?.id };
    } catch (error) {
        console.error(`[EmailService] Error sending order confirmation:`, error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        };
    }
}

/**
 * Send order notification email to merchant
 */
export async function sendOrderNotificationEmail(
    to: string,
    order: OrderDetails,
    store: StoreInfo
): Promise<EmailResult> {
    if (!to || !isValidEmail(to)) {
        console.warn(`[EmailService] Invalid merchant email for order notification: ${to}`);
        return { success: false, error: 'Invalid merchant email address' };
    }

    if (!process.env.RESEND_API_KEY) {
        console.warn('[EmailService] RESEND_API_KEY not configured, skipping order notification email');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const html = orderNotificationTemplate(order, store);
        const subject = `🎉 New Order #${order.orderNumber} - ${formatCurrency(order.total, order.currency)}`;

        console.log(`[EmailService] Sending order notification to merchant ${to} for order #${order.orderNumber}`);

        const { data: result, error } = await resend.emails.send({
            from: `${store.name} Orders <${DEFAULT_FROM_EMAIL}>`,
            to: [to],
            subject,
            html,
        });

        if (error) {
            console.error(`[EmailService] Failed to send order notification:`, error);
            return { success: false, error: error.message };
        }

        console.log(`[EmailService] Order notification sent successfully:`, result?.id);
        return { success: true, messageId: result?.id };
    } catch (error) {
        console.error(`[EmailService] Error sending order notification:`, error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        };
    }
}


/**
 * Send order confirmation email (legacy function for backward compatibility)
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

    eventBus.on('stock.low', async (payload) => {
        console.log(`[EmailService] Low stock alert for variant ${payload.data.variantId}`);
    });

    console.log('[EmailService] Event listeners registered');
}

/**
 * Validate email address format
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Format currency for email subject
 */
function formatCurrency(amount: string, currency: string = 'USD'): string {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(num);
}
