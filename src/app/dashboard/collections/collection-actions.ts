"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
    Collection,
    CollectionProduct,
    CreateCollectionInput,
    UpdateCollectionInput,
    CollectionStats,
} from "./types";

// ============================================================================
// AUTH HELPER
// ============================================================================

async function getAuthenticatedTenant() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/auth/login");
    }

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id, full_name")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) {
        redirect("/auth/login");
    }

    return { supabase, tenantId: userData.tenant_id, userId: user.id, userName: userData.full_name };
}

// ============================================================================
// COLLECTION QUERIES
// ============================================================================

export async function getCollectionDetail(collectionId: string): Promise<{ success: boolean; data?: Collection; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Fetch collection
        const { data: collection, error: collectionError } = await supabase
            .from("collections")
            .select("*")
            .eq("id", collectionId)
            .eq("tenant_id", tenantId)
            .single();

        if (collectionError || !collection) {
            return { success: false, error: "Collection not found" };
        }

        // Fetch products in collection
        const { data: collectionProducts } = await supabase
            .from("collection_products")
            .select(`
                id,
                product_id,
                position,
                created_at,
                products (
                    id,
                    name,
                    slug,
                    sku,
                    price,
                    images,
                    status
                )
            `)
            .eq("collection_id", collectionId)
            .order("position", { ascending: true });

        // Transform products
        const products: CollectionProduct[] = (collectionProducts || [])
            .filter(cp => cp.products)
            .map(cp => {
                const product = cp.products as unknown as {
                    id: string;
                    name: string;
                    slug: string;
                    sku?: string;
                    price: string;
                    images?: string[];
                    status: string;
                };
                return {
                    id: cp.id,
                    productId: product.id,
                    productName: product.name,
                    productSlug: product.slug,
                    productSku: product.sku || null,
                    productPrice: parseFloat(product.price || "0"),
                    productImage: product.images?.[0] || null,
                    productStatus: product.status as "draft" | "active" | "archived",
                    position: cp.position,
                    addedAt: cp.created_at,
                };
            });

        // Transform to Collection type
        const collectionData: Collection = {
            id: collection.id,
            tenantId: collection.tenant_id,
            name: collection.name,
            slug: collection.slug,
            description: collection.description,
            backgroundImage: collection.image_url,
            backgroundImageAlt: collection.image_alt || null,
            isActive: collection.is_active,
            type: collection.type || "manual",
            conditions: collection.conditions,
            seo: {
                metaTitle: collection.meta_title || null,
                metaDescription: collection.meta_description || null,
                slug: collection.slug,
            },
            productCount: products.length,
            products,
            metadata: collection.metadata,
            sortOrder: collection.sort_order || 0,
            createdAt: collection.created_at,
            updatedAt: collection.updated_at,
        };

        return { success: true, data: collectionData };
    } catch (error) {
        console.error("Failed to fetch collection:", error);
        return { success: false, error: "Failed to fetch collection" };
    }
}

export async function getCollectionStats(): Promise<CollectionStats> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { data: collections } = await supabase
        .from("collections")
        .select("is_active, type")
        .eq("tenant_id", tenantId);

    const { data: productCounts } = await supabase
        .from("collection_products")
        .select("collection_id")
        .in("collection_id", (collections || []).map(c => c));

    const stats: CollectionStats = {
        total: 0,
        active: 0,
        inactive: 0,
        manual: 0,
        automatic: 0,
        totalProducts: productCounts?.length || 0,
    };

    if (collections) {
        stats.total = collections.length;
        collections.forEach((collection) => {
            if (collection.is_active) stats.active++;
            else stats.inactive++;
            
            if (collection.type === "automatic") stats.automatic++;
            else stats.manual++;
        });
    }

    return stats;
}

// ============================================================================
// COLLECTION MUTATIONS
// ============================================================================

export async function updateCollectionInfo(
    collectionId: string,
    data: { name?: string; description?: string }
) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;

        const { error } = await supabase
            .from("collections")
            .update(updateData)
            .eq("id", collectionId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to update collection" };
        }

        revalidatePath(`/dashboard/collections/${collectionId}`);
        revalidatePath("/dashboard/collections");
        return { success: true };
    } catch (error) {
        console.error("Failed to update collection:", error);
        return { success: false, error: "Failed to update collection" };
    }
}

export async function updateCollectionStatus(collectionId: string, isActive: boolean) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const { error } = await supabase
            .from("collections")
            .update({ is_active: isActive, updated_at: new Date().toISOString() })
            .eq("id", collectionId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to update status" };
        }

        revalidatePath(`/dashboard/collections/${collectionId}`);
        revalidatePath("/dashboard/collections");
        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

// ============================================================================
// IMAGE ACTIONS
// ============================================================================

export async function updateCollectionImage(
    collectionId: string,
    imageUrl: string | null,
    imageAlt?: string
) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const { error } = await supabase
            .from("collections")
            .update({
                image_url: imageUrl,
                image_alt: imageAlt || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", collectionId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to update image" };
        }

        revalidatePath(`/dashboard/collections/${collectionId}`);
        revalidatePath("/dashboard/collections");
        return { success: true };
    } catch (error) {
        console.error("Failed to update image:", error);
        return { success: false, error: "Failed to update image" };
    }
}

export async function deleteCollectionImage(collectionId: string) {
    return updateCollectionImage(collectionId, null);
}

// ============================================================================
// SEO ACTIONS
// ============================================================================

export async function updateCollectionSeo(
    collectionId: string,
    seo: { metaTitle?: string; metaDescription?: string; slug?: string }
) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (seo.metaTitle !== undefined) updateData.meta_title = seo.metaTitle;
        if (seo.metaDescription !== undefined) updateData.meta_description = seo.metaDescription;
        if (seo.slug !== undefined) {
            // Check for duplicate slug
            const { data: existing } = await supabase
                .from("collections")
                .select("id")
                .eq("tenant_id", tenantId)
                .eq("slug", seo.slug)
                .neq("id", collectionId)
                .single();

            if (existing) {
                return { success: false, error: "Slug already exists" };
            }
            updateData.slug = seo.slug;
        }

        const { error } = await supabase
            .from("collections")
            .update(updateData)
            .eq("id", collectionId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to update SEO" };
        }

        revalidatePath(`/dashboard/collections/${collectionId}`);
        revalidatePath("/dashboard/collections");
        return { success: true };
    } catch (error) {
        console.error("Failed to update SEO:", error);
        return { success: false, error: "Failed to update SEO" };
    }
}

// ============================================================================
// PRODUCT MANAGEMENT ACTIONS
// ============================================================================

export async function assignProductsToCollection(collectionId: string, productIds: string[]) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Get current max position
        const { data: maxPos } = await supabase
            .from("collection_products")
            .select("position")
            .eq("collection_id", collectionId)
            .order("position", { ascending: false })
            .limit(1)
            .single();

        let position = (maxPos?.position || 0) + 1;

        // Insert products
        const inserts = productIds.map(productId => ({
            collection_id: collectionId,
            product_id: productId,
            position: position++,
        }));

        const { error } = await supabase
            .from("collection_products")
            .upsert(inserts, { onConflict: "collection_id,product_id" });

        if (error) {
            return { success: false, error: "Failed to assign products" };
        }

        revalidatePath(`/dashboard/collections/${collectionId}`);
        revalidatePath("/dashboard/collections");
        return { success: true };
    } catch (error) {
        console.error("Failed to assign products:", error);
        return { success: false, error: "Failed to assign products" };
    }
}

export async function unassignProductFromCollection(collectionId: string, productId: string) {
    const { supabase } = await getAuthenticatedTenant();

    try {
        const { error } = await supabase
            .from("collection_products")
            .delete()
            .eq("collection_id", collectionId)
            .eq("product_id", productId);

        if (error) {
            return { success: false, error: "Failed to remove product" };
        }

        revalidatePath(`/dashboard/collections/${collectionId}`);
        revalidatePath("/dashboard/collections");
        return { success: true };
    } catch (error) {
        console.error("Failed to remove product:", error);
        return { success: false, error: "Failed to remove product" };
    }
}

export async function bulkUnassignProducts(collectionId: string, productIds: string[]) {
    const { supabase } = await getAuthenticatedTenant();

    try {
        const { error } = await supabase
            .from("collection_products")
            .delete()
            .eq("collection_id", collectionId)
            .in("product_id", productIds);

        if (error) {
            return { success: false, error: "Failed to remove products" };
        }

        revalidatePath(`/dashboard/collections/${collectionId}`);
        revalidatePath("/dashboard/collections");
        return { success: true };
    } catch (error) {
        console.error("Failed to remove products:", error);
        return { success: false, error: "Failed to remove products" };
    }
}

export async function reorderCollectionProducts(collectionId: string, productIds: string[]) {
    const { supabase } = await getAuthenticatedTenant();

    try {
        // Update positions
        for (let i = 0; i < productIds.length; i++) {
            await supabase
                .from("collection_products")
                .update({ position: i })
                .eq("collection_id", collectionId)
                .eq("product_id", productIds[i]);
        }

        revalidatePath(`/dashboard/collections/${collectionId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to reorder products:", error);
        return { success: false, error: "Failed to reorder products" };
    }
}

// ============================================================================
// DELETE COLLECTION
// ============================================================================

export async function deleteCollectionById(collectionId: string) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Delete product associations first
        await supabase
            .from("collection_products")
            .delete()
            .eq("collection_id", collectionId);

        // Delete collection
        const { error } = await supabase
            .from("collections")
            .delete()
            .eq("id", collectionId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to delete collection" };
        }

        revalidatePath("/dashboard/collections");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete collection:", error);
        return { success: false, error: "Failed to delete collection" };
    }
}

// ============================================================================
// AVAILABLE PRODUCTS (for assignment dialog)
// ============================================================================

export async function getAvailableProducts(collectionId: string, search?: string) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Get products already in collection
        const { data: existingProducts } = await supabase
            .from("collection_products")
            .select("product_id")
            .eq("collection_id", collectionId);

        const existingIds = (existingProducts || []).map(p => p.product_id);

        // Get available products
        let query = supabase
            .from("products")
            .select("id, name, slug, sku, price, images, status")
            .eq("tenant_id", tenantId)
            .eq("status", "active")
            .order("name", { ascending: true })
            .limit(50);

        if (existingIds.length > 0) {
            query = query.not("id", "in", `(${existingIds.join(",")})`);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
        }

        const { data: products, error } = await query;

        if (error) {
            return { success: false, error: "Failed to fetch products", data: [] };
        }

        return {
            success: true,
            data: (products || []).map(p => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                sku: p.sku,
                price: parseFloat(p.price || "0"),
                image: (p.images as string[])?.[0] || null,
                status: p.status,
            })),
        };
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return { success: false, error: "Failed to fetch products", data: [] };
    }
}
