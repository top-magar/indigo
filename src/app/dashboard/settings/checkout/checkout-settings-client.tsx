"use client";
import { useSaveShortcut } from "@/hooks/use-save-shortcut";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateCheckoutSettings } from "./actions";

interface CheckoutSettings {
  guestCheckout: boolean;
  requirePhone: boolean;
  requireCompany: boolean;
  orderNotes: boolean;
  minimumOrderAmount: number;
  autoCancelHours: number;
  thankYouMessage: string;
  estimatedDeliveryDays: string;
  termsUrl: string;
  privacyUrl: string;
  refundPolicy: string;
}

import { ToggleRow } from "@/components/dashboard/toggle-row";

export function CheckoutSettingsClient({ settings: initial, userRole }: { settings: CheckoutSettings; userRole: "owner" | "admin" | "staff" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [s, setS] = useState(initial);
  const canEdit = userRole === "owner" || userRole === "admin";
  const hasChanges = JSON.stringify(s) !== JSON.stringify(initial);
  useUnsavedChanges(hasChanges);
  const set = <K extends keyof CheckoutSettings>(k: K, v: CheckoutSettings[K]) => setS(prev => ({ ...prev, [k]: v }));

  const handleSave = () => startTransition(async () => {
    const fd = new FormData();
    fd.set("guestCheckout", String(s.guestCheckout));
    fd.set("requirePhone", String(s.requirePhone));
    fd.set("requireCompany", String(s.requireCompany));
    fd.set("orderNotes", String(s.orderNotes));
    fd.set("minimumOrderAmount", String(s.minimumOrderAmount));
    fd.set("autoCancelHours", String(s.autoCancelHours));
    fd.set("thankYouMessage", s.thankYouMessage);
    fd.set("estimatedDeliveryDays", s.estimatedDeliveryDays);
    fd.set("termsUrl", s.termsUrl);
    fd.set("privacyUrl", s.privacyUrl);
    fd.set("refundPolicy", s.refundPolicy);

    const result = await updateCheckoutSettings(fd);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Checkout settings saved");
    router.refresh();
  });

  useSaveShortcut(handleSave);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Checkout</h1>
          <p className="text-xs text-muted-foreground">Configure the checkout experience for your customers</p>
        </div>
        {canEdit && (
          <Button onClick={handleSave} disabled={isPending || !hasChanges} size="sm">
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
            {isPending ? "Saving…" : "Save"}
          </Button>
        )}
      </div>

      {/* Customer Options */}
      <div>
        <h2 className="text-sm font-medium mb-3">Customer Options</h2>
        <div className="rounded-lg border divide-y">
          <ToggleRow label="Guest Checkout" description="Allow checkout without creating an account" checked={s.guestCheckout} onChange={v => set("guestCheckout", v)} disabled={!canEdit} badge="Recommended" />
          <ToggleRow label="Order Notes" description="Allow customers to add special instructions" checked={s.orderNotes} onChange={v => set("orderNotes", v)} disabled={!canEdit} />
          <ToggleRow label="Require Phone Number" description="Needed for COD delivery coordination in Nepal" checked={s.requirePhone} onChange={v => set("requirePhone", v)} disabled={!canEdit} badge="Nepal" />
          <ToggleRow label="Require Company Name" description="For B2B stores that need company details at checkout" checked={s.requireCompany} onChange={v => set("requireCompany", v)} disabled={!canEdit} />
        </div>
      </div>

      {/* Order Rules */}
      <div>
        <h2 className="text-sm font-medium mb-3">Order Rules</h2>
        <div className="rounded-lg border divide-y">
          {/* Minimum Order */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Minimum Order Amount</p>
              <p className="text-xs text-muted-foreground">Prevent small orders, especially useful for COD</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number" min={0} value={s.minimumOrderAmount || ""} className="w-28 text-right tabular-nums"
                onChange={e => set("minimumOrderAmount", Number(e.target.value) || 0)}
                placeholder="0" disabled={!canEdit}
              />
            </div>
          </div>

          {/* Auto-cancel */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Auto-cancel Unpaid Orders</p>
              <p className="text-xs text-muted-foreground">Automatically cancel orders not paid within this time</p>
            </div>
            <Select value={String(s.autoCancelHours)} onValueChange={v => set("autoCancelHours", Number(v))} disabled={!canEdit}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Disabled</SelectItem>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="12">12 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="48">48 hours</SelectItem>
                <SelectItem value="72">72 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Delivery */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Estimated Delivery</p>
              <p className="text-xs text-muted-foreground">Shown to customers at checkout</p>
            </div>
            <Input
              value={s.estimatedDeliveryDays} className="w-40"
              onChange={e => set("estimatedDeliveryDays", e.target.value)}
              placeholder="e.g. 3-5 business days" disabled={!canEdit}
            />
          </div>
        </div>
      </div>

      {/* Post-Purchase */}
      <div>
        <h2 className="text-sm font-medium mb-3">Post-Purchase</h2>
        <div className="rounded-lg border">
          <div className="p-4 space-y-1.5">
            <Label className="text-xs">Thank You Message</Label>
            <Textarea
              value={s.thankYouMessage} onChange={e => set("thankYouMessage", e.target.value)}
              placeholder="Thank you for your order! We'll notify you when it ships."
              rows={2} disabled={!canEdit}
            />
            <p className="text-[10px] text-muted-foreground">Displayed on the order confirmation page after checkout</p>
          </div>
        </div>
      </div>

      {/* Legal & Policies */}
      <div>
        <h2 className="text-sm font-medium mb-3">Legal & Policies</h2>
        <div className="rounded-lg border divide-y">
          <div className="p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Terms of Service URL</Label>
                <Input value={s.termsUrl} onChange={e => set("termsUrl", e.target.value)} placeholder="https://yourstore.com/terms" disabled={!canEdit} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Privacy Policy URL</Label>
                <Input value={s.privacyUrl} onChange={e => set("privacyUrl", e.target.value)} placeholder="https://yourstore.com/privacy" disabled={!canEdit} />
              </div>
            </div>
          </div>
          <div className="p-4 space-y-1.5">
            <Label className="text-xs">Refund Policy</Label>
            <Textarea value={s.refundPolicy} onChange={e => set("refundPolicy", e.target.value)} placeholder="Describe your refund policy…" rows={3} disabled={!canEdit} />
            <p className="text-[10px] text-muted-foreground">Displayed on checkout page and order confirmation emails</p>
          </div>
        </div>
      </div>
    </div>
  );
}
