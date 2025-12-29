/**
 * Disable Draft Mode API Route Handler
 * 
 * Exits draft mode and returns to viewing published content only.
 * 
 * @see https://nextjs.org/docs/app/guides/draft-mode
 */
import { draftMode } from "next/headers"
import { redirect } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"

/**
 * Disable draft mode
 * 
 * GET /api/draft/disable?redirect=<path>
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const redirectPath = searchParams.get("redirect")

  // Disable Draft Mode by removing the cookie
  const draft = await draftMode()
  draft.disable()

  // Redirect to the requested path or homepage
  redirect(redirectPath || "/")
}

/**
 * POST endpoint for programmatic disabling (e.g., from editor UI)
 */
export async function POST() {
  const draft = await draftMode()
  draft.disable()

  return NextResponse.json({ success: true, draftMode: false })
}
