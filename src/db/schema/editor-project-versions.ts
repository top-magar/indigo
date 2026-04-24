import { pgTable, uuid, text, jsonb, timestamp, integer, index } from "drizzle-orm/pg-core"
import { editorProjects } from "./editor-projects"
import { tenants } from "./tenants"

export const editorProjectVersions = pgTable("editor_project_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => editorProjects.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  version: integer("version").notNull(),
  label: text("label"),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("editor_project_versions_project_id_idx").on(table.projectId),
}))

export type EditorProjectVersion = typeof editorProjectVersions.$inferSelect
