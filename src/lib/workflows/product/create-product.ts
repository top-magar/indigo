/**
 * Create Product Workflow
 * Orchestrates product creation with variants and collection links
 */

import { createClient } from "@/lib/supabase/server";
import { runWorkflow, WorkflowContext } from "../engine";
import {
  validateProductStep,
  createProductStep,
  createVariantsStep,
  linkCollectionsStep,
  emitProductCreatedStep,
  CreateProductInput,
  Product,
  ProductVariant,
} from "./steps";

export interface CreateProductWorkflowResult {
  product: Product;
  variants: ProductVariant[];
}

/**
 * Create a product with optional variants and collection links
 * Uses saga pattern with automatic compensation on failure
 */
export async function createProductWorkflow(
  tenantId: string,
  input: CreateProductInput
): Promise<CreateProductWorkflowResult> {
  const supabase = await createClient();

  const context: WorkflowContext = {
    tenantId,
    supabase,
    completedSteps: [],
  };

  const steps = [
    validateProductStep,
    createProductStep,
    createVariantsStep,
    linkCollectionsStep,
    emitProductCreatedStep,
  ];

  return runWorkflow<CreateProductInput, CreateProductWorkflowResult>(
    steps,
    input,
    context
  );
}
