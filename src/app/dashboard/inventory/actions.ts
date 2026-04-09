"use server";

import { z } from "zod";
import { createLogger } from "@/lib/logger";
const log = createLogger("actions:inventory");

import { createClient } from "@/infrastructure/supabase/server";
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { inventoryRepository } from "@/features/inventory/repositories";
import type { AdjustmentType } from "@/features/inventory/repositories";

async function getAuthenticatedTenant() {
    const { user, supabase } = await getAuthenticatedClient();
    return { supabase, tenantId: user.tenantId, userId: user.id };
}

import type { StockAdjustment, InventoryProduct, StockMovement } from "./types";

const adjustStockSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int(),
    type: z.enum(["add", "remove", "set", "transfer"]),
    reason: z.string().min(1).max(500),
});

// Adjust stock for a single product
export async function adjustStock(adjustment: StockAdjustment): Promise<{ error?: string; newQuantity?: number }> {
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
        return { error: err instanceof Error ? err.message : "Failed to adjust stock" };
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
): Promise<{ error?: string; successCount: number }> {
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
        return { error: err instanceof Error ? err.message : "Failed to adjust stock", successCount: 0 };
    }
}

// Update reorder settings for a product
export async function updateReorderSettings(
    productId: string,
    reorderPoint: number,
    reorderQuantity: number
): Promise<{ error?: string }> {
    try {
        const validProductId = z.string().uuid().parse(productId);
        const validReorderPoint = z.number().int().min(0).parse(reorderPoint);
        const validReorderQuantity = z.number().int().min(1).parse(reorderQuantity);
        const { supabase, tenantId } = await getAuthenticatedTenant();

        // Store in product metadata
        const { data: product } = await supabase
            .from("products")
            .select("metadata")
            .eq("id", validProductId)
            .eq("tenant_id", tenantId)
            .single();

        const metadata = (product?.metadata as Record<string, unknown>) || {};
        metadata.inventory = {
            ...(metadata.inventory as Record<string, unknown> || {}),
            reorderPoint: validReorderPoint,
            reorderQuantity: validReorderQuantity,
        };

        const { error } = await supabase
            .from("products")
            .update({ metadata, updated_at: new Date().toISOString() })
            .eq("id", validProductId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { error: `Failed to update reorder settings: ${error.message}` };
        }

        revalidatePath("/dashboard/inventory");
        return {};
    } catch (err) {
        log.error("Update reorder settings error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update settings" };
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
export async function exportInventory(): Promise<{ csv?: string; error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        const { data: products, error } = await supabase
            .from("products")
            .select(`
                id, name, sku, barcode, quantity, price, cost_price, status,
                categories!products_category_id_fkey(name)
            `)
            .eq("tenant_id", tenantId)
            .order("name");

        if (error) {
            return { error: error.message };
        }

        const headers = ["Name", "SKU", "Barcode", "Quantity", "Price", "Cost", "Value", "Status", "Category"];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows = (products || []).map((p: any) => [
            `"${p.name.replace(/"/g, '""')}"`,
            p.sku || "",
            p.barcode || "",
            p.quantity,
            p.price,
            p.cost_price || "",
            p.quantity * (p.cost_price || p.price),
            p.status,
            p.categories?.name || "Uncategorized",
        ]);

        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        return { csv };
    } catch (err) {
        log.error("Export inventory error:", err);
        return { error: err instanceof Error ? err.message : "Failed to export" };
    }
}

const importSchema = z.array(z.object({
    sku: z.string().min(1),
    quantity: z.number().int().min(0),
})).min(1);

// Import inventory from CSV
export async function importInventory(
    updates: { sku: string; quantity: number }[]
): Promise<{ error?: string; successCount: number; failedCount: number }> {
    try {
        const parsed = importSchema.parse(updates);
        const { supabase, tenantId, userId } = await getAuthenticatedTenant();
        let successCount = 0;
        let failedCount = 0;

        // Batch fetch all products by SKU
        const skus = parsed.map(u => u.sku);
        const { data: products } = await supabase
            .from("products")
            .select("id, quantity, name, sku")
            .eq("tenant_id", tenantId)
            .in("sku", skus);

        const productBySku = new Map((products || []).map(p => [p.sku, p]));

        for (const update of parsed) {
            const product = productBySku.get(update.sku);

            if (!product) {
                failedCount++;
                continue;
            }

            const quantityBefore = product.quantity;
            const quantityChange = update.quantity - quantityBefore;

            const { error } = await supabase
                .from("products")
                .update({ quantity: update.quantity, updated_at: new Date().toISOString() })
                .eq("id", product.id)
                .eq("tenant_id", tenantId);

            if (error) {
                failedCount++;
            } else {
                successCount++;
                
                // Log movement
                await supabase.from("stock_movements").insert({
                    tenant_id: tenantId,
                    product_id: product.id,
                    product_name: product.name,
                    type: "adjustment",
                    quantity_before: quantityBefore,
                    quantity_change: quantityChange,
                    quantity_after: update.quantity,
                    reason: "CSV Import",
                    created_by: userId,
                });
            }
        }

        revalidatePath("/dashboard/inventory");
        revalidatePath("/dashboard/products");
        return { successCount, failedCount };
    } catch (err) {
        log.error("Import inventory error:", err);
        return { error: err instanceof Error ? err.message : "Failed to import", successCount: 0, failedCount: 0 };
    }
}
