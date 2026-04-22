import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { ShippingSettingsClient } from "./shipping-settings-client";
import { getShippingZones } from "./actions";

export const metadata: Metadata = {
    title: "Shipping Settings | Dashboard",
    description: "Configure shipping zones, rates, and delivery options.",
};

export default async function ShippingSettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
    if (!userData?.tenant_id) redirect("/login");

    const { data: tenant } = await supabase.from("tenants").select("currency, settings").eq("id", userData.tenant_id).single();
    const settings = (tenant?.settings ?? {}) as Record<string, unknown>;

    // Fetch real shipping zones from DB
    const { data: zones } = await getShippingZones();

    const shippingData = {
        zones: (zones ?? []).map((z: Record<string, unknown>) => ({
            id: z.id as string,
            name: z.name as string,
            regions: ((z.shipping_zone_countries as Array<Record<string, string>>) ?? []).map(c => c.country_code ?? c.name ?? ""),
            rates: ((z.shipping_rates as Array<Record<string, unknown>>) ?? []).map(r => ({
                id: r.id as string,
                name: r.name as string,
                price: (r.price as number) ?? 0,
                min_days: (r.min_delivery_days as number) ?? 0,
                max_days: (r.max_delivery_days as number) ?? 0,
            })),
        })),
        freeShippingThreshold: (settings.free_shipping_threshold as number) ?? null,
        defaultHandlingTime: (settings.default_handling_time as number) ?? 1,
        carriers: [],
        packages: [],
    };

    return (
        <ShippingSettingsClient 
            data={shippingData} 
            currency={tenant?.currency || "USD"} 
        />
    );
}
