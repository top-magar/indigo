import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: text("role").default("owner").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
