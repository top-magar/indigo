/**
 * Product Workflows - Saga-based product operations
 */

export { createProductWorkflow } from "./create-product";
export type { CreateProductWorkflowResult } from "./create-product";

export { updateProductWorkflow } from "./update-product";
export type { UpdateProductInput, UpdateProductWorkflowResult } from "./update-product";

export { deleteProductWorkflow } from "./delete-product";
export type { DeleteProductInput, DeleteProductWorkflowResult } from "./delete-product";

// Steps (for composition in other workflows)
export {
  validateProductStep,
  createProductStep,
  createVariantsStep,
  linkCollectionsStep,
  emitProductCreatedStep,
} from "./steps";

export type {
  CreateProductInput,
  CreateVariantInput,
  Product,
  ProductVariant,
} from "./steps";
