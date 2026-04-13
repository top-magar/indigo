import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core"

export const editorProjects = pgTable("editor_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export type EditorProject = typeof editorProjects.$inferSelect
export type NewEditorProject = typeof editorProjects.$inferInsert
