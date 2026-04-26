import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { plans, subscriptions, payments } from "@/db/schema/billing";
import { eq, desc, sql, count } from "drizzle-orm";
import { requireAdmin } from "../_lib/auth";
import { formatCurrency } from "@/shared/utils";
import BillingClient from "./billing-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Billing | Admin" };

export default async function BillingPage() {
  await requireAdmin();

  const [allPlans, allSubs, recentPayments, [{ value: totalRevenue }], merchantList] = await Promise.all([
    db.select().from(plans).where(eq(plans.isActive, true)).orderBy(plans.sortOrder),
    db.select({
      id: subscriptions.id,
      tenantId: subscriptions.tenantId,
      planId: subscriptions.planId,
      status: subscriptions.status,
      periodEnd: subscriptions.currentPeriodEnd,
      billingCycle: subscriptions.billingCycle,
    }).from(subscriptions).orderBy(desc(subscriptions.createdAt)),
    db.select({
      id: payments.id,
      tenantId: payments.tenantId,
      amount: payments.amount,
      method: payments.method,
      reference: payments.reference,
      createdAt: payments.createdAt,
    }).from(payments).orderBy(desc(payments.createdAt)).limit(20),
    db.select({ value: sql<string>`COALESCE(SUM(${payments.amount}), 0)` }).from(payments),
    db.select({ id: tenants.id, name: tenants.name, slug: tenants.slug }).from(tenants).orderBy(tenants.name),
  ]);

  // Count subs per status
  const activeSubs = allSubs.filter(s => s.status === "active").length;
  const graceSubs = allSubs.filter(s => s.status === "grace").length;
  const expiredSubs = allSubs.filter(s => s.status === "expired").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Billing</h1>
        <p className="text-xs text-muted-foreground">Plan management and payment tracking</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums mt-1">{formatCurrency(Number(totalRevenue), "NPR")}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Active Subscriptions</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums mt-1">{activeSubs}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">In Grace Period</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums mt-1 text-amber-600">{graceSubs}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Expired</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums mt-1 text-destructive">{expiredSubs}</p>
        </div>
      </div>

      {/* Plans */}
      <div>
        <p className="text-sm font-medium mb-3">Plans</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {allPlans.map(plan => (
            <div key={plan.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{plan.name}</p>
                {plan.isDefault && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">Default</span>}
              </div>
              <p className="text-xl font-semibold tabular-nums">{formatCurrency(Number(plan.priceMonthly), "NPR")}<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p>{plan.maxProducts} products · {plan.maxStaff} staff · {plan.maxStorageMb}MB</p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">{allSubs.filter(s => s.planId === plan.id && s.status === "active").length} active subscribers</p>
            </div>
          ))}
        </div>
      </div>

      <BillingClient
        merchants={merchantList}
        plans={allPlans.map(p => ({ id: p.id, name: p.name, priceMonthly: p.priceMonthly }))}
        subscriptions={allSubs}
        payments={recentPayments.map(p => ({
          ...p,
          merchantName: merchantList.find(m => m.id === p.tenantId)?.name ?? "Unknown",
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
