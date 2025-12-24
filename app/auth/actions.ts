"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { headers } from "next/headers"

export async function signupAction(_prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const storeName = formData.get("storeName") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!email || !password || !storeName || !confirmPassword) {
    return { error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (storeName.length < 3) {
    return { error: "Store name must be at least 3 characters" }
  }

  // Generate slug with random suffix to ensure uniqueness
  const slugBase = storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  const slug = `${slugBase}-${randomSuffix}`

  const origin = (await headers()).get("origin")

  // 1. Sign up user with standard client
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "User creation failed" }
  }

  // 2. Perform DB operations using Admin client (Service Role) to bypass RLS
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
    return { error: `Tenant creation failed: ${tenantError.message}` }
  }

  // Create user profile linked to tenant
  const { error: userError } = await supabaseAdmin.from("users").insert({
    id: authData.user.id,
    tenant_id: tenant.id,
    email,
    full_name: storeName,
    role: "owner",
  })

  if (userError) {
    return { error: `User profile creation failed: ${userError.message}` }
  }

  return { success: true }
}
