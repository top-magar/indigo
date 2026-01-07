import { withTenant } from "@/infrastructure/db";
import { productVariants, inventoryLevels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { productRepository } from "@/features/products/repositories";
import { createErrorResponse, createSuccessResponse, AppError } from "@/shared/errors";
import { resolveBySlug } from "@/infrastructure/tenant";

/**
 * GET /api/store/[slug]/products/[productId]
 * 
 * Public endpoint - Get product details with variants
 * 
 * @see IMPLEMENTATION-PLAN.md Section 3.2
 * @see SYSTEM-ARCHITECTURE.md Section 4.1
 * 
 * Tenant Resolution: URL slug → DB lookup → 404 if not found
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; productId: string }> }
) {
  try {
    const { slug, productId } = await params;

    // 1. Resolve tenant from URL slug
    const tenant = await resolveBySlug(slug);
    if (!tenant) {
      return createErrorResponse("Store not found", "TENANT_NOT_FOUND");
    }

    // 2. Get product using repository
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    
    let product;
    if (isUuid) {
      product = await productRepository.findById(tenant.id, productId);
    } else {
      product = await productRepository.findBySlug(tenant.id, productId);
    }

    // Only return active products
    if (!product || product.status !== "active") {
      return createErrorResponse("Product not found", "NOT_FOUND");
    }

    // 3. Get variants with inventory (still need direct query for variants)
    const variantsWithInventory = await withTenant(tenant.id, async (tx) => {
      const variants = await tx
        .select({
          id: productVariants.id,
          name: productVariants.name,
          sku: productVariants.sku,
          price: productVariants.price,
          options: productVariants.options,
        })
        .from(productVariants)
        .where(eq(productVariants.productId, product.id));

      return Promise.all(
        variants.map(async (variant) => {
          const [inventory] = await tx
            .select({ quantity: inventoryLevels.quantity })
            .from(inventoryLevels)
            .where(eq(inventoryLevels.variantId, variant.id))
            .limit(1);

          return {
            ...variant,
            inStock: (inventory?.quantity || 0) > 0,
            quantity: inventory?.quantity || 0,
          };
        })
      );
    });

    return createSuccessResponse({
      product: {
        ...product,
        variants: variantsWithInventory,
      },
      tenant: {
        name: tenant.name,
        slug: tenant.slug,
        currency: tenant.currency,
      },
    });
  } catch (error) {
    console.error("[API] GET /api/store/[slug]/products/[productId] error:", error);
    
    if (error instanceof AppError) {
      return error.toResponse();
    }
    
    return createErrorResponse("Internal server error", "INTERNAL_ERROR");
  }
}
