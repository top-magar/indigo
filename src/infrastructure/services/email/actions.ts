/**
 * Email Service - Handles transactional emails
 * 
 * Supports two providers:
 * - Resend (default): Easy setup, good for development
 * - AWS SES: Cost-effective for production, requires email/domain verification
 * 
 * Set EMAIL_PROVIDER=ses to use AWS SES instead of Resend
 */

import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { Resend } from 'resend';
import { eventBus } from "../event-bus";
import { orderConfirmationTemplate, orderNotificationTemplate, orderShippedTemplate, orderDeliveredTemplate } from './templates';
import type { OrderDetails, OrderAddress, StoreInfo, EmailResult } from './types';
import { sendEmailViaSES, isSESConfigured } from '../../aws/ses';

const log = createLogger("infra:email");

// Email provider configuration
type EmailProvider = 'resend' | 'ses';
const EMAIL_PROVIDER: EmailProvider = (process.env.EMAIL_PROVIDER as EmailProvider) || 'resend';

// Lazy-initialized Resend client (avoids build-time errors when API key is missing)
let resend: Resend | null = null;

function getResendClient(): Resend | null {
    if (!process.env.RESEND_API_KEY) {
        return null;
    }
    if (!resend) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
}

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
    | 'order_delivered'
    | 'order_completed'
    | 'order_cancelled'
    | 'payment_received'
    | 'refund_processed'
    | 'low_stock_alert'
    | 'abandoned_cart'
    | 'welcome';

/**
 * Send a raw email using configured provider (Resend or SES)
 */
export async function sendEmail(input: SendEmailInput): Promise<EmailResult> {
    const { to, subject, template, data } = input;

    try {
        z.string().email().parse(to);
    } catch {
        log.warn(`[EmailService] Invalid or missing email address: ${to}`);
        return { success: false, error: 'Invalid email address' };
    }

    // Try SES if configured
    if (EMAIL_PROVIDER === 'ses') {
        const sesStatus = await isSESConfigured();
        if (sesStatus.configured && sesStatus.fromEmail) {
            log.info(`[EmailService] Sending ${template} email via SES to ${to}`);
            const htmlContent = typeof data.html === 'string' ? data.html : `<h1>${subject}</h1><pre>${JSON.stringify(data, null, 2)}</pre>`;
            return sendEmailViaSES({
                to,
                subject,
                html: htmlContent,
                text: `${subject}\n\n${JSON.stringify(data, null, 2)}`,
                from: sesStatus.fromEmail,
            });
        }
        log.warn('[EmailService] SES not configured (no verified identities), falling back to Resend');
    }

    // Fallback to Resend
    if (!process.env.RESEND_API_KEY) {
        log.warn('[EmailService] No email provider configured (RESEND_API_KEY missing, SES not verified)');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        log.info(`[EmailService] Sending ${template} email via Resend to ${to}`);
        
        const client = getResendClient();
        if (!client) {
            return { success: false, error: 'Email service not configured' };
        }
        
        const { data: result, error } = await client.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [to],
            subject,
            ...(typeof data.html === 'string' ? { html: data.html } : { text: `${subject}\n\n${JSON.stringify(data, null, 2)}` }),
        });

        if (error) {
            log.error(`[EmailService] Failed to send email:`, error);
            return { success: false, error: error.message };
        }

        log.info("Email sent successfully", { messageId: result?.id });
        return { success: true, messageId: result?.id };
    } catch (error) {
        log.error(`[EmailService] Error sending email:`, error);
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
        log.warn(`[EmailService] Invalid customer email for order confirmation: ${to}`);
        return { success: false, error: 'Invalid customer email address' };
    }

    const html = orderConfirmationTemplate(order, store);
    const subject = `Order Confirmed - #${order.orderNumber}`;

    // Try SES if configured
    if (EMAIL_PROVIDER === 'ses') {
        const sesStatus = await isSESConfigured();
        if (sesStatus.configured && sesStatus.fromEmail) {
            log.info(`[EmailService] Sending order confirmation via SES to ${to}`);
            return sendEmailViaSES({
                to,
                subject,
                html,
                from: `${store.name} <${sesStatus.fromEmail}>`,
            });
        }
    }

    // Fallback to Resend
    if (!process.env.RESEND_API_KEY) {
        log.warn('[EmailService] No email provider configured');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        log.info(`[EmailService] Sending order confirmation via Resend to ${to}`);

        const client = getResendClient();
        if (!client) {
            return { success: false, error: 'Email service not configured' };
        }

        const { data: result, error } = await client.emails.send({
            from: `${store.name} <${DEFAULT_FROM_EMAIL}>`,
            to: [to],
            subject,
            html,
        });

        if (error) {
            log.error(`[EmailService] Failed to send order confirmation:`, error);
            return { success: false, error: error.message };
        }

        log.info("Order confirmation sent", { messageId: result?.id });
        return { success: true, messageId: result?.id };
    } catch (error) {
        log.error(`[EmailService] Error sending order confirmation:`, error);
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
        log.warn(`[EmailService] Invalid merchant email for order notification: ${to}`);
        return { success: false, error: 'Invalid merchant email address' };
    }

    const html = orderNotificationTemplate(order, store);
    const subject = `🎉 New Order #${order.orderNumber} - ${formatCurrency(order.total, order.currency)}`;

    // Try SES if configured
    if (EMAIL_PROVIDER === 'ses') {
        const sesStatus = await isSESConfigured();
        if (sesStatus.configured && sesStatus.fromEmail) {
            log.info(`[EmailService] Sending order notification via SES to ${to}`);
            return sendEmailViaSES({
                to,
                subject,
                html,
                from: `${store.name} Orders <${sesStatus.fromEmail}>`,
            });
        }
    }

    // Fallback to Resend
    if (!process.env.RESEND_API_KEY) {
        log.warn('[EmailService] No email provider configured');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        log.info(`[EmailService] Sending order notification via Resend to ${to}`);

        const client = getResendClient();
        if (!client) {
            return { success: false, error: 'Email service not configured' };
        }

        const { data: result, error } = await client.emails.send({
            from: `${store.name} Orders <${DEFAULT_FROM_EMAIL}>`,
            to: [to],
            subject,
            html,
        });

        if (error) {
            log.error(`[EmailService] Failed to send order notification:`, error);
            return { success: false, error: error.message };
        }

        log.info("Order notification sent", { messageId: result?.id });
        return { success: true, messageId: result?.id };
    } catch (error) {
        log.error(`[EmailService] Error sending order notification:`, error);
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
    trackingNumber?: string,
    carrier?: string
): Promise<void> {
    const orderNumber = orderId.slice(0, 8).toUpperCase();
    const html = orderShippedTemplate(orderNumber, trackingNumber, carrier);
    await sendEmail({
        to: customerEmail,
        subject: `Your Order Has Shipped - #${orderNumber}`,
        template: 'order_shipped',
        data: { html },
    });
}

/**
 * Send order delivered email
 */
export async function sendOrderDelivered(
    customerEmail: string,
    orderNumber: string,
    storeName: string,
    storeSlug: string
): Promise<void> {
    const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/store/${storeSlug}/account/orders`;
    const html = orderDeliveredTemplate(orderNumber, storeName, reviewUrl);
    await sendEmail({
        to: customerEmail,
        subject: `Your Order #${orderNumber} Has Been Delivered`,
        template: 'order_delivered',
        data: { html },
    });
}

/**
 * Register event listeners for automatic emails
 */
export function registerEmailListeners(): void {
    eventBus.on('order.created', async (payload) => {
        const { orderId } = payload.data as { orderId: string };
        const tenantId = payload.tenantId;

        try {
            const { createClient } = await import('@/infrastructure/supabase/server');
            const supabase = await createClient();

            const [{ data: order }, { data: items }, { data: tenant }] = await Promise.all([
                supabase.from('orders').select('*').eq('id', orderId).eq('tenant_id', tenantId).single(),
                supabase.from('order_items').select('*').eq('order_id', orderId),
                supabase.from('tenants').select('name, slug, logo_url').eq('id', tenantId).single(),
            ]);

            if (!order || !tenant) return;

            const store: StoreInfo = { name: tenant.name, slug: tenant.slug, logoUrl: tenant.logo_url };
            const orderDetails: OrderDetails = {
                orderId: order.id,
                orderNumber: order.order_number,
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                items: (items || []).map((i: Record<string, unknown>) => ({
                    productName: i.product_name as string,
                    productSku: i.product_sku as string | undefined,
                    productImage: i.product_image as string | undefined,
                    quantity: i.quantity as number,
                    unitPrice: String(i.unit_price),
                    totalPrice: String(i.total_price),
                })),
                subtotal: String(order.subtotal),
                shippingTotal: String(order.shipping_total || 0),
                taxTotal: String(order.tax_total || 0),
                total: String(order.total),
                currency: order.currency || 'NPR',
                shippingAddress: order.shipping_address as OrderAddress | undefined,
                paymentStatus: order.payment_status,
                createdAt: new Date(order.created_at),
            };

            // Send customer confirmation
            if (order.customer_email) {
                await sendOrderConfirmationEmail(order.customer_email, orderDetails, store);
            }

            // Send merchant notification (use tenant owner email or first user)
            const { data: owner } = await supabase
                .from('users')
                .select('email')
                .eq('tenant_id', tenantId)
                .eq('role', 'owner')
                .limit(1)
                .single();

            if (owner?.email) {
                await sendOrderNotificationEmail(owner.email, orderDetails, store);
            }
        } catch (error) {
            log.error('[EmailService] Failed to send order.created emails:', error);
        }
    });

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
        log.info(`[EmailService] Low stock alert for variant ${payload.data.variantId}`);
    });

    log.info('[EmailService] Event listeners registered');
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
