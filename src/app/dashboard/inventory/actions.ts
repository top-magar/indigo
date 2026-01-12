"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { inventoryRepository } from "@/features/inventory/repositories";
import type { AdjustmentType } from "@/features/inventory/repositories";

async function getAuthenticatedTenant() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/login");
    }

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) {
        redirect("/login");
    }

    return { supabase, tenantId: userData.tenant_id, userId: user.id };
}

export interface StockAdjustment {
    productId: string;
    type: "add" | "remove" | "set" | "transfer";
    quantity: number;
    reason: string;
    notes?: string;
    reference?: string; // Order ID, PO number, etc.
}

export interface InventoryProduct {
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    barcode: string | null;
    quantity: number;
    track_quantity: boolean;
    allow_backorder: boolean;
    price: number;
    cost_price: number | null;
    status: "draft" | "active" | "archived";
    images: { url: string; alt: string }[];
    category_id: string | null;
    category_name: string | null;
    reorder_point: number;
    reorder_quantity: number;
    last_restock_date: string | null;
    updated_at: string;
}

export interface StockMovement {
    id: string;
    product_id: string;
    product_name: string;
    type: "add" | "remove" | "set" | "sale" | "return" | "adjustment" | "transfer";
    quantity_before: number;
    quantity_change: number;
    quantity_after: number;
    reason: string;
    notes: string | null;
    reference: string | null;
    created_by: string | null;
    created_at: string;
}

// Adjust stock for a single product
export async function adjustStock(adjustment: StockAdjustment): Promise<{ error?: string; newQuantity?: number }> {
    try {
        const { tenantId } = await getAuthenticatedTenant();

        // Map adjustment type to repository type
        const type: AdjustmentType = adjustment.type === "transfer" ? "set" : adjustment.type;

        const updated = await inventoryRepository.adjustStock(
            tenantId,
            adjustment.productId,
            adjustment.quantity,
            type,
            adjustment.reason
        );

        revalidatePath("/dashboard/inventory");
        revalidatePath("/dashboard/products");
        return { newQuantity: updated.quantity || 0 };
    } catch (err) {
        console.error("Adjust stock error:", err);
        return { error: err instanceof Error ? err.message : "Failed to adjust stock" };
    }
}

// Bulk adjust stock for multiple products
export async function bulkAdjustStock(
    adjustments: { productId: string; quantity: number }[],
    type: "add" | "remove" | "set",
    reason: string
): Promise<{ error?: string; successCount: number }> {
    try {
        const { tenantId } = await getAuthenticatedTenant();

        const results = await inventoryRepository.bulkAdjustStock(
            tenantId,
            adjustments,
            type as AdjustmentType,
            reason
        );

        revalidatePath("/dashboard/inventory");
        revalidatePath("/dashboard/products");
        return { successCount: results.length };
    } catch (err) {
        console.error("Bulk adjust stock error:", err);
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
        const { supabase, tenantId } = await getAuthenticatedTenant();

        // Store in product metadata
        const { data: product } = await supabase
            .from("products")
            .select("metadata")
            .eq("id", productId)
            .eq("tenant_id", tenantId)
            .single();

        const metadata = (product?.metadata as Record<string, unknown>) || {};
        metadata.inventory = {
            ...(metadata.inventory as Record<string, unknown> || {}),
            reorderPoint,
            reorderQuantity,
        };

        const { error } = await supabase
            .from("products")
            .update({ metadata, updated_at: new Date().toISOString() })
            .eq("id", productId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { error: `Failed to update reorder settings: ${error.message}` };
        }

        revalidatePath("/dashboard/inventory");
        return {};
    } catch (err) {
        console.error("Update reorder settings error:", err);
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
        console.error("Get stock movements error:", err);
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
        console.error("Export inventory error:", err);
        return { error: err instanceof Error ? err.message : "Failed to export" };
    }
}

// Import inventory from CSV
export async function importInventory(
    updates: { sku: string; quantity: number }[]
): Promise<{ error?: string; successCount: number; failedCount: number }> {
    try {
        const { supabase, tenantId, userId } = await getAuthenticatedTenant();
        let successCount = 0;
        let failedCount = 0;

        for (const update of updates) {
            const { data: product } = await supabase
                .from("products")
                .select("id, quantity, name")
                .eq("tenant_id", tenantId)
                .eq("sku", update.sku)
                .single();

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
        console.error("Import inventory error:", err);
        return { error: err instanceof Error ? err.message : "Failed to import", successCount: 0, failedCount: 0 };
    }
}
