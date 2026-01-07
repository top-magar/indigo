import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, index, varchar, decimal, date } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { products, productVariants } from "./products";

/**
 * Attribute input types
 */
export type AttributeInputType = 
    | "dropdown"
    | "multiselect"
    | "text"
    | "rich_text"
    | "numeric"
    | "boolean"
    | "date"
    | "datetime"
    | "file"
    | "swatch"
    | "reference";

/**
 * Attribute entity types (for reference type)
 */
export type AttributeEntityType = 
    | "product"
    | "product_variant"
    | "category"
    | "collection"
    | "page";

/**
 * Attributes table - Product attribute definitions
 * 
 * @see scripts/supabase/010-attributes.sql
 */
export const attributes = pgTable("attributes", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    inputType: varchar("input_type", { length: 50 }).default("dropdown").notNull().$type<AttributeInputType>(),
    entityType: varchar("entity_type", { length: 50 }).$type<AttributeEntityType>(),
    unit: varchar("unit", { length: 20 }), // For numeric type: g, kg, lb, cm, m, ml, l
    valueRequired: boolean("value_required").default(false),
    visibleInStorefront: boolean("visible_in_storefront").default(true),
    filterableInStorefront: boolean("filterable_in_storefront").default(false),
    filterableInDashboard: boolean("filterable_in_dashboard").default(true),
    usedInProductTypes: integer("used_in_product_types").default(0),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    tenantIdx: index("attributes_tenant_idx").on(table.tenantId),
    slugIdx: index("attributes_slug_idx").on(table.tenantId, table.slug),
}));

/**
 * Attribute values table - Predefined values for dropdown/multiselect/swatch
 */
export const attributeValues = pgTable("attribute_values", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    attributeId: uuid("attribute_id").references(() => attributes.id, { onDelete: "cascade" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    value: text("value"),
    richText: text("rich_text"),
    fileUrl: text("file_url"),
    swatchColor: varchar("swatch_color", { length: 7 }), // Hex color code
    swatchImage: text("swatch_image"),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    attributeIdx: index("attribute_values_attribute_idx").on(table.attributeId),
    slugIdx: index("attribute_values_slug_idx").on(table.attributeId, table.slug),
}));

/**
 * Product attribute values - Links products to their attribute values
 */
export const productAttributeValues = pgTable("product_attribute_values", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
    attributeId: uuid("attribute_id").references(() => attributes.id, { onDelete: "cascade" }).notNull(),
    attributeValueId: uuid("attribute_value_id").references(() => attributeValues.id, { onDelete: "cascade" }),
    textValue: text("text_value"),
    richTextValue: text("rich_text_value"),
    numericValue: decimal("numeric_value", { precision: 15, scale: 4 }),
    booleanValue: boolean("boolean_value"),
    dateValue: date("date_value"),
    datetimeValue: timestamp("datetime_value"),
    fileUrl: text("file_url"),
    referenceId: uuid("reference_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    productIdx: index("product_attribute_values_product_idx").on(table.productId),
    attributeIdx: index("product_attribute_values_attribute_idx").on(table.attributeId),
}));

/**
 * Variant attribute values - Links variants to their attribute values
 */
export const variantAttributeValues = pgTable("variant_attribute_values", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "cascade" }).notNull(),
    attributeId: uuid("attribute_id").references(() => attributes.id, { onDelete: "cascade" }).notNull(),
    attributeValueId: uuid("attribute_value_id").references(() => attributeValues.id, { onDelete: "cascade" }),
    textValue: text("text_value"),
    numericValue: decimal("numeric_value", { precision: 15, scale: 4 }),
    booleanValue: boolean("boolean_value"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    variantIdx: index("variant_attribute_values_variant_idx").on(table.variantId),
    attributeIdx: index("variant_attribute_values_attribute_idx").on(table.attributeId),
}));
