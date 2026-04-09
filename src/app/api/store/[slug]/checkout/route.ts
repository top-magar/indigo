import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/infrastructure/supabase/server";
import { cartRepository } from "@/features/cart/repositories";
import { orderRepository } from "@/features/orders/repositories";
import { createErrorResponse, createSuccessResponse, AppError } from "@/shared/errors";
import { resolveBySlug } from "@/infrastructure/tenant";
import { withRateLimit } from "@/infrastructure/middleware/rate-limit";
import { auditLogger, extractRequestMetadata } from "@/infrastructure/services/audit-logger";
import { createLogger } from "@/lib/logger";
import { getPaymentProvider, type PaymentMethod } from "@/infrastructure/payments";
import { eventBus, createEventPayload } from "@/infrastructure/services/event-bus";

const log = createLogger("api:store-slug-checkout");

const CheckoutRequestSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  customerName: z.string().min(1, "Customer name is required").optional(),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().min(5, "Address is too short").optional(),
  shippingCity: z.string().min(2, "City name is too short").optional(),
  shippingArea: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingCountry: z.string().min(2, "Country is required").optional(),
  paymentMethod: z.enum(["cod", "bank_transfer", "esewa", "khalti"]).default("cod"),
});

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export const POST = withRateLimit("checkout", async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const tenant = await resolveBySlug(slug);
    if (!tenant) return createErrorResponse("Store not found", "TENANT_NOT_FOUND");

    const cookieStore = await cookies();
    const cartId = cookieStore.get("cart_id")?.value;
    if (!cartId) return createErrorResponse("Cart not found", "CART_NOT_FOUND");

    let checkoutData: z.infer<typeof CheckoutRequestSchema>;
    try {
      checkoutData = CheckoutRequestSchema.parse(await request.json());
    } catch (error) {
      if (error instanceof z.ZodError) {
        return createErrorResponse("Invalid checkout data", "VALIDATION_ERROR", error.flatten().fieldErrors as Record<string, string[]>);
      }
      return createErrorResponse("Invalid request body", "VALIDATION_ERROR");
    }

    const cart = await cartRepository.findActiveById(tenant.id, cartId);
    if (!cart) return createErrorResponse("Cart not found or expired", "CART_NOT_FOUND");
    if (!cart.items || cart.items.length === 0) return createErrorResponse("Cart is empty", "CART_EMPTY");

    const supabase = await createClient();

    // Calculate totals server-side (NEVER trust client)
    const subtotal = cart.items.reduce((sum, item) => sum + parseFloat(item.unitPrice) * item.quantity, 0);
    const discountTotal = parseFloat(cart.discountTotal || "0");

    // Look up tenant's shipping rate
    const { data: shippingRates } = await supabase
      .from("shipping_rates")
      .select("price, min_order_amount")
      .eq("tenant_id", tenant.id)
      .eq("is_active", true)
      .order("price", { ascending: true })
      .limit(5);

    // Find applicable rate: free shipping if above threshold, else cheapest rate
    let shippingTotal = 0;
    if (shippingRates && shippingRates.length > 0) {
      const freeRate = shippingRates.find((r) => parseFloat(r.price) === 0 && r.min_order_amount && subtotal >= parseFloat(r.min_order_amount));
      shippingTotal = freeRate ? 0 : parseFloat(shippingRates[0].price || "0");
    }
    // Nepal VAT: 13% on subtotal after discounts
    const taxTotal = Math.round((subtotal - discountTotal) * 0.13 * 100) / 100;
    const total = subtotal - discountTotal + shippingTotal + taxTotal;
    if (total <= 0) return createErrorResponse("Invalid cart total", "VALIDATION_ERROR");

    // Update cart with customer info
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

    // Create order
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
      customerName: checkoutData.customerName || undefined,
      metadata: { paymentMethod: checkoutData.paymentMethod },
      shippingAddress: checkoutData.shippingAddress ? {
        address: checkoutData.shippingAddress,
        city: checkoutData.shippingCity,
        area: checkoutData.shippingArea,
        postalCode: checkoutData.shippingPostalCode,
        country: checkoutData.shippingCountry,
      } : undefined,
    });

    // Process payment via provider
    const provider = getPaymentProvider();
    const payment = await provider.createPayment({
      orderId: order.id,
      tenantId: tenant.id,
      amount: total,
      currency: tenant.currency,
      method: checkoutData.paymentMethod as PaymentMethod,
      customerEmail: checkoutData.email || cart.email || "",
    });

    if (!payment.success) {
      await orderRepository.delete(tenant.id, order.id);
      return createErrorResponse(payment.error || "Payment failed", "INTERNAL_ERROR");
    }

    log.info("[Checkout] Order created", { orderId: order.id, orderNumber, amount: total, method: checkoutData.paymentMethod });

    // Emit order.created event (triggers email notifications)
    eventBus.emit("order.created", createEventPayload(tenant.id, {
      orderId: order.id,
      tenantId: tenant.id,
      orderNumber,
    })).catch((err) => log.error("Failed to emit order.created:", err));

    try {
      await auditLogger.logCheckout(tenant.id, "checkout.complete", { cartId, orderId: order.id, total }, extractRequestMetadata(request));
    } catch { /* non-blocking */ }

    return createSuccessResponse({
      orderId: order.id,
      orderNumber,
      amount: total.toFixed(2),
      currency: tenant.currency,
      paymentMethod: checkoutData.paymentMethod,
      paymentStatus: payment.status,
      redirectUrl: payment.redirectUrl,
    });
  } catch (error) {
    log.error("[API] POST /api/store/[slug]/checkout error:", error);
    if (error instanceof AppError) return error.toResponse();
    return createErrorResponse("Internal server error", "INTERNAL_ERROR");
  }
});
