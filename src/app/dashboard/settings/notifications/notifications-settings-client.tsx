"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Notification01Icon,
    ShoppingCart01Icon,
    Alert02Icon,
    UserIcon,
    AnalyticsUpIcon,
    Mail01Icon,
    Loading01Icon,
    CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { updateNotificationSettings } from "../actions";

interface NotificationSettings {
    orderNotifications: boolean;
    lowStockAlerts: boolean;
    lowStockThreshold: number;
    customerSignups: boolean;
    weeklyReports: boolean;
    marketingEmails: boolean;
}

interface NotificationsSettingsClientProps {
    settings: NotificationSettings;
    userRole: "owner" | "admin" | "staff";
}

export function NotificationsSettingsClient({ settings: initialSettings, userRole }: NotificationsSettingsClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [settings, setSettings] = useState(initialSettings);

    const canEdit = userRole === "owner" || userRole === "admin";

    const handleSave = async () => {
        const formData = new FormData();
        formData.set("orderNotifications", String(settings.orderNotifications));
        formData.set("lowStockAlerts", String(settings.lowStockAlerts));
        formData.set("lowStockThreshold", String(settings.lowStockThreshold));
        formData.set("customerSignups", String(settings.customerSignups));
        formData.set("weeklyReports", String(settings.weeklyReports));
        formData.set("marketingEmails", String(settings.marketingEmails));

        startTransition(async () => {
            const result = await updateNotificationSettings(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Notification settings saved");
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                <p className="text-muted-foreground">
                    Choose what notifications you want to receive
                </p>
            </div>

            {/* Order Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={ShoppingCart01Icon} className="w-5 h-5" />
                        Order Notifications
                    </CardTitle>
                    <CardDescription>Get notified about new orders and updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>New Order Alerts</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive an email when a new order is placed
                            </p>
                        </div>
                        <Switch
                            checked={settings.orderNotifications}
                            onCheckedChange={(checked) => setSettings(s => ({ ...s, orderNotifications: checked }))}
                            disabled={!canEdit}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Inventory Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={Alert02Icon} className="w-5 h-5" />
                        Inventory Alerts
                    </CardTitle>
                    <CardDescription>Stay informed about your stock levels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Low Stock Alerts</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified when products are running low
                            </p>
                        </div>
                        <Switch
                            checked={settings.lowStockAlerts}
                            onCheckedChange={(checked) => setSettings(s => ({ ...s, lowStockAlerts: checked }))}
                            disabled={!canEdit}
                        />
                    </div>
                    
                    {settings.lowStockAlerts && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="threshold">Low Stock Threshold</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="threshold"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={settings.lowStockThreshold}
                                        onChange={(e) => setSettings(s => ({ ...s, lowStockThreshold: parseInt(e.target.value) || 10 }))}
                                        className="w-24"
                                        disabled={!canEdit}
                                    />
                                    <span className="text-sm text-muted-foreground">units</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Alert when stock falls below this number
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Customer Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={UserIcon} className="w-5 h-5" />
                        Customer Notifications
                    </CardTitle>
                    <CardDescription>Updates about your customers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>New Customer Signups</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified when a new customer creates an account
                            </p>
                        </div>
                        <Switch
                            checked={settings.customerSignups}
                            onCheckedChange={(checked) => setSettings(s => ({ ...s, customerSignups: checked }))}
                            disabled={!canEdit}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Reports */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={AnalyticsUpIcon} className="w-5 h-5" />
                        Reports & Insights
                    </CardTitle>
                    <CardDescription>Periodic reports about your store performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Weekly Performance Report</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive a summary of your store&apos;s performance every week
                            </p>
                        </div>
                        <Switch
                            checked={settings.weeklyReports}
                            onCheckedChange={(checked) => setSettings(s => ({ ...s, weeklyReports: checked }))}
                            disabled={!canEdit}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Marketing */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={Mail01Icon} className="w-5 h-5" />
                        Marketing & Updates
                    </CardTitle>
                    <CardDescription>Platform updates and tips</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Product Updates & Tips</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive tips, best practices, and platform updates
                            </p>
                        </div>
                        <Switch
                            checked={settings.marketingEmails}
                            onCheckedChange={(checked) => setSettings(s => ({ ...s, marketingEmails: checked }))}
                            disabled={!canEdit}
                        />
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
                                Save Preferences
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}