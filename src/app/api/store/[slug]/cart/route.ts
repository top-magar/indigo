import { cookies } from "next/headers";
import { cartRepository } from "@/features/cart/repositories";
import { createErrorResponse, createSuccessResponse, AppError } from "@/shared/errors";
import { resolveBySlug } from "@/infrastructure/tenant";
import { withRateLimit } from "@/infrastructure/middleware/rate-limit";

/**
 * GET /api/store/[slug]/cart
 * 
 * Get current cart for the store
 * Rate limited: 60 requests/minute per IP
 * 
 * @see IMPLEMENTATION-PLAN.md Section 3.2
 * @see SYSTEM-ARCHITECTURE.md Section 9.2 (F006)
 */
export const GET = withRateLimit("cart", async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. Resolve tenant
    const tenant = await resolveBySlug(slug);
    if (!tenant) {
      return createErrorResponse("Store not found", "TENANT_NOT_FOUND");
    }

    // 2. Get cart ID from cookie
    const cookieStore = await cookies();
    const cartId = cookieStore.get("cart_id")?.value;

    if (!cartId) {
      return createSuccessResponse({
        cart: null,
        items: [],
        itemCount: 0,
        subtotal: "0.00",
      });
    }

    // 3. Get cart with items using repository
    const cart = await cartRepository.findActiveById(tenant.id, cartId);

    if (!cart) {
      return createSuccessResponse({
        cart: null,
        items: [],
        itemCount: 0,
        subtotal: "0.00",
      });
    }

    // Calculate totals
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items
      .reduce((sum, item) => sum + parseFloat(item.unitPrice) * item.quantity, 0)
      .toFixed(2);

    return createSuccessResponse({
      cart: {
        id: cart.id,
        status: cart.status,
        currency: cart.currency,
      },
      items: cart.items.map(item => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        compareAtPrice: item.compareAtPrice,
        total: (parseFloat(item.unitPrice) * item.quantity).toFixed(2),
      })),
      itemCount,
      subtotal,
    });
  } catch (error) {
    console.error("[API] GET /api/store/[slug]/cart error:", error);
    
    if (error instanceof AppError) {
      return error.toResponse();
    }
    
    return createErrorResponse("Internal server error", "INTERNAL_ERROR");
  }
});

/**
 * POST /api/store/[slug]/cart
 * 
 * Create a new cart or get existing
 * Rate limited: 60 requests/minute per IP
 */
export const POST = withRateLimit("cart", async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. Resolve tenant
    const tenant = await resolveBySlug(slug);
    if (!tenant) {
      return createErrorResponse("Store not found", "TENANT_NOT_FOUND");
    }

    // 2. Check for existing cart
    const cookieStore = await cookies();
    const existingCartId = cookieStore.get("cart_id")?.value;

    if (existingCartId) {
      const existingCart = await cartRepository.findActiveById(tenant.id, existingCartId);
      if (existingCart) {
        return createSuccessResponse({ cart: existingCart });
      }
    }

    // 3. Create new cart using repository
    const cart = await cartRepository.create(tenant.id, {
      currency: tenant.currency || "USD",
    });

    // 4. Set cart cookie
    cookieStore.set("cart_id", cart.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return createSuccessResponse({ cart }, 201);
  } catch (error) {
    console.error("[API] POST /api/store/[slug]/cart error:", error);
    
    if (error instanceof AppError) {
      return error.toResponse();
    }
    
    return createErrorResponse("Internal server error", "INTERNAL_ERROR");
  }
});
