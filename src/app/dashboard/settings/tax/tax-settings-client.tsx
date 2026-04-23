"use client";
import { useSaveShortcut } from "@/hooks/use-save-shortcut";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { type TaxSettings, updateTaxSettings } from "./actions";

import { ToggleRow } from "@/components/dashboard/toggle-row";

export function TaxSettingsClient({ initialSettings }: { initialSettings: TaxSettings }) {
  const [s, setS] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();
  const hasChanges = JSON.stringify(s) !== JSON.stringify(initialSettings);
  useUnsavedChanges(hasChanges);
  const set = <K extends keyof TaxSettings>(k: K, v: TaxSettings[K]) => setS(prev => ({ ...prev, [k]: v }));

  const handleSave = () => startTransition(async () => {
    const result = await updateTaxSettings(s);
    result.success ? toast.success("Tax settings saved") : toast.error(result.error ?? "Failed to save");
  });

  useSaveShortcut(handleSave);

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
                <Input value={s.taxName} onChange={e => set("taxName", e.target.value)} placeholder="e.g. VAT, GST" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Default Rate (%)</Label>
                <Input type="number" min={0} max={100} step={0.01} value={s.defaultRate} onChange={e => set("defaultRate", parseFloat(e.target.value) || 0)} className="tabular-nums" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">PAN / VAT Registration Number</Label>
              <Input value={s.registrationNumber} onChange={e => set("registrationNumber", e.target.value)} placeholder="e.g. 123456789" />
              <p className="text-[10px] text-muted-foreground">9-digit PAN number. Displayed on invoices and required for VAT billing in Nepal.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Behavior */}
      <div>
        <h2 className="text-sm font-medium mb-3">Behavior</h2>
        <div className="rounded-lg border divide-y">
          <ToggleRow label="Prices Include Tax" description="Product prices already include tax (tax-inclusive pricing)" checked={s.priceIncludesTax} onChange={v => set("priceIncludesTax", v)} badge="Common in Nepal" />
          <ToggleRow label="Auto-apply to New Products" description="Automatically apply the default tax rate to newly created products" checked={s.autoApplyToNewProducts} onChange={v => set("autoApplyToNewProducts", v)} badge="Recommended" />
          <ToggleRow label="Tax on Shipping" description="Apply tax to shipping charges in addition to product prices" checked={s.taxOnShipping} onChange={v => set("taxOnShipping", v)} />
          <ToggleRow label="Show Tax in Cart" description="Display tax as a separate line item in the cart and checkout" checked={s.displayTaxInCart} onChange={v => set("displayTaxInCart", v)} />
        </div>
      </div>

      {/* Invoicing */}
      <div>
        <h2 className="text-sm font-medium mb-3">Invoicing</h2>
        <div className="rounded-lg border">
          <div className="p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Invoice Prefix</Label>
                <Input value={s.invoicePrefix} onChange={e => set("invoicePrefix", e.target.value)} placeholder="INV-" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Next Invoice Number</Label>
                <Input type="number" min={1} value={s.nextInvoiceNumber} onChange={e => set("nextInvoiceNumber", parseInt(e.target.value) || 1)} className="tabular-nums" />
              </div>
            </div>
            <div className="mt-3 rounded-md bg-muted/30 border px-3 py-2">
              <p className="text-[10px] text-muted-foreground">
                Next invoice: <span className="font-medium text-foreground tabular-nums">{s.invoicePrefix}{String(s.nextInvoiceNumber).padStart(4, "0")}</span>
                {" "}· Sequential numbering required by Nepal IRD for VAT-registered businesses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
