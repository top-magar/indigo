import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PuckEditorClient } from "./puck-editor-client";

export const metadata: Metadata = {
    title: "Page Editor",
    description: "Edit your store page with the visual editor.",
};

interface PageEditorProps {
    params: Promise<{ pageId: string }>;
}

export default async function PuckEditorPage({ params }: PageEditorProps) {
    const { pageId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

    // Fetch page data
    const { data: page, error } = await supabase
        .from("store_pages")
        .select("*")
        .eq("id", pageId)
        .eq("tenant_id", userData.tenant_id)
        .single();

    if (error || !page) {
        notFound();
    }

    return (
        <PuckEditorClient
            pageId={page.id}
            pageTitle={page.title}
            initialData={page.puck_data || null}
        />
    );
}
