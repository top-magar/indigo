import { createClient } from "@/infrastructure/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check if user has a profile with tenant
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("tenant_id, role, platform_role")
          .eq("id", user.id)
          .single()

        // Platform access: role is platform_admin OR has platform_role
        const hasPlatformAccess = userData?.role === "platform_admin" || !!userData?.platform_role;

        if (hasPlatformAccess && !userData?.tenant_id) {
          return NextResponse.redirect(`${requestUrl.origin}/admin`)
        }

        // If no tenant and no platform access, redirect to onboarding
        if (!userData?.tenant_id && !hasPlatformAccess) {
          return NextResponse.redirect(`${requestUrl.origin}/auth/onboarding`)
        }

        // Dual-role users: respect the `next` param, default to admin
        if (hasPlatformAccess) {
          return NextResponse.redirect(`${requestUrl.origin}${next === "/dashboard" ? "/admin" : next}`)
        }
      }

      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/login?error=auth-code-error`)
}
