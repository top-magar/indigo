import { pgTable, uuid, text, timestamp, jsonb, index, boolean } from "drizzle-orm/pg-core";

/**
 * Tenant settings interface
 * @see SYSTEM-ARCHITECTURE.md Section 5.2.1
 */
export interface TenantSettings {
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
    favicon?: string;
    fontFamily?: string;
    borderRadius?: "none" | "sm" | "md" | "lg" | "full";
  };
  features?: {
    customDomain?: boolean;
    analytics?: boolean;
    customerAccounts?: boolean;
    discountCodes?: boolean;
  };
  checkout?: {
    guestCheckoutEnabled?: boolean;
    requirePhone?: boolean;
    requireShippingAddress?: boolean;
  };
  notifications?: {
    orderConfirmation?: boolean;
    orderStatusUpdates?: boolean;
    lowStockAlerts?: boolean;
  };
}

/**
 * Tenants table - Platform-level entity (no tenant_id on itself)
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 5.2.1
 * @see IMPLEMENTATION-PLAN.md Section 2.1.1
 * 
 * RLS Policy: Only platform admins or self-access
 */
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  currency: text("currency").default("NPR"),
  displayCurrency: text("display_currency").default("NPR"),
  priceIncludesTax: boolean("price_includes_tax").default(false),
  logoUrl: text("logo_url"),
  plan: text("plan").default("free").notNull(), // free, starter, pro, enterprise
  
  // Stripe Connect Integration
  // @see SYSTEM-ARCHITECTURE.md Section 3.4.1
  stripeAccountId: text("stripe_account_id"),
  stripeOnboardingComplete: boolean("stripe_onboarding_complete").default(false),
  
  // Settings JSONB
  settings: jsonb("settings").default({}).$type<TenantSettings>(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("tenants_slug_idx").on(table.slug),
}));
