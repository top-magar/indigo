import { pgTable, uuid, text, timestamp, integer, index, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { products } from "./products";

/**
 * Stock movement types
 */
export type StockMovementType = 
    | "add" 
    | "remove" 
    | "set" 
    | "sale" 
    | "return" 
    | "adjustment" 
    | "transfer"
    | "received"
    | "sold";

/**
 * Stock movements table - Tracks all inventory changes
 * 
 * @see scripts/supabase/007-inventory.sql
 */
export const stockMovements = pgTable("stock_movements", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
    productName: text("product_name").notNull(),
    type: varchar("type", { length: 20 }).notNull().$type<StockMovementType>(),
    quantityBefore: integer("quantity_before").notNull(),
    quantityChange: integer("quantity_change").notNull(),
    quantityAfter: integer("quantity_after").notNull(),
    reason: text("reason").notNull(),
    notes: text("notes"),
    reference: text("reference"), // External reference like order ID
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    tenantIdx: index("stock_movements_tenant_idx").on(table.tenantId),
    productIdx: index("stock_movements_product_idx").on(table.productId),
    createdAtIdx: index("stock_movements_created_at_idx").on(table.createdAt),
    typeIdx: index("stock_movements_type_idx").on(table.type),
}));
