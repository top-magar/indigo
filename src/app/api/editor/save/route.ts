import { NextRequest, NextResponse } from "next/server"
import { saveDraftAction, saveThemeAction } from "@/features/editor/actions/actions"

export async function POST(req: NextRequest) {
  try {
    const { tenantId, pageId, json, theme } = await req.json()
    if (!tenantId || !json) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    await saveDraftAction(tenantId, json, pageId)
    if (theme && Object.keys(theme).length > 0) {
      await saveThemeAction(tenantId, theme, pageId).catch(() => {})
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 500 })
  }
}
