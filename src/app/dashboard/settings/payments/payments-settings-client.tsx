"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Banknote, Building2, Wallet, CreditCard } from "lucide-react";
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
    <div className="max-w-3xl space-y-3">
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

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Wallet className="h-8 w-8 text-green-500" />
          <div className="flex-1">
            <CardTitle className="text-sm">eSewa</CardTitle>
            <CardDescription>Accept payments via eSewa digital wallet</CardDescription>
          </div>
          <Badge variant={settings.esewa ? "default" : "outline"}>
            {settings.esewa ? "Active" : "Inactive"}
          </Badge>
          <Switch
            checked={settings.esewa}
            onCheckedChange={(v) => setSettings({ ...settings, esewa: v })}
          />
        </CardHeader>
        {settings.esewa && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="esewaMerchantCode">Merchant Code</Label>
                <Input
                  id="esewaMerchantCode"
                  value={settings.esewamerchantCode}
                  onChange={(e) => setSettings({ ...settings, esewamerchantCode: e.target.value })}
                  placeholder="e.g. EPAYTEST"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="esewaSecret">Secret Key</Label>
                <Input
                  id="esewaSecret"
                  type="password"
                  value={settings.esewaSecret}
                  onChange={(e) => setSettings({ ...settings, esewaSecret: e.target.value })}
                  placeholder="Your eSewa secret key"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Get your credentials from the <a href="https://developer.esewa.com.np" target="_blank" rel="noopener noreferrer" className="underline">eSewa Developer Portal</a></p>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <CreditCard className="h-8 w-8 text-purple-600" />
          <div className="flex-1">
            <CardTitle className="text-sm">Khalti</CardTitle>
            <CardDescription>Accept payments via Khalti digital wallet</CardDescription>
          </div>
          <Badge variant={settings.khalti ? "default" : "outline"}>
            {settings.khalti ? "Active" : "Inactive"}
          </Badge>
          <Switch
            checked={settings.khalti}
            onCheckedChange={(v) => setSettings({ ...settings, khalti: v })}
          />
        </CardHeader>
        {settings.khalti && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="khaltiSecretKey">Secret Key</Label>
              <Input
                id="khaltiSecretKey"
                type="password"
                value={settings.khaltiSecretKey}
                onChange={(e) => setSettings({ ...settings, khaltiSecretKey: e.target.value })}
                placeholder="Your Khalti secret key"
              />
            </div>
            <p className="text-xs text-muted-foreground">Get your credentials from the <a href="https://khalti.com/join/merchant" target="_blank" rel="noopener noreferrer" className="underline">Khalti Merchant Portal</a></p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
