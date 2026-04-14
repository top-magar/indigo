import { pgTable, uuid, text, timestamp, integer, decimal, index, pgEnum } from "drizzle-orm/pg-core"
import { orders } from "./orders"
import { tenants } from "./tenants"

// ── Enums ──

export const codCollectionStatusEnum = pgEnum("cod_collection_status", [
  "pending",       // Awaiting delivery + collection
  "collected",     // Cash collected by rider
  "deposited",     // Deposited to merchant account
  "failed",        // Collection failed (customer refused, not home, etc.)
  "returned",      // Package returned to merchant
])

export const deliveryAttemptStatusEnum = pgEnum("delivery_attempt_status", [
  "scheduled",
  "out_for_delivery",
  "delivered",
  "failed",
  "rescheduled",
  "returned",
])

// ── COD Collections ──

export const codCollections = pgTable("cod_collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),

  // Money
  expectedAmount: decimal("expected_amount", { precision: 12, scale: 2 }).notNull(),
  collectedAmount: decimal("collected_amount", { precision: 12, scale: 2 }),
  currency: text("currency").default("NPR").notNull(),

  // Status
  status: codCollectionStatusEnum("status").default("pending").notNull(),

  // Tracking
  collectorName: text("collector_name"),       // Rider/agent name
  collectedAt: timestamp("collected_at"),
  depositedAt: timestamp("deposited_at"),
  failureReason: text("failure_reason"),

  // Pathao integration
  trackingId: text("tracking_id"),             // Pathao tracking number
  deliveryPartner: text("delivery_partner").default("pathao"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantStatusIdx: index("idx_cod_tenant_status").on(table.tenantId, table.status, table.createdAt),
  orderIdx: index("idx_cod_order").on(table.orderId),
}))

// ── Delivery Attempts ──

export const deliveryAttempts = pgTable("delivery_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  codCollectionId: uuid("cod_collection_id").references(() => codCollections.id),

  attemptNumber: integer("attempt_number").default(1).notNull(),
  status: deliveryAttemptStatusEnum("status").default("scheduled").notNull(),

  scheduledAt: timestamp("scheduled_at"),
  attemptedAt: timestamp("attempted_at"),
  notes: text("notes"),                        // Rider notes (e.g. "customer not home")

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tenantOrderIdx: index("idx_delivery_attempts_tenant_order").on(table.tenantId, table.orderId),
  codIdx: index("idx_delivery_attempts_cod").on(table.codCollectionId),
}))

// ── Types ──

export type CodCollection = typeof codCollections.$inferSelect
export type NewCodCollection = typeof codCollections.$inferInsert
export type DeliveryAttempt = typeof deliveryAttempts.$inferSelect
export type NewDeliveryAttempt = typeof deliveryAttempts.$inferInsert
