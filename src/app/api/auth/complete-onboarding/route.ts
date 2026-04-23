import { createClient } from "@/infrastructure/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { createLogger } from "@/lib/logger";
import { withRateLimit } from "@/infrastructure/middleware/rate-limit";
const log = createLogger("api:auth-complete-onboarding");

export const POST = withRateLimit("auth", async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const storeName = formData.get("storeName") as string
    const currency = (formData.get("currency") as string) || "NPR"
    const logo = formData.get("logo") as File | null

    if (!storeName || storeName.length < 3) {
      return NextResponse.json({ error: "Store name must be at least 3 characters" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if already onboarded
    const { data: existingUser } = await supabase.from("users").select("tenant_id").eq("id", user.id).single()
    if (existingUser?.tenant_id) {
      return NextResponse.json({ success: true, message: "Already onboarded" })
    }

    // Generate slug — clean, no random suffix unless collision
    const slugBase = storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    let slug = slugBase

    // Check for collision
    const { data: existing } = await supabaseAdmin.from("tenants").select("id").eq("slug", slug).single()
    if (existing) {
      slug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Upload logo if provided
    let logoUrl: string | null = null
    if (logo && logo.size > 0) {
      const ext = logo.name.split(".").pop() || "png"
      const path = `logos/${slug}.${ext}`
      const buffer = Buffer.from(await logo.arrayBuffer())

      const { error: uploadError } = await supabaseAdmin.storage
        .from("public")
        .upload(path, buffer, { contentType: logo.type, upsert: true })

      if (uploadError) {
        log.error("Logo upload error:", uploadError)
        // Non-fatal — continue without logo
      } else {
        const { data: urlData } = supabaseAdmin.storage.from("public").getPublicUrl(path)
        logoUrl = urlData.publicUrl
      }
    }

    // Create tenant
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .insert({
        name: storeName,
        slug,
        currency,
        ...(logoUrl && { logo_url: logoUrl }),
      })
      .select()
      .single()

    if (tenantError) {
      log.error("Tenant creation error:", tenantError)
      return NextResponse.json({ error: "Failed to create store" }, { status: 500 })
    }

    // Create or update user profile
    const { error: userError } = await supabaseAdmin
      .from("users")
      .upsert({
        id: user.id,
        tenant_id: tenant.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || storeName,
        role: "owner",
      }, { onConflict: "id" })

    if (userError) {
      log.error("User profile creation error:", userError)
      await supabaseAdmin.from("tenants").delete().eq("id", tenant.id)
      return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    log.error("Onboarding error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
});
