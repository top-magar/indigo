import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, index, numeric } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

// ============================================================================
// TYPES
// ============================================================================

export type DiscountKind = "sale" | "voucher"; // Sale = automatic, Voucher = code-based
export type DiscountType = "percentage" | "fixed" | "free_shipping";
export type DiscountScope = "entire_order" | "specific_products"; // Entire order vs specific products
export type VoucherCodeStatus = "active" | "used" | "expired" | "deactivated";

// ============================================================================
// DISCOUNTS (Sales & Vouchers)
// ============================================================================

export const discounts = pgTable("discounts", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    
    // Basic info
    name: text("name").notNull(),
    description: text("description"),
    kind: text("kind").$type<DiscountKind>().notNull().default("voucher"),
    
    // Discount configuration
    type: text("type").$type<DiscountType>().notNull().default("percentage"),
    value: numeric("value", { precision: 10, scale: 2 }).notNull().default("0"),
    scope: text("scope").$type<DiscountScope>().notNull().default("entire_order"),
    
    // For vouchers: apply to cheapest item only
    applyOncePerOrder: boolean("apply_once_per_order").notNull().default(false),
    
    // Requirements
    minOrderAmount: numeric("min_order_amount", { precision: 10, scale: 2 }),
    minQuantity: integer("min_quantity"),
    minCheckoutItemsQuantity: integer("min_checkout_items_quantity"),
    
    // Usage limits (for vouchers)
    usageLimit: integer("usage_limit"), // Total usage limit
    usedCount: integer("used_count").notNull().default(0),
    applyOncePerCustomer: boolean("apply_once_per_customer").notNull().default(false),
    onlyForStaff: boolean("only_for_staff").notNull().default(false),
    singleUse: boolean("single_use").notNull().default(false), // Each code can only be used once
    
    // Date range
    startsAt: timestamp("starts_at"),
    endsAt: timestamp("ends_at"),
    
    // Status
    isActive: boolean("is_active").notNull().default(true),
    
    // Applicable items (for specific_products scope)
    applicableProductIds: jsonb("applicable_product_ids").$type<string[]>(),
    applicableCollectionIds: jsonb("applicable_collection_ids").$type<string[]>(),
    applicableCategoryIds: jsonb("applicable_category_ids").$type<string[]>(),
    applicableVariantIds: jsonb("applicable_variant_ids").$type<string[]>(),
    
    // Country restrictions (for shipping discounts)
    countries: jsonb("countries").$type<string[]>(),
    
    // Metadata
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    tenantIdx: index("discounts_tenant_idx").on(table.tenantId),
    kindIdx: index("discounts_kind_idx").on(table.tenantId, table.kind),
    activeIdx: index("discounts_active_idx").on(table.tenantId, table.isActive),
}));

// ============================================================================
// VOUCHER CODES (Multiple codes per voucher)
// ============================================================================

export const voucherCodes = pgTable("voucher_codes", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    discountId: uuid("discount_id").references(() => discounts.id, { onDelete: "cascade" }).notNull(),
    
    code: text("code").notNull(),
    status: text("status").$type<VoucherCodeStatus>().notNull().default("active"),
    
    // Usage tracking
    usedCount: integer("used_count").notNull().default(0),
    usageLimit: integer("usage_limit"), // Per-code limit (optional, inherits from discount if null)
    
    // Metadata
    isManuallyCreated: boolean("is_manually_created").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    usedAt: timestamp("used_at"), // Last used timestamp
}, (table) => ({
    discountIdx: index("voucher_codes_discount_idx").on(table.discountId),
    codeIdx: index("voucher_codes_code_idx").on(table.tenantId, table.code),
    statusIdx: index("voucher_codes_status_idx").on(table.discountId, table.status),
}));

// ============================================================================
// DISCOUNT USAGES (Track each usage)
// ============================================================================

export const discountUsages = pgTable("discount_usages", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    discountId: uuid("discount_id").references(() => discounts.id).notNull(),
    voucherCodeId: uuid("voucher_code_id").references(() => voucherCodes.id),
    customerId: uuid("customer_id"),
    orderId: uuid("order_id"),
    discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).notNull(),
    usedAt: timestamp("used_at").defaultNow().notNull(),
}, (table) => ({
    discountIdx: index("discount_usages_discount_idx").on(table.discountId),
    customerIdx: index("discount_usages_customer_idx").on(table.customerId),
    codeIdx: index("discount_usages_code_idx").on(table.voucherCodeId),
}));

// ============================================================================
// DISCOUNT RULES (Advanced rule-based discounts like Saleor Promotions)
// ============================================================================

export type RuleRewardType = "subtotal_discount" | "gift";
export type RuleConditionType = "product" | "collection" | "category" | "variant";

export const discountRules = pgTable("discount_rules", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    discountId: uuid("discount_id").references(() => discounts.id, { onDelete: "cascade" }).notNull(),
    
    name: text("name"),
    description: text("description"),
    
    // Reward configuration
    rewardType: text("reward_type").$type<RuleRewardType>().notNull().default("subtotal_discount"),
    rewardValueType: text("reward_value_type").$type<"percentage" | "fixed">().notNull().default("percentage"),
    rewardValue: numeric("reward_value", { precision: 10, scale: 2 }).notNull().default("0"),
    
    // Gift reward (if rewardType is "gift")
    giftProductIds: jsonb("gift_product_ids").$type<string[]>(),
    
    // Conditions
    conditions: jsonb("conditions").$type<{
        type: RuleConditionType;
        ids: string[];
    }[]>(),
    
    // Channel restrictions
    channelIds: jsonb("channel_ids").$type<string[]>(),
    
    // Order
    orderIndex: integer("order_index").notNull().default(0),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    discountIdx: index("discount_rules_discount_idx").on(table.discountId),
}));