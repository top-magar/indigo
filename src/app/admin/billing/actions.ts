"use server";

import { requirePermission } from "../_lib/permissions";
import { db } from "@/infrastructure/db";
import { plans, subscriptions, payments } from "@/db/schema/billing";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "../_lib/audit";

const assignPlanSchema = z.object({
  tenantId: z.string().uuid(),
  planId: z.string().uuid(),
  billingCycle: z.enum(["monthly", "yearly"]),
});

export async function assignPlan(input: z.infer<typeof assignPlanSchema>): Promise<{ error?: string }> {
  const user = await requirePermission("manage_billing");

  const parsed = assignPlanSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const { tenantId, planId, billingCycle } = parsed.data;
  const now = new Date();
  const periodEnd = new Date(now);
  billingCycle === "yearly" ? periodEnd.setFullYear(periodEnd.getFullYear() + 1) : periodEnd.setMonth(periodEnd.getMonth() + 1);
  const gracePeriodEnd = new Date(periodEnd);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

  try {
    await db.transaction(async (tx) => {
      // Deactivate existing subscriptions
      await tx.update(subscriptions)
        .set({ status: "cancelled", updatedAt: now })
        .where(eq(subscriptions.tenantId, tenantId));

      // Create new subscription
      await tx.insert(subscriptions).values({
        tenantId, planId, billingCycle,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        gracePeriodEnd,
      });
    });

    revalidatePath("/admin/billing");
    logAdminAction({
      actorId: user.id, actorEmail: user.email, action: "plan.assign",
      targetType: "tenant", targetId: tenantId, metadata: { planId, billingCycle },
    });
    return {};
  } catch {
    return { error: "Failed to assign plan" };
  }
}

const recordPaymentSchema = z.object({
  tenantId: z.string().uuid(),
  amount: z.string().min(1),
  method: z.enum(["esewa", "khalti", "bank_transfer", "fonepay", "cash", "other"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export async function recordPayment(input: z.infer<typeof recordPaymentSchema>): Promise<{ error?: string }> {
  const user = await requirePermission("manage_billing");

  const parsed = recordPaymentSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  try {
    // Get active subscription
    const [sub] = await db.select({ id: subscriptions.id })
      .from(subscriptions).where(eq(subscriptions.tenantId, parsed.data.tenantId)).limit(1);

    await db.insert(payments).values({
      tenantId: parsed.data.tenantId,
      subscriptionId: sub?.id,
      amount: parsed.data.amount,
      method: parsed.data.method,
      reference: parsed.data.reference || null,
      notes: parsed.data.notes || null,
      recordedBy: user.id,
    });

    // If subscription is in grace/expired, reactivate
    if (sub) {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      const gracePeriodEnd = new Date(periodEnd);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

      await db.update(subscriptions)
        .set({ status: "active", currentPeriodStart: now, currentPeriodEnd: periodEnd, gracePeriodEnd, updatedAt: now })
        .where(eq(subscriptions.id, sub.id));
    }

    revalidatePath("/admin/billing");
    logAdminAction({
      actorId: user.id, actorEmail: user.email, action: "payment.record",
      targetType: "tenant", targetId: parsed.data.tenantId,
      metadata: { amount: parsed.data.amount, method: parsed.data.method, reference: parsed.data.reference },
    });
    return {};
  } catch {
    return { error: "Failed to record payment" };
  }
}

export async function getPlans() {
  return db.select().from(plans).where(eq(plans.isActive, true)).orderBy(plans.sortOrder);
}

export async function getBillingOverview() {
  const [allSubs, allPayments, allPlans] = await Promise.all([
    db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt)),
    db.select().from(payments).orderBy(desc(payments.createdAt)).limit(50),
    db.select().from(plans).where(eq(plans.isActive, true)).orderBy(plans.sortOrder),
  ]);
  return { subscriptions: allSubs, payments: allPayments, plans: allPlans };
}
