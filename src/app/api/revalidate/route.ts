/**
 * On-Demand ISR Revalidation API Route
 * 
 * Allows external services (webhooks, CMS, etc.) to trigger cache revalidation
 * for specific store pages or data types.
 * 
 * Note: This project uses Next.js 16 Cache Components with `use cache` directive.
 * Traditional ISR with `revalidate` config is replaced by cacheLife() and cacheTag().
 * 
 * @see https://nextjs.org/docs/app/guides/incremental-static-regeneration
 */
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

/**
 * POST /api/revalidate
 * 
 * Body:
 * - secret: string (required) - Must match REVALIDATION_SECRET env var
 * - type: "path" | "tag" (required) - Type of revalidation
 * - path?: string - Path to revalidate (for type: "path")
 * - tag?: string - Cache tag to revalidate (for type: "tag")
 * - storeSlug?: string - Store slug for convenience methods
 * - dataType?: "products" | "categories" | "layout" - Data type for tag-based revalidation
 * 
 * Examples:
 * 
 * Revalidate a specific store page:
 * { "secret": "...", "type": "path", "path": "/store/my-store" }
 * 
 * Revalidate all products for a store:
 * { "secret": "...", "type": "tag", "storeSlug": "my-store", "dataType": "products" }
 * 
 * Revalidate a specific tag:
 * { "secret": "...", "type": "tag", "tag": "products-tenant-123" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret, type, path, tag, storeSlug, dataType } = body

    // Validate secret
    const revalidationSecret = process.env.REVALIDATION_SECRET
    if (!revalidationSecret) {
      return NextResponse.json(
        { error: "Revalidation not configured" },
        { status: 500 }
      )
    }

    if (secret !== revalidationSecret) {
      return NextResponse.json(
        { error: "Invalid secret" },
        { status: 401 }
      )
    }

    // Validate type
    if (!type || !["path", "tag"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'path' or 'tag'" },
        { status: 400 }
      )
    }

    const revalidated: string[] = []

    if (type === "path") {
      if (!path) {
        return NextResponse.json(
          { error: "Path is required for type 'path'" },
          { status: 400 }
        )
      }
      revalidatePath(path)
      revalidated.push(`path:${path}`)
    }

    if (type === "tag") {
      // Direct tag revalidation
      // Next.js 16 Cache Components: revalidateTag requires a cache lifetime
      if (tag) {
        revalidateTag(tag, "hours")
        revalidated.push(`tag:${tag}`)
      }
      
      // Convenience: revalidate by store and data type
      if (storeSlug && dataType) {
        // Revalidate store-specific paths based on data type
        switch (dataType) {
          case "products":
            revalidatePath(`/store/${storeSlug}/products`)
            revalidateTag(`products-${storeSlug}`, "hours")
            revalidated.push(`path:/store/${storeSlug}/products`, `tag:products-${storeSlug}`)
            break
          case "categories":
            revalidatePath(`/store/${storeSlug}`)
            revalidateTag(`categories-${storeSlug}`, "days")
            revalidated.push(`path:/store/${storeSlug}`, `tag:categories-${storeSlug}`)
            break
          case "layout":
            revalidatePath(`/store/${storeSlug}`)
            revalidated.push(`path:/store/${storeSlug}`)
            break
        }
      }
    }

    if (revalidated.length === 0) {
      return NextResponse.json(
        { error: "No revalidation targets specified" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      revalidated,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Revalidation error:", error)
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/revalidate?secret=...&path=...
 * 
 * Simple GET endpoint for webhook integrations that only support GET
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const secret = searchParams.get("secret")
  const path = searchParams.get("path")
  const tag = searchParams.get("tag")

  // Validate secret
  const revalidationSecret = process.env.REVALIDATION_SECRET
  if (!revalidationSecret) {
    return NextResponse.json(
      { error: "Revalidation not configured" },
      { status: 500 }
    )
  }

  if (secret !== revalidationSecret) {
    return NextResponse.json(
      { error: "Invalid secret" },
      { status: 401 }
    )
  }

  if (!path && !tag) {
    return NextResponse.json(
      { error: "Either 'path' or 'tag' query parameter is required" },
      { status: 400 }
    )
  }

  const revalidated: string[] = []

  if (path) {
    revalidatePath(path)
    revalidated.push(`path:${path}`)
  }

  if (tag) {
    // Next.js 16 Cache Components: revalidateTag requires a cache lifetime
    revalidateTag(tag, "hours")
    revalidated.push(`tag:${tag}`)
  }

  return NextResponse.json({
    success: true,
    revalidated,
    timestamp: new Date().toISOString(),
  })
}
