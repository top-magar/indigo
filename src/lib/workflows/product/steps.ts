/**
 * Product Workflow Steps - Reusable steps for product operations
 */

import { createStep, createStepWithCompensation, WorkflowContext } from "../engine";
import { eventBus, createEventPayload } from "@/lib/services/event-bus";

// Types
export interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  quantity?: number;
  trackQuantity?: boolean;
  allowBackorder?: boolean;
  weight?: number;
  weightUnit?: string;
  status?: "draft" | "active" | "archived";
  categoryId?: string;
  collectionIds?: string[];
  images?: Array<{ url: string; alt?: string; position: number }>;
  variants?: CreateVariantInput[];
  metadata?: Record<string, unknown>;
}

export interface CreateVariantInput {
  title: string;
  sku?: string;
  price?: number;
  quantity?: number;
  options?: Record<string, string>;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  price: number;
  [key: string]: unknown;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  title: string;
  [key: string]: unknown;
}

// Helper to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Step 1: Validate product input
 */
export const validateProductStep = createStep<CreateProductInput, CreateProductInput>(
  "validate-product-input",
  async (input, _context) => {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error("Product name is required");
    }

    if (input.price < 0) {
      throw new Error("Price must be a positive number");
    }

    if (input.variants?.length && !input.variants.every((v) => v.title)) {
      throw new Error("All variants must have a title");
    }

    // Return validated input
    return {
      ...input,
      slug: input.slug || generateSlug(input.name),
      quantity: input.quantity ?? 0,
      trackQuantity: input.trackQuantity ?? true,
      allowBackorder: input.allowBackorder ?? false,
      status: input.status ?? "draft",
    };
  }
);

/**
 * Step 2: Create the product record
 */
export const createProductStep = createStepWithCompensation<
  CreateProductInput,
  { product: Product; input: CreateProductInput },
  string // compensation data is the product ID
>(
  "create-product",
  async (input, context) => {
    const { supabase, tenantId } = context;

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("slug", input.slug)
      .single();

    let finalSlug = input.slug!;
    if (existing) {
      finalSlug = `${input.slug}-${Date.now()}`;
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        tenant_id: tenantId,
        name: input.name,
        slug: finalSlug,
        description: input.description || null,
        price: input.price,
        compare_at_price: input.compareAtPrice || null,
        cost_price: input.costPrice || null,
        sku: input.sku || null,
        barcode: input.barcode || null,
        quantity: input.quantity,
        track_quantity: input.trackQuantity,
        allow_backorder: input.allowBackorder,
        weight: input.weight || null,
        weight_unit: input.weightUnit || "g",
        status: input.status,
        category_id: input.categoryId || null,
        images: input.images || [],
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }

    return {
      data: { product: product as Product, input },
      compensationData: product.id,
    };
  },
  async (productId, context) => {
    const { supabase, tenantId } = context;
    await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("tenant_id", tenantId);
  }
);

/**
 * Step 3: Create product variants
 */
export const createVariantsStep = createStepWithCompensation<
  { product: Product; input: CreateProductInput },
  { product: Product; variants: ProductVariant[] },
  string[] // compensation data is variant IDs
>(
  "create-variants",
  async ({ product, input }, context) => {
    const { supabase, tenantId } = context;

    if (!input.variants?.length) {
      return {
        data: { product, variants: [] },
        compensationData: [],
      };
    }

    const variantsToInsert = input.variants.map((v, index) => ({
      tenant_id: tenantId,
      product_id: product.id,
      title: v.title,
      sku: v.sku || null,
      price: v.price ?? product.price,
      quantity: v.quantity ?? 0,
      position: index,
      options: v.options || {},
    }));

    const { data: variants, error } = await supabase
      .from("product_variants")
      .insert(variantsToInsert)
      .select();

    if (error) {
      throw new Error(`Failed to create variants: ${error.message}`);
    }

    return {
      data: { product, variants: variants as ProductVariant[] },
      compensationData: variants.map((v) => v.id),
    };
  },
  async (variantIds, context) => {
    if (!variantIds.length) return;
    
    const { supabase } = context;
    await supabase.from("product_variants").delete().in("id", variantIds);
  }
);

/**
 * Step 4: Link product to collections
 */
export const linkCollectionsStep = createStepWithCompensation<
  { product: Product; variants: ProductVariant[] },
  { product: Product; variants: ProductVariant[]; collectionLinks: string[] },
  { productId: string; collectionIds: string[] }
>(
  "link-collections",
  async ({ product, variants }, context) => {
    const { supabase } = context;
    const input = context.completedSteps.find((s) => s.id === "validate-product-input")
      ?.output as CreateProductInput | undefined;

    const collectionIds = input?.collectionIds || [];
    
    if (!collectionIds.length) {
      return {
        data: { product, variants, collectionLinks: [] },
        compensationData: { productId: product.id, collectionIds: [] },
      };
    }

    const linksToInsert = collectionIds.map((collectionId, index) => ({
      collection_id: collectionId,
      product_id: product.id,
      position: index,
    }));

    const { error } = await supabase
      .from("collection_products")
      .insert(linksToInsert);

    if (error) {
      throw new Error(`Failed to link collections: ${error.message}`);
    }

    return {
      data: { product, variants, collectionLinks: collectionIds },
      compensationData: { productId: product.id, collectionIds },
    };
  },
  async ({ productId, collectionIds }, context) => {
    if (!collectionIds.length) return;
    
    const { supabase } = context;
    await supabase
      .from("collection_products")
      .delete()
      .eq("product_id", productId)
      .in("collection_id", collectionIds);
  }
);

/**
 * Step 5: Emit product created event
 */
export const emitProductCreatedStep = createStep<
  { product: Product; variants: ProductVariant[]; collectionLinks: string[] },
  { product: Product; variants: ProductVariant[] }
>(
  "emit-product-created",
  async ({ product, variants }, context) => {
    await eventBus.emit(
      "product.created",
      createEventPayload(context.tenantId, {
        productId: product.id,
        variantIds: variants.map((v) => v.id),
        name: product.name,
        slug: product.slug,
      })
    );

    return { product, variants };
  }
);
