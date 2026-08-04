import { pgTable, uuid, text, jsonb, timestamp, integer, index, unique } from "drizzle-orm/pg-core"
import { editorProjects } from "./editor-projects"
import { tenants } from "./tenants"

export const editorProjectVersions = pgTable("editor_project_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => editorProjects.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  version: integer("version").notNull(),
  label: text("label"),
  data: jsonb("data").notNull(),
  documentVersion: integer("document_version").default(2).notNull(),
  publishedBy: uuid("published_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("editor_project_versions_project_id_idx").on(table.projectId),
  tenantIdIdx: index("editor_project_versions_tenant_id_idx").on(table.tenantId),
  projectVersionUnique: unique("editor_project_versions_project_version_unique").on(table.projectId, table.version),
}))

export type EditorProjectVersion = typeof editorProjectVersions.$inferSelect
