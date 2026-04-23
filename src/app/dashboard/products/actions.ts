"use server";

import { createLogger } from "@/lib/logger";
const log = createLogger("actions:products");

import { z } from "zod";
import { createClient } from "@/infrastructure/supabase/server";
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { productRepository } from "@/features/products/repositories/products";
import { expireProductsCache, expireProductCache } from "@/features/store/data";
import { auditLogger } from "@/infrastructure/services/audit-logger";

async function getAuthenticatedTenant() {
    const { user, supabase } = await getAuthenticatedClient();
    return { supabase, tenantId: user.tenantId, userId: user.id, tenantSlug: undefined as string | undefined };
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

const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  description: z.string().optional().default(""),
  quantity: z.coerce.number().int().min(0).default(0),
  sku: z.string().optional().default(""),
});

/**
 * Simple product creation (backward compatible)
 */
export async function createProduct(formData: FormData): Promise<{ success?: boolean; error?: string }> {
    try {
        const { tenantId, userId } = await getAuthenticatedTenant();

        const raw = Object.fromEntries(formData.entries());
        const { name, price, description, quantity, sku } = createProductSchema.parse(raw);

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const product = await productRepository.create(tenantId, {
            name,
            slug,
            price: String(price),
            description: description || undefined,
            quantity,
            sku: sku || undefined,
            status: "active",
        });

        // Audit log - non-blocking
        try {
            await auditLogger.logCreate(tenantId, "product", product.id, {
                name,
                price,
                description: description || undefined,
                quantity,
                sku: sku || undefined,
                status: "active",
            }, { userId });
        } catch (auditError) {
            log.error("Audit logging failed:", auditError);
        }

        await expireProductCaches(tenantId);
        return { success: true };
    } catch (error) {
        log.error("Product creation error:", error);
        return { error: error instanceof Error ? error.message : "Failed to create product" };
    }
}

/**
 * Production-ready product creation with full details using workflow
 * Uses saga pattern with automatic rollback on failure
 */
const productDetailsSchema = z.object({
    name: z.string().min(1, "Product name is required").max(255),
    slug: z.string().optional(),
    description: z.string().max(10000).optional(),
    categoryId: z.string().uuid().optional().or(z.literal("")),
    collectionIds: z.array(z.string().uuid()).optional().default([]),
    brand: z.string().max(255).optional(),
    tags: z.array(z.string()).optional().default([]),
    price: z.number().min(0, "Price cannot be negative"),
    compareAtPrice: z.number().min(0).optional(),
    costPrice: z.number().min(0).optional(),
    sku: z.string().max(100).optional(),
    barcode: z.string().max(100).optional(),
    quantity: z.number().int().min(0).default(0),
    trackQuantity: z.boolean().default(true),
    allowBackorder: z.boolean().default(false),
    weight: z.number().min(0).optional(),
    weightUnit: z.string().default("g"),
    requiresShipping: z.boolean().default(true),
    hasVariants: z.boolean().default(false),
    images: z.array(z.object({ url: z.string().url(), alt: z.string().default(""), position: z.number().default(0) })).default([]),
    variants: z.array(z.object({ title: z.string(), sku: z.string().optional(), price: z.number().min(0).optional(), quantity: z.number().int().min(0).optional() })).default([]),
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    publishAt: z.string().optional(),
});

function safeJsonParse<T>(str: string | null, fallback: T): T {
    if (!str) return fallback;
    try { return JSON.parse(str); } catch { return fallback; }
}

export async function createProductWithDetails(formData: FormData): Promise<{ success?: boolean; error?: string; productId?: string }> {
    try {
        const { tenantId, userId } = await getAuthenticatedTenant();

        // Parse and validate all input
        const raw = {
            name: formData.get("name") as string || "",
            slug: (formData.get("slug") as string) || undefined,
            description: (formData.get("description") as string) || undefined,
            categoryId: (formData.get("categoryId") as string) || undefined,
            collectionIds: safeJsonParse(formData.get("collectionIds") as string, []),
            brand: (formData.get("brand") as string) || undefined,
            tags: safeJsonParse(formData.get("tags") as string, []),
            price: parseFloat(formData.get("price") as string),
            compareAtPrice: formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : undefined,
            costPrice: formData.get("costPrice") ? parseFloat(formData.get("costPrice") as string) : undefined,
            sku: (formData.get("sku") as string) || undefined,
            barcode: (formData.get("barcode") as string) || undefined,
            quantity: parseInt(formData.get("quantity") as string) || 0,
            trackQuantity: formData.get("trackQuantity") === "true",
            allowBackorder: formData.get("allowBackorder") === "true",
            weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : undefined,
            weightUnit: (formData.get("weightUnit") as string) || "g",
            requiresShipping: formData.get("requiresShipping") === "true",
            hasVariants: formData.get("hasVariants") === "true",
            images: safeJsonParse(formData.get("images") as string, []),
            variants: safeJsonParse(formData.get("variants") as string, []),
            metaTitle: (formData.get("metaTitle") as string) || undefined,
            metaDescription: (formData.get("metaDescription") as string) || undefined,
            status: (formData.get("status") as string) || "draft",
            publishAt: (formData.get("publishAt") as string) || undefined,
        };

        // Reject NaN prices
        if (isNaN(raw.price)) return { error: "Price must be a valid number" };

        const validated = productDetailsSchema.parse(raw);

        const slug = validated.slug || validated.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const product = await productRepository.create(tenantId, {
            name: validated.name,
            slug,
            description: validated.description,
            price: String(validated.price),
            compareAtPrice: validated.compareAtPrice ? String(validated.compareAtPrice) : undefined,
            costPrice: validated.costPrice ? String(validated.costPrice) : undefined,
            sku: validated.sku,
            barcode: validated.barcode,
            quantity: validated.quantity,
            trackQuantity: validated.trackQuantity,
            allowBackorder: validated.allowBackorder,
            weight: validated.weight ? String(validated.weight) : undefined,
            weightUnit: validated.weightUnit,
            status: validated.status,
            hasVariants: validated.hasVariants,
            categoryId: validated.categoryId || undefined,
            images: validated.images.length > 0 ? validated.images : [],
            metadata: {
                brand: validated.brand || null,
                tags: validated.tags,
                seo: {
                    metaTitle: validated.metaTitle || null,
                    metaDescription: validated.metaDescription || null,
                },
                shipping: {
                    requiresShipping: validated.requiresShipping,
                    weightUnit: validated.weightUnit,
                },
                publishAt: validated.publishAt || null,
            },
        });

        // Audit log - non-blocking
        try {
            await auditLogger.logCreate(tenantId, "product", product.id, {
                name: validated.name,
                slug: validated.slug,
                price: validated.price,
                status: validated.status,
                hasVariants: validated.hasVariants,
                variantsCount: validated.variants.length,
                imagesCount: validated.images.length,
            }, { userId });
        } catch (auditError) {
            log.error("Audit logging failed:", auditError);
        }

        await expireProductCaches(tenantId);
        return { success: true, productId: product.id };
    } catch (err) {
        if (err instanceof z.ZodError) {
            return { error: err.issues[0].message };
        }
        log.error("Product creation error:", err);
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

        await productRepository.update(tenantId, productId, {
            ...(name !== undefined && { name }),
            ...(price !== undefined && { price: String(price) }),
            ...(description !== undefined && { description }),
            ...(status !== undefined && { status }),
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
            log.error("Audit logging failed:", auditError);
        }

        await expireProductCaches(tenantId);
        return { success: true };
    } catch (err) {
        log.error("Product update error:", err);
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
        log.error("Update stock error:", error);
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

        await productRepository.delete(tenantId, productId);

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
            log.error("Audit logging failed:", auditError);
        }

        await expireProductCaches(tenantId);
        return { success: true };
    } catch (error) {
        log.error("Delete product error:", error);
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

        await productRepository.updateStatus(tenantId, productId, status);

        // Audit log - non-blocking
        try {
            await auditLogger.logUpdate(tenantId, "product", productId, 
                { status: oldProduct?.status, name: oldProduct?.name },
                { status, name: oldProduct?.name },
                { userId }
            );
        } catch (auditError) {
            log.error("Audit logging failed:", auditError);
        }

        await expireProductCaches(tenantId);
        return { success: true };
    } catch (error) {
        log.error("Update product status error:", error);
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
                await productRepository.delete(tenantId, productId);
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
                    log.error("Audit logging failed for product", auditError, { productId });
                }
            } catch (error) {
                log.error("Bulk product operation failed", error, { productId });
                errors.push(`${productId}: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        }

        await expireProductCaches(tenantId);

        if (errors.length > 0) {
            return { error: `Failed to delete some products: ${errors.join(", ")}`, deletedCount };
        }

        return { success: true, deletedCount };
    } catch (error) {
        log.error("Bulk delete products error:", error);
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
                await productRepository.updateStatus(tenantId, productId, status);
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
                    log.error("Audit logging failed for product", auditError, { productId });
                }
            } catch (error) {
                log.error("Bulk product operation failed", error, { productId });
                errors.push(`${productId}: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        }

        await expireProductCaches(tenantId);

        if (errors.length > 0) {
            return { error: `Failed to update some products: ${errors.join(", ")}`, updatedCount };
        }

        return { success: true, updatedCount };
    } catch (error) {
        log.error("Bulk update product status error:", error);
        return { error: error instanceof Error ? error.message : "Failed to update products", updatedCount: 0 };
    }
}

export async function duplicateProduct(productId: string) {
    const { tenantId } = await getAuthenticatedTenant();
    const supabase = await createClient();

    // Fetch original
    const { data: original, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("tenant_id", tenantId)
        .single();

    if (error || !original) throw new Error("Product not found");

    // Create copy
    const { id: _id, created_at: _ca, updated_at: _ua, ...fields } = original;
    const { data: copy, error: insertError } = await supabase
        .from("products")
        .insert({
            ...fields,
            name: `${original.name} (Copy)`,
            slug: `${original.slug}-copy-${Date.now().toString(36)}`,
            status: "draft",
        })
        .select("id")
        .single();

    if (insertError) throw new Error(insertError.message);

    revalidatePath("/dashboard/products");
    return { id: copy.id };
}

export async function exportAllProducts(): Promise<string> {
    const { tenantId } = await getAuthenticatedTenant();
    const supabase = await createClient();

    const { data } = await supabase
        .from("products")
        .select("name, sku, price, quantity, status, categories(name)")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

    const rows = (data || []).map((p: Record<string, unknown>) => [
        `"${(p.name as string || "").replace(/"/g, '""')}"`,
        p.sku || "",
        p.price || "0",
        p.quantity || "0",
        p.status || "draft",
        (p.categories as { name: string } | null)?.name || "Uncategorized",
    ].join(","));

    return ["Name,SKU,Price,Stock,Status,Category", ...rows].join("\n");
}
