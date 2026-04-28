"use server";

import { z } from "zod";
import { createLogger } from "@/lib/logger";
const log = createLogger("actions:inventory");

import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { inventoryRepository } from "@/features/inventory/repositories";
import type { AdjustmentType } from "@/features/inventory/repositories";
import { db } from "@/infrastructure/db";
import { products } from "@/db/schema/products";
import { stockMovements } from "@/db/schema/inventory";
import { eq, and, inArray } from "drizzle-orm";

async function getAuthenticatedTenant() {
    const { user } = await getAuthenticatedClient();
    return { tenantId: user.tenantId, userId: user.id };
}

import type { StockAdjustment, InventoryProduct, StockMovement } from "./types";

const adjustStockSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int(),
    type: z.enum(["add", "remove", "set", "transfer"]),
    reason: z.string().min(1).max(500),
});

// Adjust stock for a single product
export async function adjustStock(adjustment: StockAdjustment): Promise<{ success?: boolean; error?: string; newQuantity?: number }> {
    try {
        const parsed = adjustStockSchema.parse(adjustment);
        const { tenantId } = await getAuthenticatedTenant();

        // Map adjustment type to repository type
        const type: AdjustmentType = parsed.type === "transfer" ? "set" : parsed.type;

        const updated = await inventoryRepository.adjustStock(
            tenantId,
            parsed.productId,
            parsed.quantity,
            type,
            parsed.reason
        );

        revalidatePath("/dashboard/inventory");
        revalidatePath("/dashboard/products");
        return { newQuantity: updated.quantity || 0 };
    } catch (err) {
        log.error("Adjust stock error:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to adjust stock" };
    }
}

const bulkAdjustSchema = z.object({
    adjustments: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int() })).min(1),
    type: z.enum(["add", "remove", "set"]),
    reason: z.string().min(1).max(500),
});

// Bulk adjust stock for multiple products
export async function bulkAdjustStock(
    adjustments: { productId: string; quantity: number }[],
    type: "add" | "remove" | "set",
    reason: string
): Promise<{ success?: boolean; error?: string; successCount: number }> {
    try {
        const parsed = bulkAdjustSchema.parse({ adjustments, type, reason });
        const { tenantId } = await getAuthenticatedTenant();

        const results = await inventoryRepository.bulkAdjustStock(
            tenantId,
            parsed.adjustments,
            parsed.type as AdjustmentType,
            parsed.reason
        );

        revalidatePath("/dashboard/inventory");
        revalidatePath("/dashboard/products");
        return { successCount: results.length };
    } catch (err) {
        log.error("Bulk adjust stock error:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to adjust stock", successCount: 0 };
    }
}

// Update reorder settings for a product
export async function updateReorderSettings(
    productId: string,
    reorderPoint: number,
    reorderQuantity: number
): Promise<{ success?: boolean; error?: string }> {
    try {
        const validProductId = z.string().uuid().parse(productId);
        const validReorderPoint = z.number().int().min(0).parse(reorderPoint);
        const validReorderQuantity = z.number().int().min(1).parse(reorderQuantity);
        const { tenantId } = await getAuthenticatedTenant();

        // Store in product metadata
        const [product] = await db
            .select({ metadata: products.metadata })
            .from(products)
            .where(and(eq(products.id, validProductId), eq(products.tenantId, tenantId)))
            .limit(1);

        const metadata = (product?.metadata as Record<string, unknown>) || {};
        metadata.inventory = {
            ...(metadata.inventory as Record<string, unknown> || {}),
            reorderPoint: validReorderPoint,
            reorderQuantity: validReorderQuantity,
        };

        await db
            .update(products)
            .set({ metadata, updatedAt: new Date() })
            .where(and(eq(products.id, validProductId), eq(products.tenantId, tenantId)));

        revalidatePath("/dashboard/inventory");
        return { success: true };
    } catch (err) {
        log.error("Update reorder settings error:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to update settings" };
    }
}

// Get stock movements for a product
export async function getStockMovements(
    productId?: string,
    limit: number = 50
): Promise<{ movements: StockMovement[]; error?: string }> {
    try {
        const { tenantId } = await getAuthenticatedTenant();

        let movements;
        if (productId) {
            movements = await inventoryRepository.getMovementHistory(tenantId, productId, { limit });
        } else {
            movements = await inventoryRepository.getRecentMovements(tenantId, limit);
        }

        const transformedMovements: StockMovement[] = movements.map((m) => ({
            id: m.id,
            product_id: m.productId,
            product_name: m.productName,
            type: m.type as StockMovement["type"],
            quantity_before: m.quantityBefore,
            quantity_change: m.quantityChange,
            quantity_after: m.quantityAfter,
            reason: m.reason,
            notes: m.notes,
            reference: m.reference,
            created_by: m.createdBy,
            created_at: m.createdAt.toISOString(),
        }));

        return { movements: transformedMovements };
    } catch (err) {
        log.error("Get stock movements error:", err);
        return { movements: [], error: err instanceof Error ? err.message : "Failed to fetch movements" };
    }
}

// Export inventory to CSV
export async function exportInventory(): Promise<{ success?: boolean; csv?: string; error?: string }> {
    try {
        const { tenantId } = await getAuthenticatedTenant();

        const rows = await db
            .select({
                id: products.id,
                name: products.name,
                sku: products.sku,
                barcode: products.barcode,
                quantity: products.quantity,
                price: products.price,
                costPrice: products.costPrice,
                status: products.status,
                categoryId: products.categoryId,
            })
            .from(products)
            .where(eq(products.tenantId, tenantId))
            .orderBy(products.name);

        const headers = ["Name", "SKU", "Barcode", "Quantity", "Price", "Cost", "Value", "Status"];
        const csvRows = rows.map((p) => [
            `"${p.name.replace(/"/g, '""')}"`,
            p.sku || "",
            p.barcode || "",
            p.quantity,
            p.price,
            p.costPrice || "",
            (p.quantity || 0) * Number(p.costPrice || p.price),
            p.status,
        ]);

        const csv = [headers.join(","), ...csvRows.map(r => r.join(","))].join("\n");
        return { csv };
    } catch (err) {
        log.error("Export inventory error:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to export" };
    }
}

const importSchema = z.array(z.object({
    sku: z.string().min(1),
    quantity: z.number().int().min(0),
})).min(1);

// Import inventory from CSV
export async function importInventory(
    updates: { sku: string; quantity: number }[]
): Promise<{ success?: boolean; error?: string; successCount: number; failedCount: number }> {
    try {
        const parsed = importSchema.parse(updates);
        const { tenantId, userId } = await getAuthenticatedTenant();
        let successCount = 0;
        let failedCount = 0;

        // Batch fetch all products by SKU
        const skus = parsed.map(u => u.sku);
        const matchedProducts = await db
            .select({ id: products.id, quantity: products.quantity, name: products.name, sku: products.sku })
            .from(products)
            .where(and(eq(products.tenantId, tenantId), inArray(products.sku, skus)));

        const productBySku = new Map(matchedProducts.map(p => [p.sku, p]));

        for (const update of parsed) {
            const product = productBySku.get(update.sku);

            if (!product) {
                failedCount++;
                continue;
            }

            const quantityBefore = product.quantity || 0;
            const quantityChange = update.quantity - quantityBefore;

            try {
                await db
                    .update(products)
                    .set({ quantity: update.quantity, updatedAt: new Date() })
                    .where(and(eq(products.id, product.id), eq(products.tenantId, tenantId)));

                successCount++;

                // Log movement
                await db.insert(stockMovements).values({
                    tenantId,
                    productId: product.id,
                    productName: product.name,
                    type: "adjustment",
                    quantityBefore,
                    quantityChange,
                    quantityAfter: update.quantity,
                    reason: "CSV Import",
                    createdBy: userId,
                });
            } catch {
                failedCount++;
            }
        }

        revalidatePath("/dashboard/inventory");
        revalidatePath("/dashboard/products");
        return { successCount, failedCount };
    } catch (err) {
        log.error("Import inventory error:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to import", successCount: 0, failedCount: 0 };
    }
}
