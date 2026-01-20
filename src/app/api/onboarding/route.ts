import { NextResponse } from "next/server";
import { db } from "@/infrastructure/db";
import { tenants, users } from "@/db/schema";
import { createClient } from "@/infrastructure/supabase/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { businessName, email, password } = body;

        if (!businessName || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create user in Supabase Auth
        const supabase = await createClient();
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError || !authData.user) {
            return NextResponse.json({ error: authError?.message || "Failed to create user" }, { status: 400 });
        }

        const newTenant = await db.transaction(async (tx) => {
            // Generate slug from business name
            const slug = businessName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            
            const [tenant] = await tx.insert(tenants).values({
                name: businessName,
                slug,
            }).returning();

            await tx.insert(users).values({
                id: authData.user!.id,
                tenantId: tenant.id,
                email,
                role: "owner",
            });

            return tenant;
        });

        return NextResponse.json({ success: true, tenantId: newTenant.id });
    } catch (error: unknown) {
        console.error("Onboarding error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
