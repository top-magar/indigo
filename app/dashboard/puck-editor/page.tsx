import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PuckPagesClient } from "./puck-pages-client";

export const metadata: Metadata = {
    title: "Page Editor | Puck",
    description: "Manage your store pages with the Puck visual editor.",
};

export default async function PuckEditorPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

    // Fetch pages
    const { data: pages } = await supabase
        .from("store_pages")
        .select("id, title, slug, status, page_type, updated_at")
        .eq("tenant_id", userData.tenant_id)
        .order("updated_at", { ascending: false });

    return <PuckPagesClient pages={pages || []} />;
}
