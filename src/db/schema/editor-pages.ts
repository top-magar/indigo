import { pgTable, uuid, text, jsonb, timestamp, boolean, integer, index, unique } from "drizzle-orm/pg-core"
import { editorProjects } from "./editor-projects"
import { tenants } from "./tenants"

export const editorPages = pgTable("editor_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => editorProjects.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  order: integer("order").default(0).notNull(),
  data: jsonb("data").notNull(),
  publishedHtml: text("published_html"),
  published: boolean("published").default(false),
  isHomepage: boolean("is_homepage").default(false),
  views: integer("views").default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImage: text("og_image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("editor_pages_project_id_idx").on(table.projectId),
  tenantIdIdx: index("editor_pages_tenant_id_idx").on(table.tenantId),
  projectSlugUnique: unique("editor_pages_project_id_slug_unique").on(table.projectId, table.slug),
}))

export type EditorPage = typeof editorPages.$inferSelect
export type NewEditorPage = typeof editorPages.$inferInsert
