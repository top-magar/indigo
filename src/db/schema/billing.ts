import { pgTable, uuid, text, timestamp, integer, decimal, varchar, boolean, jsonb } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

/**
 * Platform plans — defined by admin.
 * Free tier always exists. Paid tiers have limits.
 */
export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  priceMonthly: decimal("price_monthly", { precision: 10, scale: 2 }).notNull().default("0"),
  priceYearly: decimal("price_yearly", { precision: 10, scale: 2 }),
  commissionRate: decimal("commission_rate", { precision: 4, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).notNull().default("NPR"),

  // Limits
  maxProducts: integer("max_products").notNull().default(10),
  maxStaff: integer("max_staff").notNull().default(1),
  maxStorageMb: integer("max_storage_mb").notNull().default(100),
  maxOrders: integer("max_orders"), // null = unlimited (legacy, per year)
  maxOrdersPerMonth: integer("max_orders_per_month"), // null = unlimited

  // Features
  features: jsonb("features").$type<string[]>().default([]),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  loyaltyYear2Discount: integer("loyalty_year2_discount").default(0),
  loyaltyYear3Discount: integer("loyalty_year3_discount").default(0),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Tenant subscriptions — links a tenant to a plan.
 * One active subscription per tenant at a time.
 */
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  planId: uuid("plan_id").references(() => plans.id).notNull(),

  status: varchar("status", { length: 20 }).notNull().default("active")
    .$type<"active" | "grace" | "expired" | "cancelled">(),

  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }).notNull(),
  gracePeriodEnd: timestamp("grace_period_end", { withTimezone: true }),

  billingCycle: varchar("billing_cycle", { length: 10 }).notNull().default("monthly")
    .$type<"monthly" | "yearly">(),

  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Payment records — admin logs each payment manually.
 * Tracks eSewa, Khalti, bank transfer, cash, etc.
 */
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id),

  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("NPR"),

  method: varchar("method", { length: 30 }).notNull()
    .$type<"esewa" | "khalti" | "bank_transfer" | "fonepay" | "cash" | "other">(),
  reference: varchar("reference", { length: 255 }), // transaction ID, receipt number
  notes: text("notes"),

  recordedBy: uuid("recorded_by").notNull(), // admin user ID who recorded this
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Plan = typeof plans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Payment = typeof payments.$inferSelect;

/**
 * Platform invoices — auto-generated monthly for each merchant.
 * Calculates MIN(commission × order_total, plan_cap).
 */
export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  planId: uuid("plan_id").references(() => plans.id),

  // Period
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),

  // Calculation
  orderTotal: decimal("order_total", { precision: 12, scale: 2 }).notNull().default("0"),
  orderCount: integer("order_count").notNull().default(0),
  commissionRate: decimal("commission_rate", { precision: 4, scale: 2 }).notNull().default("0"),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  capAmount: decimal("cap_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull().default("0"),

  status: varchar("status", { length: 20 }).notNull().default("pending")
    .$type<"pending" | "paid" | "overdue" | "waived">(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  paymentId: uuid("payment_id").references(() => payments.id),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
