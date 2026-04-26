"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils";
import { requestUpgrade } from "./actions";

type Plan = {
  id: string; name: string; slug: string;
  priceMonthly: string; priceYearly: string | null;
  commissionRate: string | null; features: unknown;
  isDefault: boolean;
};

export function UpgradeDialog({ plan, currentPlanName }: { plan: Plan; currentPlanName: string }) {
  const [open, setOpen] = useState(false);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [paymentInfo, setPaymentInfo] = useState<{ planName: string; amount: string; cycle: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const isCurrent = plan.name === currentPlanName;
  const isDowngrade = plan.isDefault; // Free plan

  if (isCurrent || isDowngrade) return null;

  const amount = cycle === "yearly" && plan.priceYearly
    ? Number(plan.priceYearly)
    : Number(plan.priceMonthly);

  const handleUpgrade = () => {
    startTransition(async () => {
      const result = await requestUpgrade({ planId: plan.id, billingCycle: cycle });
      if (result.error) toast.error(result.error);
      else if (result.paymentInfo) setPaymentInfo(result.paymentInfo);
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setPaymentInfo(null); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-3">Upgrade to {plan.name}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to {plan.name}</DialogTitle>
        </DialogHeader>

        {!paymentInfo ? (
          <div className="space-y-4">
            {/* Cycle selector */}
            <div className="flex rounded-md border overflow-hidden">
              <button onClick={() => setCycle("monthly")} className={`flex-1 px-3 py-2 text-xs transition-colors ${cycle === "monthly" ? "bg-foreground text-background" : "hover:bg-muted"}`}>
                Monthly — {formatCurrency(Number(plan.priceMonthly), "NPR")}/mo cap
              </button>
              {plan.priceYearly && Number(plan.priceYearly) > 0 && (
                <button onClick={() => setCycle("yearly")} className={`flex-1 px-3 py-2 text-xs transition-colors ${cycle === "yearly" ? "bg-foreground text-background" : "hover:bg-muted"}`}>
                  Yearly — {formatCurrency(Number(plan.priceYearly), "NPR")}/yr (save 17%)
                </button>
              )}
            </div>

            <div className="text-center py-2">
              <p className="text-2xl font-semibold tabular-nums">{formatCurrency(amount, "NPR")}</p>
              <p className="text-xs text-muted-foreground">{cycle === "yearly" ? "per year" : "per month (cap)"}</p>
            </div>

            <Button onClick={handleUpgrade} disabled={isPending} className="w-full">
              {isPending ? "Processing..." : "Continue to Payment"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">Amount to pay</p>
              <p className="text-2xl font-semibold tabular-nums mt-1">{formatCurrency(Number(paymentInfo.amount), "NPR")}</p>
              <p className="text-xs text-muted-foreground">{paymentInfo.planName} — {paymentInfo.cycle}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Pay via any of these methods:</p>

              {/* eSewa */}
              <div className="rounded-md border p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">eSewa</p>
                  <p className="text-xs text-muted-foreground">9840172158</p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => copyToClipboard("9840172158")}>
                  <Copy className="size-3.5" />
                </Button>
              </div>

              {/* Khalti */}
              <div className="rounded-md border p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Khalti</p>
                  <p className="text-xs text-muted-foreground">9840172158</p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => copyToClipboard("9840172158")}>
                  <Copy className="size-3.5" />
                </Button>
              </div>

              {/* Bank */}
              <div className="rounded-md border p-3">
                <p className="text-xs font-medium">Bank Transfer</p>
                <p className="text-xs text-muted-foreground">Indigo Technology Pvt. Ltd.</p>
                <p className="text-xs text-muted-foreground">A/C: 0123456789 · NIC Asia Bank</p>
              </div>
            </div>

            <div className="rounded-md bg-success/10 p-3">
              <p className="text-xs text-success font-medium">After payment:</p>
              <p className="text-xs text-success/80">Send payment screenshot to our WhatsApp (9840172158). We'll activate your plan within 1 hour during business hours.</p>
            </div>

            <Button variant="outline" className="w-full" onClick={() => {
              window.open("https://wa.me/9779840172158?text=Hi, I just paid for the " + paymentInfo.planName + " plan. Please activate my subscription.", "_blank");
            }}>
              Send on WhatsApp
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
