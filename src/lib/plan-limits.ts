import "server-only";
import { cache } from "react";
import { db } from "@/infrastructure/db";
import { plans, subscriptions } from "@/db/schema/billing";
import { products } from "@/db/schema/products";
import { users } from "@/db/schema/users";
import { eq, and, count } from "drizzle-orm";

export interface PlanLimits {
  planName: string;
  maxProducts: number;
  maxStaff: number;
  maxStorageMb: number;
  maxOrders: number | null;
  currentProducts: number;
  currentStaff: number;
  status: "active" | "grace" | "expired" | "cancelled" | "none";
  periodEnd: Date | null;
  gracePeriodEnd: Date | null;
}

/**
 * Get current plan limits and usage for a tenant.
 * Cached per request — safe to call multiple times.
 */
export const getTenantPlanLimits = cache(async (tenantId: string): Promise<PlanLimits> => {
  // Get active subscription + plan
  const [sub] = await db.select({
    planName: plans.name,
    maxProducts: plans.maxProducts,
    maxStaff: plans.maxStaff,
    maxStorageMb: plans.maxStorageMb,
    maxOrders: plans.maxOrders,
    status: subscriptions.status,
    periodEnd: subscriptions.currentPeriodEnd,
    gracePeriodEnd: subscriptions.gracePeriodEnd,
  })
    .from(subscriptions)
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(eq(subscriptions.tenantId, tenantId))
    .orderBy(subscriptions.createdAt)
    .limit(1);

  // Get current usage
  const [[{ value: currentProducts }], [{ value: currentStaff }]] = await Promise.all([
    db.select({ value: count() }).from(products).where(eq(products.tenantId, tenantId)),
    db.select({ value: count() }).from(users).where(eq(users.tenantId, tenantId)),
  ]);

  // No subscription = free tier defaults
  if (!sub) {
    const [freePlan] = await db.select().from(plans).where(eq(plans.isDefault, true)).limit(1);
    return {
      planName: freePlan?.name ?? "Free",
      maxProducts: freePlan?.maxProducts ?? 10,
      maxStaff: freePlan?.maxStaff ?? 1,
      maxStorageMb: freePlan?.maxStorageMb ?? 100,
      maxOrders: freePlan?.maxOrders ?? null,
      currentProducts,
      currentStaff,
      status: "none",
      periodEnd: null,
      gracePeriodEnd: null,
    };
  }

  return { ...sub, currentProducts, currentStaff };
});

/**
 * Check if a tenant can perform an action based on plan limits.
 * Returns { allowed: true } or { allowed: false, reason: "..." }
 */
export async function checkPlanLimit(
  tenantId: string,
  resource: "products" | "staff" | "storage"
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getTenantPlanLimits(tenantId);

  // Expired subscriptions block all creation
  if (limits.status === "expired" || limits.status === "cancelled") {
    return { allowed: false, reason: "Your subscription has expired. Please renew to continue." };
  }

  switch (resource) {
    case "products":
      if (limits.currentProducts >= limits.maxProducts) {
        return { allowed: false, reason: `Product limit reached (${limits.maxProducts}). Upgrade your plan to add more.` };
      }
      break;
    case "staff":
      if (limits.currentStaff >= limits.maxStaff) {
        return { allowed: false, reason: `Staff limit reached (${limits.maxStaff}). Upgrade your plan to invite more.` };
      }
      break;
  }

  return { allowed: true };
}
