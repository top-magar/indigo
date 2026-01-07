import { pgTable, uuid, text, timestamp, boolean, jsonb, index, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

/**
 * Customers table - End customers who purchase from stores
 * 
 * @see scripts/supabase/003-customers-addresses.sql
 */
export const customers = pgTable("customers", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash"),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    acceptsMarketing: boolean("accepts_marketing").default(false),
    isActive: boolean("is_active").default(true),
    lastLogin: timestamp("last_login"),
    countryCode: varchar("country_code", { length: 2 }),
    metadata: jsonb("metadata").default({}),
    privateMetadata: jsonb("private_metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    tenantIdx: index("customers_tenant_idx").on(table.tenantId),
    emailIdx: index("customers_email_idx").on(table.tenantId, table.email),
    isActiveIdx: index("customers_is_active_idx").on(table.tenantId, table.isActive),
}));

/**
 * Addresses table - Customer shipping and billing addresses
 */
export const addresses = pgTable("addresses", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "cascade" }).notNull(),
    type: varchar("type", { length: 20 }).default("shipping"), // shipping, billing
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    company: varchar("company", { length: 255 }),
    addressLine1: varchar("address_line1", { length: 255 }).notNull(),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }),
    postalCode: varchar("postal_code", { length: 20 }),
    country: varchar("country", { length: 2 }).notNull(),
    countryCode: varchar("country_code", { length: 10 }),
    phone: varchar("phone", { length: 50 }),
    isDefault: boolean("is_default").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    tenantIdx: index("addresses_tenant_idx").on(table.tenantId),
    customerIdx: index("addresses_customer_idx").on(table.customerId),
}));
