import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShippingSettingsClient } from "./shipping-settings-client";

export const metadata: Metadata = {
    title: "Shipping Settings | Dashboard",
    description: "Configure shipping zones, rates, and delivery options.",
};

export default async function ShippingSettingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

    const { data: tenant } = await supabase
        .from("tenants")
        .select("currency")
        .eq("id", userData.tenant_id)
        .single();

    // Mock shipping data - in production, fetch from shipping_zones table
    const shippingData = {
        zones: [
            {
                id: "1",
                name: "Kathmandu Valley",
                regions: ["Domestic"],
                rates: [
                    { id: "1", name: "Standard Delivery", price: 100, min_days: 1, max_days: 2 },
                    { id: "2", name: "Express Delivery", price: 200, min_days: 0, max_days: 1 },
                ],
            },
            {
                id: "2",
                name: "Outside Valley",
                regions: ["Domestic"],
                rates: [
                    { id: "3", name: "Standard Delivery", price: 250, min_days: 3, max_days: 5 },
                ],
            },
        ],
        freeShippingThreshold: 2500,
        defaultHandlingTime: 1,
        carriers: [],
        packages: [],
    };

    return (
        <ShippingSettingsClient 
            data={shippingData} 
            currency={tenant?.currency || "NPR"} 
        />
    );
}
