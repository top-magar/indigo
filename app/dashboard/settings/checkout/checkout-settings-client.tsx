"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ShoppingCart01Icon,
    UserIcon,
    FileEditIcon,
    Loading01Icon,
    CheckmarkCircle02Icon,
    LinkSquare01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { updateCheckoutSettings } from "../actions";

interface CheckoutSettings {
    guestCheckout: boolean;
    requirePhone: boolean;
    requireCompany: boolean;
    orderNotes: boolean;
    termsUrl: string;
    privacyUrl: string;
    refundPolicy: string;
}

interface CheckoutSettingsClientProps {
    settings: CheckoutSettings;
    userRole: "owner" | "admin" | "staff";
}

export function CheckoutSettingsClient({ settings: initialSettings, userRole }: CheckoutSettingsClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [settings, setSettings] = useState(initialSettings);

    const canEdit = userRole === "owner" || userRole === "admin";

    const handleSave = async () => {
        const formData = new FormData();
        formData.set("guestCheckout", String(settings.guestCheckout));
        formData.set("requirePhone", String(settings.requirePhone));
        formData.set("requireCompany", String(settings.requireCompany));
        formData.set("orderNotes", String(settings.orderNotes));
        formData.set("termsUrl", settings.termsUrl);
        formData.set("privacyUrl", settings.privacyUrl);
        formData.set("refundPolicy", settings.refundPolicy);

        startTransition(async () => {
            const result = await updateCheckoutSettings(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Checkout settings saved");
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Checkout Settings</h1>
                <p className="text-muted-foreground">
                    Configure your checkout experience and customer requirements
                </p>
            </div>

            {/* Customer Options */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={UserIcon} className="w-5 h-5" />
                        Customer Options
                    </CardTitle>
                    <CardDescription>Control how customers can checkout</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Guest Checkout</Label>
                            <p className="text-sm text-muted-foreground">
                                Allow customers to checkout without creating an account
                            </p>
                        </div>
                        <Switch
                            checked={settings.guestCheckout}
                            onCheckedChange={(checked) => setSettings(s => ({ ...s, guestCheckout: checked }))}
                            disabled={!canEdit}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Order Notes</Label>
                            <p className="text-sm text-muted-foreground">
                                Allow customers to add notes to their orders
                            </p>
                        </div>
                        <Switch
                            checked={settings.orderNotes}
                            onCheckedChange={(checked) => setSettings(s => ({ ...s, orderNotes: checked }))}
                            disabled={!canEdit}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Required Fields */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={ShoppingCart01Icon} className="w-5 h-5" />
                        Required Fields
                    </CardTitle>
                    <CardDescription>Choose which fields are required at checkout</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Phone Number</Label>
                            <p className="text-sm text-muted-foreground">
                                Require customers to provide a phone number
                            </p>
                        </div>
                        <Switch
                            checked={settings.requirePhone}
                            onCheckedChange={(checked) => setSettings(s => ({ ...s, requirePhone: checked }))}
                            disabled={!canEdit}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Company Name</Label>
                            <p className="text-sm text-muted-foreground">
                                Require customers to provide a company name (B2B)
                            </p>
                        </div>
                        <Switch
                            checked={settings.requireCompany}
                            onCheckedChange={(checked) => setSettings(s => ({ ...s, requireCompany: checked }))}
                            disabled={!canEdit}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Legal Pages */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={FileEditIcon} className="w-5 h-5" />
                        Legal & Policies
                    </CardTitle>
                    <CardDescription>Links to your legal pages shown at checkout</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="termsUrl">Terms of Service URL</Label>
                        <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={LinkSquare01Icon} className="w-4 h-4 text-muted-foreground" />
                            <Input
                                id="termsUrl"
                                value={settings.termsUrl}
                                onChange={(e) => setSettings(s => ({ ...s, termsUrl: e.target.value }))}
                                placeholder="https://yourstore.com/terms"
                                disabled={!canEdit}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="privacyUrl">Privacy Policy URL</Label>
                        <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={LinkSquare01Icon} className="w-4 h-4 text-muted-foreground" />
                            <Input
                                id="privacyUrl"
                                value={settings.privacyUrl}
                                onChange={(e) => setSettings(s => ({ ...s, privacyUrl: e.target.value }))}
                                placeholder="https://yourstore.com/privacy"
                                disabled={!canEdit}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="refundPolicy">Refund Policy</Label>
                        <Textarea
                            id="refundPolicy"
                            value={settings.refundPolicy}
                            onChange={(e) => setSettings(s => ({ ...s, refundPolicy: e.target.value }))}
                            placeholder="Describe your refund policy..."
                            rows={4}
                            disabled={!canEdit}
                        />
                        <p className="text-xs text-muted-foreground">
                            This will be displayed on the checkout page and order confirmation
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            {canEdit && (
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? (
                            <>
                                <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 mr-2" />
                                Save Settings
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}