import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const tenantKyc = pgTable("tenant_kyc", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull().unique(),

  // Identity
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  businessType: varchar("business_type", { length: 30 }).notNull()
    .$type<"individual" | "company">(),
  businessAddress: varchar("business_address", { length: 500 }).notNull(),

  // Documents
  panNumber: varchar("pan_number", { length: 50 }).notNull(),
  registrationNumber: varchar("registration_number", { length: 100 }),

  // Status
  status: varchar("status", { length: 20 }).notNull().default("pending")
    .$type<"pending" | "verified" | "rejected">(),
  rejectionReason: text("rejection_reason"),
  verifiedBy: uuid("verified_by"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),

  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type TenantKyc = typeof tenantKyc.$inferSelect;
