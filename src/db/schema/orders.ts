import { pgTable, uuid, text, timestamp, integer, index, varchar, decimal, jsonb } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { customers } from "./customers";
import { products, productVariants } from "./products";

// Import centralized status types
import type { OrderStatus, PaymentStatus, FulfillmentStatus } from "@/shared/types/status";

// Re-export for backward compatibility
export type { OrderStatus, PaymentStatus, FulfillmentStatus } from "@/shared/types/status";

/**
 * Orders table - Full order management
 * 
 * @see scripts/supabase/004-orders.sql
 */
export const orders = pgTable("orders", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    
    // Order Identification
    orderNumber: varchar("order_number", { length: 50 }).notNull(),
    
    // Status
    status: varchar("status", { length: 50 }).default("pending").notNull().$type<OrderStatus>(),
    paymentStatus: varchar("payment_status", { length: 50 }).default("pending").$type<PaymentStatus>(),
    fulfillmentStatus: varchar("fulfillment_status", { length: 50 }).default("unfulfilled").$type<FulfillmentStatus>(),
    
    // Totals
    subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
    discountTotal: decimal("discount_total", { precision: 12, scale: 2 }).default("0"),
    shippingTotal: decimal("shipping_total", { precision: 12, scale: 2 }).default("0"),
    taxTotal: decimal("tax_total", { precision: 12, scale: 2 }).default("0"),
    total: decimal("total", { precision: 12, scale: 2 }).default("0").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    itemsCount: integer("items_count").default(0),
    
    // Addresses (stored as JSONB for flexibility)
    shippingAddress: jsonb("shipping_address"),
    billingAddress: jsonb("billing_address"),
    
    // Customer Info
    customerEmail: varchar("customer_email", { length: 255 }),
    customerName: varchar("customer_name", { length: 255 }),
    customerNote: text("customer_note"),
    internalNotes: text("internal_notes"),
    
    // Shipping
    shippingMethod: text("shipping_method"),
    shippingCarrier: text("shipping_carrier"),
    
    // Discounts
    discountId: uuid("discount_id"),
    discountCode: text("discount_code"),
    discountName: text("discount_name"),
    
    // Stripe Integration
    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
    
    // Metadata
    metadata: jsonb("metadata").default({}),
    
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    tenantCreatedIdx: index("orders_tenant_created_idx").on(table.tenantId, table.createdAt),
    orderNumberIdx: index("orders_order_number_idx").on(table.tenantId, table.orderNumber),
    statusIdx: index("orders_status_idx").on(table.tenantId, table.status),
    paymentStatusIdx: index("orders_payment_status_idx").on(table.paymentStatus),
    fulfillmentStatusIdx: index("orders_fulfillment_status_idx").on(table.fulfillmentStatus),
    customerIdx: index("orders_customer_idx").on(table.customerId),
    stripePaymentIdx: index("orders_stripe_payment_idx").on(table.stripePaymentIntentId),
}));

/**
 * Order items - Individual line items in an order
 */
export const orderItems = pgTable("order_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
    
    // Product snapshot
    productName: varchar("product_name", { length: 255 }).notNull(),
    productSku: varchar("product_sku", { length: 100 }),
    productImage: text("product_image"),
    variantTitle: varchar("variant_title", { length: 255 }),
    options: jsonb("options").default([]),
    
    // Quantity & Pricing
    quantity: integer("quantity").default(1).notNull(),
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
    quantityFulfilled: integer("quantity_fulfilled").default(0),
    
    // Tax & Discounts
    taxRate: decimal("tax_rate", { precision: 5, scale: 2 }),
    taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }),
    discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }),
    
    // Metadata
    metadata: jsonb("metadata").default({}),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    orderIdx: index("order_items_order_idx").on(table.orderId),
    tenantIdx: index("order_items_tenant_idx").on(table.tenantId),
}));

/**
 * Order status history - Track status changes
 */
export const orderStatusHistory = pgTable("order_status_history", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
    status: varchar("status", { length: 50 }).notNull(),
    note: text("note"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    orderIdx: index("order_status_history_order_idx").on(table.orderId),
}));

/**
 * Fulfillments - Order fulfillments for tracking shipments
 */
export type FulfillmentItemStatus = "pending" | "approved" | "shipped" | "delivered" | "cancelled";

export const fulfillments = pgTable("fulfillments", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull().$type<FulfillmentItemStatus>(),
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    shippingCarrier: text("shipping_carrier"),
    warehouse: text("warehouse"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    orderIdx: index("fulfillments_order_idx").on(table.orderId),
    tenantIdx: index("fulfillments_tenant_idx").on(table.tenantId),
}));

/**
 * Fulfillment lines - Individual items in a fulfillment
 */
export const fulfillmentLines = pgTable("fulfillment_lines", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    fulfillmentId: uuid("fulfillment_id").references(() => fulfillments.id, { onDelete: "cascade" }).notNull(),
    orderLineId: uuid("order_line_id").references(() => orderItems.id, { onDelete: "cascade" }).notNull(),
    quantity: integer("quantity").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    fulfillmentIdx: index("fulfillment_lines_fulfillment_idx").on(table.fulfillmentId),
}));

/**
 * Order transactions - Payment transactions
 */
export type TransactionType = "authorization" | "charge" | "refund" | "void" | "capture" | "chargeback";
export type TransactionStatus = "pending" | "success" | "failed" | "cancelled";

export const orderTransactions = pgTable("order_transactions", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
    type: varchar("type", { length: 20 }).notNull().$type<TransactionType>(),
    status: varchar("status", { length: 20 }).default("pending").notNull().$type<TransactionStatus>(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    paymentMethod: text("payment_method"),
    paymentGateway: text("payment_gateway"),
    gatewayTransactionId: text("gateway_transaction_id"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    orderIdx: index("order_transactions_order_idx").on(table.orderId),
    tenantIdx: index("order_transactions_tenant_idx").on(table.tenantId),
}));

/**
 * Order invoices - Invoices generated for orders
 */
export type InvoiceStatus = "draft" | "pending" | "sent" | "paid" | "cancelled";

export const orderInvoices = pgTable("order_invoices", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
    invoiceNumber: text("invoice_number").notNull(),
    status: varchar("status", { length: 20 }).default("draft").notNull().$type<InvoiceStatus>(),
    url: text("url"),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    orderIdx: index("order_invoices_order_idx").on(table.orderId),
    tenantIdx: index("order_invoices_tenant_idx").on(table.tenantId),
}));

/**
 * Order events - Order activity history/timeline
 */
export const orderEvents = pgTable("order_events", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
    type: text("type").notNull(),
    message: text("message").notNull(),
    userId: uuid("user_id"),
    userName: text("user_name"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    orderIdx: index("order_events_order_idx").on(table.orderId),
    tenantIdx: index("order_events_tenant_idx").on(table.tenantId),
}));
