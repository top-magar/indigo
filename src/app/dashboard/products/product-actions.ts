"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
    Product,
    ProductMedia,
    ProductVariant,
    ProductStats,
    CreateVariantInput,
    UpdateVariantInput,
    BulkUpdateStockInput,
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
// PRODUCT QUERIES
// ============================================================================

export async function getProductDetail(productId: string): Promise<{ success: boolean; data?: Product; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Fetch product
        const { data: product, error: productError } = await supabase
            .from("products")
            .select(`
                *,
                categories (id, name, slug)
            `)
            .eq("id", productId)
            .eq("tenant_id", tenantId)
            .single();

        if (productError || !product) {
            return { success: false, error: "Product not found" };
        }

        // Fetch variants
        const { data: variants } = await supabase
            .from("product_variants")
            .select(`
                *,
                inventory_levels (quantity, location)
            `)
            .eq("product_id", productId)
            .eq("tenant_id", tenantId)
            .order("created_at", { ascending: true });

        // Fetch collection associations
        const { data: collectionLinks } = await supabase
            .from("product_collections")
            .select(`
                collection_id,
                collections (id, name, slug)
            `)
            .eq("product_id", productId);

        // Transform to Product type
        const productData: Product = {
            id: product.id,
            tenantId: product.tenant_id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            descriptionHtml: product.description_html,
            price: parseFloat(product.price || "0"),
            compareAtPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
            costPrice: product.cost_price ? parseFloat(product.cost_price) : null,
            currency: product.currency || "USD",
            sku: product.sku,
            barcode: product.barcode,
            quantity: product.quantity || 0,
            trackQuantity: product.track_quantity ?? true,
            allowBackorder: product.allow_backorder ?? false,
            status: product.status || "draft",
            categoryId: product.category_id,
            categoryName: product.categories?.name || null,
            collectionIds: collectionLinks?.map(cl => cl.collection_id) || [],
            collectionNames: collectionLinks?.map(cl => {
                const collection = cl.collections;
                if (Array.isArray(collection)) {
                    return collection[0]?.name;
                }
                return (collection as { name: string } | null)?.name;
            }).filter(Boolean) as string[] || [],
            productTypeId: product.product_type_id,
            productTypeName: null,
            media: (product.images || []).map((url: string, index: number): ProductMedia => ({
                id: `media-${index}`,
                url,
                alt: product.name,
                type: "image",
                position: index,
            })),
            hasVariants: (variants?.length || 0) > 0,
            variants: (variants || []).map((v): ProductVariant => ({
                id: v.id,
                productId: v.product_id,
                title: v.name,
                sku: v.sku,
                barcode: v.barcode,
                price: v.price ? parseFloat(v.price) : null,
                compareAtPrice: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
                costPrice: v.cost_price ? parseFloat(v.cost_price) : null,
                quantity: v.inventory_levels?.[0]?.quantity || 0,
                trackQuantity: v.track_quantity ?? true,
                allowBackorder: v.allow_backorder ?? false,
                weight: v.weight ? parseFloat(v.weight) : null,
                weightUnit: v.weight_unit || "g",
                options: v.options || [],
                imageId: v.image_id,
                position: v.position || 0,
                createdAt: v.created_at,
                updatedAt: v.updated_at || v.created_at,
            })),
            attributes: product.attributes || [],
            shipping: {
                requiresShipping: product.requires_shipping ?? true,
                weight: product.weight ? parseFloat(product.weight) : null,
                weightUnit: product.weight_unit || "g",
                dimensions: product.dimensions || {},
            },
            seo: {
                metaTitle: product.meta_title,
                metaDescription: product.meta_description,
                slug: product.slug,
            },
            brand: product.brand,
            tags: product.tags || [],
            metadata: product.metadata,
            createdAt: product.created_at,
            updatedAt: product.updated_at,
        };

        return { success: true, data: productData };
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return { success: false, error: "Failed to fetch product" };
    }
}

export async function getProductStats(): Promise<ProductStats> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { data: products } = await supabase
        .from("products")
        .select("status, quantity, price")
        .eq("tenant_id", tenantId);

    const stats: ProductStats = {
        total: 0,
        active: 0,
        draft: 0,
        archived: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0,
        withVariants: 0,
    };

    if (products) {
        stats.total = products.length;
        products.forEach((product) => {
            if (product.status === "active") stats.active++;
            else if (product.status === "draft") stats.draft++;
            else if (product.status === "archived") stats.archived++;
            
            const qty = product.quantity || 0;
            if (qty === 0) stats.outOfStock++;
            else if (qty <= 10) stats.lowStock++;
            
            stats.totalValue += qty * parseFloat(product.price || "0");
        });
    }

    return stats;
}

// ============================================================================
// VARIANT ACTIONS
// ============================================================================

export async function createVariant(input: CreateVariantInput) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Create variant
        const { data: variant, error: variantError } = await supabase
            .from("product_variants")
            .insert({
                tenant_id: tenantId,
                product_id: input.productId,
                name: input.title,
                sku: input.sku || null,
                price: input.price?.toString() || null,
                options: input.options,
            })
            .select()
            .single();

        if (variantError || !variant) {
            return { success: false, error: "Failed to create variant" };
        }

        // Create inventory level
        if (input.quantity !== undefined) {
            await supabase.from("inventory_levels").insert({
                tenant_id: tenantId,
                variant_id: variant.id,
                quantity: input.quantity,
                location: "default",
            });
        }

        revalidatePath(`/dashboard/products/${input.productId}`);
        return { success: true, data: variant };
    } catch (error) {
        console.error("Failed to create variant:", error);
        return { success: false, error: "Failed to create variant" };
    }
}

export async function updateVariant(input: UpdateVariantInput) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const updateData: Record<string, unknown> = {};
        if (input.title !== undefined) updateData.name = input.title;
        if (input.sku !== undefined) updateData.sku = input.sku;
        if (input.price !== undefined) updateData.price = input.price?.toString();
        if (input.options !== undefined) updateData.options = input.options;

        const { data: variant, error } = await supabase
            .from("product_variants")
            .update(updateData)
            .eq("id", input.id)
            .eq("tenant_id", tenantId)
            .select("product_id")
            .single();

        if (error || !variant) {
            return { success: false, error: "Failed to update variant" };
        }

        revalidatePath(`/dashboard/products/${variant.product_id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update variant:", error);
        return { success: false, error: "Failed to update variant" };
    }
}

export async function deleteVariant(variantId: string) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Get product ID first
        const { data: variant } = await supabase
            .from("product_variants")
            .select("product_id")
            .eq("id", variantId)
            .eq("tenant_id", tenantId)
            .single();

        if (!variant) {
            return { success: false, error: "Variant not found" };
        }

        // Delete inventory levels
        await supabase
            .from("inventory_levels")
            .delete()
            .eq("variant_id", variantId)
            .eq("tenant_id", tenantId);

        // Delete variant
        const { error } = await supabase
            .from("product_variants")
            .delete()
            .eq("id", variantId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to delete variant" };
        }

        revalidatePath(`/dashboard/products/${variant.product_id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete variant:", error);
        return { success: false, error: "Failed to delete variant" };
    }
}

// ============================================================================
// STOCK ACTIONS
// ============================================================================

export async function updateVariantStock(variantId: string, quantity: number, action: "set" | "add" | "subtract" = "set") {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Get current inventory
        const { data: inventory } = await supabase
            .from("inventory_levels")
            .select("id, quantity, variant_id")
            .eq("variant_id", variantId)
            .eq("tenant_id", tenantId)
            .single();

        let newQuantity = quantity;
        if (inventory) {
            if (action === "add") {
                newQuantity = inventory.quantity + quantity;
            } else if (action === "subtract") {
                newQuantity = Math.max(0, inventory.quantity - quantity);
            }

            await supabase
                .from("inventory_levels")
                .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
                .eq("id", inventory.id);
        } else {
            // Create inventory level if doesn't exist
            await supabase.from("inventory_levels").insert({
                tenant_id: tenantId,
                variant_id: variantId,
                quantity: newQuantity,
                location: "default",
            });
        }

        // Get product ID for revalidation
        const { data: variant } = await supabase
            .from("product_variants")
            .select("product_id")
            .eq("id", variantId)
            .single();

        if (variant) {
            revalidatePath(`/dashboard/products/${variant.product_id}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to update variant stock:", error);
        return { success: false, error: "Failed to update stock" };
    }
}

export async function bulkUpdateStock(updates: BulkUpdateStockInput[]) {
    const { supabase, tenantId } = await getAuthenticatedTenant();
    const errors: string[] = [];
    let successCount = 0;

    for (const update of updates) {
        const result = await updateVariantStock(update.variantId, update.quantity, update.action);
        if (result.success) {
            successCount++;
        } else {
            errors.push(`${update.variantId}: ${result.error}`);
        }
    }

    revalidatePath("/dashboard/products");
    
    if (errors.length > 0) {
        return { success: false, error: errors.join(", "), updatedCount: successCount };
    }

    return { success: true, updatedCount: successCount };
}

// ============================================================================
// MEDIA ACTIONS
// ============================================================================

export async function addProductMedia(productId: string, mediaUrl: string, alt?: string) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Get current images
        const { data: product } = await supabase
            .from("products")
            .select("images")
            .eq("id", productId)
            .eq("tenant_id", tenantId)
            .single();

        if (!product) {
            return { success: false, error: "Product not found" };
        }

        const currentImages = (product.images as string[]) || [];
        const updatedImages = [...currentImages, mediaUrl];

        const { error } = await supabase
            .from("products")
            .update({ images: updatedImages, updated_at: new Date().toISOString() })
            .eq("id", productId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to add media" };
        }

        revalidatePath(`/dashboard/products/${productId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to add media:", error);
        return { success: false, error: "Failed to add media" };
    }
}

export async function removeProductMedia(productId: string, mediaUrl: string) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const { data: product } = await supabase
            .from("products")
            .select("images")
            .eq("id", productId)
            .eq("tenant_id", tenantId)
            .single();

        if (!product) {
            return { success: false, error: "Product not found" };
        }

        const currentImages = (product.images as string[]) || [];
        const updatedImages = currentImages.filter(img => img !== mediaUrl);

        const { error } = await supabase
            .from("products")
            .update({ images: updatedImages, updated_at: new Date().toISOString() })
            .eq("id", productId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to remove media" };
        }

        revalidatePath(`/dashboard/products/${productId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to remove media:", error);
        return { success: false, error: "Failed to remove media" };
    }
}

export async function reorderProductMedia(productId: string, mediaUrls: string[]) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const { error } = await supabase
            .from("products")
            .update({ images: mediaUrls, updated_at: new Date().toISOString() })
            .eq("id", productId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to reorder media" };
        }

        revalidatePath(`/dashboard/products/${productId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to reorder media:", error);
        return { success: false, error: "Failed to reorder media" };
    }
}

// ============================================================================
// SEO ACTIONS
// ============================================================================

export async function updateProductSeo(productId: string, seo: { metaTitle?: string; metaDescription?: string; slug?: string }) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (seo.metaTitle !== undefined) updateData.meta_title = seo.metaTitle;
        if (seo.metaDescription !== undefined) updateData.meta_description = seo.metaDescription;
        if (seo.slug !== undefined) updateData.slug = seo.slug;

        const { error } = await supabase
            .from("products")
            .update(updateData)
            .eq("id", productId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to update SEO" };
        }

        revalidatePath(`/dashboard/products/${productId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update SEO:", error);
        return { success: false, error: "Failed to update SEO" };
    }
}

// ============================================================================
// ORGANIZATION ACTIONS
// ============================================================================

export async function updateProductOrganization(
    productId: string,
    data: { categoryId?: string | null; collectionIds?: string[] }
) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Update category
        if (data.categoryId !== undefined) {
            await supabase
                .from("products")
                .update({ category_id: data.categoryId, updated_at: new Date().toISOString() })
                .eq("id", productId)
                .eq("tenant_id", tenantId);
        }

        // Update collections
        if (data.collectionIds !== undefined) {
            // Remove existing collection links
            await supabase
                .from("product_collections")
                .delete()
                .eq("product_id", productId);

            // Add new collection links
            if (data.collectionIds.length > 0) {
                const collectionLinks = data.collectionIds.map(collectionId => ({
                    product_id: productId,
                    collection_id: collectionId,
                }));

                await supabase.from("product_collections").insert(collectionLinks);
            }
        }

        revalidatePath(`/dashboard/products/${productId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update organization:", error);
        return { success: false, error: "Failed to update organization" };
    }
}

// ============================================================================
// SHIPPING ACTIONS
// ============================================================================

export async function updateProductShipping(
    productId: string,
    shipping: { weight?: number; weightUnit?: "g" | "kg" | "lb" | "oz"; requiresShipping?: boolean; dimensions?: { length?: number; width?: number; height?: number } }
) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (shipping.weight !== undefined) updateData.weight = shipping.weight.toString();
        if (shipping.weightUnit !== undefined) updateData.weight_unit = shipping.weightUnit;
        if (shipping.requiresShipping !== undefined) updateData.requires_shipping = shipping.requiresShipping;
        if (shipping.dimensions !== undefined) updateData.dimensions = shipping.dimensions;

        const { error } = await supabase
            .from("products")
            .update(updateData)
            .eq("id", productId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to update shipping" };
        }

        revalidatePath(`/dashboard/products/${productId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update shipping:", error);
        return { success: false, error: "Failed to update shipping" };
    }
}
