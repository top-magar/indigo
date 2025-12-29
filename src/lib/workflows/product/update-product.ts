/**
 * Update Product Workflow
 * Handles product updates with variant synchronization
 */

import { createClient } from "@/lib/supabase/server";
import { createStep, createStepWithCompensation, runWorkflow, WorkflowContext } from "../engine";
import { eventBus, createEventPayload } from "@/lib/services/event-bus";
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
 * Step 2: Update product record
 */
const updateProductStep = createStepWithCompensation<
  { input: UpdateProductInput; snapshot: ProductSnapshot },
  { product: Product; snapshot: ProductSnapshot },
  ProductSnapshot
>(
  "update-product",
  async ({ input, snapshot }, context) => {
    const { supabase, tenantId } = context;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that are explicitly provided
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
    if (input.images !== undefined) updateData.images = input.images;
    if (input.metadata !== undefined) updateData.metadata = input.metadata;

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

    return {
      data: { product: product as Product, snapshot },
      compensationData: snapshot,
    };
  },
  async (snapshot, context) => {
    const { supabase, tenantId } = context;
    
    // Restore original product state
    await supabase
      .from("products")
      .update(snapshot.product)
      .eq("id", snapshot.product.id)
      .eq("tenant_id", tenantId);
  }
);

/**
 * Step 3: Sync collection links
 */
const syncCollectionsStep = createStepWithCompensation<
  { product: Product; snapshot: ProductSnapshot },
  { product: Product },
  { productId: string; originalCollectionIds: string[] }
>(
  "sync-collections",
  async ({ product, snapshot }, context) => {
    const { supabase } = context;
    const input = context.completedSteps.find((s) => s.id === "fetch-product-snapshot")
      ?.output as { input: UpdateProductInput } | undefined;

    const newCollectionIds = input?.input.collectionIds;
    
    // Skip if collections not being updated
    if (newCollectionIds === undefined) {
      return {
        data: { product },
        compensationData: { productId: product.id, originalCollectionIds: snapshot.collectionIds },
      };
    }

    // Remove old links
    await supabase
      .from("collection_products")
      .delete()
      .eq("product_id", product.id);

    // Add new links
    if (newCollectionIds.length > 0) {
      const linksToInsert = newCollectionIds.map((collectionId, index) => ({
        collection_id: collectionId,
        product_id: product.id,
        position: index,
      }));

      const { error } = await supabase
        .from("collection_products")
        .insert(linksToInsert);

      if (error) {
        throw new Error(`Failed to update collections: ${error.message}`);
      }
    }

    return {
      data: { product },
      compensationData: { productId: product.id, originalCollectionIds: snapshot.collectionIds },
    };
  },
  async ({ productId, originalCollectionIds }, context) => {
    const { supabase } = context;
    
    // Restore original collection links
    await supabase
      .from("collection_products")
      .delete()
      .eq("product_id", productId);

    if (originalCollectionIds.length > 0) {
      const linksToInsert = originalCollectionIds.map((collectionId, index) => ({
        collection_id: collectionId,
        product_id: productId,
        position: index,
      }));

      await supabase.from("collection_products").insert(linksToInsert);
    }
  }
);

/**
 * Step 4: Emit update event
 */
const emitProductUpdatedStep = createStep<
  { product: Product },
  { product: Product }
>(
  "emit-product-updated",
  async ({ product }, context) => {
    await eventBus.emit(
      "product.updated",
      createEventPayload(context.tenantId, {
        productId: product.id,
        name: product.name,
        slug: product.slug,
      })
    );

    return { product };
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
    syncCollectionsStep,
    emitProductUpdatedStep,
  ];

  return runWorkflow<UpdateProductInput, UpdateProductWorkflowResult>(
    steps,
    input,
    context
  );
}
