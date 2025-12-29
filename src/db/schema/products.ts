import { pgTable, uuid, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const products = pgTable("products", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    price: text("price").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productVariants = pgTable("product_variants", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    productId: uuid("product_id").references(() => products.id).notNull(),
    name: text("name").notNull(), // e.g. "Small / Red"
    sku: text("sku"),
    price: text("price"), // Override base price
    options: jsonb("options"), // { size: "S", color: "Red" }
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inventoryLevels = pgTable("inventory_levels", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    variantId: uuid("variant_id").references(() => productVariants.id).notNull(),
    quantity: integer("quantity").default(0).notNull(),
    location: text("location").default("default").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
