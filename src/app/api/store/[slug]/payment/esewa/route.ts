import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/infrastructure/db";
import { orders } from "@/db/schema/orders";
import { tenants } from "@/db/schema/tenants";
import { eq, and } from "drizzle-orm";
import { verifyEsewaPayment } from "@/infrastructure/payments/esewa";
import { createLogger } from "@/lib/logger";

const log = createLogger("api:payment:esewa-callback");

/** Verify HMAC-SHA256 signature on eSewa callback data */
function verifySignature(decoded: Record<string, any>, secret: string): boolean {
  const { signed_field_names, signature } = decoded;
  if (!signed_field_names || !signature) return false;
  const message = signed_field_names
    .split(",")
    .map((field: string) => `${field}=${decoded[field]}`)
    .join(",");
  const expected = crypto.createHmac("sha256", secret).update(message).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

/** eSewa redirects here after payment with base64-encoded data in query param */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = request.nextUrl.searchParams.get("data");

  if (!data) {
    return NextResponse.redirect(new URL(`/store/${slug}?payment=error&reason=missing_data`, request.url));
  }

  try {
    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    const orderId = decoded.transaction_uuid;

    if (!orderId) {
      return NextResponse.redirect(new URL(`/store/${slug}?payment=error&reason=invalid_data`, request.url));
    }

    // 1. Tenant scoping: look up tenant from slug first
    const [tenant] = await db.select({ id: tenants.id, settings: tenants.settings })
      .from(tenants).where(eq(tenants.slug, slug)).limit(1);

    if (!tenant) {
      return NextResponse.redirect(new URL(`/store/${slug}?payment=error&reason=invalid_store`, request.url));
    }

    // Look up order scoped to tenant
    const [order] = await db.select({ id: orders.id, tenantId: orders.tenantId, total: orders.total, paymentStatus: orders.paymentStatus })
      .from(orders).where(and(eq(orders.id, orderId), eq(orders.tenantId, tenant.id))).limit(1);

    if (!order) {
      return NextResponse.redirect(new URL(`/store/${slug}?payment=error&reason=order_not_found`, request.url));
    }

    // 2. Idempotency: skip re-verification if already paid
    if (order.paymentStatus === "paid") {
      return NextResponse.redirect(new URL(`/store/${slug}/order-confirmation?order=${orderId}&payment=success`, request.url));
    }

    const paymentSettings = (tenant.settings as Record<string, any>)?.payments;
    const merchantCode = paymentSettings?.esewamerchantCode;
    const merchantSecret = paymentSettings?.esewaSecret;

    if (!merchantCode || !merchantSecret) {
      log.error("eSewa credentials not configured for tenant");
      return NextResponse.redirect(new URL(`/store/${slug}?payment=error&reason=config_error`, request.url));
    }

    // 4. HMAC signature verification before trusting callback data
    if (!verifySignature(decoded, merchantSecret)) {
      log.error("eSewa HMAC signature verification failed");
      return NextResponse.redirect(new URL(`/store/${slug}?payment=error&reason=verification_failed`, request.url));
    }

    const result = await verifyEsewaPayment({
      encodedData: data,
      merchantCode,
      merchantSecret,
      expectedAmount: Number(order.total),
      expectedTransactionUuid: orderId,
    });

    if (result.success) {
      await db.update(orders)
        .set({ paymentStatus: "paid", status: "confirmed", metadata: { paymentMethod: "esewa", esewaTransactionCode: result.transactionCode }, updatedAt: new Date() })
        .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenant.id)));

      return NextResponse.redirect(new URL(`/store/${slug}/order-confirmation?order=${orderId}&payment=success`, request.url));
    }

    // 3. Sanitize error — don't leak internal details
    log.error("eSewa verification failed:", result.error);
    return NextResponse.redirect(new URL(`/store/${slug}?payment=failed&reason=verification_failed`, request.url));
  } catch (err) {
    log.error("eSewa callback error:", err);
    return NextResponse.redirect(new URL(`/store/${slug}?payment=error`, request.url));
  }
}
