import { NextResponse } from "next/server";
import { products } from "@/db/schema";
import { publicStorefrontAction } from "@/lib/public-actions";

export async function GET(request: Request) {
    const tenantId = request.headers.get("x-tenant-id");

    if (!tenantId) {
        return NextResponse.json(
            { error: "Missing x-tenant-id header" },
            { status: 400 }
        );
    }

    try {
        const allProducts = await publicStorefrontAction(tenantId, async (tx) => {
            return tx.select().from(products);
        });

        return NextResponse.json(
            { products: allProducts },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
                },
            }
        );
    } catch (error) {
        console.error("Public API Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}
