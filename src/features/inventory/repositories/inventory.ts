import "server-only";
import { products, categories, productVariants } from "@/db/schema/products";
import { stockMovements } from "@/db/schema/inventory";
import { eq, ilike, or, lte, gt, desc, and, inArray, sql } from "drizzle-orm";
import { withTenant } from "@/infrastructure/db";
import { QueryOptions } from "@/infrastructure/repositories/base";
import { auditLogger } from "@/infrastructure/services/audit-logger";

const LOW_STOCK_THRESHOLD = 10;

export type StockLevel = "healthy" | "low" | "out";
export type AdjustmentType = "add" | "remove" | "set";

export interface StockAdjustment {
    productId: string;
    quantity: number;
}

export interface InventoryStats {
    totalProducts: number;
    totalUnits: number;
    totalValue: number;
    costValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    healthyStockCount: number;
}

export interface OrderItemForInventory {
    variantId: string;
    productId?: string | null;
    quantity: number;
    productName?: string;
}

export interface InventoryDecrementResult {
    success: boolean;
    decrementedItems: Array<{
        variantId: string;
        productId: string;
        productName: string;
        quantityBefore: number;
        quantityAfter: number;
        decremented: number;
    }>;
    errors: Array<{
        variantId: string;
        error: string;
        code: "VARIANT_NOT_FOUND" | "INSUFFICIENT_STOCK" | "UNKNOWN_ERROR";
    }>;
}

export class InventoryRepository {
    async findAll(tenantId: string, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            let query = tx
                .select({
                    id: products.id,
                    tenantId: products.tenantId,
                    categoryId: products.categoryId,
                    name: products.name,
                    slug: products.slug,
                    sku: products.sku,
                    barcode: products.barcode,
                    quantity: products.quantity,
                    trackQuantity: products.trackQuantity,
                    allowBackorder: products.allowBackorder,
                    price: products.price,
                    costPrice: products.costPrice,
                    status: products.status,
                    images: products.images,
                    updatedAt: products.updatedAt,
                    categoryName: categories.name,
                })
                .from(products)
                .leftJoin(categories, eq(products.categoryId, categories.id))
                .where(eq(products.status, "active"))
                .orderBy(products.name);

            if (options?.limit) {
                query = query.limit(options.limit) as typeof query;
            }

            if (options?.offset) {
                query = query.offset(options.offset) as typeof query;
            }

            return query;
        });
    }

    async findById(tenantId: string, productId: string) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .select({
                    id: products.id,
                    tenantId: products.tenantId,
                    categoryId: products.categoryId,
                    name: products.name,
                    slug: products.slug,
                    sku: products.sku,
                    barcode: products.barcode,
                    quantity: products.quantity,
                    trackQuantity: products.trackQuantity,
                    allowBackorder: products.allowBackorder,
                    price: products.price,
                    costPrice: products.costPrice,
                    status: products.status,
                    images: products.images,
                    updatedAt: products.updatedAt,
                    categoryName: categories.name,
                })
                .from(products)
                .leftJoin(categories, eq(products.categoryId, categories.id))
                .where(eq(products.id, productId))
                .limit(1);

            return result || null;
        });
    }

    async findByStockLevel(tenantId: string, level: StockLevel, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            let stockCondition;
            if (level === "out") {
                stockCondition = eq(products.quantity, 0);
            } else if (level === "low") {
                stockCondition = and(
                    gt(products.quantity, 0),
                    lte(products.quantity, LOW_STOCK_THRESHOLD)
                );
            } else {
                stockCondition = gt(products.quantity, LOW_STOCK_THRESHOLD);
            }

            let query = tx
                .select({
                    id: products.id,
                    tenantId: products.tenantId,
                    categoryId: products.categoryId,
                    name: products.name,
                    slug: products.slug,
                    sku: products.sku,
                    barcode: products.barcode,
                    quantity: products.quantity,
                    trackQuantity: products.trackQuantity,
                    allowBackorder: products.allowBackorder,
                    price: products.price,
                    costPrice: products.costPrice,
                    status: products.status,
                    images: products.images,
                    updatedAt: products.updatedAt,
                    categoryName: categories.name,
                })
                .from(products)
                .leftJoin(categories, eq(products.categoryId, categories.id))
                .where(and(eq(products.status, "active"), stockCondition))
                .orderBy(products.quantity);

            if (options?.limit) {
                query = query.limit(options.limit) as typeof query;
            }

            if (options?.offset) {
                query = query.offset(options.offset) as typeof query;
            }

            return query;
        });
    }

    async findByCategory(tenantId: string, categoryId: string, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            let query = tx
                .select()
                .from(products)
                .where(eq(products.categoryId, categoryId))
                .orderBy(products.name);

            if (options?.limit) {
                query = query.limit(options.limit) as typeof query;
            }

            if (options?.offset) {
                query = query.offset(options.offset) as typeof query;
            }

            return query;
        });
    }

    async search(tenantId: string, query: string, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            const searchPattern = `%${query}%`;
            let dbQuery = tx
                .select({
                    id: products.id,
                    tenantId: products.tenantId,
                    categoryId: products.categoryId,
                    name: products.name,
                    slug: products.slug,
                    sku: products.sku,
                    barcode: products.barcode,
                    quantity: products.quantity,
                    trackQuantity: products.trackQuantity,
                    allowBackorder: products.allowBackorder,
                    price: products.price,
                    costPrice: products.costPrice,
                    status: products.status,
                    images: products.images,
                    updatedAt: products.updatedAt,
                    categoryName: categories.name,
                })
                .from(products)
                .leftJoin(categories, eq(products.categoryId, categories.id))
                .where(
                    or(
                        ilike(products.name, searchPattern),
                        ilike(products.sku, searchPattern),
                        ilike(products.barcode, searchPattern)
                    )
                )
                .orderBy(products.name);

            if (options?.limit) {
                dbQuery = dbQuery.limit(options.limit) as typeof dbQuery;
            }

            if (options?.offset) {
                dbQuery = dbQuery.offset(options.offset) as typeof dbQuery;
            }

            return dbQuery;
        });
    }

    async getStats(tenantId: string): Promise<InventoryStats> {
        return withTenant(tenantId, async (tx) => {
            const activeProducts = await tx
                .select()
                .from(products)
                .where(eq(products.status, "active"));

            let totalProducts = 0;
            let totalUnits = 0;
            let totalValue = 0;
            let costValue = 0;
            let lowStockCount = 0;
            let outOfStockCount = 0;
            let healthyStockCount = 0;

            for (const product of activeProducts) {
                totalProducts++;
                const qty = product.quantity || 0;
                const price = Number(product.price) || 0;
                const cost = Number(product.costPrice) || 0;

                totalUnits += qty;
                totalValue += qty * price;
                costValue += qty * cost;

                if (qty === 0) {
                    outOfStockCount++;
                } else if (qty <= LOW_STOCK_THRESHOLD) {
                    lowStockCount++;
                } else {
                    healthyStockCount++;
                }
            }

            return {
                totalProducts,
                totalUnits,
                totalValue,
                costValue,
                lowStockCount,
                outOfStockCount,
                healthyStockCount,
            };
        });
    }

    async adjustStock(
        tenantId: string,
        productId: string,
        quantity: number,
        type: AdjustmentType,
        reason: string
    ) {
        return withTenant(tenantId, async (tx) => {
            const [product] = await tx
                .select()
                .from(products)
                .where(eq(products.id, productId))
                .limit(1);

            if (!product) {
                throw new Error("Product not found");
            }

            const currentQty = product.quantity || 0;
            let newQty: number;
            let movementQty: number;

            switch (type) {
                case "add":
                    newQty = currentQty + quantity;
                    movementQty = quantity;
                    break;
                case "remove":
                    newQty = Math.max(0, currentQty - quantity);
                    movementQty = -Math.min(quantity, currentQty);
                    break;
                case "set":
                    newQty = quantity;
                    movementQty = quantity - currentQty;
                    break;
            }

            const [updated] = await tx
                .update(products)
                .set({
                    quantity: newQty,
                    updatedAt: new Date(),
                })
                .where(eq(products.id, productId))
                .returning();

            await tx.insert(stockMovements).values({
                tenantId,
                productId,
                productName: product.name,
                type: type === "set" ? "adjustment" : type === "add" ? "received" : "sold",
                quantityBefore: currentQty,
                quantityChange: movementQty,
                quantityAfter: newQty,
                reason,
            });

            return updated;
        });
    }

    async bulkAdjustStock(
        tenantId: string,
        adjustments: StockAdjustment[],
        type: AdjustmentType,
        reason: string
    ) {
        const results = [];
        for (const adjustment of adjustments) {
            const result = await this.adjustStock(
                tenantId,
                adjustment.productId,
                adjustment.quantity,
                type,
                reason
            );
            results.push(result);
        }
        return results;
    }

    async getRecentMovements(tenantId: string, limit = 20) {
        return withTenant(tenantId, async (tx) => {
            return tx
                .select()
                .from(stockMovements)
                .orderBy(desc(stockMovements.createdAt))
                .limit(limit);
        });
    }

    async getMovementHistory(tenantId: string, productId: string, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            let query = tx
                .select()
                .from(stockMovements)
                .where(eq(stockMovements.productId, productId))
                .orderBy(desc(stockMovements.createdAt));

            if (options?.limit) {
                query = query.limit(options.limit) as typeof query;
            }

            if (options?.offset) {
                query = query.offset(options.offset) as typeof query;
            }

            return query;
        });
    }

    async decrementStockForOrder(
        tenantId: string,
        orderId: string,
        items: OrderItemForInventory[],
        options?: {
            allowBackorder?: boolean;
            skipInsufficientStock?: boolean;
        }
    ): Promise<InventoryDecrementResult> {
        const { allowBackorder = false, skipInsufficientStock = false } = options ?? {};

        return withTenant(tenantId, async (tx) => {
            const result: InventoryDecrementResult = {
                success: true,
                decrementedItems: [],
                errors: [],
            };

            const variantIds = items.map(item => item.variantId).filter(Boolean);
            
            if (variantIds.length === 0) {
                return result;
            }

            const variants = await tx
                .select({
                    variantId: productVariants.id,
                    variantName: productVariants.name,
                    variantQuantity: productVariants.quantity,
                    productId: productVariants.productId,
                    productName: products.name,
                    productQuantity: products.quantity,
                    trackQuantity: products.trackQuantity,
                    allowBackorder: products.allowBackorder,
                })
                .from(productVariants)
                .innerJoin(products, eq(productVariants.productId, products.id))
                .where(inArray(productVariants.id, variantIds));

            const variantMap = new Map(variants.map(v => [v.variantId, v]));

            for (const item of items) {
                const variant = variantMap.get(item.variantId);

                if (!variant) {
                    result.errors.push({
                        variantId: item.variantId,
                        error: `Variant not found: ${item.variantId}`,
                        code: "VARIANT_NOT_FOUND",
                    });
                    result.success = false;
                    continue;
                }

                const currentQuantity = variant.variantQuantity ?? 0;
                const canBackorder = allowBackorder || variant.allowBackorder;

                if (!canBackorder && currentQuantity < item.quantity) {
                    if (skipInsufficientStock) {
                        result.errors.push({
                            variantId: item.variantId,
                            error: `Insufficient stock for ${variant.productName} (${variant.variantName}): available ${currentQuantity}, requested ${item.quantity}`,
                            code: "INSUFFICIENT_STOCK",
                        });
                        continue;
                    } else {
                        result.errors.push({
                            variantId: item.variantId,
                            error: `Insufficient stock for ${variant.productName} (${variant.variantName}): available ${currentQuantity}, requested ${item.quantity}`,
                            code: "INSUFFICIENT_STOCK",
                        });
                        result.success = false;
                        continue;
                    }
                }

                const newQuantity = Math.max(0, currentQuantity - item.quantity);
                const actualDecrement = currentQuantity - newQuantity;

                await tx
                    .update(productVariants)
                    .set({
                        quantity: newQuantity,
                        updatedAt: new Date(),
                    })
                    .where(eq(productVariants.id, item.variantId));

                if (variant.trackQuantity) {
                    await tx
                        .update(products)
                        .set({
                            quantity: sql`GREATEST(0, ${products.quantity} - ${actualDecrement})`,
                            updatedAt: new Date(),
                        })
                        .where(eq(products.id, variant.productId));
                }

                await tx.insert(stockMovements).values({
                    tenantId,
                    productId: variant.productId,
                    productName: `${variant.productName} - ${variant.variantName}`,
                    type: "sold",
                    quantityBefore: currentQuantity,
                    quantityChange: -actualDecrement,
                    quantityAfter: newQuantity,
                    reason: "Order completed",
                    reference: orderId,
                });

                result.decrementedItems.push({
                    variantId: item.variantId,
                    productId: variant.productId,
                    productName: `${variant.productName} - ${variant.variantName}`,
                    quantityBefore: currentQuantity,
                    quantityAfter: newQuantity,
                    decremented: actualDecrement,
                });
            }

            if (result.decrementedItems.length > 0) {
                try {
                    await auditLogger.logWithTransaction(tx, tenantId, "inventory.decrement", {
                        entityType: "inventory",
                        entityId: orderId,
                        newValues: {
                            orderId,
                            itemsDecremented: result.decrementedItems.length,
                            totalUnitsDecremented: result.decrementedItems.reduce((sum, item) => sum + item.decremented, 0),
                            items: result.decrementedItems,
                        },
                        metadata: {
                            source: "stripe_webhook",
                            hasErrors: result.errors.length > 0,
                            errorCount: result.errors.length,
                        },
                    });
                } catch (auditError) {
                    console.error("[Inventory] Audit logging failed:", auditError);
                }
            }

            return result;
        });
    }

    async decrementProductStock(
        tenantId: string,
        orderId: string,
        items: Array<{ productId: string; quantity: number; productName?: string }>
    ): Promise<InventoryDecrementResult> {
        return withTenant(tenantId, async (tx) => {
            const result: InventoryDecrementResult = {
                success: true,
                decrementedItems: [],
                errors: [],
            };

            const productIds = items.map(item => item.productId).filter(Boolean);
            
            if (productIds.length === 0) {
                return result;
            }

            const productList = await tx
                .select()
                .from(products)
                .where(inArray(products.id, productIds));

            const productMap = new Map(productList.map(p => [p.id, p]));

            for (const item of items) {
                const product = productMap.get(item.productId);

                if (!product) {
                    result.errors.push({
                        variantId: item.productId,
                        error: `Product not found: ${item.productId}`,
                        code: "VARIANT_NOT_FOUND",
                    });
                    result.success = false;
                    continue;
                }

                const currentQuantity = product.quantity ?? 0;

                if (product.trackQuantity && !product.allowBackorder && currentQuantity < item.quantity) {
                    result.errors.push({
                        variantId: item.productId,
                        error: `Insufficient stock for ${product.name}: available ${currentQuantity}, requested ${item.quantity}`,
                        code: "INSUFFICIENT_STOCK",
                    });
                    result.success = false;
                    continue;
                }

                const newQuantity = Math.max(0, currentQuantity - item.quantity);
                const actualDecrement = currentQuantity - newQuantity;

                await tx
                    .update(products)
                    .set({
                        quantity: newQuantity,
                        updatedAt: new Date(),
                    })
                    .where(eq(products.id, item.productId));

                await tx.insert(stockMovements).values({
                    tenantId,
                    productId: item.productId,
                    productName: product.name,
                    type: "sold",
                    quantityBefore: currentQuantity,
                    quantityChange: -actualDecrement,
                    quantityAfter: newQuantity,
                    reason: "Order completed",
                    reference: orderId,
                });

                result.decrementedItems.push({
                    variantId: item.productId,
                    productId: item.productId,
                    productName: product.name,
                    quantityBefore: currentQuantity,
                    quantityAfter: newQuantity,
                    decremented: actualDecrement,
                });
            }

            if (result.decrementedItems.length > 0) {
                try {
                    await auditLogger.logWithTransaction(tx, tenantId, "inventory.decrement", {
                        entityType: "inventory",
                        entityId: orderId,
                        newValues: {
                            orderId,
                            itemsDecremented: result.decrementedItems.length,
                            totalUnitsDecremented: result.decrementedItems.reduce((sum, item) => sum + item.decremented, 0),
                            items: result.decrementedItems,
                        },
                        metadata: {
                            source: "stripe_webhook",
                        },
                    });
                } catch (auditError) {
                    console.error("[Inventory] Audit logging failed:", auditError);
                }
            }

            return result;
        });
    }
}

export const inventoryRepository = new InventoryRepository();
