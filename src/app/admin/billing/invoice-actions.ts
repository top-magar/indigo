"use server";

import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { orders } from "@/db/schema/orders";
import { plans, subscriptions, invoices } from "@/db/schema/billing";
import { eq, and, gte, lt, sql, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requirePermission } from "../_lib/permissions";
import { logAdminAction } from "../_lib/audit";

/**
 * Calculate commission for a tenant for a given period.
 * Returns MIN(commission_rate × order_total, plan_cap)
 */
async function calculateCommission(tenantId: string, periodStart: Date, periodEnd: Date) {
  // Get tenant's active subscription + plan
  const [sub] = await db.select({
    planId: subscriptions.planId,
    commissionRate: plans.commissionRate,
    cap: plans.priceMonthly,
    planName: plans.name,
  })
    .from(subscriptions)
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(eq(subscriptions.tenantId, tenantId))
    .orderBy(subscriptions.createdAt)
    .limit(1);

  // No subscription = free tier, no commission
  if (!sub || Number(sub.commissionRate) === 0) {
    return { planId: sub?.planId ?? null, commissionRate: 0, orderTotal: 0, orderCount: 0, commissionAmount: 0, capAmount: 0, finalAmount: 0 };
  }

  // Get paid orders in period
  const [result] = await db.select({
    total: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
    count: sql<number>`COUNT(*)::int`,
  })
    .from(orders)
    .where(and(
      eq(orders.tenantId, tenantId),
      eq(orders.paymentStatus, "paid"),
      gte(orders.createdAt, periodStart),
      lt(orders.createdAt, periodEnd),
    ));

  const orderTotal = Number(result.total);
  const orderCount = result.count;
  const rate = Number(sub.commissionRate);
  const cap = Number(sub.cap);
  const commissionAmount = orderTotal * (rate / 100);
  const finalAmount = Math.min(commissionAmount, cap);

  return {
    planId: sub.planId,
    commissionRate: rate,
    orderTotal,
    orderCount,
    commissionAmount: Math.round(commissionAmount * 100) / 100,
    capAmount: cap,
    finalAmount: Math.round(finalAmount * 100) / 100,
  };
}

/**
 * Generate invoices for all merchants for a given month.
 * Skips free-tier merchants and merchants who already have an invoice for the period.
 */
export async function generateMonthlyInvoices(year: number, month: number): Promise<{ generated: number; skipped: number; error?: string }> {
  const user = await requirePermission("manage_billing");

  const periodStart = new Date(year, month - 1, 1);
  const periodEnd = new Date(year, month, 1);

  // Get all active tenants (not deleted)
  const allTenants = await db.select({ id: tenants.id, name: tenants.name })
    .from(tenants)
    .where(isNull(tenants.deletedAt));

  let generated = 0;
  let skipped = 0;

  for (const tenant of allTenants) {
    // Check if invoice already exists for this period
    const [existing] = await db.select({ id: invoices.id })
      .from(invoices)
      .where(and(
        eq(invoices.tenantId, tenant.id),
        eq(invoices.periodStart, periodStart),
      ))
      .limit(1);

    if (existing) { skipped++; continue; }

    const calc = await calculateCommission(tenant.id, periodStart, periodEnd);

    // Skip free tier (no commission)
    if (calc.finalAmount === 0) { skipped++; continue; }

    await db.insert(invoices).values({
      tenantId: tenant.id,
      planId: calc.planId,
      periodStart,
      periodEnd,
      orderTotal: calc.orderTotal.toString(),
      orderCount: calc.orderCount,
      commissionRate: calc.commissionRate.toString(),
      commissionAmount: calc.commissionAmount.toString(),
      capAmount: calc.capAmount.toString(),
      finalAmount: calc.finalAmount.toString(),
      status: "pending",
    });
    generated++;
  }

  logAdminAction({
    actorId: user.id, actorEmail: user.email, action: "payment.record",
    targetType: "invoices",
    metadata: { year, month, generated, skipped },
  });

  revalidatePath("/admin/billing");
  return { generated, skipped };
}

/**
 * Mark an invoice as paid (link to a payment record).
 */
export async function markInvoicePaid(invoiceId: string, paymentId?: string): Promise<{ error?: string }> {
  const user = await requirePermission("manage_billing");

  await db.update(invoices)
    .set({ status: "paid", paidAt: new Date(), paymentId: paymentId ?? null })
    .where(eq(invoices.id, invoiceId));

  revalidatePath("/admin/billing");
  return {};
}

/**
 * Waive an invoice (e.g., for alpha users, promotions).
 */
export async function waiveInvoice(invoiceId: string): Promise<{ error?: string }> {
  const user = await requirePermission("manage_billing");

  await db.update(invoices)
    .set({ status: "waived" })
    .where(eq(invoices.id, invoiceId));

  revalidatePath("/admin/billing");
  return {};
}
