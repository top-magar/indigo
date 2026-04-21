import { pgTable, uuid, text, jsonb, timestamp, boolean, integer } from "drizzle-orm/pg-core"

export const editorProjects = pgTable("editor_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug"),
  data: jsonb("data").notNull(),
  publishedHtml: text("published_html"),
  published: boolean("published").default(false),
  views: integer("views").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export type EditorProject = typeof editorProjects.$inferSelect
export type NewEditorProject = typeof editorProjects.$inferInsert
