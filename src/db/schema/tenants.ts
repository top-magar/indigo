import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export interface TenantSettings {
  theme?: {
    primaryColor?: string;
    logo?: string;
  };
  features?: {
    customDomain?: boolean;
    analytics?: boolean;
  };
}

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  currency: text("currency").default("NPR"),
  logoUrl: text("logo_url"),
  plan: text("plan").default("free").notNull(),
  settings: jsonb("settings").default({}).$type<TenantSettings>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("tenants_slug_idx").on(table.slug),
}));
