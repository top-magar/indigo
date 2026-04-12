import { pgTable, uuid, text, jsonb, timestamp, integer } from "drizzle-orm/pg-core"
import { editorProjects } from "./editor-projects"

export const editorProjectVersions = pgTable("editor_project_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => editorProjects.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  label: text("label"),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export type EditorProjectVersion = typeof editorProjectVersions.$inferSelect
