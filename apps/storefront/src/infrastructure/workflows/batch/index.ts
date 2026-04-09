/**
 * Batch Workflows - Bulk operations with partial failure handling
 */

export { batchUpdateProductsWorkflow } from "./batch-products";
export type { BatchUpdateProductsInput, BatchUpdateProductsResult } from "./batch-products";

export { batchUpdateInventoryWorkflow } from "./batch-inventory";
export type { BatchUpdateInventoryInput, BatchUpdateInventoryResult } from "./batch-inventory";

export { batchProcessOrdersWorkflow } from "./batch-orders";
export type { BatchProcessOrdersInput, BatchProcessOrdersResult } from "./batch-orders";
