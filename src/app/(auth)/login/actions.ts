"use server"

import { z } from "zod"
import { createClient } from "@/infrastructure/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const callbackUrlSchema = z.string().min(1).startsWith("/")

/**
 * Google OAuth sign-in action
 */
export async function signInWithGoogle(callbackUrl: string = "/dashboard") {
  const validCallbackUrl = callbackUrlSchema.parse(callbackUrl)
  const supabase = await createClient()
  const origin = (await headers()).get("origin")

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(validCallbackUrl)}`,
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
