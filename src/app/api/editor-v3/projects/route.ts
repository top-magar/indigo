import { NextRequest, NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"
import { db } from "@/infrastructure/db"
import { editorProjects } from "@/db/schema/editor-projects"
import { requireUser } from "@/lib/auth"

/** GET /api/editor-v3/projects — list projects for current tenant */
export async function GET() {
  const user = await requireUser()
  const rows = await db
    .select({ id: editorProjects.id, name: editorProjects.name, updatedAt: editorProjects.updatedAt })
    .from(editorProjects)
    .where(eq(editorProjects.tenantId, user.tenantId))
    .orderBy(desc(editorProjects.updatedAt))
  return NextResponse.json(rows)
}

/** POST /api/editor-v3/projects — create a new project */
export async function POST(req: NextRequest) {
  const user = await requireUser()
  const body = await req.json() as { name?: string; data?: unknown }
  if (!body.name || !body.data) {
    return NextResponse.json({ error: "name and data are required" }, { status: 400 })
  }
  const [row] = await db.insert(editorProjects).values({
    tenantId: user.tenantId,
    name: body.name,
    data: body.data,
  }).returning({ id: editorProjects.id })
  return NextResponse.json(row, { status: 201 })
}
