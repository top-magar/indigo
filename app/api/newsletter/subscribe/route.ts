import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const { email, storeSlug } = await request.json();

        if (!email || !storeSlug) {
            return NextResponse.json(
                { error: "Email and store slug are required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Get tenant by slug
        const { data: tenant, error: tenantError } = await supabase
            .from("tenants")
            .select("id")
            .eq("slug", storeSlug)
            .single();

        if (tenantError || !tenant) {
            return NextResponse.json(
                { error: "Store not found" },
                { status: 404 }
            );
        }

        // Check if already subscribed
        const { data: existing } = await supabase
            .from("newsletter_subscribers")
            .select("id")
            .eq("tenant_id", tenant.id)
            .eq("email", email.toLowerCase())
            .single();

        if (existing) {
            return NextResponse.json(
                { message: "Already subscribed" },
                { status: 200 }
            );
        }

        // Insert new subscriber
        const { error: insertError } = await supabase
            .from("newsletter_subscribers")
            .insert({
                tenant_id: tenant.id,
                email: email.toLowerCase(),
                subscribed_at: new Date().toISOString(),
            });

        if (insertError) {
            console.error("Newsletter subscription error:", insertError);
            return NextResponse.json(
                { error: "Failed to subscribe" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Successfully subscribed" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Newsletter API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
