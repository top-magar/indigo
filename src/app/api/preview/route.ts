import { draftMode } from "next/headers"
import { redirect } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { createClient } from "@/infrastructure/supabase/server"

/**
 * Enable draft mode for store preview.
 * Authenticated store owners can preview without a secret token.
 *
 * GET /api/preview?slug=<store-slug>
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 })
  }

  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Verify the user's tenant owns this store
  const supabase = await createClient()
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .eq("id", user.tenantId)
    .single()

  if (!tenant) {
    return NextResponse.json({ error: "Store not found or not owned by you" }, { status: 403 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(`/store/${slug}`)
}
