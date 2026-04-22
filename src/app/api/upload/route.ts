import { type NextRequest, NextResponse } from "next/server"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/infrastructure/middleware/rate-limit"
import { createClient } from "@/infrastructure/supabase/server"

const log = createLogger("api:upload")
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"]
const BUCKET = "uploads"

export const POST = withRateLimit("dashboard", async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const contentType = request.headers.get("content-type")
    if (!contentType?.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 })

    const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single()
    if (!userData?.tenant_id) return NextResponse.json({ error: "No tenant" }, { status: 403 })

    // Unique filename: tenant/timestamp-sanitized
    const ext = file.name.split(".").pop()?.toLowerCase() || "png"
    const sanitized = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-]/g, "_").toLowerCase()
    const path = `${userData.tenant_id}/${Date.now()}-${sanitized}.${ext}`

    const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      log.error("Supabase upload error:", error)
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)

    return NextResponse.json({
      url: urlData.publicUrl,
      filename: sanitized,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    log.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
})
