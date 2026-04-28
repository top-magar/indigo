"use server";

import { createLogger } from "@/lib/logger";
const log = createLogger("products-product-actions");

import { validateId } from "@/shared/utils/validate-id";
import { getAuthenticatedClient } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { products, productVariants, inventoryLevels, categories } from "@/db/schema/products";
import { collectionProducts, collections } from "@/db/schema/collections";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type {
    Product,
    ProductMedia,
    ProductVariant,
    ProductStats,
    CreateVariantInput,
    UpdateVariantInput,
    BulkUpdateStockInput,
    VariantOption,
} from "@/features/products/types";

// ============================================================================
// AUTH HELPER
// ============================================================================

async function getAuthenticatedTenant() {
    const { user } = await getAuthenticatedClient();
    return { tenantId: user.tenantId, userId: user.id, userName: user.fullName };
}

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

export async function getProductDetail(productId: string): Promise<{ success: boolean; data?: Product; error?: string }> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(productId, "Product ID");
        // Fetch product with category
        const [product] = await db.select()
            .from(products)
            .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
            .limit(1);

        if (!product) {
            return { success: false, error: "Product not found" };
        }

        // Fetch category name
        let categoryName: string | null = null;
        if (product.categoryId) {
            const [cat] = await db.select({ name: categories.name })
                .from(categories)
                .where(eq(categories.id, product.categoryId))
                .limit(1);
            categoryName = cat?.name || null;
        }

        // Fetch variants with inventory
        const variantsData = await db.select()
            .from(productVariants)
            .where(and(eq(productVariants.productId, productId), eq(productVariants.tenantId, tenantId)))
            .orderBy(asc(productVariants.createdAt));

        const variantIds = variantsData.map(v => v.id);
        let inventoryMap: Record<string, { quantity: number; location: string }[]> = {};
        if (variantIds.length > 0) {
            const invLevels = await db.select()
                .from(inventoryLevels)
                .where(and(eq(inventoryLevels.tenantId, tenantId)));
            for (const inv of invLevels) {
                if (variantIds.includes(inv.variantId)) {
                    if (!inventoryMap[inv.variantId]) inventoryMap[inv.variantId] = [];
                    inventoryMap[inv.variantId].push({ quantity: inv.quantity, location: inv.location });
                }
            }
        }

        // Fetch collection associations
        const collectionLinks = await db.select({
            collectionId: collectionProducts.collectionId,
            collectionName: collections.name,
        })
            .from(collectionProducts)
            .innerJoin(collections, eq(collectionProducts.collectionId, collections.id))
            .where(eq(collectionProducts.productId, productId));

        // Transform to Product type
        const productData: Product = {
            id: product.id,
            tenantId: product.tenantId,
            name: product.name,
            slug: product.slug,
            description: product.description,
            descriptionHtml: (product as Record<string, unknown>).descriptionHtml as string | undefined,
            price: parseFloat(product.price || "0"),
            compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null,
            costPrice: product.costPrice ? parseFloat(product.costPrice) : null,
            currency: (product as Record<string, unknown>).currency as string || "USD",
            sku: product.sku,
            barcode: product.barcode,
            quantity: product.quantity || 0,
            trackQuantity: product.trackQuantity ?? true,
            allowBackorder: product.allowBackorder ?? false,
            status: product.status || "draft",
            categoryId: product.categoryId,
            categoryName,
            collectionIds: collectionLinks.map(cl => cl.collectionId),
            collectionNames: collectionLinks.map(cl => cl.collectionName).filter(Boolean) as string[],
            productTypeId: (product as Record<string, unknown>).productTypeId as string | undefined,
            productTypeName: null,
            media: ((product.images || []) as { url: string; alt?: string }[]).map((img, index: number): ProductMedia => ({
                id: `media-${index}`,
                url: typeof img === 'string' ? img : img.url,
                alt: typeof img === 'string' ? product.name : (img.alt || product.name),
                type: "image",
                position: index,
            })),
            hasVariants: variantsData.length > 0,
            variants: variantsData.map((v): ProductVariant => ({
                id: v.id,
                productId: v.productId,
                title: v.name,
                sku: v.sku,
                barcode: v.barcode,
                price: v.price ? parseFloat(v.price) : null,
                compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
                costPrice: v.costPrice ? parseFloat(v.costPrice) : null,
                quantity: inventoryMap[v.id]?.[0]?.quantity || 0,
                trackQuantity: (v as Record<string, unknown>).trackQuantity as boolean ?? true,
                allowBackorder: (v as Record<string, unknown>).allowBackorder as boolean ?? false,
                weight: v.weight ? parseFloat(v.weight) : null,
                weightUnit: (v as Record<string, unknown>).weightUnit as "g" | "kg" | "lb" | "oz" || "g",
                options: (Array.isArray(v.options) ? v.options : Object.entries(v.options || {}).map(([name, value]) => ({ name, value }))) as VariantOption[],
                imageId: (v as Record<string, unknown>).imageId as string | undefined,
                position: v.position || 0,
                createdAt: v.createdAt.toISOString(),
                updatedAt: v.updatedAt.toISOString(),
            })),
            attributes: (product as Record<string, unknown>).attributes as { attributeId: string; values: string[] }[] || [],
            shipping: {
                requiresShipping: (product as Record<string, unknown>).requiresShipping as boolean ?? true,
                weight: product.weight ? parseFloat(product.weight) : null,
                weightUnit: (product.weightUnit || "g") as "g" | "kg" | "lb" | "oz",
                dimensions: (product as Record<string, unknown>).dimensions as Record<string, unknown> || {},
            },
            seo: {
                metaTitle: (product as Record<string, unknown>).metaTitle as string | undefined,
                metaDescription: (product as Record<string, unknown>).metaDescription as string | undefined,
                slug: product.slug,
            },
            brand: (product as Record<string, unknown>).brand as string | undefined,
            tags: (product as Record<string, unknown>).tags as string[] || [],
            metadata: product.metadata as Record<string, unknown> | null,
            createdAt: product.createdAt.toISOString(),
            updatedAt: product.updatedAt.toISOString(),
        };

        return { success: true, data: productData };
    } catch (error) {
        log.error("Failed to fetch product:", error);
        return { success: false, error: "Failed to fetch product" };
    }
}

export async function getProductStats(): Promise<ProductStats> {
    const { tenantId } = await getAuthenticatedTenant();

    const productsData = await db.select({
        status: products.status,
        quantity: products.quantity,
        price: products.price,
    }).from(products).where(eq(products.tenantId, tenantId));

    const stats: ProductStats = {
        total: 0, active: 0, draft: 0, archived: 0,
        lowStock: 0, outOfStock: 0, totalValue: 0, withVariants: 0,
    };

    stats.total = productsData.length;
    productsData.forEach((product) => {
        if (product.status === "active") stats.active++;
        else if (product.status === "draft") stats.draft++;
        else if (product.status === "archived") stats.archived++;
        const qty = product.quantity || 0;
        if (qty === 0) stats.outOfStock++;
        else if (qty <= 10) stats.lowStock++;
        stats.totalValue += qty * parseFloat(product.price || "0");
    });

    return stats;
}

// ============================================================================
// VARIANT ACTIONS
// ============================================================================

export async function createVariant(input: CreateVariantInput) {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        const [variant] = await db.insert(productVariants).values({
            tenantId,
            productId: input.productId,
            name: input.title,
            sku: input.sku || null,
            price: input.price?.toString() || null,
            options: input.options as unknown as Record<string, string>,
        }).returning();

        if (!variant) {
            return { success: false, error: "Failed to create variant" };
        }

        if (input.quantity !== undefined) {
            await db.insert(inventoryLevels).values({
                tenantId,
                variantId: variant.id,
                quantity: input.quantity,
                location: "default",
            });
        }

        revalidatePath(`/dashboard/products/${input.productId}`);
        return { success: true, data: variant };
    } catch (error) {
        log.error("Failed to create variant:", error);
        return { success: false, error: "Failed to create variant" };
    }
}

export async function updateVariant(input: UpdateVariantInput) {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        const updateData: Record<string, unknown> = {};
        if (input.title !== undefined) updateData.name = input.title;
        if (input.sku !== undefined) updateData.sku = input.sku;
        if (input.price !== undefined) updateData.price = input.price?.toString();
        if (input.options !== undefined) updateData.options = input.options;

        const [variant] = await db.update(productVariants)
            .set(updateData)
            .where(and(eq(productVariants.id, input.id), eq(productVariants.tenantId, tenantId)))
            .returning({ productId: productVariants.productId });

        if (!variant) {
            return { success: false, error: "Failed to update variant" };
        }

        revalidatePath(`/dashboard/products/${variant.productId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to update variant:", error);
        return { success: false, error: "Failed to update variant" };
    }
}

export async function deleteVariant(variantId: string) {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(variantId, "Variant ID");
        const [variant] = await db.select({ productId: productVariants.productId })
            .from(productVariants)
            .where(and(eq(productVariants.id, variantId), eq(productVariants.tenantId, tenantId)))
            .limit(1);

        if (!variant) {
            return { success: false, error: "Variant not found" };
        }

        await db.delete(inventoryLevels)
            .where(and(eq(inventoryLevels.variantId, variantId), eq(inventoryLevels.tenantId, tenantId)));

        await db.delete(productVariants)
            .where(and(eq(productVariants.id, variantId), eq(productVariants.tenantId, tenantId)));

        revalidatePath(`/dashboard/products/${variant.productId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to delete variant:", error);
        return { success: false, error: "Failed to delete variant" };
    }
}

// ============================================================================
// STOCK ACTIONS
// ============================================================================

export async function updateVariantStock(variantId: string, quantity: number, action: "set" | "add" | "subtract" = "set") {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(variantId, "Variant ID");
        const [inventory] = await db.select()
            .from(inventoryLevels)
            .where(and(eq(inventoryLevels.variantId, variantId), eq(inventoryLevels.tenantId, tenantId)))
            .limit(1);

        let newQuantity = quantity;
        if (inventory) {
            if (action === "add") {
                newQuantity = inventory.quantity + quantity;
            } else if (action === "subtract") {
                newQuantity = Math.max(0, inventory.quantity - quantity);
            }

            await db.update(inventoryLevels)
                .set({ quantity: newQuantity, updatedAt: new Date() })
                .where(eq(inventoryLevels.id, inventory.id));
        } else {
            await db.insert(inventoryLevels).values({
                tenantId,
                variantId,
                quantity: newQuantity,
                location: "default",
            });
        }

        const [variant] = await db.select({ productId: productVariants.productId })
            .from(productVariants)
            .where(eq(productVariants.id, variantId))
            .limit(1);

        if (variant) {
            revalidatePath(`/dashboard/products/${variant.productId}`);
        }

        return { success: true };
    } catch (error) {
        log.error("Failed to update variant stock:", error);
        return { success: false, error: "Failed to update stock" };
    }
}

export async function bulkUpdateStock(updates: BulkUpdateStockInput[]) {
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
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(productId, "Product ID");
        const [product] = await db.select({ images: products.images })
            .from(products)
            .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
            .limit(1);

        if (!product) {
            return { success: false, error: "Product not found" };
        }

        const currentImages = (product.images || []) as { url: string; alt?: string }[];
        const updatedImages = [...currentImages, { url: mediaUrl, alt: alt || "" }];

        await db.update(products)
            .set({ images: updatedImages, updatedAt: new Date() })
            .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));

        revalidatePath(`/dashboard/products/${productId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to add media:", error);
        return { success: false, error: "Failed to add media" };
    }
}

export async function removeProductMedia(productId: string, mediaUrl: string) {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(productId, "Product ID");
        const [product] = await db.select({ images: products.images })
            .from(products)
            .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
            .limit(1);

        if (!product) {
            return { success: false, error: "Product not found" };
        }

        const currentImages = (product.images || []) as { url: string; alt?: string }[];
        const updatedImages = currentImages.filter(img => (typeof img === 'string' ? img : img.url) !== mediaUrl);

        await db.update(products)
            .set({ images: updatedImages, updatedAt: new Date() })
            .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));

        revalidatePath(`/dashboard/products/${productId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to remove media:", error);
        return { success: false, error: "Failed to remove media" };
    }
}

export async function reorderProductMedia(productId: string, mediaUrls: string[]) {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(productId, "Product ID");
        const reordered = mediaUrls.map(url => ({ url, alt: "" }));
        await db.update(products)
            .set({ images: reordered, updatedAt: new Date() })
            .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));

        revalidatePath(`/dashboard/products/${productId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to reorder media:", error);
        return { success: false, error: "Failed to reorder media" };
    }
}

// ============================================================================
// SEO ACTIONS
// ============================================================================

export async function updateProductSeo(productId: string, seo: { metaTitle?: string; metaDescription?: string; slug?: string }) {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(productId, "Product ID");
        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (seo.metaTitle !== undefined) updateData.metaTitle = seo.metaTitle;
        if (seo.metaDescription !== undefined) updateData.metaDescription = seo.metaDescription;
        if (seo.slug !== undefined) updateData.slug = seo.slug;

        await db.update(products)
            .set(updateData)
            .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));

        revalidatePath(`/dashboard/products/${productId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to update SEO:", error);
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
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(productId, "Product ID");
        if (data.categoryId !== undefined) {
            await db.update(products)
                .set({ categoryId: data.categoryId, updatedAt: new Date() })
                .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));
        }

        if (data.collectionIds !== undefined) {
            await db.delete(collectionProducts)
                .where(and(eq(collectionProducts.productId, productId), eq(collectionProducts.tenantId, tenantId)));

            if (data.collectionIds.length > 0) {
                await db.insert(collectionProducts).values(
                    data.collectionIds.map(collectionId => ({
                        productId,
                        collectionId,
                        tenantId,
                    }))
                );
            }
        }

        revalidatePath(`/dashboard/products/${productId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to update organization:", error);
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
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(productId, "Product ID");
        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (shipping.weight !== undefined) updateData.weight = shipping.weight.toString();
        if (shipping.weightUnit !== undefined) updateData.weightUnit = shipping.weightUnit;

        await db.update(products)
            .set(updateData)
            .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));

        revalidatePath(`/dashboard/products/${productId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to update shipping:", error);
        return { success: false, error: "Failed to update shipping" };
    }
}
