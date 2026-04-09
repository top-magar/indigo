import { NextRequest, NextResponse } from "next/server"
import { saveDraftAction, saveThemeAction } from "@/features/editor/actions/actions"
import { withRateLimit } from "@/infrastructure/middleware/rate-limit"
import { createClient } from "@/infrastructure/supabase/server"

export const POST = withRateLimit("visualEditor", async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single()
    if (!userData?.tenant_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { pageId, json, theme } = await req.json()
    if (!json) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    await saveDraftAction(userData.tenant_id, json, pageId)
    if (theme && Object.keys(theme).length > 0) {
      await saveThemeAction(userData.tenant_id, theme, pageId).catch(() => {})
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 500 })
  }
})
