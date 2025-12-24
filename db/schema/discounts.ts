import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, index, numeric } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export type DiscountType = "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";
export type DiscountScope = "all" | "products" | "collections" | "customers";

export const discounts = pgTable("discounts", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    type: text("type").$type<DiscountType>().notNull().default("percentage"),
    value: numeric("value", { precision: 10, scale: 2 }).notNull().default("0"),
    scope: text("scope").$type<DiscountScope>().notNull().default("all"),
    minOrderAmount: numeric("min_order_amount", { precision: 10, scale: 2 }),
    minQuantity: integer("min_quantity"),
    maxUses: integer("max_uses"),
    maxUsesPerCustomer: integer("max_uses_per_customer"),
    usedCount: integer("used_count").notNull().default(0),
    startsAt: timestamp("starts_at"),
    expiresAt: timestamp("expires_at"),
    isActive: boolean("is_active").notNull().default(true),
    combinesWithOtherDiscounts: boolean("combines_with_other_discounts").notNull().default(false),
    firstTimePurchaseOnly: boolean("first_time_purchase_only").notNull().default(false),
    applicableProductIds: jsonb("applicable_product_ids").$type<string[]>(),
    applicableCollectionIds: jsonb("applicable_collection_ids").$type<string[]>(),
    applicableCustomerIds: jsonb("applicable_customer_ids").$type<string[]>(),
    excludedProductIds: jsonb("excluded_product_ids").$type<string[]>(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    tenantIdx: index("discounts_tenant_idx").on(table.tenantId),
    codeIdx: index("discounts_code_idx").on(table.tenantId, table.code),
    activeIdx: index("discounts_active_idx").on(table.tenantId, table.isActive),
}));

// Track discount usage per customer
export const discountUsages = pgTable("discount_usages", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    discountId: uuid("discount_id").references(() => discounts.id).notNull(),
    customerId: uuid("customer_id"),
    orderId: uuid("order_id"),
    discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).notNull(),
    usedAt: timestamp("used_at").defaultNow().notNull(),
}, (table) => ({
    discountIdx: index("discount_usages_discount_idx").on(table.discountId),
    customerIdx: index("discount_usages_customer_idx").on(table.customerId),
}));