import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StoreEditorClient } from "./store-editor-client";
import { getStorePages } from "./actions";

export const metadata: Metadata = {
    title: "Store Editor | Dashboard",
    description: "Customize your store pages with the visual editor.",
};

export default async function StoreEditorPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

    // Get tenant info
    const { data: tenant } = await supabase
        .from("tenants")
        .select("slug, name")
        .eq("id", userData.tenant_id)
        .single();

    const pages = await getStorePages();

    return (
        <StoreEditorClient
            pages={pages}
            storeSlug={tenant?.slug || ""}
            storeName={tenant?.name || "My Store"}
        />
    );
}
