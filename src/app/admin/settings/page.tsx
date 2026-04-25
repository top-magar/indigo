import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { orders } from "@/db/schema/orders";
import { count } from "drizzle-orm";
import { Check, Circle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Platform Settings | Admin" };

export default async function AdminSettingsPage() {
  const [[{ value: merchantCount }], [{ value: orderCount }]] = await Promise.all([
    db.select({ value: count() }).from(tenants),
    db.select({ value: count() }).from(orders),
  ]);

  const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
  const hasResendKey = !!process.env.RESEND_API_KEY;
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasMerchants = merchantCount > 0;
  const hasOrders = orderCount > 0;

  const steps = [
    { label: "Supabase connected", desc: "Database and auth configured", done: hasSupabase },
    { label: "Stripe configured", desc: "Payment processing for platform billing", done: hasStripeKey },
    { label: "Email service configured", desc: "Resend API key for transactional emails", done: hasResendKey },
    { label: "First merchant signed up", desc: "At least one store created on the platform", done: hasMerchants },
    { label: "First order received", desc: "A customer has placed an order", done: hasOrders },
  ];

  const completed = steps.filter(s => s.done).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Platform Settings</h1>
        <p className="text-xs text-muted-foreground">Setup checklist and platform configuration</p>
      </div>

      {/* Setup progress */}
      <div className="rounded-lg border p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium">Platform Setup</p>
          <p className="text-xs text-muted-foreground">{completed}/{steps.length} complete</p>
        </div>
        <div className="w-full h-2 bg-muted rounded-full mb-6">
          <div className="h-2 bg-foreground rounded-full transition-all" style={{ width: `${(completed / steps.length) * 100}%` }} />
        </div>
        <div className="space-y-3">
          {steps.map(step => (
            <div key={step.label} className="flex items-start gap-3">
              <div className={`size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${step.done ? "bg-foreground text-background" : "border-2 border-muted-foreground/30"}`}>
                {step.done ? <Check className="size-3" /> : <Circle className="size-2 text-muted-foreground/30" />}
              </div>
              <div>
                <p className={`text-sm ${step.done ? "font-medium" : "text-muted-foreground"}`}>{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environment status */}
      <div className="rounded-lg border p-5">
        <p className="text-sm font-medium mb-4">Environment</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            ["SUPABASE_URL", hasSupabase],
            ["STRIPE_SECRET_KEY", hasStripeKey],
            ["RESEND_API_KEY", hasResendKey],
            ["STRIPE_WEBHOOK_SECRET", !!process.env.STRIPE_WEBHOOK_SECRET],
            ["DATABASE_URL", !!process.env.DATABASE_URL],
            ["NEXT_PUBLIC_APP_URL", !!process.env.NEXT_PUBLIC_APP_URL],
          ].map(([name, set]) => (
            <div key={name as string} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
              <span className="font-mono text-[11px]">{name as string}</span>
              <span className={`text-[10px] font-medium ${set ? "text-success" : "text-destructive"}`}>{set ? "Set" : "Missing"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
