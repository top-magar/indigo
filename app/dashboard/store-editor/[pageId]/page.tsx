import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditorClient } from "./editor-client";
import { getStorePage, getProductsForEditor, getCategoriesForEditor, getCollectionsForEditor, getStoreTheme, getBlockTemplates } from "../actions";

export const metadata: Metadata = {
    title: "Page Editor",
    description: "Edit your store page with the visual editor.",
};

interface PageEditorProps {
    params: Promise<{ pageId: string }>;
}

export default async function PageEditorPage({ params }: PageEditorProps) {
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

    // Get tenant info for store slug
    const { data: tenant } = await supabase
        .from("tenants")
        .select("slug")
        .eq("id", userData.tenant_id)
        .single();

    if (!tenant?.slug) redirect("/dashboard");

    // Fetch page and related data
    const [page, products, categories, collections, theme, blockTemplates] = await Promise.all([
        getStorePage(pageId),
        getProductsForEditor({ limit: 50 }),
        getCategoriesForEditor(),
        getCollectionsForEditor(),
        getStoreTheme(),
        getBlockTemplates(),
    ]);

    if (!page) {
        notFound();
    }

    return (
        <EditorClient
            page={page}
            products={products}
            categories={categories}
            collections={collections}
            storeSlug={tenant.slug}
            theme={theme}
            blockTemplates={blockTemplates}
        />
    );
}
