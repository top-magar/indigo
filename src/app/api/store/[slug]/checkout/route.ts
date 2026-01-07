import { cookies } from "next/headers";
import Stripe from "stripe";
import { z } from "zod";
import { sudoDb } from "@/infrastructure/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cartRepository } from "@/features/cart/repositories";
import { orderRepository } from "@/features/orders/repositories";
import { createErrorResponse, createSuccessResponse, AppError } from "@/shared/errors";
import { resolveBySlug } from "@/infrastructure/tenant";
import { withRateLimit } from "@/infrastructure/middleware/rate-limit";
import { auditLogger, extractRequestMetadata } from "@/infrastructure/services/audit-logger";

/**
 * Checkout API Route
 * 
 * Rate limited: 10 requests/minute per IP (stricter for payment security)
 * 
 * @see IMPLEMENTATION-PLAN.md Section 3.4
 * @see SYSTEM-ARCHITECTURE.md Section 9.2 (F007)
 * 
 * Creates a Stripe PaymentIntent for checkout using Stripe Connect
 * - Validates cart exists and has items
 * - Calculates totals server-side (never trust client)
 * - Creates PaymentIntent with transfer_data for Connect
 * - Creates pending order record
 * - Returns client_secret for frontend
 */

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Request validation schema
// Error messages explain what's wrong AND how to fix it
const CheckoutRequestSchema = z.object({
  // Optional customer info for the order
  email: z
    .string()
    .email("Invalid email format — please enter a valid email like name@example.com")
    .optional(),
  customerName: z
    .string()
    .min(1, "Customer name is required — please enter your full name")
    .optional(),
  customerPhone: z.string().optional(),
  // Optional shipping address
  shippingAddress: z
    .string()
    .min(5, "Address is too short — please enter your complete street address")
    .optional(),
  shippingCity: z
    .string()
    .min(2, "City name is too short — please enter a valid city name")
    .optional(),
  shippingArea: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingCountry: z
    .string()
    .min(2, "Country is required — please select or enter your country")
    .optional(),
});

type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

/**
 * Generate order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * POST /api/store/[slug]/checkout
 * 
 * Create a PaymentIntent for checkout
 * Rate limited: 10 requests/minute per IP (stricter for payment security)
 * 
 * @returns PaymentIntent client_secret and order ID
 */
export const POST = withRateLimit("checkout", async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. Resolve tenant
    const tenant = await resolveBySlug(slug);
    if (!tenant) {
      return createErrorResponse("Store not found", "TENANT_NOT_FOUND");
    }

    // 2. Get tenant's Stripe account ID (for Connect)
    const tenantDetails = await sudoDb
      .select({
        stripeAccountId: tenants.stripeAccountId,
        stripeOnboardingComplete: tenants.stripeOnboardingComplete,
      })
      .from(tenants)
      .where(eq(tenants.id, tenant.id))
      .limit(1);

    if (!tenantDetails[0]?.stripeAccountId) {
      return createErrorResponse(
        "This store has not configured payment processing",
        "STRIPE_NOT_CONFIGURED"
      );
    }

    if (!tenantDetails[0].stripeOnboardingComplete) {
      return createErrorResponse(
        "Store payment setup is incomplete",
        "STRIPE_NOT_CONFIGURED"
      );
    }

    const stripeAccountId = tenantDetails[0].stripeAccountId;

    // 3. Get cart ID from cookie
    const cookieStore = await cookies();
    const cartId = cookieStore.get("cart_id")?.value;

    if (!cartId) {
      return createErrorResponse("Cart not found", "CART_NOT_FOUND");
    }

    // 4. Parse and validate request body
    let checkoutData: CheckoutRequest = {};
    try {
      const body = await request.json();
      checkoutData = CheckoutRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return createErrorResponse(
          "Invalid checkout data",
          "VALIDATION_ERROR",
          error.flatten().fieldErrors as Record<string, string[]>
        );
      }
      // If body is empty or not JSON, continue with empty checkout data
    }

    // 5. Get cart with items using repository
    const cart = await cartRepository.findActiveById(tenant.id, cartId);

    if (!cart) {
      return createErrorResponse("Cart not found or expired", "CART_NOT_FOUND");
    }

    if (!cart.items || cart.items.length === 0) {
      return createErrorResponse("Cart is empty", "CART_EMPTY");
    }

    // 6. Calculate totals server-side (NEVER trust client-provided totals)
    const subtotal = cart.items.reduce(
      (sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
      0
    );
    const discountTotal = parseFloat(cart.discountTotal || "0");
    const shippingTotal = parseFloat(cart.shippingTotal || "0");
    const taxTotal = parseFloat(cart.taxTotal || "0");
    const total = subtotal - discountTotal + shippingTotal + taxTotal;

    // Ensure total is positive
    if (total <= 0) {
      return createErrorResponse(
        "Invalid cart total",
        "VALIDATION_ERROR",
        { total: ["Cart total must be greater than zero"] }
      );
    }

    // Convert to smallest currency unit (cents for USD, paisa for NPR)
    const amountInSmallestUnit = Math.round(total * 100);

    // 7. Update cart with customer info if provided
    if (checkoutData.email || checkoutData.customerName || checkoutData.shippingAddress) {
      await cartRepository.update(tenant.id, cartId, {
        email: checkoutData.email || cart.email || undefined,
        customerName: checkoutData.customerName || cart.customerName || undefined,
        customerPhone: checkoutData.customerPhone || cart.customerPhone || undefined,
        shippingAddress: checkoutData.shippingAddress || cart.shippingAddress || undefined,
        shippingCity: checkoutData.shippingCity || cart.shippingCity || undefined,
        shippingArea: checkoutData.shippingArea || cart.shippingArea || undefined,
        shippingPostalCode: checkoutData.shippingPostalCode || cart.shippingPostalCode || undefined,
        shippingCountry: checkoutData.shippingCountry || cart.shippingCountry || undefined,
      });
    }

    // 8. Create pending order using repository
    const orderNumber = generateOrderNumber();
    const order = await orderRepository.create(tenant.id, {
      orderNumber,
      status: "pending",
      paymentStatus: "pending",
      subtotal: subtotal.toFixed(2),
      discountTotal: discountTotal.toFixed(2),
      shippingTotal: shippingTotal.toFixed(2),
      taxTotal: taxTotal.toFixed(2),
      total: total.toFixed(2),
      currency: tenant.currency,
      itemsCount: cart.items.length,
      customerEmail: checkoutData.email || cart.email || undefined,
      customerName: checkoutData.customerName || cart.customerName || undefined,
      shippingAddress: checkoutData.shippingAddress ? {
        address: checkoutData.shippingAddress,
        city: checkoutData.shippingCity,
        area: checkoutData.shippingArea,
        postalCode: checkoutData.shippingPostalCode,
        country: checkoutData.shippingCountry,
      } : undefined,
    });

    // 9. Create Stripe PaymentIntent with Connect transfer
    let paymentIntent: Stripe.PaymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: tenant.currency.toLowerCase(),
        // Stripe Connect: Transfer funds to connected account
        transfer_data: {
          destination: stripeAccountId,
        },
        // Metadata for webhook processing
        metadata: {
          tenant_id: tenant.id,
          cart_id: cartId,
          order_id: order.id,
        },
        // Automatic payment methods for better conversion
        automatic_payment_methods: {
          enabled: true,
        },
        // Description for Stripe Dashboard
        description: `Order ${orderNumber} for ${tenant.name}`,
      });
    } catch (stripeError) {
      console.error("[Checkout] Stripe PaymentIntent creation failed:", stripeError);
      
      // Clean up the pending order on Stripe failure
      await orderRepository.delete(tenant.id, order.id);

      return createErrorResponse(
        "Payment processing failed. Please try again.",
        "INTERNAL_ERROR"
      );
    }

    // 10. Update order with PaymentIntent ID
    await orderRepository.update(tenant.id, order.id, {
      stripePaymentIntentId: paymentIntent.id,
    });

    console.log("[Checkout] PaymentIntent created", {
      paymentIntentId: paymentIntent.id,
      orderId: order.id,
      orderNumber,
      amount: total,
      currency: tenant.currency,
    });

    // 11. Audit log checkout start - non-blocking
    try {
      await auditLogger.logCheckout(tenant.id, "checkout.start", {
        cartId,
        orderId: order.id,
        total,
      }, extractRequestMetadata(request));
    } catch (auditError) {
      console.error("[Checkout] Audit logging failed:", auditError);
    }

    // 12. Return client_secret for frontend
    return createSuccessResponse({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      orderNumber,
      amount: total.toFixed(2),
      currency: tenant.currency,
    });
  } catch (error) {
    console.error("[API] POST /api/store/[slug]/checkout error:", error);
    
    if (error instanceof AppError) {
      return error.toResponse();
    }
    
    return createErrorResponse("Internal server error", "INTERNAL_ERROR");
  }
});