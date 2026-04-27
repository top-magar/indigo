import { requireUser } from "@/lib/auth";
import { getTenantPlanLimits } from "@/lib/plan-limits";
import { db } from "@/infrastructure/db";
import { plans, payments, invoices as invoicesTable } from "@/db/schema/billing";
import { eq, desc } from "drizzle-orm";
import { formatCurrency } from "@/shared/utils";
import { Check, Receipt, CreditCard, HelpCircle, TrendingUp, Package, Users } from "lucide-react";
import { UpgradeDialog } from "./upgrade-dialog";
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

  const pct = (c: number, m: number) => Math.min((c / m) * 100, 100);
  const currentPlan = allPlans.find(p => p.name === limits.planName);
  const rate = Number(currentPlan?.commissionRate ?? 0);
  const cap = Number(currentPlan?.priceMonthly ?? 0);

  // Calculate savings for celebration message
  const latestInvoice = recentInvoices[0];
  const savings = latestInvoice ? Number(latestInvoice.commissionAmount) - Number(latestInvoice.finalAmount) : 0;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Plan & Billing</h2>
        <p className="text-xs text-muted-foreground">Manage your subscription, view invoices, and understand pricing</p>
      </div>

      {/* Celebration banner — show when cap saves money */}
      {latestInvoice && savings > 0 && (
        <div className="rounded-lg bg-success/10 p-4">
          <p className="text-sm font-medium text-success">
            Your cap saved you {formatCurrency(savings, "NPR")} this month
          </p>
          <p className="text-xs text-success mt-0.5">
            You processed {latestInvoice.orderCount} orders worth {formatCurrency(Number(latestInvoice.orderTotal), "NPR")} — commission would be {formatCurrency(Number(latestInvoice.commissionAmount), "NPR")} but you only pay {formatCurrency(Number(latestInvoice.finalAmount), "NPR")}.
          </p>
        </div>
      )}

      {/* Top row: Plan + Usage */}
      <div className="grid lg:grid-cols-5 gap-3">
        {/* Current plan */}
        <section className="lg:col-span-3 rounded-lg border p-4" aria-label="Current plan">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Current Plan</p>
              <p className="text-lg font-semibold tracking-tight">{limits.planName}</p>
              {currentPlan?.description && <p className="text-xs text-muted-foreground mt-1">{currentPlan.description}</p>}
            </div>
            <span className={`text-[10px] px-2 py-1 rounded font-medium ${
              limits.status === "active" ? "bg-success/10 text-success" :
              limits.status === "grace" ? "bg-warning/10 text-warning" :
              limits.status === "none" ? "bg-muted text-muted-foreground" :
              "bg-destructive/10 text-destructive"
            }`} role="status">{limits.status === "none" ? "Free Tier" : limits.status}</span>
          </div>

          {rate > 0 ? (
            <div className="grid grid-cols-3 gap-4 p-3 rounded-md bg-muted/50">
              <div>
                <p className="text-[10px] text-muted-foreground">Commission</p>
                <p className="text-sm font-semibold tabular-nums">{rate}%</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Monthly Cap</p>
                <p className="text-sm font-semibold tabular-nums">{formatCurrency(cap, "NPR")}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Annual</p>
                <p className="text-sm font-semibold tabular-nums">{currentPlan?.priceYearly ? formatCurrency(Number(currentPlan.priceYearly), "NPR") : "—"}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground p-3 rounded-md bg-muted/50">No commission on the free plan. Upgrade to unlock more products and features.</p>
          )}

          {limits.periodEnd && (
            <p className="text-xs text-muted-foreground mt-3">
              Renews {new Date(limits.periodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </section>

        {/* Usage */}
        <section className="lg:col-span-2 rounded-lg border p-4 flex flex-col justify-between" aria-label="Usage">
          <p className="text-xs text-muted-foreground mb-4">Usage</p>
          <div className="space-y-4 flex-1">
            {[
              { label: "Products", icon: Package, current: limits.currentProducts, max: limits.maxProducts },
              { label: "Staff", icon: Users, current: limits.currentStaff, max: limits.maxStaff },
            ].map(u => (
              <div key={u.label}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><u.icon className="size-3" />{u.label}</span>
                  <span className="tabular-nums font-medium">{u.current}<span className="text-muted-foreground">/{u.max}</span></span>
                </div>
                <div className="h-2 bg-muted rounded-full" role="progressbar" aria-valuenow={u.current} aria-valuemax={u.max} aria-label={`${u.label}: ${u.current} of ${u.max}`}>
                  <div
                    className={`h-2 rounded-full transition-all ${pct(u.current, u.max) >= 90 ? "bg-destructive" : pct(u.current, u.max) >= 70 ? "bg-warning" : "bg-foreground"}`}
                    style={{ width: `${Math.max(pct(u.current, u.max), 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {(pct(limits.currentProducts, limits.maxProducts) >= 80 || pct(limits.currentStaff, limits.maxStaff) >= 80) && (
            <p className="text-xs text-warning mt-3">Approaching limit — consider upgrading</p>
          )}
        </section>
      </div>

      {/* Plans */}
      <section aria-label="Available plans">
        <p className="text-sm font-medium mb-3">Available Plans</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {allPlans.map(plan => {
            const isCurrent = plan.name === limits.planName;
            const r = Number(plan.commissionRate);
            const c = Number(plan.priceMonthly);

            return (
              <div key={plan.id} className={`rounded-lg border p-4 flex flex-col ${isCurrent ? "border-foreground ring-1 ring-foreground" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{plan.name}</p>
                  {isCurrent && <span className="text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded">Current</span>}
                </div>
                <p className="text-lg font-semibold tabular-nums">
                  {c === 0 ? "Free" : formatCurrency(c, "NPR")}
                  {c > 0 && <span className="text-xs text-muted-foreground font-normal">/mo cap</span>}
                </p>
                {r > 0 && <p className="text-xs text-muted-foreground mt-0.5">{r}% commission on sales</p>}
                {plan.priceYearly && Number(plan.priceYearly) > 0 && (
                  <p className="text-[10px] text-success mt-0.5">{formatCurrency(Number(plan.priceYearly), "NPR")}/yr — save 17%</p>
                )}
                <div className="mt-3 pt-3 border-t space-y-1.5 flex-1">
                  {(plan.features as string[] || []).map((f, i) => (
                    <p key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Check className="size-3 text-foreground shrink-0 mt-0.5" /> {f}
                    </p>
                  ))}
                </div>
                <UpgradeDialog plan={plan} currentPlanName={limits.planName} />
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works + Example */}
      <div className="grid lg:grid-cols-2 gap-3">
        <section className="rounded-lg border p-4" aria-label="How pricing works">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium">How Pricing Works</p>
          </div>
          <div className="space-y-3">
            {[
              { n: "1", title: "Pay only when you sell", desc: "Small percentage of paid orders. No sales = no charge." },
              { n: "2", title: "Monthly cap protects you", desc: "Your bill never exceeds the cap, even with high sales." },
              { n: "3", title: "You pay whichever is lower", desc: "Commission OR cap — always the smaller number." },
            ].map(s => (
              <div key={s.n} className="flex gap-2.5">
                <div className="size-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5">{s.n}</div>
                <div>
                  <p className="text-xs font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border p-4" aria-label="Pricing example">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium">Example ({currentPlan?.name ?? "Growth"} Plan)</p>
          </div>
          <div className="space-y-0">
            {[10000, 25000, 50000, 100000].map(sales => {
              const exRate = rate || 2;
              const exCap = cap || 499;
              const comm = sales * (exRate / 100);
              const pay = Math.min(comm, exCap);
              const capped = comm > exCap;
              return (
                <div key={sales} className="flex items-center justify-between text-xs py-2 border-b border-muted last:border-0">
                  <span className="text-muted-foreground tabular-nums">{formatCurrency(sales, "NPR")} sales</span>
                  <span className="text-muted-foreground tabular-nums">{exRate}% = {formatCurrency(comm, "NPR")}</span>
                  <span className={`font-semibold tabular-nums ${capped ? "text-success" : ""}`}>
                    {formatCurrency(pay, "NPR")} {capped && <Check className="size-3 text-success inline" />}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2"><Check className="size-2.5 text-success inline" /> = cap applied, you save money</p>
        </section>
      </div>

      {/* Invoices + Payments */}
      <div className="grid lg:grid-cols-2 gap-3">
        <section className="rounded-lg border" aria-label="Invoices">
          <div className="flex items-center gap-2 p-4 border-b">
            <Receipt className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium">Invoices</p>
          </div>
          {recentInvoices.length > 0 ? (
            <div className="divide-y">
              {recentInvoices.map(inv => {
                const invSavings = Number(inv.commissionAmount) - Number(inv.finalAmount);
                return (
                  <div key={inv.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{new Date(inv.periodStart).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
                        <p className="text-xs text-muted-foreground">{inv.orderCount} orders · {formatCurrency(Number(inv.orderTotal), "NPR")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">{formatCurrency(Number(inv.finalAmount), "NPR")}</p>
                        <span className={`text-[10px] ${inv.status === "paid" ? "text-success" : inv.status === "waived" ? "text-muted-foreground" : "text-warning"}`}>{inv.status}</span>
                      </div>
                    </div>
                    {invSavings > 0 && <p className="text-[10px] text-success mt-1">Cap saved you {formatCurrency(invSavings, "NPR")}</p>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="p-6 text-xs text-muted-foreground text-center">No invoices yet</p>
          )}
        </section>

        <section className="rounded-lg border" aria-label="Payment history">
          <div className="flex items-center gap-2 p-4 border-b">
            <CreditCard className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium">Payments</p>
          </div>
          {recentPayments.length > 0 ? (
            <div className="divide-y">
              {recentPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium tabular-nums">{formatCurrency(Number(p.amount), "NPR")}</p>
                    <p className="text-xs text-muted-foreground">{p.method.replace("_", " ")}{p.reference && ` · ${p.reference}`}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-6 text-xs text-muted-foreground text-center">No payments yet</p>
          )}
        </section>
      </div>
    </div>
  );
}
