"use server"

import { createClient } from "@/infrastructure/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

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

  const slugBase = storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  const slug = `${slugBase}-${randomSuffix}`

  const origin = (await headers()).get("origin")

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

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

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

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = (await headers()).get("origin")

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/auth/onboarding`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { error: "Failed to initiate Google sign-in" }
}
