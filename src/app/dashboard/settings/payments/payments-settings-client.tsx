"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Banknote, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type PaymentSettings, updatePaymentSettings } from "./actions";

interface PaymentsSettingsClientProps {
  initialSettings: PaymentSettings;
}

export function PaymentsSettingsClient({ initialSettings }: PaymentsSettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updatePaymentSettings(settings);
      if (result.success) toast.success("Payment settings saved");
      else toast.error(result.error ?? "Failed to save");
    });
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Payments</h2>
          <p className="text-sm text-muted-foreground">Manage your payment methods and bank details.</p>
        </div>
        <Button onClick={handleSave} disabled={isPending || !hasChanges}>
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Banknote className="h-8 w-8 text-green-600" />
          <div className="flex-1">
            <CardTitle className="text-sm">Cash on Delivery</CardTitle>
            <CardDescription>Customers pay when they receive their order</CardDescription>
          </div>
          <Badge variant={settings.cashOnDelivery ? "default" : "outline"}>
            {settings.cashOnDelivery ? "Active" : "Inactive"}
          </Badge>
          <Switch
            checked={settings.cashOnDelivery}
            onCheckedChange={(v) => setSettings({ ...settings, cashOnDelivery: v })}
          />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Building2 className="h-8 w-8 text-info" />
          <div className="flex-1">
            <CardTitle className="text-sm">Bank Transfer</CardTitle>
            <CardDescription>Customers transfer to your bank account</CardDescription>
          </div>
          <Badge variant={settings.bankTransfer ? "default" : "outline"}>
            {settings.bankTransfer ? "Active" : "Inactive"}
          </Badge>
          <Switch
            checked={settings.bankTransfer}
            onCheckedChange={(v) => setSettings({ ...settings, bankTransfer: v })}
          />
        </CardHeader>
        {settings.bankTransfer && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={settings.bankName}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  placeholder="e.g. Nepal Bank Ltd"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  value={settings.accountHolderName}
                  onChange={(e) => setSettings({ ...settings, accountHolderName: e.target.value })}
                  placeholder="Full name on account"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={settings.accountNumber}
                  onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                  placeholder="Account number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={settings.branch}
                  onChange={(e) => setSettings({ ...settings, branch: e.target.value })}
                  placeholder="Branch name"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
