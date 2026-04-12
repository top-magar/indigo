import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { sudoDb } from "@/infrastructure/db"
import { editorProjectVersions } from "@/db/schema/editor-project-versions"

type Params = { params: Promise<{ id: string; versionId: string }> }

/** GET /api/editor-v3/projects/[id]/versions/[versionId] — get version data */
export async function GET(_req: NextRequest, { params }: Params) {
  const { versionId } = await params
  const [row] = await sudoDb.select().from(editorProjectVersions).where(eq(editorProjectVersions.id, versionId))
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json(row)
}
