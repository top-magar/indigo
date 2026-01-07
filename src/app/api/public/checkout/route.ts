import { NextResponse } from "next/server";
import { orders } from "@/db/schema";
import { publicStorefrontAction } from "@/lib/public-actions";

/**
 * @deprecated This endpoint is deprecated. Use POST /api/store/[slug]/checkout instead.
 * This endpoint will be removed in a future release.
 * 
 * Migration guide:
 * - Old: POST /api/public/checkout with x-tenant-id header
 * - New: POST /api/store/{store-slug}/checkout (tenant resolved from URL)
 */
export async function POST(request: Request) {
    // Add deprecation warning header
    const deprecationWarning = "This endpoint is deprecated. Use POST /api/store/[slug]/checkout instead.";
    
    try {
        const tenantId = request.headers.get("x-tenant-id");

        if (!tenantId) {
            return NextResponse.json({ error: "Missing x-tenant-id header" }, { status: 400 });
        }

        const body = await request.json();
        const { amount } = body;
        // In a real app, we would validate items, check inventory, and calculate total.
        // Simplifying here to just accept 'amount' for the prototype proof-of-concept.

        if (!amount) {
            return NextResponse.json({ error: "Missing amount" }, { status: 400 });
        }

        const newOrder = await publicStorefrontAction(tenantId, async (tx) => {
            const [order] = await tx.insert(orders).values({
                tenantId,
                orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
                total: amount,
                status: "pending"
            }).returning();
            return order;
        });

        return NextResponse.json(
            { success: true, orderId: newOrder.id },
            {
                headers: {
                    "Deprecation": "true",
                    "Sunset": "2026-06-01",
                    "Link": "</api/store/{slug}/checkout>; rel=\"successor-version\"",
                    "X-Deprecation-Notice": deprecationWarning,
                },
            }
        );
    } catch (error: any) {
        console.error("Public API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
