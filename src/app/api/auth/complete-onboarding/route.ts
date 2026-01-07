import { createClient } from "@/infrastructure/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { storeName } = await request.json()

    if (!storeName || storeName.length < 3) {
      return NextResponse.json(
        { error: "Store name must be at least 3 characters" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Check if user already has a profile
    const { data: existingUser } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single()

    if (existingUser?.tenant_id) {
      return NextResponse.json(
        { error: "User already has a store" },
        { status: 400 }
      )
    }

    // Generate slug
    const slugBase = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    const randomSuffix = Math.random().toString(36).substring(2, 6)
    const slug = `${slugBase}-${randomSuffix}`

    // Use admin client to bypass RLS
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create tenant
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .insert({
        name: storeName,
        slug,
      })
      .select()
      .single()

    if (tenantError) {
      return NextResponse.json(
        { error: `Failed to create store: ${tenantError.message}` },
        { status: 500 }
      )
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
      })

    if (userError) {
      // Rollback tenant creation
      await supabaseAdmin.from("tenants").delete().eq("id", tenant.id)
      return NextResponse.json(
        { error: `Failed to create user profile: ${userError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, tenantId: tenant.id })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
