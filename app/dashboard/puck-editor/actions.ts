"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Data } from "@measured/puck";

async function getAuthenticatedTenant() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/auth/login");
    }

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) {
        redirect("/auth/login");
    }

    return { supabase, tenantId: userData.tenant_id, userId: user.id };
}

export async function savePuckPage(
    pageId: string,
    data: Data
): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { error } = await supabase
        .from("store_pages")
        .update({
            puck_data: data,
            updated_at: new Date().toISOString(),
        })
        .eq("id", pageId)
        .eq("tenant_id", tenantId);

    if (error) {
        console.error("Error saving page:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/puck-editor");
    revalidatePath(`/dashboard/puck-editor/${pageId}`);
    return { success: true };
}

export async function getPuckPages() {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { data, error } = await supabase
        .from("store_pages")
        .select("id, title, slug, status, updated_at")
        .eq("tenant_id", tenantId)
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("Error fetching pages:", error);
        return [];
    }

    return data || [];
}

export async function createPuckPage(
    title: string
): Promise<{ success: boolean; pageId?: string; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    // Generate slug from title
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    // Check for existing slug
    const { data: existing } = await supabase
        .from("store_pages")
        .select("slug")
        .eq("tenant_id", tenantId)
        .like("slug", `${baseSlug}%`);

    let slug = baseSlug;
    if (existing && existing.length > 0) {
        const existingSlugs = existing.map(p => p.slug);
        let counter = 1;
        while (existingSlugs.includes(slug)) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    // Create page with empty Puck data
    const { data, error } = await supabase
        .from("store_pages")
        .insert({
            tenant_id: tenantId,
            title,
            slug,
            page_type: "custom",
            status: "draft",
            is_homepage: false,
            puck_data: { content: [], root: { props: {} } },
            blocks: [],
            settings: {},
        })
        .select("id")
        .single();

    if (error) {
        console.error("Error creating page:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/puck-editor");
    return { success: true, pageId: data.id };
}

export async function deletePuckPage(pageId: string): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { error } = await supabase
        .from("store_pages")
        .delete()
        .eq("id", pageId)
        .eq("tenant_id", tenantId);

    if (error) {
        console.error("Error deleting page:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/puck-editor");
    return { success: true };
}
