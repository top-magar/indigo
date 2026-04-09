/**
 * Inngest Event Types
 * 
 * Type definitions for all Inngest events used in the platform.
 * These types ensure type safety when sending and receiving events.
 */

import type { OrderDetails, StoreInfo } from "@/infrastructure/services/email/types";

/**
 * Order confirmation email event data
 */
export interface SendOrderConfirmationEvent {
  name: "order/send-confirmation";
  data: {
    tenantId: string;
    customerEmail: string;
    orderDetails: OrderDetails;
    storeInfo: StoreInfo;
  };
}

/**
 * Merchant notification email event data
 */
export interface SendOrderNotificationEvent {
  name: "order/send-notification";
  data: {
    tenantId: string;
    merchantEmail: string;
    orderDetails: OrderDetails;
    storeInfo: StoreInfo;
  };
}

/**
 * Inventory decrement event data
 */
export interface ProcessInventoryDecrementEvent {
  name: "inventory/decrement";
  data: {
    tenantId: string;
    orderId: string;
    items: Array<{
      variantId: string;
      productId?: string | null;
      quantity: number;
      productName?: string;
    }>;
  };
}

/**
 * Stripe webhook sync event data
 */
export interface SyncStripeWebhookEvent {
  name: "stripe/webhook-sync";
  data: {
    tenantId: string;
    eventType: string;
    eventId: string;
    paymentIntentId?: string;
    cartId?: string;
    amount?: number;
    metadata?: Record<string, string>;
  };
}

/**
 * Union type of all Inngest events
 */
export type InngestEvents = {
  "order/send-confirmation": SendOrderConfirmationEvent;
  "order/send-notification": SendOrderNotificationEvent;
  "inventory/decrement": ProcessInventoryDecrementEvent;
  "stripe/webhook-sync": SyncStripeWebhookEvent;
};
