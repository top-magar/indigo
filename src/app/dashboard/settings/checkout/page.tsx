import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { CheckoutSettingsClient } from "./checkout-settings-client";

export const metadata: Metadata = {
    title: "Checkout Settings | Dashboard",
    description: "Configure your checkout experience.",
};

export default async function CheckoutSettingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id, role")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/login");

    const { data: tenant } = await supabase
        .from("tenants")
        .select("settings")
        .eq("id", userData.tenant_id)
        .single();

    const settings = (tenant?.settings as Record<string, any>) || {};
    const checkoutSettings = settings.checkout || {};

    return (
        <CheckoutSettingsClient 
            settings={{
                guestCheckout: checkoutSettings.guestCheckout ?? true,
                requirePhone: checkoutSettings.requirePhone ?? false,
                requireCompany: checkoutSettings.requireCompany ?? false,
                orderNotes: checkoutSettings.orderNotes ?? true,
                termsUrl: checkoutSettings.termsUrl || "",
                privacyUrl: checkoutSettings.privacyUrl || "",
                refundPolicy: checkoutSettings.refundPolicy || "",
            }}
            userRole={userData.role}
        />
    );
}
