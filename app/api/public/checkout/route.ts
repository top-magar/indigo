import { NextResponse } from "next/server";
import { orders } from "@/db/schema";
import { publicStorefrontAction } from "@/lib/public-actions";

export async function POST(request: Request) {
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
                totalAmount: amount,
                status: "pending"
            }).returning();
            return order;
        });

        return NextResponse.json({ success: true, orderId: newOrder.id });
    } catch (error: any) {
        console.error("Public API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
