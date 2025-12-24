"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { StorePage, PageBlock, PageSettings, StoreTheme, BlockTemplate } from "@/types/page-builder";

// =====================================================
// AUTH HELPER
// =====================================================

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

// =====================================================
// PAGE CRUD OPERATIONS
// =====================================================

export async function getStorePages(): Promise<StorePage[]> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { data, error } = await supabase
        .from("store_pages")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("updated_at", { ascending: false });

    if (error) {
        // Table might not exist yet - return empty array gracefully
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
            console.warn("store_pages table not found. Please run the migration: scripts/supabase/012-create-store-pages.sql");
            return [];
        }
        console.error("Error fetching pages:", error.message || error);
        return [];
    }

    return data || [];
}

export async function getStorePage(pageId: string): Promise<StorePage | null> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { data, error } = await supabase
        .from("store_pages")
        .select("*")
        .eq("id", pageId)
        .eq("tenant_id", tenantId)
        .single();

    if (error) {
        console.error("Error fetching page:", error);
        return null;
    }

    return data;
}

export async function getStorePageBySlug(slug: string): Promise<StorePage | null> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { data, error } = await supabase
        .from("store_pages")
        .select("*")
        .eq("slug", slug)
        .eq("tenant_id", tenantId)
        .single();

    if (error) {
        console.error("Error fetching page by slug:", error);
        return null;
    }

    return data;
}

export async function createStorePage(
    title: string,
    pageType: StorePage["page_type"] = "custom"
): Promise<{ success: boolean; pageId?: string; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    // Generate slug from title
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    // Check for existing slug and make unique if needed
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

    // Default blocks based on page type
    const defaultBlocks: PageBlock[] = pageType === "home" ? [
        {
            id: crypto.randomUUID(),
            type: "hero",
            visible: true,
            settings: { padding: { top: 0, right: 0, bottom: 0, left: 0 } },
            content: {
                layout: "center",
                heading: "Welcome to Our Store",
                subheading: "Discover amazing products",
                description: "Shop the latest collection with free shipping on orders over $50",
                primaryButton: { text: "Shop Now", link: "/products", style: "primary" },
                height: "large",
            },
        },
        {
            id: crypto.randomUUID(),
            type: "featured-products",
            visible: true,
            settings: { padding: { top: 64, right: 0, bottom: 64, left: 0 } },
            content: {
                heading: "Featured Products",
                subheading: "Our most popular items",
                source: "latest",
                limit: 4,
                columns: 4,
                showPrice: true,
                showAddToCart: true,
                showQuickView: false,
            },
        },
    ] : [];

    const { data, error } = await supabase
        .from("store_pages")
        .insert({
            tenant_id: tenantId,
            title,
            slug,
            page_type: pageType,
            status: "draft",
            is_homepage: pageType === "home",
            blocks: defaultBlocks,
            settings: { showHeader: true, showFooter: true },
        })
        .select("id")
        .single();

    if (error) {
        console.error("Error creating page:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/store-editor");
    return { success: true, pageId: data.id };
}

export async function updateStorePage(
    pageId: string,
    updates: Partial<Pick<StorePage, "title" | "slug" | "meta_title" | "meta_description" | "status" | "is_homepage" | "blocks" | "settings" | "craft_data">>
): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId, userId } = await getAuthenticatedTenant();

    // If updating blocks, save a version first
    if (updates.blocks) {
        const { data: currentPage } = await supabase
            .from("store_pages")
            .select("blocks")
            .eq("id", pageId)
            .eq("tenant_id", tenantId)
            .single();

        if (currentPage) {
            // Get current version number
            const { data: versions } = await supabase
                .from("store_page_versions")
                .select("version_number")
                .eq("page_id", pageId)
                .order("version_number", { ascending: false })
                .limit(1);

            const nextVersion = (versions?.[0]?.version_number || 0) + 1;

            // Save version (keep last 50 versions)
            await supabase
                .from("store_page_versions")
                .insert({
                    page_id: pageId,
                    tenant_id: tenantId,
                    version_number: nextVersion,
                    blocks: currentPage.blocks,
                    created_by: userId,
                });

            // Clean up old versions (keep last 50)
            if (nextVersion > 50) {
                await supabase
                    .from("store_page_versions")
                    .delete()
                    .eq("page_id", pageId)
                    .lt("version_number", nextVersion - 50);
            }
        }
    }

    // Handle publishing
    const updateData: Record<string, unknown> = { ...updates };
    if (updates.status === "published") {
        updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from("store_pages")
        .update(updateData)
        .eq("id", pageId)
        .eq("tenant_id", tenantId);

    if (error) {
        console.error("Error updating page:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/store-editor");
    revalidatePath(`/dashboard/store-editor/${pageId}`);
    return { success: true };
}

export async function deleteStorePage(pageId: string): Promise<{ success: boolean; error?: string }> {
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

    revalidatePath("/dashboard/store-editor");
    return { success: true };
}

export async function duplicateStorePage(pageId: string): Promise<{ success: boolean; pageId?: string; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    // Get original page
    const { data: original, error: fetchError } = await supabase
        .from("store_pages")
        .select("*")
        .eq("id", pageId)
        .eq("tenant_id", tenantId)
        .single();

    if (fetchError || !original) {
        return { success: false, error: "Page not found" };
    }

    // Generate new slug
    const baseSlug = `${original.slug}-copy`;
    const { data: existing } = await supabase
        .from("store_pages")
        .select("slug")
        .eq("tenant_id", tenantId)
        .like("slug", `${baseSlug}%`);

    let slug = baseSlug;
    if (existing && existing.length > 0) {
        slug = `${baseSlug}-${existing.length}`;
    }

    // Create duplicate
    const { data, error } = await supabase
        .from("store_pages")
        .insert({
            tenant_id: tenantId,
            title: `${original.title} (Copy)`,
            slug,
            page_type: original.page_type === "home" ? "custom" : original.page_type,
            status: "draft",
            is_homepage: false,
            meta_title: original.meta_title,
            meta_description: original.meta_description,
            blocks: original.blocks,
            settings: original.settings,
        })
        .select("id")
        .single();

    if (error) {
        console.error("Error duplicating page:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/store-editor");
    return { success: true, pageId: data.id };
}

// =====================================================
// VERSION HISTORY
// =====================================================

export async function getPageVersions(pageId: string): Promise<{ version_number: number; created_at: string }[]> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { data, error } = await supabase
        .from("store_page_versions")
        .select("version_number, created_at")
        .eq("page_id", pageId)
        .eq("tenant_id", tenantId)
        .order("version_number", { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching versions:", error);
        return [];
    }

    return data || [];
}

export async function restorePageVersion(
    pageId: string,
    versionNumber: number
): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    // Get the version
    const { data: version, error: fetchError } = await supabase
        .from("store_page_versions")
        .select("blocks, settings")
        .eq("page_id", pageId)
        .eq("tenant_id", tenantId)
        .eq("version_number", versionNumber)
        .single();

    if (fetchError || !version) {
        return { success: false, error: "Version not found" };
    }

    // Update the page with the version's blocks
    return updateStorePage(pageId, {
        blocks: version.blocks,
        settings: version.settings,
    });
}

// =====================================================
// THEME OPERATIONS
// =====================================================

export async function getStoreTheme(): Promise<StoreTheme | null> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { data, error } = await supabase
        .from("store_themes")
        .select("*")
        .eq("tenant_id", tenantId)
        .single();

    if (error && error.code !== "PGRST116") {
        console.error("Error fetching theme:", error);
    }

    return data || null;
}

export async function updateStoreTheme(
    updates: Partial<Pick<StoreTheme, "theme_name" | "colors" | "typography" | "layout" | "custom_css">>
): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    // Check if theme exists
    const { data: existing } = await supabase
        .from("store_themes")
        .select("id")
        .eq("tenant_id", tenantId)
        .single();

    if (existing) {
        const { error } = await supabase
            .from("store_themes")
            .update(updates)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: error.message };
        }
    } else {
        const { error } = await supabase
            .from("store_themes")
            .insert({ tenant_id: tenantId, ...updates });

        if (error) {
            return { success: false, error: error.message };
        }
    }

    revalidatePath("/dashboard/store-editor");
    return { success: true };
}

// =====================================================
// BLOCK TEMPLATES
// =====================================================

export async function getBlockTemplates(): Promise<BlockTemplate[]> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { data, error } = await supabase
        .from("store_block_templates")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching templates:", error);
        return [];
    }

    return data || [];
}

export async function saveBlockTemplate(
    name: string,
    block: PageBlock
): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { error } = await supabase
        .from("store_block_templates")
        .insert({
            tenant_id: tenantId,
            name,
            block_type: block.type,
            block_data: block,
        });

    if (error) {
        console.error("Error saving template:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function deleteBlockTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { error } = await supabase
        .from("store_block_templates")
        .delete()
        .eq("id", templateId)
        .eq("tenant_id", tenantId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

// =====================================================
// DATA FETCHING FOR BLOCKS
// =====================================================

export async function getProductsForEditor(options?: {
    categoryId?: string;
    collectionId?: string;
    productIds?: string[];
    limit?: number;
}) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    let query = supabase
        .from("products")
        .select("id, name, slug, price, compare_at_price, images, status")
        .eq("tenant_id", tenantId)
        .eq("status", "active");

    if (options?.categoryId) {
        query = query.eq("category_id", options.categoryId);
    }

    if (options?.productIds && options.productIds.length > 0) {
        query = query.in("id", options.productIds);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }

    return data || [];
}

export async function getCategoriesForEditor() {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .eq("tenant_id", tenantId)
        .order("sort_order");

    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }

    return data || [];
}

export async function getCollectionsForEditor() {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { data, error } = await supabase
        .from("collections")
        .select("id, name, slug, image_url")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("sort_order");

    if (error) {
        console.error("Error fetching collections:", error);
        return [];
    }

    return data || [];
}
