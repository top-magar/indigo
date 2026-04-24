import { pgTable, uuid, text, jsonb, timestamp, boolean, integer, index } from "drizzle-orm/pg-core"
import { tenants } from "./tenants"

export const editorProjects = pgTable("editor_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  slug: text("slug"),
  data: jsonb("data").notNull(),
  publishedHtml: text("published_html"),
  published: boolean("published").default(false),
  navConfig: jsonb("nav_config"),
  themeConfig: jsonb("theme_config"),
  headerData: jsonb("header_data"),
  footerData: jsonb("footer_data"),
  views: integer("views").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tenantIdIdx: index("editor_projects_tenant_id_idx").on(table.tenantId),
}))

export type EditorProject = typeof editorProjects.$inferSelect
export type NewEditorProject = typeof editorProjects.$inferInsert
