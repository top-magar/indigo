import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/infrastructure/supabase/server"

const rateMap = new Map<string, number>()

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown"
  const now = Date.now()
  if ((rateMap.get(ip) ?? 0) > now - 2000) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  rateMap.set(ip, now)

  const { tenantId, sectionId, fields, recipientEmail } = await req.json() as {
    tenantId?: string; sectionId?: string; fields?: Record<string, string>; recipientEmail?: string
  }
  if (!fields || typeof fields !== "object") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  // Log submission
  console.log("[form-submit]", { tenantId, sectionId, fields })

  // Store in DB if tenantId provided
  if (tenantId) {
    const supabase = await createClient()
    await supabase.from("form_submissions").insert({
      tenant_id: tenantId,
      section_id: sectionId ?? null,
      data: fields,
      recipient_email: recipientEmail ?? null,
    })

    // Check for webhook
    const { data: layout } = await supabase
      .from("store_layouts")
      .select("theme_overrides")
      .eq("tenant_id", tenantId)
      .eq("is_homepage", true)
      .maybeSingle()
    const theme = layout?.theme_overrides as Record<string, unknown> | undefined
    const webhookUrl = theme?.formWebhookUrl as string | undefined
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, sectionId, fields }),
      }).catch(() => {})
    }
    if (recipientEmail) {
      console.log("[form-submit] Would email:", recipientEmail, fields)
    }
  }

  return NextResponse.json({ success: true })
}
