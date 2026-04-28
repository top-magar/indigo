"use server";

import { createLogger } from "@/lib/logger";
const log = createLogger("actions:products");

import { z } from "zod";
import { getAuthenticatedClient } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { products, categories } from "@/db/schema/products";
import { collectionProducts } from "@/db/schema/collections";
import { eq, and, sql, inArray } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { expireProductsCache, expireProductCache } from "@/features/store/data";
import { auditLogger } from "@/infrastructure/services/audit-logger";

async function getAuthenticatedTenant() {
    const { user } = await getAuthenticatedClient();
    return { tenantId: user.tenantId, userId: user.id, tenantSlug: undefined as string | undefined };
}

async function expireProductCaches(tenantId: string, productSlug?: string) {
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/collections");
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

export async function createProduct(formData: FormData): Promise<{ success?: boolean; error?: string }> {
    try {
        const { tenantId, userId } = await getAuthenticatedTenant();

        const { checkPlanLimit } = await import("@/lib/plan-limits");
        const limit = await checkPlanLimit(tenantId, "products");
        if (!limit.allowed) return { success: false, error: limit.reason };

        const raw = Object.fromEntries(formData.entries());
        const { name, price, description, quantity, sku } = createProductSchema.parse(raw);

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const [product] = await db.insert(products).values({
            tenantId, name, slug, price: price.toString(),
            description: description || null, quantity, sku: sku || null, status: "active",
        }).returning({ id: products.id });

        if (!product) {
            return { success: false, error: "Failed to create product" };
        }

        try {
            await auditLogger.logCreate(tenantId, "product", product.id, {
                name, price, description: description || undefined, quantity, sku: sku || undefined, status: "active",
            }, { userId });
        } catch (auditError) {
            log.error("Audit logging failed:", auditError);
        }

        await expireProductCaches(tenantId);
        return { success: true };
    } catch (error) {
        log.error("Product creation error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to create product" };
    }
}

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

        const { checkPlanLimit } = await import("@/lib/plan-limits");
        const limit = await checkPlanLimit(tenantId, "products");
        if (!limit.allowed) return { success: false, error: limit.reason };

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

        if (isNaN(raw.price)) return { success: false, error: "Price must be a valid number" };

        const validated = productDetailsSchema.parse(raw);

        const slug = validated.slug || validated.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const [product] = await db.insert(products).values({
            tenantId, name: validated.name, slug,
            description: validated.description || null,
            price: validated.price.toString(),
            compareAtPrice: validated.compareAtPrice?.toString() || null,
            costPrice: validated.costPrice?.toString() || null,
            sku: validated.sku || null,
            barcode: validated.barcode || null,
            quantity: validated.quantity,
            trackQuantity: validated.trackQuantity,
            allowBackorder: validated.allowBackorder,
            weight: validated.weight?.toString() || null,
            weightUnit: validated.weightUnit,
            status: validated.status,
            hasVariants: validated.hasVariants,
            categoryId: validated.categoryId || null,
            images: validated.images.length > 0 ? validated.images : [],
            metadata: {
                brand: validated.brand || null,
                tags: validated.tags,
                seo: { metaTitle: validated.metaTitle || null, metaDescription: validated.metaDescription || null },
                shipping: { requiresShipping: validated.requiresShipping, weightUnit: validated.weightUnit },
                publishAt: validated.publishAt || null,
            },
        }).returning({ id: products.id });

        if (!product) {
            return { success: false, error: "Failed to create product" };
        }

        try {
            await auditLogger.logCreate(tenantId, "product", product.id, {
                name: validated.name, slug: validated.slug, price: validated.price,
                status: validated.status, hasVariants: validated.hasVariants,
                variantsCount: validated.variants.length, imagesCount: validated.images.length,
            }, { userId });
        } catch (auditError) {
            log.error("Audit logging failed:", auditError);
        }

        await expireProductCaches(tenantId);
        return { success: true, productId: product.id };
    } catch (err) {
        if (err instanceof z.ZodError) {
            return { success: false, error: err.issues[0].message };
        }
        log.error("Product creation error:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to create product" };
    }
}

export async function updateProduct(formData: FormData): Promise<{ success?: boolean; error?: string }> {
    try {
        const { tenantId, userId } = await getAuthenticatedTenant();
        
        const productId = formData.get("productId") as string;
        if (!productId) return { success: false, error: "Product ID is required" };

        const [oldProduct] = await db.select({ name: products.name, price: products.price, description: products.description, status: products.status })
            .from(products).where(and(eq(products.id, productId), eq(products.tenantId, tenantId))).limit(1);

        const name = formData.get("name") as string | undefined;
        const price = formData.get("price") ? parseFloat(formData.get("price") as string) : undefined;
        const description = formData.get("description") as string | undefined;
        const status = formData.get("status") as "draft" | "active" | "archived" | undefined;
        const collectionIdsJson = formData.get("collectionIds") as string;
        const collectionIds = collectionIdsJson ? JSON.parse(collectionIdsJson) : undefined;

        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (name) updateData.name = name;
        if (price !== undefined) updateData.price = price.toString();
        if (description !== undefined) updateData.description = description;
        if (status) updateData.status = status;

        await db.update(products).set(updateData)
            .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));

        try {
            const oldValues: Record<string, unknown> = {};
            const newValues: Record<string, unknown> = {};
            if (oldProduct) {
                if (name !== undefined) { oldValues.name = oldProduct.name; newValues.name = name; }
                if (price !== undefined) { oldValues.price = oldProduct.price; newValues.price = price; }
                if (description !== undefined) { oldValues.description = oldProduct.description; newValues.description = description; }
                if (status !== undefined) { oldValues.status = oldProduct.status; newValues.status = status; }
                if (collectionIds !== undefined) { newValues.collectionIds = collectionIds; }
            }
            await auditLogger.logUpdate(tenantId, "product", productId, oldValues, newValues, { userId });
        } catch (auditError) {
            log.error("Audit logging failed:", auditError);
        }

        await expireProductCaches(tenantId);
        return { success: true };
    } catch (err) {
        log.error("Product update error:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to update product" };
    }
}

export async function updateProductStock(formData: FormData): Promise<{ success?: boolean; error?: string }> {
    try {
        const { tenantId } = await getAuthenticatedTenant();

        const productId = formData.get("productId") as string;
        const action = formData.get("action") as "add" | "remove" | "set";
        const adjustment = parseInt(formData.get("adjustment") as string) || 1;

        const [product] = await db.select({ slug: products.slug })
            .from(products).where(and(eq(products.id, productId), eq(products.tenantId, tenantId))).limit(1);

        if (!product) return { success: false, error: "Product not found" };

        if (action === "set") {
            await db.update(products).set({ quantity: adjustment, updatedAt: new Date() })
                .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));
        } else {
            const expr = action === "add"
                ? sql`${products.quantity} + ${Math.abs(adjustment)}`
                : sql`GREATEST(0, ${products.quantity} - ${Math.abs(adjustment)})`;
            await db.update(products).set({ quantity: expr, updatedAt: new Date() })
                .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));
        }

        await expireProductCaches(tenantId, product.slug);
        return { success: true };
    } catch (error) {
        log.error("Update stock error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update stock" };
    }
}

export async function deleteProduct(formData: FormData): Promise<{ success?: boolean; error?: string }> {
    try {
        const { tenantId, userId } = await getAuthenticatedTenant();
        const productId = formData.get("productId") as string;

        const [oldProduct] = await db.select({ name: products.name, slug: products.slug, price: products.price, status: products.status, sku: products.sku, quantity: products.quantity })
            .from(products).where(and(eq(products.id, productId), eq(products.tenantId, tenantId))).limit(1);

        await db.delete(products).where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));

        try {
            await auditLogger.logDelete(tenantId, "product", productId, {
                name: oldProduct?.name, slug: oldProduct?.slug, price: oldProduct?.price,
                status: oldProduct?.status, sku: oldProduct?.sku, quantity: oldProduct?.quantity,
            }, { userId });
        } catch (auditError) {
            log.error("Audit logging failed:", auditError);
        }

        await expireProductCaches(tenantId);
        return { success: true };
    } catch (error) {
        log.error("Delete product error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete product" };
    }
}

export async function updateProductStatus(productId: string, status: "draft" | "active" | "archived"): Promise<{ success?: boolean; error?: string }> {
    try {
        const { tenantId, userId } = await getAuthenticatedTenant();

        const [oldProduct] = await db.select({ status: products.status, name: products.name })
            .from(products).where(and(eq(products.id, productId), eq(products.tenantId, tenantId))).limit(1);

        await db.update(products).set({ status, updatedAt: new Date() })
            .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));

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
        return { success: false, error: error instanceof Error ? error.message : "Failed to update product status" };
    }
}

export async function bulkDeleteProducts(productIds: string[]): Promise<{ success?: boolean; error?: string; deletedCount: number }> {
    try {
        const { tenantId, userId } = await getAuthenticatedTenant();

        const oldProducts = await db.select({ id: products.id, name: products.name, slug: products.slug, price: products.price, status: products.status, sku: products.sku, quantity: products.quantity })
            .from(products).where(and(eq(products.tenantId, tenantId), inArray(products.id, productIds)));

        const productMap = new Map(oldProducts.map(p => [p.id, p]));
        const errors: string[] = [];
        let deletedCount = 0;
        
        for (const productId of productIds) {
            try {
                await db.delete(products).where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));
                deletedCount++;
                try {
                    const oldProduct = productMap.get(productId);
                    await auditLogger.logDelete(tenantId, "product", productId, {
                        name: oldProduct?.name, slug: oldProduct?.slug, price: oldProduct?.price,
                        status: oldProduct?.status, sku: oldProduct?.sku, quantity: oldProduct?.quantity,
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
            return { success: false, error: `Failed to delete some products: ${errors.join(", ")}`, deletedCount };
        }

        return { success: true, deletedCount };
    } catch (error) {
        log.error("Bulk delete products error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete products", deletedCount: 0 };
    }
}

export async function bulkUpdateProductStatus(productIds: string[], status: "draft" | "active" | "archived"): Promise<{ success?: boolean; error?: string; updatedCount: number }> {
    try {
        const { tenantId, userId } = await getAuthenticatedTenant();

        const oldProducts = await db.select({ id: products.id, name: products.name, status: products.status })
            .from(products).where(and(eq(products.tenantId, tenantId), inArray(products.id, productIds)));

        const productMap = new Map(oldProducts.map(p => [p.id, p]));
        const errors: string[] = [];
        let updatedCount = 0;
        
        for (const productId of productIds) {
            try {
                await db.update(products).set({ status, updatedAt: new Date() })
                    .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));
                updatedCount++;
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
            return { success: false, error: `Failed to update some products: ${errors.join(", ")}`, updatedCount };
        }

        return { success: true, updatedCount };
    } catch (error) {
        log.error("Bulk update product status error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update products", updatedCount: 0 };
    }
}

export async function duplicateProduct(productId: string) {
    const { tenantId } = await getAuthenticatedTenant();

    const { checkPlanLimit } = await import("@/lib/plan-limits");
    const limit = await checkPlanLimit(tenantId, "products");
    if (!limit.allowed) return { success: false, error: limit.reason };

    const [original] = await db.select().from(products)
        .where(and(eq(products.id, productId), eq(products.tenantId, tenantId))).limit(1);

    if (!original) throw new Error("Product not found");

    const [copy] = await db.insert(products).values({
        tenantId: original.tenantId, name: `${original.name} (Copy)`,
        slug: `${original.slug}-copy-${Date.now().toString(36)}`,
        description: original.description, price: original.price,
        compareAtPrice: original.compareAtPrice, costPrice: original.costPrice,
        sku: original.sku, barcode: original.barcode, quantity: original.quantity,
        trackQuantity: original.trackQuantity, allowBackorder: original.allowBackorder,
        weight: original.weight, weightUnit: original.weightUnit,
        status: "draft", hasVariants: original.hasVariants,
        categoryId: original.categoryId, images: original.images,
        metadata: original.metadata, vendor: original.vendor,
        productType: original.productType,
    }).returning({ id: products.id });

    revalidatePath("/dashboard/products");
    return { id: copy.id };
}

export async function exportAllProducts(): Promise<string> {
    const { tenantId } = await getAuthenticatedTenant();

    const data = await db.select({
        name: products.name, sku: products.sku, price: products.price,
        quantity: products.quantity, status: products.status,
        categoryId: products.categoryId,
    }).from(products).where(eq(products.tenantId, tenantId));

    // Fetch category names for all products
    const categoryIds = [...new Set(data.filter(p => p.categoryId).map(p => p.categoryId!))];
    let categoryMap = new Map<string, string>();
    if (categoryIds.length > 0) {
        const cats = await db.select({ id: categories.id, name: categories.name })
            .from(categories).where(inArray(categories.id, categoryIds));
        categoryMap = new Map(cats.map(c => [c.id, c.name]));
    }

    const rows = data.map(p => [
        `"${(p.name || "").replace(/"/g, '""')}"`,
        p.sku || "",
        p.price || "0",
        p.quantity || "0",
        p.status || "draft",
        p.categoryId ? categoryMap.get(p.categoryId) || "Uncategorized" : "Uncategorized",
    ].join(","));

    return ["Name,SKU,Price,Stock,Status,Category", ...rows].join("\n");
}
