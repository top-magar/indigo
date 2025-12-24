import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotificationsSettingsClient } from "./notifications-settings-client";

export const metadata: Metadata = {
    title: "Notification Settings | Dashboard",
    description: "Manage your notification preferences.",
};

export default async function NotificationsSettingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id, role")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

    const { data: tenant } = await supabase
        .from("tenants")
        .select("settings")
        .eq("id", userData.tenant_id)
        .single();

    const settings = (tenant?.settings as Record<string, any>) || {};
    const notificationSettings = settings.notifications || {};

    return (
        <NotificationsSettingsClient 
            settings={{
                orderNotifications: notificationSettings.orderNotifications ?? true,
                lowStockAlerts: notificationSettings.lowStockAlerts ?? true,
                lowStockThreshold: notificationSettings.lowStockThreshold ?? 10,
                customerSignups: notificationSettings.customerSignups ?? false,
                weeklyReports: notificationSettings.weeklyReports ?? true,
                marketingEmails: notificationSettings.marketingEmails ?? false,
            }}
            userRole={userData.role}
        />
    );
}
