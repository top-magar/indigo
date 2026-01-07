/**
 * Draft Mode API Route Handler
 * 
 * Enables Next.js Draft Mode for previewing unpublished content:
 * - Draft products (status: "draft")
 * - Unpublished store layout changes
 * 
 * @see https://nextjs.org/docs/app/guides/draft-mode
 */
import { draftMode } from "next/headers"
import { redirect } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/infrastructure/supabase/server"

/**
 * Enable draft mode
 * 
 * GET /api/draft?secret=<token>&slug=<store-slug>&redirect=<path>
 * 
 * Security: Requires a secret token that matches DRAFT_MODE_SECRET env var
 * This prevents unauthorized users from viewing draft content.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const secret = searchParams.get("secret")
  const slug = searchParams.get("slug")
  const redirectPath = searchParams.get("redirect")

  // Validate secret token
  const draftSecret = process.env.DRAFT_MODE_SECRET
  if (!draftSecret) {
    return NextResponse.json(
      { error: "Draft mode not configured" },
      { status: 500 }
    )
  }

  if (secret !== draftSecret) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    )
  }

  // Optionally validate that the store exists
  if (slug) {
    const supabase = await createClient()
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .single()

    if (!tenant) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      )
    }
  }

  // Enable Draft Mode by setting the cookie
  const draft = await draftMode()
  draft.enable()

  // Redirect to the requested path or store homepage
  const destination = redirectPath || (slug ? `/store/${slug}` : "/")
  redirect(destination)
}
