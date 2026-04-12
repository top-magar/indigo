import { NextRequest, NextResponse } from "next/server"
import { eq, desc, sql } from "drizzle-orm"
import { sudoDb } from "@/infrastructure/db"
import { editorProjectVersions } from "@/db/schema/editor-project-versions"
import { editorProjects } from "@/db/schema/editor-projects"

type Params = { params: Promise<{ id: string }> }

/** GET /api/editor-v3/projects/[id]/versions — list versions */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const rows = await sudoDb
    .select({ id: editorProjectVersions.id, version: editorProjectVersions.version, label: editorProjectVersions.label, createdAt: editorProjectVersions.createdAt })
    .from(editorProjectVersions)
    .where(eq(editorProjectVersions.projectId, id))
    .orderBy(desc(editorProjectVersions.version))
  return NextResponse.json(rows)
}

/** POST /api/editor-v3/projects/[id]/versions — save a snapshot */
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json() as { label?: string }

  // Get current project data
  const [project] = await sudoDb.select().from(editorProjects).where(eq(editorProjects.id, id))
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 })

  // Get next version number
  const [{ max }] = await sudoDb
    .select({ max: sql<number>`coalesce(max(${editorProjectVersions.version}), 0)` })
    .from(editorProjectVersions)
    .where(eq(editorProjectVersions.projectId, id))

  const [row] = await sudoDb
    .insert(editorProjectVersions)
    .values({ projectId: id, version: max + 1, label: body.label, data: project.data })
    .returning()

  return NextResponse.json(row, { status: 201 })
}
