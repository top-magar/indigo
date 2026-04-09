"use server"

import { z } from "zod"
import { createClient } from "@/infrastructure/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  storeName: z.string().min(3),
  confirmPassword: z.string().min(6),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match" })

export async function signupAction(_prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  const parsed = signupSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }
  const { email, password, storeName } = parsed.data

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

// Google OAuth sign-in action
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
