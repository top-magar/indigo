import { NextResponse } from "next/server";
import { db } from "@/infrastructure/db";
import { tenants, users } from "@/db/schema";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { businessName, email, password } = body;

        if (!businessName || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);

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
                tenantId: tenant.id,
                email,
                password: hashedPassword,
                role: "owner",
            });

            return tenant;
        });

        return NextResponse.json({ success: true, tenantId: newTenant.id });
    } catch (error: any) {
        console.error("Onboarding error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
