"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { type TaxSettings, updateTaxSettings } from "./actions";

interface TaxSettingsClientProps {
    initialSettings: TaxSettings;
}

export function TaxSettingsClient({ initialSettings }: TaxSettingsClientProps) {
    const [settings, setSettings] = useState(initialSettings);
    const [isPending, startTransition] = useTransition();

    function handleSave() {
        startTransition(async () => {
            const result = await updateTaxSettings(settings);
            if (result.success) toast.success("Tax settings saved");
            else toast.error(result.error ?? "Failed to save");
        });
    }

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold">Tax</h2>
                    <p className="text-sm text-muted-foreground">Configure how taxes are calculated and displayed.</p>
                </div>
                <Button onClick={handleSave} disabled={isPending || !hasChanges}>
                    {isPending ? "Saving…" : "Save"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tax Rate</CardTitle>
                    <CardDescription>Set the default tax rate applied to products.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="taxName">Tax Name</Label>
                            <Input
                                id="taxName"
                                value={settings.taxName}
                                onChange={(e) => setSettings({ ...settings, taxName: e.target.value })}
                                placeholder="e.g. VAT, GST, Sales Tax"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="defaultRate">Default Rate (%)</Label>
                            <Input
                                id="defaultRate"
                                type="number"
                                min={0}
                                max={100}
                                step={0.01}
                                value={settings.defaultRate}
                                onChange={(e) => setSettings({ ...settings, defaultRate: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="registrationNumber">Tax Registration Number</Label>
                        <Input
                            id="registrationNumber"
                            value={settings.registrationNumber}
                            onChange={(e) => setSettings({ ...settings, registrationNumber: e.target.value })}
                            placeholder="e.g. VAT/PAN number"
                        />
                        <p className="text-xs text-muted-foreground">Displayed on invoices. Leave blank if not registered.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tax Behavior</CardTitle>
                    <CardDescription>Control how taxes are calculated and shown to customers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Prices include tax</Label>
                            <p className="text-sm text-muted-foreground">Product prices already include tax (tax-inclusive pricing).</p>
                        </div>
                        <Switch
                            checked={settings.priceIncludesTax}
                            onCheckedChange={(v) => setSettings({ ...settings, priceIncludesTax: v })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Auto-apply to new products</Label>
                            <p className="text-sm text-muted-foreground">Automatically apply the default tax rate to newly created products.</p>
                        </div>
                        <Switch
                            checked={settings.autoApplyToNewProducts}
                            onCheckedChange={(v) => setSettings({ ...settings, autoApplyToNewProducts: v })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Show tax in cart</Label>
                            <p className="text-sm text-muted-foreground">Display tax breakdown as a separate line item in the cart.</p>
                        </div>
                        <Switch
                            checked={settings.displayTaxInCart}
                            onCheckedChange={(v) => setSettings({ ...settings, displayTaxInCart: v })}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
