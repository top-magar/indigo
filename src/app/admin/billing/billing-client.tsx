"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils";
import { assignPlan, recordPayment } from "./actions";
import { generateMonthlyInvoices, markInvoicePaid, waiveInvoice } from "./invoice-actions";

type Props = {
  merchants: { id: string; name: string; slug: string }[];
  plans: { id: string; name: string; priceMonthly: string }[];
  subscriptions: { id: string; tenantId: string; planId: string; status: string; periodEnd: Date; billingCycle: string }[];
  payments: { id: string; tenantId: string; amount: string; method: string; reference: string | null; merchantName: string; createdAt: string }[];
  invoices: { id: string; tenantId: string; merchantName: string; periodStart: string; orderTotal: string; commissionRate: string; finalAmount: string; status: string }[];
};

export default function BillingClient({ merchants, plans, subscriptions, payments, invoices: invoiceList }: Props) {
  const [isPending, startTransition] = useTransition();

  // Assign plan form
  const [assignTenant, setAssignTenant] = useState("");
  const [assignPlanId, setAssignPlanId] = useState("");
  const [assignCycle, setAssignCycle] = useState<"monthly" | "yearly">("monthly");

  // Record payment form
  const [payTenant, setPayTenant] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("");
  const [payRef, setPayRef] = useState("");

  const handleAssign = () => {
    if (!assignTenant || !assignPlanId) return;
    startTransition(async () => {
      const result = await assignPlan({ tenantId: assignTenant, planId: assignPlanId, billingCycle: assignCycle });
      if (result.error) toast.error(result.error);
      else { toast.success("Plan assigned"); setAssignTenant(""); setAssignPlanId(""); }
    });
  };

  const handlePayment = () => {
    if (!payTenant || !payAmount || !payMethod) return;
    startTransition(async () => {
      const result = await recordPayment({ tenantId: payTenant, amount: payAmount, method: payMethod as any, reference: payRef || undefined });
      if (result.error) toast.error(result.error);
      else { toast.success("Payment recorded"); setPayTenant(""); setPayAmount(""); setPayRef(""); }
    });
  };

  const statusColor: Record<string, string> = {
    active: "bg-success/10 text-success",
    grace: "bg-warning/10 text-warning",
    expired: "bg-destructive/10 text-destructive",
    cancelled: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-3">
        {/* Assign Plan */}
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Assign Plan</p>
          <Select value={assignTenant} onValueChange={setAssignTenant}>
            <SelectTrigger><SelectValue placeholder="Select merchant" /></SelectTrigger>
            <SelectContent>
              {merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={assignPlanId} onValueChange={setAssignPlanId}>
            <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
            <SelectContent>
              {plans.map(p => <SelectItem key={p.id} value={p.id}>{p.name} — {formatCurrency(Number(p.priceMonthly), "NPR")}/mo</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={assignCycle} onValueChange={v => setAssignCycle(v as "monthly" | "yearly")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleAssign} disabled={isPending || !assignTenant || !assignPlanId}>Assign Plan</Button>
        </div>

        {/* Record Payment */}
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Record Payment</p>
          <Select value={payTenant} onValueChange={setPayTenant}>
            <SelectTrigger><SelectValue placeholder="Select merchant" /></SelectTrigger>
            <SelectContent>
              {merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Amount (NPR)" value={payAmount} onChange={e => setPayAmount(e.target.value)} type="number" />
          <Select value={payMethod} onValueChange={setPayMethod}>
            <SelectTrigger><SelectValue placeholder="Payment method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="esewa">eSewa</SelectItem>
              <SelectItem value="khalti">Khalti</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="fonepay">Fonepay</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Reference / Transaction ID (optional)" value={payRef} onChange={e => setPayRef(e.target.value)} />
          <Button size="sm" onClick={handlePayment} disabled={isPending || !payTenant || !payAmount || !payMethod}>Record Payment</Button>
        </div>
      </div>

      {/* Payment History */}
      <div className="rounded-lg border">
        <div className="p-4 border-b">
          <p className="text-sm font-medium">Recent Payments</p>
        </div>
        {payments.length > 0 ? (
          <div className="divide-y">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium">{p.merchantName}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.method.replace("_", " ")} {p.reference && `· ${p.reference}`} · {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{formatCurrency(Number(p.amount), "NPR")}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-4 text-xs text-muted-foreground text-center">No payments recorded yet</p>
        )}
      </div>

      {/* Active Subscriptions */}
      <div className="rounded-lg border">
        <div className="p-4 border-b">
          <p className="text-sm font-medium">Subscriptions</p>
        </div>
        {subscriptions.length > 0 ? (
          <div className="divide-y">
            {subscriptions.map(s => {
              const merchant = merchants.find(m => m.id === s.tenantId);
              const plan = plans.find(p => p.id === s.planId);
              return (
                <div key={s.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">{merchant?.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{plan?.name} · {s.billingCycle}</p>
                  </div>
                  <Badge className={`text-[10px] ${statusColor[s.status] ?? ""}`}>{s.status}</Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="p-4 text-xs text-muted-foreground text-center">No subscriptions yet</p>
        )}
      </div>

      {/* Invoice Generation */}
      <div className="rounded-lg border">
        <div className="flex items-center justify-between p-4 border-b">
          <p className="text-sm font-medium">Monthly Invoices</p>
          <Button size="sm" onClick={() => {
            const now = new Date();
            startTransition(async () => {
              const result = await generateMonthlyInvoices(now.getFullYear(), now.getMonth() + 1);
              if (result.error) toast.error(result.error);
              else toast.success(`Generated ${result.generated} invoices (${result.skipped} skipped)`);
            });
          }} disabled={isPending}>
            Generate This Month
          </Button>
        </div>
        {invoiceList.length > 0 ? (
          <div className="divide-y">
            {invoiceList.map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium">{inv.merchantName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(inv.periodStart).toLocaleDateString("en-US", { month: "short", year: "numeric" })} · {inv.commissionRate}% on {formatCurrency(Number(inv.orderTotal), "NPR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold tabular-nums">{formatCurrency(Number(inv.finalAmount), "NPR")}</p>
                  {inv.status === "pending" ? (
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => startTransition(async () => { await markInvoicePaid(inv.id); toast.success("Marked paid"); })} disabled={isPending}>Paid</Button>
                      <Button variant="ghost" size="sm" onClick={() => startTransition(async () => { await waiveInvoice(inv.id); toast.success("Waived"); })} disabled={isPending}>Waive</Button>
                    </div>
                  ) : (
                    <Badge className={`text-[10px] ${inv.status === "paid" ? "bg-success/10 text-success" : inv.status === "waived" ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive"}`}>
                      {inv.status}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center p-4">No invoices generated yet. Click "Generate This Month" to calculate commissions.</p>
        )}
      </div>
    </div>
  );
}
