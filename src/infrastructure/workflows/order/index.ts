// Stub — order workflows not yet implemented
export type CreateOrderInput = Record<string, unknown>;
export type UpdateOrderStatusInput = Record<string, unknown>;
export type CancelOrderInput = Record<string, unknown>;
export type CreateReturnInput = Record<string, unknown>;
export type ProcessRefundInput = Record<string, unknown>;

type OrderResult = { order: { id: string; order_number: string } | null; success: boolean };
const stub = async (..._args: unknown[]): Promise<OrderResult> => ({ order: null, success: true });

export const createOrderWorkflow = stub;
export const updateOrderStatusWorkflow = stub;
export const cancelOrderWorkflow = stub;
export const createReturnWorkflow = stub;
export const processRefundWorkflow = stub;
