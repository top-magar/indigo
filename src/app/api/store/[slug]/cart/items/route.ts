import { cookies } from "next/headers";
import { withTenant } from "@/infrastructure/db";
import { products, productVariants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cartRepository } from "@/features/cart/repositories";
import { createErrorResponse, createSuccessResponse, AppError } from "@/shared/errors";
import { resolveBySlug } from "@/infrastructure/tenant";
import { withRateLimit } from "@/infrastructure/middleware/rate-limit";
import { z } from "zod";

/**
 * Cart item validation schema
 * Error messages explain what's wrong AND how to fix it
 * 
 * @see IMPLEMENTATION-PLAN.md Section 3.2
 */
const addToCartSchema = z.object({
  productId: z
    .string()
    .uuid("Invalid product ID — please select a valid product"),
  variantId: z
    .string()
    .uuid("Invalid variant ID — please select a valid product variant")
    .optional(),
  quantity: z
    .number()
    .int("Quantity must be a whole number — decimals are not allowed")
    .positive("Quantity must be at least 1 — enter how many items to add")
    .max(99, "Maximum quantity is 99 — for larger orders, please contact us")
    .default(1),
});

const updateCartItemSchema = z.object({
  itemId: z
    .string()
    .uuid("Invalid cart item ID"),
  quantity: z
    .number()
    .int("Quantity must be a whole number — decimals are not allowed")
    .min(0, "Quantity cannot be negative — enter 0 to remove the item")
    .max(99, "Maximum quantity is 99 — for larger orders, please contact us"),
});

/**
 * POST /api/store/[slug]/cart/items
 * 
 * Add item to cart
 * Rate limited: 60 requests/minute per IP
 * 
 * @see IMPLEMENTATION-PLAN.md Section 3.2
 * @see SYSTEM-ARCHITECTURE.md Section 9.2 (F006)
 */
export const POST = withRateLimit("cart", async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // 1. Validate input
    const validation = addToCartSchema.safeParse(body);
    if (!validation.success) {
      return createErrorResponse(
        "Validation failed",
        "VALIDATION_ERROR",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }
    const { productId, variantId, quantity } = validation.data;

    // 2. Resolve tenant
    const tenant = await resolveBySlug(slug);
    if (!tenant) {
      return createErrorResponse("Store not found", "TENANT_NOT_FOUND");
    }

    // 3. Get or create cart
    const cookieStore = await cookies();
    let cartId = cookieStore.get("cart_id")?.value;

    // 4. Verify product and get details
    const productData = await withTenant(tenant.id, async (tx) => {
      const [product] = await tx
        .select()
        .from(products)
        .where(and(eq(products.id, productId), eq(products.status, "active")))
        .limit(1);

      if (!product) {
        throw new AppError("Product not found or unavailable", "PRODUCT_NOT_AVAILABLE");
      }

      // Get variant if specified, otherwise use first variant
      let variant = null;
      if (variantId) {
        [variant] = await tx
          .select()
          .from(productVariants)
          .where(eq(productVariants.id, variantId))
          .limit(1);
      } else {
        [variant] = await tx
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, productId))
          .limit(1);
      }

      return { product, variant };
    });

    // 5. Get or create cart using repository
    let cart;
    if (cartId) {
      cart = await cartRepository.findActiveById(tenant.id, cartId);
    }

    if (!cart) {
      cart = await cartRepository.create(tenant.id, {
        currency: tenant.currency || "USD",
      });
      cartId = cart.id;
    }

    // 6. Add item to cart using repository
    const productImage = productData.product.images?.[0];
    const item = await cartRepository.addItem(tenant.id, cart.id, {
      productId,
      variantId: productData.variant?.id || null,
      productName: productData.product.name,
      productImage: typeof productImage === "string" ? productImage : productImage?.url || null,
      unitPrice: productData.variant?.price || productData.product.price,
      compareAtPrice: productData.product.compareAtPrice,
      quantity,
    });

    // 7. Set cart cookie if new
    if (cartId) {
      cookieStore.set("cart_id", cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return createSuccessResponse({ success: true, item }, 201);
  } catch (error) {
    console.error("[API] POST /api/store/[slug]/cart/items error:", error);
    
    if (error instanceof AppError) {
      return error.toResponse();
    }
    
    return createErrorResponse("Internal server error", "INTERNAL_ERROR");
  }
});

/**
 * PUT /api/store/[slug]/cart/items
 * 
 * Update cart item quantity
 * Rate limited: 60 requests/minute per IP
 */
export const PUT = withRateLimit("cart", async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // 1. Validate input
    const validation = updateCartItemSchema.safeParse(body);
    if (!validation.success) {
      return createErrorResponse(
        "Validation failed",
        "VALIDATION_ERROR",
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }
    const { itemId, quantity } = validation.data;

    // 2. Resolve tenant
    const tenant = await resolveBySlug(slug);
    if (!tenant) {
      return createErrorResponse("Store not found", "TENANT_NOT_FOUND");
    }

    // 3. Get cart from cookie
    const cookieStore = await cookies();
    const cartId = cookieStore.get("cart_id")?.value;

    if (!cartId) {
      return createErrorResponse("Cart not found", "CART_NOT_FOUND");
    }

    // 4. Update item using repository
    if (quantity === 0) {
      const deleted = await cartRepository.removeItem(tenant.id, cartId, itemId);
      if (!deleted) {
        return createErrorResponse("Cart item not found", "NOT_FOUND");
      }
      return createSuccessResponse({ success: true, deleted: true });
    }

    const item = await cartRepository.updateItemQuantity(tenant.id, cartId, itemId, quantity);
    if (!item) {
      return createErrorResponse("Cart item not found", "NOT_FOUND");
    }

    return createSuccessResponse({ success: true, item });
  } catch (error) {
    console.error("[API] PUT /api/store/[slug]/cart/items error:", error);
    
    if (error instanceof AppError) {
      return error.toResponse();
    }
    
    return createErrorResponse("Internal server error", "INTERNAL_ERROR");
  }
});
