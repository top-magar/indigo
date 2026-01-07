import { categoryRepository } from "@/features/categories/repositories";
import { createErrorResponse, createSuccessResponse, AppError } from "@/shared/errors";
import { resolveBySlug } from "@/infrastructure/tenant";

/**
 * GET /api/store/[slug]/categories
 * 
 * Public endpoint - List active categories for a store
 * 
 * @see IMPLEMENTATION-PLAN.md Section 3.2
 * @see SYSTEM-ARCHITECTURE.md Section 4.1
 * 
 * Tenant Resolution: URL slug → DB lookup → 404 if not found
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const parentId = searchParams.get("parent_id");

    // 1. Resolve tenant from URL slug (NEVER trust client)
    const tenant = await resolveBySlug(slug);
    if (!tenant) {
      return createErrorResponse("Store not found", "TENANT_NOT_FOUND");
    }

    // 2. Query using repository (RLS enforced via withTenant)
    let categoryList;
    if (parentId === "null" || parentId === "") {
      // Get root categories (no parent)
      categoryList = await categoryRepository.findRoots(tenant.id);
    } else if (parentId) {
      // Get children of specific parent
      categoryList = await categoryRepository.findByParent(tenant.id, parentId);
    } else {
      // Return all categories
      categoryList = await categoryRepository.findAll(tenant.id, { limit, offset });
    }

    return createSuccessResponse({
      categories: categoryList,
      pagination: {
        limit,
        offset,
        hasMore: categoryList.length === limit,
      },
      tenant: {
        name: tenant.name,
        slug: tenant.slug,
        currency: tenant.currency,
      },
    });
  } catch (error) {
    console.error("[API] GET /api/store/[slug]/categories error:", error);
    
    if (error instanceof AppError) {
      return error.toResponse();
    }
    
    return createErrorResponse("Internal server error", "INTERNAL_ERROR");
  }
}
