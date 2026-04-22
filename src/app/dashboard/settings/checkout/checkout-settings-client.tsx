"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { updateCheckoutSettings } from "./actions";

interface CheckoutSettings {
  guestCheckout: boolean;
  requirePhone: boolean;
  requireCompany: boolean;
  orderNotes: boolean;
  termsUrl: string;
  privacyUrl: string;
  refundPolicy: string;
}

interface Props {
  settings: CheckoutSettings;
  userRole: "owner" | "admin" | "staff";
}

function ToggleRow({ label, description, checked, onChange, badge, disabled }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void; badge?: string; disabled?: boolean;
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
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

export function CheckoutSettingsClient({ settings: initial, userRole }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [s, setS] = useState(initial);
  const canEdit = userRole === "owner" || userRole === "admin";
  const hasChanges = JSON.stringify(s) !== JSON.stringify(initial);
  const set = <K extends keyof CheckoutSettings>(k: K, v: CheckoutSettings[K]) => setS(prev => ({ ...prev, [k]: v }));

  const handleSave = () => startTransition(async () => {
    const fd = new FormData();
    fd.set("guestCheckout", String(s.guestCheckout));
    fd.set("requirePhone", String(s.requirePhone));
    fd.set("requireCompany", String(s.requireCompany));
    fd.set("orderNotes", String(s.orderNotes));
    fd.set("termsUrl", s.termsUrl);
    fd.set("privacyUrl", s.privacyUrl);
    fd.set("refundPolicy", s.refundPolicy);

    const result = await updateCheckoutSettings(fd);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Checkout settings saved");
    router.refresh();
  });

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

      {/* Customer Options + Required Fields */}
      <div>
        <h2 className="text-sm font-medium mb-3">Customer Options</h2>
        <div className="rounded-lg border divide-y">
          <ToggleRow label="Guest Checkout" description="Allow checkout without creating an account" checked={s.guestCheckout} onChange={v => set("guestCheckout", v)} disabled={!canEdit} badge="Recommended" />
          <ToggleRow label="Order Notes" description="Allow customers to add notes to their orders" checked={s.orderNotes} onChange={v => set("orderNotes", v)} disabled={!canEdit} />
          <ToggleRow label="Require Phone Number" description="Phone is needed for COD delivery coordination" checked={s.requirePhone} onChange={v => set("requirePhone", v)} disabled={!canEdit} badge="Nepal" />
          <ToggleRow label="Require Company Name" description="For B2B stores that need company details" checked={s.requireCompany} onChange={v => set("requireCompany", v)} disabled={!canEdit} />
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
