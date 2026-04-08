"use server";

import { createLogger } from "@/lib/logger";
const log = createLogger("actions:collections");

import { z } from "zod";
import { createClient } from "@/infrastructure/supabase/server";
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Collection } from "@/infrastructure/supabase/types";

async function getAuthenticatedTenant() {
    const { user, supabase } = await getAuthenticatedClient();
    return { supabase, tenantId: user.tenantId };
}

const createCollectionSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
  slug: z.string().optional().default(""),
  description: z.string().optional().default(""),
  imageUrl: z.string().optional().default(""),
  isActive: z.boolean().default(true),
  type: z.enum(["manual", "automatic"]).default("manual"),
});

export async function createCollection(formData: FormData): Promise<{ error?: string; collection?: Collection }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        const parsed = createCollectionSchema.parse({
            name: formData.get("name"),
            slug: formData.get("slug") ?? "",
            description: formData.get("description") ?? "",
            imageUrl: formData.get("imageUrl") ?? "",
            isActive: formData.get("isActive") === "true",
            type: formData.get("type") ?? "manual",
        });

        // Check for duplicate slug
        const { data: existing } = await supabase
            .from("collections")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("slug", parsed.slug)
            .single();

        let finalSlug = parsed.slug;
        if (existing) {
            finalSlug = `${parsed.slug}-${Date.now()}`;
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
                name: parsed.name,
                slug: finalSlug,
                description: parsed.description || null,
                image_url: parsed.imageUrl || null,
                is_active: parsed.isActive,
                type: parsed.type,
                sort_order: sortOrder,
                conditions: null,
                metadata: {},
            })
            .select()
            .single();

        if (error) {
            log.error("Create collection error:", error);
            return { error: `Failed to create collection: ${error.message}` };
        }

        revalidatePath("/dashboard/collections");
        revalidatePath("/dashboard/products/new");
        return { collection };
    } catch (err) {
        if (err instanceof z.ZodError) {
            return { error: err.issues[0].message };
        }
        log.error("Create collection error:", err);
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
            log.error("Update collection error:", error);
            return { error: `Failed to update collection: ${error.message}` };
        }

        revalidatePath("/dashboard/collections");
        revalidatePath("/dashboard/products/new");
        return { collection };
    } catch (err) {
        log.error("Update collection error:", err);
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
            .eq("tenant_id", tenantId)
            .eq("collection_id", id);

        // Then delete the collection
        const { error } = await supabase
            .from("collections")
            .delete()
            .eq("id", id)
            .eq("tenant_id", tenantId);

        if (error) {
            log.error("Delete collection error:", error);
            return { error: `Failed to delete collection: ${error.message}` };
        }

        revalidatePath("/dashboard/collections");
        revalidatePath("/dashboard/products/new");
        return {};
    } catch (err) {
        log.error("Delete collection error:", err);
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
            log.error("Toggle collection status error:", error);
            return { error: `Failed to update collection: ${error.message}` };
        }

        revalidatePath("/dashboard/collections");
        return {};
    } catch (err) {
        log.error("Toggle collection status error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update collection" };
    }
}

export async function updateCollectionOrder(updates: { id: string; sort_order: number }[]): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        // Update all sort orders in parallel
        const results = await Promise.all(updates.map(update =>
            supabase
                .from("collections")
                .update({ sort_order: update.sort_order })
                .eq("id", update.id)
                .eq("tenant_id", tenantId)
        ));

        const failed = results.find(r => r.error);
        if (failed?.error) {
            log.error("Update collection order error:", failed.error);
            return { error: `Failed to update order: ${failed.error.message}` };
        }

        revalidatePath("/dashboard/collections");
        return {};
    } catch (err) {
        log.error("Update collection order error:", err);
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
            .eq("tenant_id", tenantId)
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
                log.error("Add product to collection error:", error);
                return { error: `Failed to add product: ${error.message}` };
            }
        }

        revalidatePath("/dashboard/collections");
        return {};
    } catch (err) {
        log.error("Add product to collection error:", err);
        return { error: err instanceof Error ? err.message : "Failed to add product" };
    }
}

export async function removeProductFromCollection(collectionId: string, productId: string): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        const { error } = await supabase
            .from("collection_products")
            .delete()
            .eq("tenant_id", tenantId)
            .eq("collection_id", collectionId)
            .eq("product_id", productId);

        if (error) {
            log.error("Remove product from collection error:", error);
            return { error: `Failed to remove product: ${error.message}` };
        }

        revalidatePath("/dashboard/collections");
        return {};
    } catch (err) {
        log.error("Remove product from collection error:", err);
        return { error: err instanceof Error ? err.message : "Failed to remove product" };
    }
}
