import { NextRequest, NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/infrastructure/db"
import { editorProjectVersions } from "@/db/schema/editor-project-versions"
import { editorProjects } from "@/db/schema/editor-projects"
import { requireUser } from "@/lib/auth"

type Params = { params: Promise<{ id: string; versionId: string }> }

/** GET /api/editor-v3/projects/[id]/versions/[versionId] — get version data */
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await requireUser()
  const { id, versionId } = await params
  // Verify project ownership
  const [project] = await db.select({ id: editorProjects.id }).from(editorProjects)
    .where(and(eq(editorProjects.id, id), eq(editorProjects.tenantId, user.tenantId)))
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const [row] = await db.select().from(editorProjectVersions)
    .where(and(eq(editorProjectVersions.id, versionId), eq(editorProjectVersions.projectId, id)))
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(row)
}
