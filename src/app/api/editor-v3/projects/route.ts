import { NextRequest, NextResponse } from "next/server"
import { desc } from "drizzle-orm"
import { sudoDb } from "@/infrastructure/db"
import { editorProjects } from "@/db/schema/editor-projects"

/** GET /api/editor-v3/projects — list all projects */
export async function GET() {
  const rows = await sudoDb
    .select({ id: editorProjects.id, name: editorProjects.name, updatedAt: editorProjects.updatedAt })
    .from(editorProjects)
    .orderBy(desc(editorProjects.updatedAt))
  return NextResponse.json(rows)
}

/** POST /api/editor-v3/projects — create a new project */
export async function POST(req: NextRequest) {
  const body = await req.json() as { name: string; data: unknown }
  if (!body.name || !body.data) {
    return NextResponse.json({ error: "name and data are required" }, { status: 400 })
  }
  const [row] = await sudoDb
    .insert(editorProjects)
    .values({ name: body.name, data: body.data })
    .returning()
  return NextResponse.json(row, { status: 201 })
}
