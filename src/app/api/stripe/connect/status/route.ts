import { createClient } from "@/infrastructure/supabase/server"
import { getAccountStatus } from "@/lib/stripe-connect"
import { NextResponse } from "next/server"

export async function GET() {
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
      .select("tenant_id")
      .eq("id", user.id)
      .single()

    if (!userData?.tenant_id) {
      return NextResponse.json({ error: "No tenant found" }, { status: 400 })
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("stripe_account_id, stripe_onboarding_complete")
      .eq("id", userData.tenant_id)
      .single()

    if (!tenant?.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        onboardingComplete: false,
      })
    }

    const status = await getAccountStatus(tenant.stripe_account_id)

    // Update onboarding status if changed
    if (status.chargesEnabled && !tenant.stripe_onboarding_complete) {
      await supabase
        .from("tenants")
        .update({ stripe_onboarding_complete: true })
        .eq("id", userData.tenant_id)
    }

    return NextResponse.json({
      connected: true,
      onboardingComplete: status.chargesEnabled && status.payoutsEnabled,
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
      detailsSubmitted: status.detailsSubmitted,
    })
  } catch (error) {
    console.error("Stripe status error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get status" },
      { status: 500 }
    )
  }
}
