"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProductWorkflow, updateProductWorkflow, deleteProductWorkflow } from "@/infrastructure/workflows/product";
import { expireProductsCache, expireProductCache } from "@/features/store/data";
import type { CreateProductInput } from "@/infrastructure/workflows/product/steps";
import { auditLogger } from "@/infrastructure/services/audit-logger";

async function getAuthenticatedTenant() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/login");
    }

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id, tenants(slug)")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) {
        redirect("/login");
    }

    // Handle the join result - tenants could be an object or array
    const tenantsData = userData.tenants;
    const tenantSlug = Array.isArray(tenantsData) 
        ? tenantsData[0]?.slug 
        : (tenantsData as { slug: string } | null)?.slug;

    return { supabase, userId: user.id, tenantId: userData.tenant_id, tenantSlug };
}

/**
 * Immediately expire both dashboard and storefront caches
 * Uses updateTag for read-your-own-writes consistency
 */
async function expireProductCaches(tenantId: string, productSlug?: string) {
    // Dashboard paths
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/collections");
    
    // Storefront cache - immediate expiration
    if (productSlug) {
        await expireProductCache(tenantId, productSlug);
    } else {
        await expireProductsCache(tenantId);
    }
}

/**
 * Simple product creation (backward compatible)
 */
export async function createProduct(formData: FormData): Promise<{ success?: boolean; error?: string }> {
    try {
        const { tenantId, userId } = await getAuthenticatedTenant();

        const name = formData.get("name") as string;
        const price = parseFloat(formData.get("price") as string) || 0;
        const description = formData.get("description") as string | null;
        const quantity = parseInt(formData.get("quantity") as string) || 0;
        const sku = formData.get("sku") as string | null;

        const result = await createProductWorkflow(tenantId, {
            name,
            price,
            description: description || undefined,
            quantity,
            sku: sku || undefined,
            status: "active",
        });

        // Audit log - non-blocking
        try {
            await auditLogger.logCreate(tenantId, "product", result.product.id, {
                name,
                price,
                description: description || undefined,
                quantity,
                sku: sku || undefined,
                status: "active",
            }, { userId });
        } catch (auditError) {
            console.error("Audit logging failed:", auditError);
        }

        await expireProductCaches(tenantId);
        return { success: true };
    } catch (error) {
        console.error("Product creation error:", error);
        return { error: error instanceof Error ? error.message : "Failed to create product" };
    }
}

/**
 * Production-ready product creation with full details using workflow
 * Uses saga pattern with automatic rollback on failure
 */
export async function createProductWithDetails(formData: FormData): Promise<{ success?: boolean; error?: string; productId?: string }> {
    try {
        const { tenantId, userId } = await getAuthenticatedTenant();

        // Parse form data
        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string || undefined;
        const description = formData.get("description") as string;
        const categoryId = formData.get("categoryId") as string;
        const collectionIdsJson = formData.get("collectionIds") as string;
        const collectionIds = collectionIdsJson ? JSON.parse(collectionIdsJson) : [];
        const brand = formData.get("brand") as string;
        const tagsJson = formData.get("tags") as string;
        const tags = tagsJson ? JSON.parse(tagsJson) : [];
        
        // Pricing
        const price = parseFloat(formData.get("price") as string) || 0;
        const compareAtPrice = parseFloat(formData.get("compareAtPrice") as string) || undefined;
        const costPrice = parseFloat(formData.get("costPrice") as string) || undefined;
        
        // Inventory
        const sku = formData.get("sku") as string;
        const barcode = formData.get("barcode") as string;
        const quantity = parseInt(formData.get("quantity") as string) || 0;
        const trackQuantity = formData.get("trackQuantity") === "true";
        const allowBackorder = formData.get("allowBackorder") === "true";
        
        // Shipping
        const weight = parseFloat(formData.get("weight") as string) || undefined;
        const weightUnit = formData.get("weightUnit") as string || "g";
        const requiresShipping = formData.get("requiresShipping") === "true";
        
        // Media
        const imagesJson = formData.get("images") as string;
        const images = imagesJson ? JSON.parse(imagesJson) : [];
        
        // Variants
        const hasVariants = formData.get("hasVariants") === "true";
        const variantsJson = formData.get("variants") as string;
        const variants = variantsJson ? JSON.parse(variantsJson) : [];
        
        // SEO
        const metaTitle = formData.get("metaTitle") as string;
        const metaDescription = formData.get("metaDescription") as string;
        
        // Status
        const status = formData.get("status") as "draft" | "active" | "archived" || "draft";
        const publishAt = formData.get("publishAt") as string;

        // Build workflow input
        const input: CreateProductInput = {
            name,
            slug,
            description: description || undefined,
            price,
            compareAtPrice,
            costPrice,
            sku: sku || undefined,
            barcode: barcode || undefined,
            quantity,
            trackQuantity,
            allowBackorder,
            weight,
            weightUnit,
            status,
            categoryId: categoryId || undefined,
            collectionIds: collectionIds.length > 0 ? collectionIds : undefined,
            images: images.length > 0 ? images.map((img: { url: string; alt: string; position: number }) => ({
                url: img.url,
                alt: img.alt || "",
                position: img.position,
            })) : undefined,
            variants: hasVariants && variants.length > 0 ? variants.map((v: { title: string; sku?: string; price?: number; quantity?: number }) => ({
                title: v.title,
                sku: v.sku,
                price: v.price,
                quantity: v.quantity,
            })) : undefined,
            metadata: {
                brand: brand || null,
                tags,
                seo: {
                    metaTitle: metaTitle || null,
                    metaDescription: metaDescription || null,
                },
                shipping: {
                    requiresShipping,
                    weightUnit,
                    dimensions: {
                        length: parseFloat(formData.get("length") as string) || null,
                        width: parseFloat(formData.get("width") as string) || null,
                        height: parseFloat(formData.get("height") as string) || null,
                    },
                },
                publishAt: publishAt || null,
            },
        };

        // Execute workflow with automatic rollback on failure
        const result = await createProductWorkflow(tenantId, input);

        // Audit log - non-blocking
        try {
            await auditLogger.logCreate(tenantId, "product", result.product.id, {
                name,
                slug,
                description: description || undefined,
                price,
                compareAtPrice,
                costPrice,
                sku: sku || undefined,
                barcode: barcode || undefined,
                quantity,
                trackQuantity,
                allowBackorder,
                weight,
                weightUnit,
                status,
                categoryId: categoryId || undefined,
                collectionIds: collectionIds.length > 0 ? collectionIds : undefined,
                hasVariants,
                variantsCount: variants.length,
                imagesCount: images.length,
                brand: brand || undefined,
                tags,
            }, { userId });
        } catch (auditError) {
            console.error("Audit logging failed:", auditError);
        }

        await expireProductCaches(tenantId);
        return { success: true, productId: result.product.id };
    } catch (err) {
        console.error("Product creation error:", err);
        // Workflow automatically compensated on failure
        return { error: err instanceof Error ? err.message : "Failed to create product" };
    }
}

/**
 * Update product using workflow
 */
export async function updateProduct(formData: FormData): Promise<{ success?: boolean; error?: string }> {
    try {
        const { supabase, tenantId, userId } = await getAuthenticatedTenant();
        
        const productId = formData.get("productId") as string;
        if (!productId) {
            return { error: "Product ID is required" };
        }

        // Fetch old values for audit log
        const { data: oldProduct } = await supabase
            .from("products")
            .select("name, price, description, status")
            .eq("id", productId)
            .eq("tenant_id", tenantId)
            .single();

        const name = formData.get("name") as string | undefined;
        const price = formData.get("price") ? parseFloat(formData.get("price") as string) : undefined;
        const description = formData.get("description") as string | undefined;
        const status = formData.get("status") as "draft" | "active" | "archived" | undefined;
        const collectionIdsJson = formData.get("collectionIds") as string;
        const collectionIds = collectionIdsJson ? JSON.parse(collectionIdsJson) : undefined;

        await updateProductWorkflow(tenantId, {
            productId,
            name,
            price,
            description,
            status,
            collectionIds,
        });

        // Audit log - non-blocking
        try {
            const oldValues: Record<string, unknown> = {};
            const newValues: Record<string, unknown> = {};
            
            if (oldProduct) {
                if (name !== undefined) {
                    oldValues.name = oldProduct.name;
                    newValues.name = name;
                }
                if (price !== undefined) {
                    oldValues.price = oldProduct.price;
                    newValues.price = price;
                }
                if (description !== undefined) {
                    oldValues.description = oldProduct.description;
                    newValues.description = description;
                }
                if (status !== undefined) {
                    oldValues.status = oldProduct.status;
                    newValues.status = status;
                }
                if (collectionIds !== undefined) {
                    newValues.collectionIds = collectionIds;
                }
            }
            
            await auditLogger.logUpdate(tenantId, "product", productId, oldValues, newValues, { userId });
        } catch (auditError) {
            console.error("Audit logging failed:", auditError);
        }

        await expireProductCaches(tenantId);
        return { success: true };
    } catch (err) {
        console.error("Product update error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update product" };
    }
}

export async function updateProductStock(formData: FormData): Promise<{ success?: boolean; error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        const productId = formData.get("productId") as string;
        const action = formData.get("action") as "add" | "remove" | "set";
        const adjustment = parseInt(formData.get("adjustment") as string) || 1;

        // Get current product
        const { data: product, error: fetchError } = await supabase
            .from("products")
            .select("quantity, slug")
            .eq("id", productId)
            .eq("tenant_id", tenantId)
            .single();

        if (fetchError || !product) {
            return { error: "Product not found" };
        }

        let newQuantity: number;
        if (action === "set") {
            newQuantity = adjustment;
        } else if (action === "add") {
            newQuantity = product.quantity + adjustment;
        } else {
            newQuantity = Math.max(0, product.quantity - adjustment);
        }

        const { error: updateError } = await supabase
            .from("products")
            .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
            .eq("id", productId)
            .eq("tenant_id", tenantId);

        if (updateError) {
            return { error: `Failed to update stock: ${updateError.message}` };
        }

        await expireProductCaches(tenantId, product.slug);
        return { success: true };
    } catch (error) {
        console.error("Update stock error:", error);
        return { error: error instanceof Error ? error.message : "Failed to update stock" };
    }
}

/**
 * Delete product using workflow
 */
export async function deleteProduct(formData: FormData): Promise<{ success?: boolean; error?: string }> {
    try {
        const { supabase, tenantId, userId } = await getAuthenticatedTenant();

        const productId = formData.get("productId") as string;

        // Fetch old values for audit log before deletion
        const { data: oldProduct } = await supabase
            .from("products")
            .select("name, slug, price, status, sku, quantity")
            .eq("id", productId)
            .eq("tenant_id", tenantId)
            .single();

        await deleteProductWorkflow(tenantId, { productId });

        // Audit log - non-blocking
        try {
            await auditLogger.logDelete(tenantId, "product", productId, {
                name: oldProduct?.name,
                slug: oldProduct?.slug,
                price: oldProduct?.price,
                status: oldProduct?.status,
                sku: oldProduct?.sku,
                quantity: oldProduct?.quantity,
            }, { userId });
        } catch (auditError) {
            console.error("Audit logging failed:", auditError);
        }

        await expireProductCaches(tenantId);
        return { success: true };
    } catch (error) {
        console.error("Delete product error:", error);
        return { error: error instanceof Error ? error.message : "Failed to delete product" };
    }
}

export async function updateProductStatus(productId: string, status: "draft" | "active" | "archived"): Promise<{ success?: boolean; error?: string }> {
    try {
        const { supabase, tenantId, userId } = await getAuthenticatedTenant();

        // Fetch old status for audit log
        const { data: oldProduct } = await supabase
            .from("products")
            .select("status, name")
            .eq("id", productId)
            .eq("tenant_id", tenantId)
            .single();

        await updateProductWorkflow(tenantId, { productId, status });

        // Audit log - non-blocking
        try {
            await auditLogger.logUpdate(tenantId, "product", productId, 
                { status: oldProduct?.status, name: oldProduct?.name },
                { status, name: oldProduct?.name },
                { userId }
            );
        } catch (auditError) {
            console.error("Audit logging failed:", auditError);
        }

        await expireProductCaches(tenantId);
        return { success: true };
    } catch (error) {
        console.error("Update product status error:", error);
        return { error: error instanceof Error ? error.message : "Failed to update product status" };
    }
}

/**
 * Bulk delete products using workflow
 */
export async function bulkDeleteProducts(productIds: string[]): Promise<{ success?: boolean; error?: string; deletedCount: number }> {
    try {
        const { supabase, tenantId, userId } = await getAuthenticatedTenant();

        // Fetch old values for audit log before deletion
        const { data: oldProducts } = await supabase
            .from("products")
            .select("id, name, slug, price, status, sku, quantity")
            .eq("tenant_id", tenantId)
            .in("id", productIds);

        const productMap = new Map(oldProducts?.map(p => [p.id, p]) || []);

        const errors: string[] = [];
        let deletedCount = 0;
        
        for (const productId of productIds) {
            try {
                await deleteProductWorkflow(tenantId, { productId });
                deletedCount++;

                // Audit log each deletion - non-blocking
                try {
                    const oldProduct = productMap.get(productId);
                    await auditLogger.logDelete(tenantId, "product", productId, {
                        name: oldProduct?.name,
                        slug: oldProduct?.slug,
                        price: oldProduct?.price,
                        status: oldProduct?.status,
                        sku: oldProduct?.sku,
                        quantity: oldProduct?.quantity,
                    }, { userId });
                } catch (auditError) {
                    console.error("Audit logging failed for product:", productId, auditError);
                }
            } catch (error) {
                errors.push(`${productId}: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        }

        await expireProductCaches(tenantId);

        if (errors.length > 0) {
            return { error: `Failed to delete some products: ${errors.join(", ")}`, deletedCount };
        }

        return { success: true, deletedCount };
    } catch (error) {
        console.error("Bulk delete products error:", error);
        return { error: error instanceof Error ? error.message : "Failed to delete products", deletedCount: 0 };
    }
}

/**
 * Bulk update product status using workflow
 */
export async function bulkUpdateProductStatus(productIds: string[], status: "draft" | "active" | "archived"): Promise<{ success?: boolean; error?: string; updatedCount: number }> {
    try {
        const { supabase, tenantId, userId } = await getAuthenticatedTenant();

        // Fetch old statuses for audit log
        const { data: oldProducts } = await supabase
            .from("products")
            .select("id, name, status")
            .eq("tenant_id", tenantId)
            .in("id", productIds);

        const productMap = new Map(oldProducts?.map(p => [p.id, p]) || []);

        const errors: string[] = [];
        let updatedCount = 0;
        
        for (const productId of productIds) {
            try {
                await updateProductWorkflow(tenantId, { productId, status });
                updatedCount++;

                // Audit log each update - non-blocking
                try {
                    const oldProduct = productMap.get(productId);
                    await auditLogger.logUpdate(tenantId, "product", productId,
                        { status: oldProduct?.status, name: oldProduct?.name },
                        { status, name: oldProduct?.name },
                        { userId }
                    );
                } catch (auditError) {
                    console.error("Audit logging failed for product:", productId, auditError);
                }
            } catch (error) {
                errors.push(`${productId}: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        }

        await expireProductCaches(tenantId);

        if (errors.length > 0) {
            return { error: `Failed to update some products: ${errors.join(", ")}`, updatedCount };
        }

        return { success: true, updatedCount };
    } catch (error) {
        console.error("Bulk update product status error:", error);
        return { error: error instanceof Error ? error.message : "Failed to update products", updatedCount: 0 };
    }
}
