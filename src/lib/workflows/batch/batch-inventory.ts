/**
 * Batch Update Inventory Workflow
 * Handles bulk inventory adjustments with partial failure handling
 */

import { createClient } from "@/lib/supabase/server";
import { eventBus, createEventPayload } from "@/lib/services/event-bus";

// Types
export interface InventoryAdjustment {
  productId: string;
  variantId?: string;
  action: "add" | "remove" | "set";
  quantity: number;
  reason?: string;
}

export interface BatchUpdateInventoryInput {
  adjustments: InventoryAdjustment[];
  continueOnError?: boolean;
  recordHistory?: boolean;
}

export interface InventoryUpdateResult {
  productId: string;
  variantId?: string;
  success: boolean;
  previousQuantity?: number;
  newQuantity?: number;
  error?: string;
}

export interface BatchUpdateInventoryResult {
  results: InventoryUpdateResult[];
  successCount: number;
  failureCount: number;
}

/**
 * Batch update inventory with partial failure handling
 */
export async function batchUpdateInventoryWorkflow(
  tenantId: string,
  input: BatchUpdateInventoryInput
): Promise<BatchUpdateInventoryResult> {
  const supabase = await createClient();
  const results: InventoryUpdateResult[] = [];
  const continueOnError = input.continueOnError ?? true;
  const recordHistory = input.recordHistory ?? true;

  for (const adjustment of input.adjustments) {
    try {
      // Get current quantity
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("quantity, track_quantity")
        .eq("id", adjustment.productId)
        .eq("tenant_id", tenantId)
        .single();

      if (fetchError || !product) {
        throw new Error("Product not found");
      }

      if (!product.track_quantity) {
        throw new Error("Product does not track inventory");
      }

      const previousQuantity = product.quantity;
      let newQuantity: number;

      switch (adjustment.action) {
        case "add":
          newQuantity = previousQuantity + adjustment.quantity;
          break;
        case "remove":
          newQuantity = Math.max(0, previousQuantity - adjustment.quantity);
          break;
        case "set":
          newQuantity = Math.max(0, adjustment.quantity);
          break;
        default:
          throw new Error(`Invalid action: ${adjustment.action}`);
      }

      // Update quantity
      const { error: updateError } = await supabase
        .from("products")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", adjustment.productId)
        .eq("tenant_id", tenantId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Record history if enabled
      if (recordHistory) {
        try {
          await supabase.from("inventory_history").insert({
            tenant_id: tenantId,
            product_id: adjustment.productId,
            variant_id: adjustment.variantId || null,
            action: adjustment.action,
            quantity_change: adjustment.action === "set" 
              ? newQuantity - previousQuantity 
              : (adjustment.action === "add" ? adjustment.quantity : -adjustment.quantity),
            quantity_before: previousQuantity,
            quantity_after: newQuantity,
            reason: adjustment.reason || "batch_adjustment",
          });
        } catch {
          // History table may not exist, continue
        }
      }

      results.push({
        productId: adjustment.productId,
        variantId: adjustment.variantId,
        success: true,
        previousQuantity,
        newQuantity,
      });

      // Check for low stock
      if (newQuantity <= 10 && newQuantity > 0) {
        await eventBus.emit(
          "stock.low",
          createEventPayload(tenantId, {
            productId: adjustment.productId,
            quantity: newQuantity,
          })
        );
      } else if (newQuantity === 0) {
        await eventBus.emit(
          "stock.out",
          createEventPayload(tenantId, {
            productId: adjustment.productId,
          })
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      results.push({
        productId: adjustment.productId,
        variantId: adjustment.variantId,
        success: false,
        error: errorMessage,
      });

      if (!continueOnError) {
        break;
      }
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  // Emit batch event
  if (successCount > 0) {
    await eventBus.emit(
      "stock.updated",
      createEventPayload(tenantId, {
        batchOperation: true,
        successCount,
        failureCount,
        adjustments: results.filter((r) => r.success).map((r) => ({
          productId: r.productId,
          previousQuantity: r.previousQuantity,
          newQuantity: r.newQuantity,
        })),
      })
    );
  }

  return { results, successCount, failureCount };
}
