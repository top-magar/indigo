import { NextResponse } from "next/server";
import { products } from "@/db/schema";
import { publicStorefrontAction } from "@/lib/public-actions";

/**
 * @deprecated This endpoint is deprecated. Use GET /api/store/[slug]/products instead.
 * This endpoint will be removed in a future release.
 * 
 * Migration guide:
 * - Old: GET /api/public/products with x-tenant-id header
 * - New: GET /api/store/{store-slug}/products (tenant resolved from URL)
 */
export async function GET(request: Request) {
    // Add deprecation warning header
    const deprecationWarning = "This endpoint is deprecated. Use GET /api/store/[slug]/products instead.";
    
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
                    "Deprecation": "true",
                    "Sunset": "2026-06-01",
                    "Link": "</api/store/{slug}/products>; rel=\"successor-version\"",
                    "X-Deprecation-Notice": deprecationWarning,
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
