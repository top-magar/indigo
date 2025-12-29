/**
 * Batch Update Products Workflow
 * Handles bulk product updates with partial failure handling
 */

import { createClient } from "@/lib/supabase/server";
import { eventBus, createEventPayload } from "@/lib/services/event-bus";

// Types
export interface ProductUpdate {
  productId: string;
  name?: string;
  price?: number;
  status?: "draft" | "active" | "archived";
  quantity?: number;
  categoryId?: string | null;
}

export interface BatchUpdateProductsInput {
  updates: ProductUpdate[];
  continueOnError?: boolean;
}

export interface BatchUpdateResult {
  productId: string;
  success: boolean;
  error?: string;
}

export interface BatchUpdateProductsResult {
  results: BatchUpdateResult[];
  successCount: number;
  failureCount: number;
}

/**
 * Batch update products with partial failure handling
 * Unlike single-item workflows, this continues on individual failures
 */
export async function batchUpdateProductsWorkflow(
  tenantId: string,
  input: BatchUpdateProductsInput
): Promise<BatchUpdateProductsResult> {
  const supabase = await createClient();
  const results: BatchUpdateResult[] = [];
  const continueOnError = input.continueOnError ?? true;

  for (const update of input.updates) {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (update.name !== undefined) updateData.name = update.name;
      if (update.price !== undefined) updateData.price = update.price;
      if (update.status !== undefined) updateData.status = update.status;
      if (update.quantity !== undefined) updateData.quantity = update.quantity;
      if (update.categoryId !== undefined) updateData.category_id = update.categoryId;

      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", update.productId)
        .eq("tenant_id", tenantId);

      if (error) {
        throw new Error(error.message);
      }

      results.push({ productId: update.productId, success: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      results.push({ productId: update.productId, success: false, error: errorMessage });

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
      "product.updated",
      createEventPayload(tenantId, {
        batchOperation: true,
        successCount,
        failureCount,
        productIds: results.filter((r) => r.success).map((r) => r.productId),
      })
    );
  }

  return { results, successCount, failureCount };
}

/**
 * Batch delete products
 */
export async function batchDeleteProductsWorkflow(
  tenantId: string,
  productIds: string[],
  continueOnError = true
): Promise<BatchUpdateProductsResult> {
  const supabase = await createClient();
  const results: BatchUpdateResult[] = [];

  for (const productId of productIds) {
    try {
      // Check for active orders
      const { count } = await supabase
        .from("order_items")
        .select("*", { count: "exact", head: true })
        .eq("product_id", productId);

      if (count && count > 0) {
        throw new Error("Cannot delete product with existing orders");
      }

      // Delete collection links
      await supabase
        .from("collection_products")
        .delete()
        .eq("product_id", productId);

      // Delete variants
      await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", productId)
        .eq("tenant_id", tenantId);

      // Delete product
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)
        .eq("tenant_id", tenantId);

      if (error) {
        throw new Error(error.message);
      }

      results.push({ productId, success: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      results.push({ productId, success: false, error: errorMessage });

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
      "product.deleted",
      createEventPayload(tenantId, {
        batchOperation: true,
        successCount,
        failureCount,
        productIds: results.filter((r) => r.success).map((r) => r.productId),
      })
    );
  }

  return { results, successCount, failureCount };
}
