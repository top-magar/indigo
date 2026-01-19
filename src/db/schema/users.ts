import { pgTable, uuid, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const users = pgTable("users", {
    id: uuid("id").primaryKey(), // References auth.users(id)
    tenantId: uuid("tenant_id").references(() => tenants.id),
    email: varchar("email", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 255 }),
    avatarUrl: text("avatar_url"),
    role: varchar("role", { length: 50 }).default("owner"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
