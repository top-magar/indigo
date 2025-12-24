import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { productVariants } from "./products";

export const orders = pgTable("orders", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    status: text("status").default("pending").notNull(),
    totalAmount: text("total_amount").notNull(),
    // Customer Info
    customerEmail: text("customer_email"),
    customerName: text("customer_name"),
    customerPhone: text("customer_phone"),
    // Shipping Address
    shippingAddress: text("shipping_address"),
    shippingCity: text("shipping_city"),
    shippingArea: text("shipping_area"),
    // Order Notes
    notes: text("notes"),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderStatusHistory = pgTable("order_status_history", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    orderId: uuid("order_id").references(() => orders.id).notNull(),
    status: text("status").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    orderId: uuid("order_id").references(() => orders.id).notNull(),
    variantId: uuid("variant_id").references(() => productVariants.id).notNull(),
    quantity: integer("quantity").notNull(),
    price: text("price").notNull(),
});
