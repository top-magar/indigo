import { productRepository } from "@/features/products/repositories";
import { createErrorResponse, createSuccessResponse, AppError } from "@/shared/errors";
import { resolveBySlug } from "@/infrastructure/tenant";
import { withRateLimit } from "@/infrastructure/middleware/rate-limit";

/**
 * GET /api/store/[slug]/products
 * 
 * Public endpoint - List active products for a store
 * Rate limited: 100 requests/minute per IP
 * 
 * @see IMPLEMENTATION-PLAN.md Section 3.2
 * @see SYSTEM-ARCHITECTURE.md Section 4.1
 * 
 * Tenant Resolution: URL slug → DB lookup → 404 if not found
 */
export const GET = withRateLimit("storefront", async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const categoryId = searchParams.get("category");

    // 1. Resolve tenant from URL slug (NEVER trust client)
    const tenant = await resolveBySlug(slug);
    if (!tenant) {
      return createErrorResponse("Store not found", "TENANT_NOT_FOUND");
    }

    // 2. Query using repository (RLS enforced via withTenant)
    let productList;
    if (categoryId) {
      productList = await productRepository.findByCategory(tenant.id, categoryId, { limit, offset });
    } else {
      productList = await productRepository.findActive(tenant.id, { limit, offset });
    }

    return createSuccessResponse({
      products: productList,
      pagination: {
        limit,
        offset,
        hasMore: productList.length === limit,
      },
      tenant: {
        name: tenant.name,
        slug: tenant.slug,
        currency: tenant.currency,
      },
    });
  } catch (error) {
    console.error("[API] GET /api/store/[slug]/products error:", error);
    
    if (error instanceof AppError) {
      return error.toResponse();
    }
    
    return createErrorResponse("Internal server error", "INTERNAL_ERROR");
  }
});
