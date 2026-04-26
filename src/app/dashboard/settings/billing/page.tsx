import { requireUser } from "@/lib/auth";
import { getTenantPlanLimits } from "@/lib/plan-limits";
import { db } from "@/infrastructure/db";
import { plans, payments } from "@/db/schema/billing";
import { eq, desc } from "drizzle-orm";
import { formatCurrency } from "@/shared/utils";
import { Check } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Plan & Billing | Settings" };

export default async function MerchantBillingPage() {
  const user = await requireUser();
  const limits = await getTenantPlanLimits(user.tenantId);

  const [allPlans, recentPayments] = await Promise.all([
    db.select().from(plans).where(eq(plans.isActive, true)).orderBy(plans.sortOrder),
    db.select({
      id: payments.id, amount: payments.amount, method: payments.method,
      reference: payments.reference, createdAt: payments.createdAt,
    }).from(payments).where(eq(payments.tenantId, user.tenantId)).orderBy(desc(payments.createdAt)).limit(10),
  ]);

  const usagePercent = (current: number, max: number) => Math.min((current / max) * 100, 100);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Plan & Billing</h1>
        <p className="text-xs text-muted-foreground">Your current plan, usage, and payment history</p>
      </div>

      {/* Current Plan */}
      <div className="rounded-lg border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium">Current Plan</p>
            <p className="text-2xl font-semibold tracking-tight mt-1">{limits.planName}</p>
          </div>
          <div className="text-right">
            {limits.status === "none" ? (
              <span className="text-[10px] bg-muted px-2 py-1 rounded">Free Tier</span>
            ) : (
              <span className={`text-[10px] px-2 py-1 rounded ${
                limits.status === "active" ? "bg-success/10 text-success" :
                limits.status === "grace" ? "bg-warning/10 text-warning" :
                "bg-destructive/10 text-destructive"
              }`}>{limits.status}</span>
            )}
            {limits.periodEnd && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Renews {new Date(limits.periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
        </div>

        {/* Usage bars */}
        <div className="space-y-3">
          {[
            { label: "Products", current: limits.currentProducts, max: limits.maxProducts },
            { label: "Staff members", current: limits.currentStaff, max: limits.maxStaff },
          ].map(u => (
            <div key={u.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">{u.label}</span>
                <span className="tabular-nums font-medium">{u.current} / {u.max}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full">
                <div
                  className={`h-1.5 rounded-full transition-all ${usagePercent(u.current, u.max) >= 90 ? "bg-destructive" : "bg-foreground"}`}
                  style={{ width: `${usagePercent(u.current, u.max)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <p className="text-sm font-medium mb-3">Available Plans</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {allPlans.map(plan => {
            const isCurrent = plan.name === limits.planName;
            return (
              <div key={plan.id} className={`rounded-lg border p-4 ${isCurrent ? "border-foreground" : ""}`}>
                <p className="text-sm font-medium">{plan.name}</p>
                <p className="text-xl font-semibold tabular-nums mt-1">
                  {Number(plan.priceMonthly) === 0 ? "Free" : formatCurrency(Number(plan.priceMonthly), "NPR")}
                  {Number(plan.priceMonthly) > 0 && <span className="text-xs text-muted-foreground font-normal">/mo</span>}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {(plan.features as string[] || []).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="size-3 text-foreground shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                {isCurrent && <p className="text-[10px] text-muted-foreground mt-3 font-medium">Current plan</p>}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3">To upgrade, contact us via eSewa/Khalti or bank transfer. We'll activate your plan within 24 hours.</p>
      </div>

      {/* Payment History */}
      <div className="rounded-lg border">
        <div className="p-4 border-b">
          <p className="text-sm font-medium">Payment History</p>
        </div>
        {recentPayments.length > 0 ? (
          <div className="divide-y">
            {recentPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium tabular-nums">{formatCurrency(Number(p.amount), "NPR")}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {p.method.replace("_", " ")} {p.reference && `· ${p.reference}`}
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {p.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-4 text-xs text-muted-foreground text-center">No payments yet</p>
        )}
      </div>
    </div>
  );
}
