"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Collection } from "@/infrastructure/supabase/types";

async function getAuthenticatedTenant() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/login");
    }

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) {
        redirect("/login");
    }

    return { supabase, tenantId: userData.tenant_id };
}

export async function createCollection(formData: FormData): Promise<{ error?: string; collection?: Collection }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string;
        const description = formData.get("description") as string;
        const imageUrl = formData.get("imageUrl") as string;
        const isActive = formData.get("isActive") === "true";
        const type = formData.get("type") as "manual" | "automatic";

        if (!name?.trim()) {
            return { error: "Collection name is required" };
        }

        // Check for duplicate slug
        const { data: existing } = await supabase
            .from("collections")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("slug", slug)
            .single();

        let finalSlug = slug;
        if (existing) {
            finalSlug = `${slug}-${Date.now()}`;
        }

        // Get max sort order
        const { data: maxOrder } = await supabase
            .from("collections")
            .select("sort_order")
            .eq("tenant_id", tenantId)
            .order("sort_order", { ascending: false })
            .limit(1)
            .single();

        const sortOrder = (maxOrder?.sort_order || 0) + 1;

        const { data: collection, error } = await supabase
            .from("collections")
            .insert({
                tenant_id: tenantId,
                name,
                slug: finalSlug,
                description: description || null,
                image_url: imageUrl || null,
                is_active: isActive,
                type,
                sort_order: sortOrder,
                conditions: null,
                metadata: {},
            })
            .select()
            .single();

        if (error) {
            console.error("Create collection error:", error);
            return { error: `Failed to create collection: ${error.message}` };
        }

        revalidatePath("/dashboard/collections");
        revalidatePath("/dashboard/products/new");
        return { collection };
    } catch (err) {
        console.error("Create collection error:", err);
        return { error: err instanceof Error ? err.message : "Failed to create collection" };
    }
}

export async function updateCollection(formData: FormData): Promise<{ error?: string; collection?: Collection }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string;
        const description = formData.get("description") as string;
        const imageUrl = formData.get("imageUrl") as string;
        const isActive = formData.get("isActive") === "true";
        const type = formData.get("type") as "manual" | "automatic";

        if (!name?.trim()) {
            return { error: "Collection name is required" };
        }

        // Check for duplicate slug (excluding current collection)
        const { data: existing } = await supabase
            .from("collections")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("slug", slug)
            .neq("id", id)
            .single();

        let finalSlug = slug;
        if (existing) {
            finalSlug = `${slug}-${Date.now()}`;
        }

        const { data: collection, error } = await supabase
            .from("collections")
            .update({
                name,
                slug: finalSlug,
                description: description || null,
                image_url: imageUrl || null,
                is_active: isActive,
                type,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("tenant_id", tenantId)
            .select()
            .single();

        if (error) {
            console.error("Update collection error:", error);
            return { error: `Failed to update collection: ${error.message}` };
        }

        revalidatePath("/dashboard/collections");
        revalidatePath("/dashboard/products/new");
        return { collection };
    } catch (err) {
        console.error("Update collection error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update collection" };
    }
}

export async function deleteCollection(id: string): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        // First delete collection_products associations
        await supabase
            .from("collection_products")
            .delete()
            .eq("collection_id", id);

        // Then delete the collection
        const { error } = await supabase
            .from("collections")
            .delete()
            .eq("id", id)
            .eq("tenant_id", tenantId);

        if (error) {
            console.error("Delete collection error:", error);
            return { error: `Failed to delete collection: ${error.message}` };
        }

        revalidatePath("/dashboard/collections");
        revalidatePath("/dashboard/products/new");
        return {};
    } catch (err) {
        console.error("Delete collection error:", err);
        return { error: err instanceof Error ? err.message : "Failed to delete collection" };
    }
}

export async function toggleCollectionStatus(id: string, isActive: boolean): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        const { error } = await supabase
            .from("collections")
            .update({ is_active: isActive, updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("tenant_id", tenantId);

        if (error) {
            console.error("Toggle collection status error:", error);
            return { error: `Failed to update collection: ${error.message}` };
        }

        revalidatePath("/dashboard/collections");
        return {};
    } catch (err) {
        console.error("Toggle collection status error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update collection" };
    }
}

export async function updateCollectionOrder(updates: { id: string; sort_order: number }[]): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        // Update each collection's sort order
        for (const update of updates) {
            const { error } = await supabase
                .from("collections")
                .update({ sort_order: update.sort_order })
                .eq("id", update.id)
                .eq("tenant_id", tenantId);

            if (error) {
                console.error("Update collection order error:", error);
                return { error: `Failed to update order: ${error.message}` };
            }
        }

        revalidatePath("/dashboard/collections");
        return {};
    } catch (err) {
        console.error("Update collection order error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update order" };
    }
}

export async function addProductToCollection(collectionId: string, productId: string): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        // Get max position
        const { data: maxPos } = await supabase
            .from("collection_products")
            .select("position")
            .eq("collection_id", collectionId)
            .order("position", { ascending: false })
            .limit(1)
            .single();

        const position = (maxPos?.position || 0) + 1;

        const { error } = await supabase
            .from("collection_products")
            .insert({
                collection_id: collectionId,
                product_id: productId,
                position,
            });

        if (error) {
            // Ignore duplicate errors
            if (error.code !== "23505") {
                console.error("Add product to collection error:", error);
                return { error: `Failed to add product: ${error.message}` };
            }
        }

        revalidatePath("/dashboard/collections");
        return {};
    } catch (err) {
        console.error("Add product to collection error:", err);
        return { error: err instanceof Error ? err.message : "Failed to add product" };
    }
}

export async function removeProductFromCollection(collectionId: string, productId: string): Promise<{ error?: string }> {
    try {
        const { supabase } = await getAuthenticatedTenant();

        const { error } = await supabase
            .from("collection_products")
            .delete()
            .eq("collection_id", collectionId)
            .eq("product_id", productId);

        if (error) {
            console.error("Remove product from collection error:", error);
            return { error: `Failed to remove product: ${error.message}` };
        }

        revalidatePath("/dashboard/collections");
        return {};
    } catch (err) {
        console.error("Remove product from collection error:", err);
        return { error: err instanceof Error ? err.message : "Failed to remove product" };
    }
}
