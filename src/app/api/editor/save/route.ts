import { NextRequest, NextResponse } from "next/server"
import { saveDraftAction } from "@/features/editor/actions"

export async function POST(req: NextRequest) {
  try {
    const { tenantId, pageId, json } = await req.json()
    if (!tenantId || !json) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    await saveDraftAction(tenantId, json, pageId)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 500 })
  }
}
