import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, index, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { products } from "./products";

/**
 * Collection types
 */
export type CollectionType = "manual" | "automatic";

/**
 * Collections table - Product collections/groups
 * 
 * @see scripts/supabase/005-collections.sql
 */
export const collections = pgTable("collections", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    imageAlt: text("image_alt"),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    isActive: boolean("is_active").default(true),
    sortOrder: integer("sort_order").default(0),
    type: varchar("type", { length: 20 }).default("manual").$type<CollectionType>(),
    conditions: jsonb("conditions"), // For automatic collections
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    tenantIdx: index("collections_tenant_idx").on(table.tenantId),
    slugIdx: index("collections_slug_idx").on(table.tenantId, table.slug),
    isActiveIdx: index("collections_is_active_idx").on(table.tenantId, table.isActive),
}));

/**
 * Collection products - Links products to collections
 */
export const collectionProducts = pgTable("collection_products", {
    id: uuid("id").defaultRandom().primaryKey(),
    collectionId: uuid("collection_id").references(() => collections.id, { onDelete: "cascade" }).notNull(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
    position: integer("position").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    collectionIdx: index("collection_products_collection_idx").on(table.collectionId),
    productIdx: index("collection_products_product_idx").on(table.productId),
}));
