import { cookies } from "next/headers";
import { cartRepository } from "@/features/cart/repositories";
import { createErrorResponse, createSuccessResponse, AppError } from "@/shared/errors";
import { resolveBySlug } from "@/infrastructure/tenant";

/**
 * DELETE /api/store/[slug]/cart/items/[itemId]
 * 
 * Delete a specific item from the cart
 * 
 * @see IMPLEMENTATION-PLAN.md Section 3.2
 * @see SYSTEM-ARCHITECTURE.md Section 9.2 (F006)
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; itemId: string }> }
) {
  try {
    const { slug, itemId } = await params;

    // 1. Resolve tenant
    const tenant = await resolveBySlug(slug);
    if (!tenant) {
      return createErrorResponse("Store not found", "TENANT_NOT_FOUND");
    }

    // 2. Get cart from cookie
    const cookieStore = await cookies();
    const cartId = cookieStore.get("cart_id")?.value;

    if (!cartId) {
      return createErrorResponse("Cart not found", "CART_NOT_FOUND");
    }

    // 3. Verify cart exists
    const cart = await cartRepository.findActiveById(tenant.id, cartId);
    if (!cart) {
      return createErrorResponse("Cart not found", "CART_NOT_FOUND");
    }

    // 4. Delete item using repository
    const deleted = await cartRepository.removeItem(tenant.id, cartId, itemId);
    if (!deleted) {
      return createErrorResponse("Cart item not found", "NOT_FOUND");
    }

    return createSuccessResponse({ success: true, deleted: true });
  } catch (error) {
    console.error("[API] DELETE /api/store/[slug]/cart/items/[itemId] error:", error);
    
    if (error instanceof AppError) {
      return error.toResponse();
    }
    
    return createErrorResponse("Internal server error", "INTERNAL_ERROR");
  }
}
