import { NextRequest, NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/infrastructure/db"
import { editorProjects } from "@/db/schema/editor-projects"
import { requireUser } from "@/lib/auth"

type Params = { params: Promise<{ id: string }> }

/** GET /api/editor-v3/projects/[id] — load a project (tenant-scoped) */
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await requireUser()
  const { id } = await params
  const [row] = await db.select().from(editorProjects)
    .where(and(eq(editorProjects.id, id), eq(editorProjects.tenantId, user.tenantId)))
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(row)
}

/** PUT /api/editor-v3/projects/[id] — update a project (tenant-scoped) */
export async function PUT(req: NextRequest, { params }: Params) {
  const user = await requireUser()
  const { id } = await params
  const body = await req.json() as { name?: string; data?: unknown }
  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.name) updates.name = body.name
  if (body.data) updates.data = body.data
  const [row] = await db.update(editorProjects).set(updates)
    .where(and(eq(editorProjects.id, id), eq(editorProjects.tenantId, user.tenantId)))
    .returning({ id: editorProjects.id })
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(row)
}
