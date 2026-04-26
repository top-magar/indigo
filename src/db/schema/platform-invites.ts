import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const platformInvites = pgTable("platform_invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  platformRole: varchar("platform_role", { length: 30 }).notNull()
    .$type<"admin" | "support" | "finance">(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  invitedBy: uuid("invited_by").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending")
    .$type<"pending" | "accepted" | "expired">(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
