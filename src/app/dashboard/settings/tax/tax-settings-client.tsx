"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type TaxSettings, updateTaxSettings } from "./actions";

function ToggleRow({ label, description, checked, onChange, badge }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void; badge?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{label}</p>
          {badge && <Badge className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">{badge}</Badge>}
        </div>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function TaxSettingsClient({ initialSettings }: { initialSettings: TaxSettings }) {
  const [s, setS] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();
  const hasChanges = JSON.stringify(s) !== JSON.stringify(initialSettings);
  const set = <K extends keyof TaxSettings>(k: K, v: TaxSettings[K]) => setS(prev => ({ ...prev, [k]: v }));

  const handleSave = () => startTransition(async () => {
    const result = await updateTaxSettings(s);
    result.success ? toast.success("Tax settings saved") : toast.error(result.error ?? "Failed to save");
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Tax</h1>
          <p className="text-xs text-muted-foreground">
            {s.defaultRate > 0 ? `${s.taxName || "Tax"} at ${s.defaultRate}%` : "No tax configured"} · Prices {s.priceIncludesTax ? "include" : "exclude"} tax
          </p>
        </div>
        <Button onClick={handleSave} disabled={isPending || !hasChanges} size="sm">
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>

      {/* Tax Rate */}
      <div>
        <h2 className="text-sm font-medium mb-3">Tax Rate</h2>
        <div className="rounded-lg border">
          <div className="p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Tax Name</Label>
                <Input value={s.taxName} onChange={e => set("taxName", e.target.value)} placeholder="e.g. VAT, GST, Sales Tax" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Default Rate (%)</Label>
                <Input type="number" min={0} max={100} step={0.01} value={s.defaultRate} onChange={e => set("defaultRate", parseFloat(e.target.value) || 0)} className="tabular-nums" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tax Registration Number</Label>
              <Input value={s.registrationNumber} onChange={e => set("registrationNumber", e.target.value)} placeholder="e.g. VAT/PAN number" />
              <p className="text-[10px] text-muted-foreground">Displayed on invoices. Leave blank if not registered.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Behavior */}
      <div>
        <h2 className="text-sm font-medium mb-3">Behavior</h2>
        <div className="rounded-lg border divide-y">
          <ToggleRow label="Prices Include Tax" description="Product prices already include tax (tax-inclusive pricing)" checked={s.priceIncludesTax} onChange={v => set("priceIncludesTax", v)} badge="Common in Nepal" />
          <ToggleRow label="Auto-apply to New Products" description="Automatically apply the default tax rate to newly created products" checked={s.autoApplyToNewProducts} onChange={v => set("autoApplyToNewProducts", v)} badge="Recommended" />
          <ToggleRow label="Show Tax in Cart" description="Display tax as a separate line item in the cart and checkout" checked={s.displayTaxInCart} onChange={v => set("displayTaxInCart", v)} />
        </div>
      </div>
    </div>
  );
}
