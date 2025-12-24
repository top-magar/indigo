import { NextResponse } from "next/server";
import { products } from "@/db/schema";
import { publicStorefrontAction } from "@/lib/public-actions";

export async function GET(request: Request) {
    try {
        const tenantId = request.headers.get("x-tenant-id");

        if (!tenantId) {
            return NextResponse.json({ error: "Missing x-tenant-id header" }, { status: 400 });
        }

        const allProducts = await publicStorefrontAction(tenantId, async (tx) => {
            return tx.select().from(products);
        });

        return NextResponse.json({ products: allProducts });
    } catch (error: any) {
        console.error("Public API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
