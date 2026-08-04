import { index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core"
import { editorPages } from "./editor-pages"
import { editorProjects } from "./editor-projects"
import { tenants } from "./tenants"
import { users } from "./users"

export const editorPageLeases = pgTable("editor_page_leases", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => editorProjects.id, { onDelete: "cascade" }),
  pageId: uuid("page_id").notNull().references(() => editorPages.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pageUnique: unique("editor_page_leases_page_unique").on(table.pageId),
  tenantExpiryIdx: index("editor_page_leases_tenant_expiry_idx").on(table.tenantId, table.expiresAt),
}))

export type EditorPageLease = typeof editorPageLeases.$inferSelect
