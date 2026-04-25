import { NextRequest, NextResponse } from "next/server";
import { db } from "@/infrastructure/db";
import { orders } from "@/db/schema/orders";
import { tenants } from "@/db/schema/tenants";
import { eq, and, sql } from "drizzle-orm";
import { verifyKhaltiPayment } from "@/infrastructure/payments/khalti";
import { createLogger } from "@/lib/logger";

const log = createLogger("api:payment:khalti-callback");

/** Khalti redirects here with pidx, transaction_id, amount, purchase_order_id in query */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const pidx = request.nextUrl.searchParams.get("pidx");
  const purchaseOrderId = request.nextUrl.searchParams.get("purchase_order_id");
  const status = request.nextUrl.searchParams.get("status");

  if (!pidx) {
    return NextResponse.redirect(new URL(`/store/${slug}?payment=error&reason=missing_params`, request.url));
  }

  // Khalti sends status=Completed on success, User canceled on cancel
  if (status === "User canceled") {
    return NextResponse.redirect(new URL(`/store/${slug}?payment=cancelled`, request.url));
  }

  try {
    // 1. Tenant scoping: look up tenant from slug first
    const [tenant] = await db.select({ id: tenants.id, settings: tenants.settings })
      .from(tenants).where(eq(tenants.slug, slug)).limit(1);

    if (!tenant) {
      return NextResponse.redirect(new URL(`/store/${slug}?payment=error&reason=invalid_store`, request.url));
    }

    // 6. Look up order by stored khaltiPidx using JSONB query (no full table scan)
    const [order] = await db.select({ id: orders.id, tenantId: orders.tenantId, total: orders.total, paymentStatus: orders.paymentStatus, metadata: orders.metadata })
      .from(orders)
      .where(and(eq(orders.tenantId, tenant.id), sql`${orders.metadata}->>'khaltiPidx' = ${pidx}`))
      .limit(1);

    if (!order) {
      return NextResponse.redirect(new URL(`/store/${slug}?payment=error&reason=order_not_found`, request.url));
    }

    // 7. Verify purchase_order_id matches the looked-up order
    if (purchaseOrderId && purchaseOrderId !== order.id) {
      log.error("purchase_order_id mismatch", null, { query: purchaseOrderId, orderId: order.id });
      return NextResponse.redirect(new URL(`/store/${slug}?payment=error&reason=order_mismatch`, request.url));
    }

    // 2. Idempotency: skip re-verification if already paid
    if (order.paymentStatus === "paid") {
      return NextResponse.redirect(new URL(`/store/${slug}/order-confirmation?order=${order.id}&payment=success`, request.url));
    }

    const secretKey = (tenant.settings as Record<string, any>)?.payments?.khaltiSecretKey;
    if (!secretKey) {
      log.error("Khalti secret key not configured");
      return NextResponse.redirect(new URL(`/store/${slug}?payment=error&reason=config_error`, request.url));
    }

    const amountInPaisa = Math.round(Number(order.total) * 100);

    const result = await verifyKhaltiPayment({
      pidx,
      secretKey,
      expectedAmount: amountInPaisa,
      expectedOrderId: order.id,
    });

    if (result.success) {
      await db.update(orders)
        .set({ paymentStatus: "paid", status: "confirmed", metadata: { paymentMethod: "khalti", khaltiTransactionId: result.transactionId, khaltiPidx: pidx }, updatedAt: new Date() })
        .where(and(eq(orders.id, order.id), eq(orders.tenantId, tenant.id)));

      return NextResponse.redirect(new URL(`/store/${slug}/order-confirmation?order=${order.id}&payment=success`, request.url));
    }

    // 3. Sanitize error — don't leak internal details
    log.error("Khalti verification failed:", result.error);
    return NextResponse.redirect(new URL(`/store/${slug}?payment=failed&reason=verification_failed`, request.url));
  } catch (err) {
    log.error("Khalti callback error:", err);
    return NextResponse.redirect(new URL(`/store/${slug}?payment=error`, request.url));
  }
}
