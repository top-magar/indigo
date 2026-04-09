/**
 * Cancel Order Workflow
 * Handles order cancellation with inventory restoration
 */

import { createClient } from "@/infrastructure/supabase/server";
import { createStep, runWorkflow, WorkflowContext } from "../engine";
import { eventBus, createEventPayload } from "@/infrastructure/services/event-bus";

export interface CancelOrderInput {
  orderId: string;
  reason?: string;
}

interface Order {
  id: string;
  tenant_id: string;
  order_number: string;
  status: string;
  [key: string]: unknown;
}

interface OrderItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

/**
 * Step 1: Validate order can be cancelled
 */
const validateCancellationStep = createStep<
  CancelOrderInput,
  { input: CancelOrderInput; order: Order; items: OrderItem[] }
>(
  "validate-cancellation",
  async (input, context) => {
    const { supabase, tenantId } = context;

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", input.orderId)
      .eq("tenant_id", tenantId)
      .single();

    if (error || !order) {
      throw new Error("Order not found");
    }

    // Check if order can be cancelled
    const nonCancellableStatuses = ["shipped", "delivered", "completed", "cancelled", "refunded"];
    if (nonCancellableStatuses.includes(order.status)) {
      throw new Error(
        `Cannot cancel order with status "${order.status}". ` +
        `Order must be pending, confirmed, or processing.`
      );
    }

    // Get order items for inventory restoration
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, variant_id, quantity")
      .eq("order_id", input.orderId)
      .eq("tenant_id", tenantId);

    return {
      input,
      order: order as Order,
      items: (items || []) as OrderItem[],
    };
  }
);

/**
 * Step 2: Restore inventory
 */
const restoreInventoryStep = createStep<
  { input: CancelOrderInput; order: Order; items: OrderItem[] },
  { input: CancelOrderInput; order: Order }
>(
  "restore-inventory",
  async ({ input, order, items }, context) => {
    const { supabase, tenantId } = context;

    for (const item of items) {
      // Get current product
      const { data: product } = await supabase
        .from("products")
        .select("quantity, track_quantity")
        .eq("id", item.product_id)
        .eq("tenant_id", tenantId)
        .single();

      if (product?.track_quantity) {
        // Restore quantity
        await supabase
          .from("products")
          .update({
            quantity: product.quantity + item.quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.product_id)
          .eq("tenant_id", tenantId);
      }
    }

    return { input, order };
  }
);

/**
 * Step 3: Update order status to cancelled
 */
const cancelOrderStep = createStep<
  { input: CancelOrderInput; order: Order },
  { order: Order; reason?: string }
>(
  "cancel-order",
  async ({ input, order }, context) => {
    const { supabase, tenantId } = context;

    const { data: updatedOrder, error } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        notes: input.reason
          ? `${order.notes || ""}\n\nCancellation reason: ${input.reason}`.trim()
          : order.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.orderId)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to cancel order: ${error.message}`);
    }

    return { order: updatedOrder as Order, reason: input.reason };
  }
);

/**
 * Step 4: Emit cancellation event
 */
const emitCancellationEventStep = createStep<
  { order: Order; reason?: string },
  { order: Order }
>(
  "emit-cancellation-event",
  async ({ order, reason }, context) => {
    await eventBus.emit(
      "order.cancelled",
      createEventPayload(context.tenantId, {
        orderId: order.id,
        orderNumber: order.order_number,
        reason,
      })
    );

    return { order };
  }
);

export interface CancelOrderWorkflowResult {
  order: Order;
}

/**
 * Cancel an order and restore inventory
 */
export async function cancelOrderWorkflow(
  tenantId: string,
  input: CancelOrderInput
): Promise<CancelOrderWorkflowResult> {
  const supabase = await createClient();

  const context: WorkflowContext = {
    tenantId,
    supabase,
    completedSteps: [],
  };

  const steps = [
    validateCancellationStep,
    restoreInventoryStep,
    cancelOrderStep,
    emitCancellationEventStep,
  ];

  return runWorkflow<CancelOrderInput, CancelOrderWorkflowResult>(
    steps,
    input,
    context
  );
}
