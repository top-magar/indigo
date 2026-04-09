/**
 * Update Product Workflow
 * Handles product updates with variant synchronization
 */

import { createClient } from "@/infrastructure/supabase/server";
import { createStep, createStepWithCompensation, runWorkflow, WorkflowContext } from "../engine";
import { eventBus, createEventPayload } from "@/infrastructure/services/event-bus";
import { Product, ProductVariant } from "./steps";

export interface UpdateProductInput {
  productId: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  sku?: string | null;
  barcode?: string | null;
  quantity?: number;
  trackQuantity?: boolean;
  allowBackorder?: boolean;
  weight?: number | null;
  weightUnit?: string;
  status?: "draft" | "active" | "archived";
  categoryId?: string | null;
  collectionIds?: string[];
  images?: Array<{ url: string; alt?: string; position: number }>;
  metadata?: Record<string, unknown>;
}

interface ProductSnapshot {
  product: Product;
  collectionIds: string[];
}


/**
 * Step 1: Fetch current product state (for compensation)
 */
const fetchProductStep = createStep<
  UpdateProductInput,
  { input: UpdateProductInput; snapshot: ProductSnapshot }
>(
  "fetch-product-snapshot",
  async (input, context) => {
    const { supabase, tenantId } = context;

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", input.productId)
      .eq("tenant_id", tenantId)
      .single();

    if (error || !product) {
      throw new Error("Product not found");
    }

    // Get current collection links
    const { data: links } = await supabase
      .from("collection_products")
      .select("collection_id")
      .eq("product_id", input.productId);

    return {
      input,
      snapshot: {
        product: product as Product,
        collectionIds: links?.map((l) => l.collection_id) || [],
      },
    };
  }
);


/**
 * Step 2: Update product fields
 */
const updateProductStep = createStep<
  { input: UpdateProductInput; snapshot: ProductSnapshot },
  { input: UpdateProductInput; snapshot: ProductSnapshot; product: Product }
>(
  "update-product",
  async ({ input, snapshot }, context) => {
    const { supabase, tenantId } = context;

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.compareAtPrice !== undefined) updateData.compare_at_price = input.compareAtPrice;
    if (input.costPrice !== undefined) updateData.cost_price = input.costPrice;
    if (input.sku !== undefined) updateData.sku = input.sku;
    if (input.barcode !== undefined) updateData.barcode = input.barcode;
    if (input.quantity !== undefined) updateData.quantity = input.quantity;
    if (input.trackQuantity !== undefined) updateData.track_quantity = input.trackQuantity;
    if (input.allowBackorder !== undefined) updateData.allow_backorder = input.allowBackorder;
    if (input.weight !== undefined) updateData.weight = input.weight;
    if (input.weightUnit !== undefined) updateData.weight_unit = input.weightUnit;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.categoryId !== undefined) updateData.category_id = input.categoryId;
    if (input.metadata !== undefined) updateData.metadata = input.metadata;

    if (Object.keys(updateData).length > 0) {
      updateData.updated_at = new Date().toISOString();

      const { data: product, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", input.productId)
        .eq("tenant_id", tenantId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update product: ${error.message}`);
      }

      return { input, snapshot, product: product as Product };
    }

    return { input, snapshot, product: snapshot.product };
  }
);

export interface UpdateProductWorkflowResult {
  product: Product;
}

/**
 * Update a product with automatic rollback on failure
 */
export async function updateProductWorkflow(
  tenantId: string,
  input: UpdateProductInput
): Promise<UpdateProductWorkflowResult> {
  const supabase = await createClient();

  const context: WorkflowContext = {
    tenantId,
    supabase,
    completedSteps: [],
  };

  const steps = [
    fetchProductStep,
    updateProductStep,
  ];

  return runWorkflow<UpdateProductInput, UpdateProductWorkflowResult>(
    steps,
    input,
    context
  );
}
