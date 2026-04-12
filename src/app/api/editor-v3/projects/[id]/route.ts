import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { sudoDb } from "@/infrastructure/db"
import { editorProjects } from "@/db/schema/editor-projects"

type Params = { params: Promise<{ id: string }> }

/** GET /api/editor-v3/projects/[id] — load a project */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const [row] = await sudoDb.select().from(editorProjects).where(eq(editorProjects.id, id))
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json(row)
}

/** PUT /api/editor-v3/projects/[id] — update a project */
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json() as { name?: string; data?: unknown }
  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.name) updates.name = body.name
  if (body.data) updates.data = body.data
  const [row] = await sudoDb
    .update(editorProjects)
    .set(updates)
    .where(eq(editorProjects.id, id))
    .returning()
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json(row)
}
