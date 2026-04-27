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
import { withRateLimit } from "@/infrastructure/middleware/rate-limit"

/**
 * Disable draft mode
 * 
 * GET /api/draft/disable?redirect=<path>
 */
export const GET = withRateLimit("visualEditor", async function GET(request: Request) {
  const req = request as NextRequest;
  const searchParams = req.nextUrl.searchParams
  const redirectPath = searchParams.get("redirect")
  const safePath = redirectPath?.startsWith("/") && !redirectPath.startsWith("//") ? redirectPath : "/"

  // Disable Draft Mode by removing the cookie
  const draft = await draftMode()
  draft.disable()

  // Redirect to the requested path or homepage
  redirect(safePath)
})

/**
 * POST endpoint for programmatic disabling (e.g., from editor UI)
 */
export const POST = withRateLimit("visualEditor", async function POST() {
  const draft = await draftMode()
  draft.disable()

  return NextResponse.json({ success: true, draftMode: false })
})
