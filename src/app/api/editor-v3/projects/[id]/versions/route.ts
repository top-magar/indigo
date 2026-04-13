import { NextRequest, NextResponse } from "next/server"
import { eq, and, desc } from "drizzle-orm"
import { db } from "@/infrastructure/db"
import { editorProjectVersions } from "@/db/schema/editor-project-versions"
import { editorProjects } from "@/db/schema/editor-projects"
import { requireUser } from "@/lib/auth"

type Params = { params: Promise<{ id: string }> }

/** Verify project belongs to tenant */
async function verifyOwnership(projectId: string, tenantId: string) {
  const [row] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId)))
  return !!row
}

/** GET /api/editor-v3/projects/[id]/versions — list versions */
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await requireUser()
  const { id } = await params
  if (!await verifyOwnership(id, user.tenantId)) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const rows = await db
    .select({ id: editorProjectVersions.id, version: editorProjectVersions.version, label: editorProjectVersions.label, createdAt: editorProjectVersions.createdAt })
    .from(editorProjectVersions)
    .where(eq(editorProjectVersions.projectId, id))
    .orderBy(desc(editorProjectVersions.version))
  return NextResponse.json(rows)
}

/** POST /api/editor-v3/projects/[id]/versions — save a snapshot */
export async function POST(req: NextRequest, { params }: Params) {
  const user = await requireUser()
  const { id } = await params
  if (!await verifyOwnership(id, user.tenantId)) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const body = await req.json() as { label?: string; data?: unknown }
  if (!body.data) return NextResponse.json({ error: "data is required" }, { status: 400 })
  // Get next version number
  const existing = await db.select({ version: editorProjectVersions.version }).from(editorProjectVersions)
    .where(eq(editorProjectVersions.projectId, id)).orderBy(desc(editorProjectVersions.version)).limit(1)
  const nextVersion = (existing[0]?.version ?? 0) + 1
  const [row] = await db.insert(editorProjectVersions).values({
    projectId: id,
    version: nextVersion,
    label: body.label ?? "Snapshot",
    data: body.data,
  }).returning({ id: editorProjectVersions.id })
  return NextResponse.json(row, { status: 201 })
}
