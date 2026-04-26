import { requireUser } from "@/lib/auth";
import { getTenantPlanLimits } from "@/lib/plan-limits";
import { db } from "@/infrastructure/db";
import { plans, payments, invoices as invoicesTable } from "@/db/schema/billing";
import { eq, desc } from "drizzle-orm";
import { formatCurrency } from "@/shared/utils";
import { Check, ArrowRight, Receipt, CreditCard, HelpCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Plan & Billing | Settings" };

export default async function MerchantBillingPage() {
  const user = await requireUser();
  const limits = await getTenantPlanLimits(user.tenantId);

  const [allPlans, recentPayments, recentInvoices] = await Promise.all([
    db.select({
      id: plans.id, name: plans.name, slug: plans.slug,
      priceMonthly: plans.priceMonthly, priceYearly: plans.priceYearly,
      commissionRate: plans.commissionRate, features: plans.features,
      isDefault: plans.isDefault, description: plans.description,
    }).from(plans).where(eq(plans.isActive, true)).orderBy(plans.sortOrder),
    db.select({
      id: payments.id, amount: payments.amount, method: payments.method,
      reference: payments.reference, createdAt: payments.createdAt,
    }).from(payments).where(eq(payments.tenantId, user.tenantId)).orderBy(desc(payments.createdAt)).limit(10),
    db.select({
      id: invoicesTable.id, periodStart: invoicesTable.periodStart,
      orderTotal: invoicesTable.orderTotal, orderCount: invoicesTable.orderCount,
      commissionRate: invoicesTable.commissionRate, commissionAmount: invoicesTable.commissionAmount,
      capAmount: invoicesTable.capAmount, finalAmount: invoicesTable.finalAmount,
      status: invoicesTable.status,
    }).from(invoicesTable).where(eq(invoicesTable.tenantId, user.tenantId)).orderBy(desc(invoicesTable.createdAt)).limit(12),
  ]);

  const usagePercent = (current: number, max: number) => Math.min((current / max) * 100, 100);
  const currentPlan = allPlans.find(p => p.name === limits.planName);

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Plan & Billing</h1>
        <p className="text-xs text-muted-foreground">Manage your subscription, view invoices, and understand pricing</p>
      </div>

      {/* Current Plan Card */}
      <div className="rounded-lg border p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current Plan</p>
            <p className="text-2xl font-semibold tracking-tight mt-1">{limits.planName}</p>
            {currentPlan?.description && (
              <p className="text-xs text-muted-foreground mt-1">{currentPlan.description}</p>
            )}
          </div>
          <span className={`text-[10px] px-2 py-1 rounded font-medium ${
            limits.status === "active" ? "bg-success/10 text-success" :
            limits.status === "grace" ? "bg-warning/10 text-warning" :
            limits.status === "none" ? "bg-muted text-muted-foreground" :
            "bg-destructive/10 text-destructive"
          }`}>{limits.status === "none" ? "Free Tier" : limits.status}</span>
        </div>

        {limits.periodEnd && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Renews {new Date(limits.periodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        )}

        {/* Usage */}
        <div className="mt-5 space-y-3">
          {[
            { label: "Products", current: limits.currentProducts, max: limits.maxProducts },
            { label: "Staff members", current: limits.currentStaff, max: limits.maxStaff },
          ].map(u => (
            <div key={u.label}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">{u.label}</span>
                <span className="tabular-nums font-medium">{u.current} / {u.max}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full">
                <div
                  className={`h-1.5 rounded-full transition-all ${usagePercent(u.current, u.max) >= 90 ? "bg-destructive" : usagePercent(u.current, u.max) >= 70 ? "bg-warning" : "bg-foreground"}`}
                  style={{ width: `${usagePercent(u.current, u.max)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How Pricing Works */}
      <div className="rounded-lg border p-5">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="size-4 text-muted-foreground" />
          <p className="text-sm font-medium">How Pricing Works</p>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex gap-3">
            <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5">1</div>
            <div>
              <p className="font-medium">Pay only when you sell</p>
              <p className="text-xs text-muted-foreground mt-0.5">We charge a small percentage of your paid orders each month. No sales = no charge.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5">2</div>
            <div>
              <p className="font-medium">Monthly cap protects you</p>
              <p className="text-xs text-muted-foreground mt-0.5">Your bill is capped at a maximum amount. Even if you sell NPR 10 lakh, you never pay more than the cap.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5">3</div>
            <div>
              <p className="font-medium">You pay whichever is lower</p>
              <p className="text-xs text-muted-foreground mt-0.5">Commission amount OR monthly cap — we always charge the smaller number.</p>
            </div>
          </div>

          {/* Example */}
          <div className="rounded-md bg-muted/50 p-3 mt-2">
            <p className="text-xs font-medium mb-2">Example (Growth Plan)</p>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div>
                <p>Monthly sales</p>
                <p className="font-medium text-foreground tabular-nums">NPR 15,000</p>
              </div>
              <div>
                <p>2% commission</p>
                <p className="font-medium text-foreground tabular-nums">NPR 300</p>
              </div>
              <div>
                <p>You pay</p>
                <p className="font-semibold text-foreground tabular-nums">NPR 300</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t border-muted">
              <div>
                <p>Monthly sales</p>
                <p className="font-medium text-foreground tabular-nums">NPR 50,000</p>
              </div>
              <div>
                <p>2% commission</p>
                <p className="font-medium text-foreground tabular-nums">NPR 1,000</p>
              </div>
              <div>
                <p>You pay (capped)</p>
                <p className="font-semibold text-success tabular-nums">NPR 499</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <p className="text-sm font-medium mb-3">Available Plans</p>
        <div className="grid gap-3">
          {allPlans.map(plan => {
            const isCurrent = plan.name === limits.planName;
            const rate = Number(plan.commissionRate);
            const cap = Number(plan.priceMonthly);
            const yearly = Number(plan.priceYearly);

            return (
              <div key={plan.id} className={`rounded-lg border p-4 ${isCurrent ? "border-foreground ring-1 ring-foreground" : ""}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{plan.name}</p>
                      {isCurrent && <span className="text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded">Current</span>}
                    </div>
                    {rate > 0 ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        {rate}% commission · capped at {formatCurrency(cap, "NPR")}/mo
                        {yearly > 0 && <span> · {formatCurrency(yearly, "NPR")}/yr (save 17%)</span>}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">Free forever · no commission</p>
                    )}
                  </div>
                  <p className="text-lg font-semibold tabular-nums">
                    {cap === 0 ? "Free" : formatCurrency(cap, "NPR")}
                    {cap > 0 && <span className="text-xs text-muted-foreground font-normal">/mo max</span>}
                  </p>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                  {(plan.features as string[] || []).map((f, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="size-3 text-foreground shrink-0" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          To upgrade, pay via eSewa, Khalti, or bank transfer and contact us. We'll activate your plan within 24 hours.
        </p>
      </div>

      {/* Invoices */}
      {recentInvoices.length > 0 && (
        <div className="rounded-lg border">
          <div className="flex items-center gap-2 p-4 border-b">
            <Receipt className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium">Invoices</p>
          </div>
          <div className="divide-y">
            {recentInvoices.map(inv => (
              <div key={inv.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(inv.periodStart).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {inv.orderCount} orders · {formatCurrency(Number(inv.orderTotal), "NPR")} total sales · {inv.commissionRate}% rate
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">{formatCurrency(Number(inv.finalAmount), "NPR")}</p>
                    <span className={`text-[10px] ${
                      inv.status === "paid" ? "text-success" :
                      inv.status === "waived" ? "text-muted-foreground" :
                      "text-warning"
                    }`}>{inv.status}</span>
                  </div>
                </div>
                {inv.status === "pending" && Number(inv.commissionAmount) > Number(inv.capAmount) && (
                  <p className="text-[10px] text-success mt-1">
                    Cap saved you {formatCurrency(Number(inv.commissionAmount) - Number(inv.finalAmount), "NPR")} this month
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="rounded-lg border">
        <div className="flex items-center gap-2 p-4 border-b">
          <CreditCard className="size-4 text-muted-foreground" />
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
