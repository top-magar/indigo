import { createClient } from "@/infrastructure/supabase/server"
import { createConnectAccount, createAccountLink } from "@/lib/stripe-connect"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from("users")
      .select("tenant_id, email")
      .eq("id", user.id)
      .single()

    if (!userData?.tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 400 })
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("stripe_account_id")
      .eq("id", userData.tenant_id)
      .single()

    let accountId = tenant?.stripe_account_id

    // Create account if doesn't exist
    if (!accountId) {
      const account = await createConnectAccount(userData.email, userData.tenant_id)
      accountId = account.id

      await supabase
        .from("tenants")
        .update({ stripe_account_id: accountId })
        .eq("id", userData.tenant_id)
    }

    // Create onboarding link
    const headersList = await headers()
    const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_APP_URL

    const accountLink = await createAccountLink(
      accountId,
      `${origin}/dashboard/settings/payments?refresh=true`,
      `${origin}/dashboard/settings/payments?success=true`
    )

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error("Stripe Connect error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create Stripe account" },
      { status: 500 }
    )
  }
}
