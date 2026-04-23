// Stub — product workflows not yet implemented
type ProductResult = { product: { id: string; slug: string } | null };

export async function createProductWorkflow(..._args: unknown[]): Promise<ProductResult> {
  return { product: null };
}
export async function updateProductWorkflow(..._args: unknown[]): Promise<ProductResult> {
  return { product: null };
}
export async function deleteProductWorkflow(..._args: unknown[]) {
  return { success: true };
}
