/**
 * Delete Product Workflow
 * Handles product deletion with related data cleanup
 */

import { createClient } from "@/lib/supabase/server";
import { createStep, runWorkflow, WorkflowContext } from "../engine";
import { eventBus, createEventPayload } from "@/lib/services/event-bus";

export interface DeleteProductInput {
  productId: string;
}

/**
 * Step 1: Validate product exists and can be deleted
 */
const validateDeleteStep = createStep<
  DeleteProductInput,
  DeleteProductInput
>(
  "validate-delete",
  async (input, context) => {
    const { supabase, tenantId } = context;

    const { data: product, error } = await supabase
      .from("products")
      .select("id, name, status")
      .eq("id", input.productId)
      .eq("tenant_id", tenantId)
      .single();

    if (error || !product) {
      throw new Error("Product not found");
    }

    // Check for active orders with this product
    const { count } = await supabase
      .from("order_items")
      .select("*", { count: "exact", head: true })
      .eq("product_id", input.productId);

    if (count && count > 0) {
      // Soft delete instead - archive the product
      throw new Error(
        "Cannot delete product with existing orders. Archive it instead."
      );
    }

    return input;
  }
);

/**
 * Step 2: Delete collection links
 */
const deleteCollectionLinksStep = createStep<
  DeleteProductInput,
  DeleteProductInput
>(
  "delete-collection-links",
  async (input, context) => {
    const { supabase } = context;

    await supabase
      .from("collection_products")
      .delete()
      .eq("product_id", input.productId);

    return input;
  }
);

/**
 * Step 3: Delete variants
 */
const deleteVariantsStep = createStep<
  DeleteProductInput,
  DeleteProductInput
>(
  "delete-variants",
  async (input, context) => {
    const { supabase, tenantId } = context;

    await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", input.productId)
      .eq("tenant_id", tenantId);

    return input;
  }
);

/**
 * Step 4: Delete the product
 */
const deleteProductStep = createStep<
  DeleteProductInput,
  { productId: string; deleted: boolean }
>(
  "delete-product",
  async (input, context) => {
    const { supabase, tenantId } = context;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", input.productId)
      .eq("tenant_id", tenantId);

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }

    return { productId: input.productId, deleted: true };
  }
);

/**
 * Step 5: Emit delete event
 */
const emitProductDeletedStep = createStep<
  { productId: string; deleted: boolean },
  { productId: string; deleted: boolean }
>(
  "emit-product-deleted",
  async (input, context) => {
    await eventBus.emit(
      "product.deleted",
      createEventPayload(context.tenantId, {
        productId: input.productId,
      })
    );

    return input;
  }
);

export interface DeleteProductWorkflowResult {
  productId: string;
  deleted: boolean;
}

/**
 * Delete a product and all related data
 * Note: This workflow doesn't have compensation as deletion is final
 */
export async function deleteProductWorkflow(
  tenantId: string,
  input: DeleteProductInput
): Promise<DeleteProductWorkflowResult> {
  const supabase = await createClient();

  const context: WorkflowContext = {
    tenantId,
    supabase,
    completedSteps: [],
  };

  const steps = [
    validateDeleteStep,
    deleteCollectionLinksStep,
    deleteVariantsStep,
    deleteProductStep,
    emitProductDeletedStep,
  ];

  return runWorkflow<DeleteProductInput, DeleteProductWorkflowResult>(
    steps,
    input,
    context
  );
}
