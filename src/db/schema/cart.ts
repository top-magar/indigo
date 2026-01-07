import { pgTable, uuid, text, timestamp, integer, decimal, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenants";
import { products, productVariants } from "./products";

/**
 * Carts table - Tenant-scoped
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 9.2 (F006)
 * @see IMPLEMENTATION-PLAN.md Section 3.2
 * 
 * RLS Policy: tenant_id = current_setting('app.current_tenant')::uuid
 */
export const carts = pgTable("carts", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    customerId: text("customer_id"), // Can be null for guest carts
    
    // Customer Info (for checkout)
    email: text("email"),
    customerName: text("customer_name"),
    customerPhone: text("customer_phone"),
    
    currency: text("currency").default("USD").notNull(),

    // Status: active, completed, abandoned
    status: text("status").default("active").notNull(),

    // Shipping Address
    shippingAddress: text("shipping_address"),
    shippingCity: text("shipping_city"),
    shippingArea: text("shipping_area"),
    shippingPostalCode: text("shipping_postal_code"),
    shippingCountry: text("shipping_country"),
    
    // Billing Address
    billingAddress: text("billing_address"),

    // Totals (calculated)
    subtotal: decimal("subtotal").default("0").notNull(),
    discountTotal: decimal("discount_total").default("0").notNull(),
    shippingTotal: decimal("shipping_total").default("0").notNull(),
    taxTotal: decimal("tax_total").default("0").notNull(),
    total: decimal("total").default("0").notNull(),

    // Voucher/Discount
    discountId: uuid("discount_id"),
    voucherCodeId: uuid("voucher_code_id"),
    voucherCode: text("voucher_code"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    tenantCustomerIdx: index("carts_tenant_customer_idx").on(table.tenantId, table.customerId),
    statusIdx: index("carts_status_idx").on(table.status),
}));

/**
 * Cart items table
 * 
 * Note: Access controlled via cart relationship (cart has tenant_id)
 */
export const cartItems = pgTable("cart_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id").references(() => carts.id, { onDelete: 'cascade' }).notNull(),

    // Product Link
    productId: uuid("product_id").references(() => products.id).notNull(),
    variantId: uuid("variant_id").references(() => productVariants.id),

    // Snapshot of product data at time of addition (to prevent price change issues)
    productName: text("product_name").notNull(),
    productSku: text("product_sku"),
    productImage: text("product_image"),

    quantity: integer("quantity").default(1).notNull(),

    // Pricing (stored as decimal for precision)
    unitPrice: decimal("unit_price").notNull(),
    compareAtPrice: decimal("compare_at_price"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    cartIdx: index("cart_items_cart_idx").on(table.cartId),
}));

/**
 * Cart relations for Drizzle query builder
 */
export const cartsRelations = relations(carts, ({ many }) => ({
    items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
    cart: one(carts, {
        fields: [cartItems.cartId],
        references: [carts.id],
    }),
    product: one(products, {
        fields: [cartItems.productId],
        references: [products.id],
    }),
    variant: one(productVariants, {
        fields: [cartItems.variantId],
        references: [productVariants.id],
    }),
}));
