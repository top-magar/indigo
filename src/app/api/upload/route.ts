import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createLogger } from "@/lib/logger";
import { withRateLimit } from "@/infrastructure/middleware/rate-limit";
import { createClient } from "@/infrastructure/supabase/server";
const log = createLogger("api:upload");

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Allowed file types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
]

export const POST = withRateLimit("dashboard", async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Validate content type
    const contentType = request.headers.get("content-type")
    if (!contentType?.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid content type. Expected multipart/form-data" },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      )
    }

    // Get tenant ID for scoped storage
    const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single()
    if (!userData?.tenant_id) return NextResponse.json({ error: "No tenant" }, { status: 403 })

    // Sanitize filename
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .toLowerCase()

    // Upload to Vercel Blob with tenant prefix
    const blob = await put(`tenants/${userData.tenant_id}/${sanitizedName}`, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      filename: sanitizedName,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    log.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
});
