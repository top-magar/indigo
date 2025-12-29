import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GeneralSettingsClient } from "./general-settings-client";

export const metadata: Metadata = {
    title: "Store Settings | Dashboard",
    description: "Manage your store settings and preferences.",
};

export default async function SettingsPage() {
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
        .select("*")
        .eq("id", userData.tenant_id)
        .single();

    if (!tenant) redirect("/auth/login");

    return (
        <GeneralSettingsClient 
            tenant={tenant} 
            userRole={userData.role}
        />
    );
}
