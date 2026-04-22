"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Banknote, Building2, CheckCircle, Loader2, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils";
import { type PaymentSettings, updatePaymentSettings } from "./actions";

// ─── Logos ────────────────────────────────────────────────
const ESEWA_LOGO = "https://cdn.esewa.com.np/ui/images/esewa_og.png";
const KHALTI_LOGO = "https://upload.wikimedia.org/wikipedia/commons/e/ee/Khalti_Digital_Wallet_Logo.png.jpg";

// ─── Secret Input ─────────────────────────────────────────
function SecretInput({ value, onChange, placeholder, id }: { value: string; onChange: (v: string) => void; placeholder: string; id: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="pr-9" />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </button>
    </div>
  );
}

// ─── Payment Method Row ───────────────────────────────────
function MethodHeader({ icon, name, description, active, onToggle, badge }: {
  icon: React.ReactNode; name: string; description: string; active: boolean; onToggle: (v: boolean) => void; badge?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="size-10 rounded-lg border bg-background flex items-center justify-center shrink-0 overflow-hidden">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{name}</p>
          {badge && <Badge className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">{badge}</Badge>}
          <Badge className={cn("text-[10px] px-1.5 py-0", active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
            {active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <Switch checked={active} onCheckedChange={onToggle} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────
export function PaymentsSettingsClient({ initialSettings }: { initialSettings: PaymentSettings }) {
  const [s, setS] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();
  const set = <K extends keyof PaymentSettings>(k: K, v: PaymentSettings[K]) => setS(prev => ({ ...prev, [k]: v }));
  const hasChanges = JSON.stringify(s) !== JSON.stringify(initialSettings);

  const handleSave = () => startTransition(async () => {
    const result = await updatePaymentSettings(s);
    result.success ? toast.success("Payment settings saved") : toast.error(result.error ?? "Failed to save");
  });

  const activeCount = [s.cashOnDelivery, s.bankTransfer, s.esewa, s.khalti].filter(Boolean).length;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Payments</h1>
          <p className="text-xs text-muted-foreground">
            {activeCount} payment method{activeCount !== 1 ? "s" : ""} active
          </p>
        </div>
        <Button onClick={handleSave} disabled={isPending || !hasChanges} size="sm">
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>

      <div className="rounded-lg border divide-y">
        {/* COD */}
        <MethodHeader
          icon={<Banknote className="size-5 text-success" />}
          name="Cash on Delivery"
          description="Customers pay when they receive their order"
          active={s.cashOnDelivery}
          onToggle={v => set("cashOnDelivery", v)}
          badge="Recommended"
        />

        {/* Bank Transfer */}
        <div>
          <MethodHeader
            icon={<Building2 className="size-5 text-info" />}
            name="Bank Transfer"
            description="Customers transfer directly to your bank account"
            active={s.bankTransfer}
            onToggle={v => set("bankTransfer", v)}
          />
          {s.bankTransfer && (
            <div className="px-4 pb-4 pt-0 ml-[52px] space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Bank Name</Label>
                  <Input value={s.bankName} onChange={e => set("bankName", e.target.value)} placeholder="e.g. Nepal Bank Ltd" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Account Holder</Label>
                  <Input value={s.accountHolderName} onChange={e => set("accountHolderName", e.target.value)} placeholder="Full name on account" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Account Number</Label>
                  <Input value={s.accountNumber} onChange={e => set("accountNumber", e.target.value)} placeholder="Account number" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Branch</Label>
                  <Input value={s.branch} onChange={e => set("branch", e.target.value)} placeholder="Branch name" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* eSewa */}
        <div>
          <MethodHeader
            icon={<Image src={ESEWA_LOGO} alt="eSewa" width={20} height={20} className="rounded" unoptimized />}
            name="eSewa"
            description="Nepal's leading digital wallet"
            active={s.esewa}
            onToggle={v => set("esewa", v)}
          />
          {s.esewa && (
            <div className="px-4 pb-4 pt-0 ml-[52px] space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Merchant Code</Label>
                  <Input value={s.esewamerchantCode} onChange={e => set("esewamerchantCode", e.target.value)} placeholder="e.g. EPAYTEST" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Secret Key</Label>
                  <SecretInput id="esewaSecret" value={s.esewaSecret} onChange={v => set("esewaSecret", v)} placeholder="Your eSewa secret key" />
                </div>
              </div>
              <a href="https://developer.esewa.com.np" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                Get credentials from eSewa Developer Portal <ExternalLink className="size-3" />
              </a>
            </div>
          )}
        </div>

        {/* Khalti */}
        <div>
          <MethodHeader
            icon={<Image src={KHALTI_LOGO} alt="Khalti" width={20} height={20} className="rounded" unoptimized />}
            name="Khalti"
            description="Nepal's unified payment platform"
            active={s.khalti}
            onToggle={v => set("khalti", v)}
          />
          {s.khalti && (
            <div className="px-4 pb-4 pt-0 ml-[52px] space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Secret Key</Label>
                <SecretInput id="khaltiSecret" value={s.khaltiSecretKey} onChange={v => set("khaltiSecretKey", v)} placeholder="Your Khalti secret key" />
              </div>
              <a href="https://khalti.com/join/merchant" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                Get credentials from Khalti Merchant Portal <ExternalLink className="size-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Payment credentials are encrypted at rest. Test mode available for eSewa and Khalti.
      </p>
    </div>
  );
}
