/**
 * Batch Process Orders Workflow
 * Handles bulk order status updates with validation
 */

import { createClient } from "@/infrastructure/supabase/server";
import { eventBus, createEventPayload } from "@/infrastructure/services/event-bus";

// Valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned", "completed"],
  returned: ["refunded"],
  refunded: [],
  cancelled: [],
  completed: [],
};

// Types
export interface OrderStatusUpdate {
  orderId: string;
  status: string;
  note?: string;
}

export interface BatchProcessOrdersInput {
  updates: OrderStatusUpdate[];
  continueOnError?: boolean;
  skipValidation?: boolean;
}

export interface OrderUpdateResult {
  orderId: string;
  success: boolean;
  previousStatus?: string;
  newStatus?: string;
  error?: string;
}

export interface BatchProcessOrdersResult {
  results: OrderUpdateResult[];
  successCount: number;
  failureCount: number;
}

/**
 * Batch update order statuses with validation
 */
export async function batchProcessOrdersWorkflow(
  tenantId: string,
  input: BatchProcessOrdersInput
): Promise<BatchProcessOrdersResult> {
  const supabase = await createClient();
  const results: OrderUpdateResult[] = [];
  const continueOnError = input.continueOnError ?? true;
  const skipValidation = input.skipValidation ?? false;

  for (const update of input.updates) {
    try {
      // Get current order
      const { data: order, error: fetchError } = await supabase
        .from("orders")
        .select("id, status, order_number")
        .eq("id", update.orderId)
        .eq("tenant_id", tenantId)
        .single();

      if (fetchError || !order) {
        throw new Error("Order not found");
      }

      const previousStatus = order.status;

      // Validate status transition
      if (!skipValidation) {
        const allowedTransitions = STATUS_TRANSITIONS[previousStatus] || [];
        if (!allowedTransitions.includes(update.status)) {
          throw new Error(
            `Invalid transition from "${previousStatus}" to "${update.status}"`
          );
        }
      }

      // Update status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: update.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", update.orderId)
        .eq("tenant_id", tenantId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Record status history
      try {
        await supabase.from("order_status_history").insert({
          tenant_id: tenantId,
          order_id: update.orderId,
          from_status: previousStatus,
          to_status: update.status,
          note: update.note || "Batch status update",
        });
      } catch {
        // History table may not exist, continue
      }

      results.push({
        orderId: update.orderId,
        success: true,
        previousStatus,
        newStatus: update.status,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      results.push({
        orderId: update.orderId,
        success: false,
        error: errorMessage,
      });

      if (!continueOnError) {
        break;
      }
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  // Emit events for successful updates grouped by status
  const successfulUpdates = results.filter((r) => r.success);
  const statusGroups = new Map<string, string[]>();

  for (const result of successfulUpdates) {
    if (result.newStatus) {
      const group = statusGroups.get(result.newStatus) || [];
      group.push(result.orderId);
      statusGroups.set(result.newStatus, group);
    }
  }

  // Emit events for each status group
  const eventMap: Record<string, string> = {
    confirmed: "order.confirmed",
    processing: "order.processing",
    shipped: "order.shipped",
    delivered: "order.completed",
    completed: "order.completed",
    cancelled: "order.cancelled",
  };

  for (const [status, orderIds] of statusGroups) {
    const eventType = eventMap[status];
    if (eventType) {
      await eventBus.emit(
        eventType as Parameters<typeof eventBus.emit>[0],
        createEventPayload(tenantId, {
          batchOperation: true,
          status,
          orderIds,
          count: orderIds.length,
        })
      );
    }
  }

  return { results, successCount, failureCount };
}

/**
 * Batch cancel orders with inventory restoration
 */
export async function batchCancelOrdersWorkflow(
  tenantId: string,
  orderIds: string[],
  reason?: string,
  continueOnError = true
): Promise<BatchProcessOrdersResult> {
  const supabase = await createClient();
  const results: OrderUpdateResult[] = [];

  for (const orderId of orderIds) {
    try {
      // Get order
      const { data: order, error: fetchError } = await supabase
        .from("orders")
        .select("id, status")
        .eq("id", orderId)
        .eq("tenant_id", tenantId)
        .single();

      if (fetchError || !order) {
        throw new Error("Order not found");
      }

      // Check if order can be cancelled
      const nonCancellableStatuses = ["shipped", "delivered", "completed", "cancelled", "refunded"];
      if (nonCancellableStatuses.includes(order.status)) {
        throw new Error(`Cannot cancel order with status "${order.status}"`);
      }

      // Get order items for inventory restoration
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", orderId)
        .eq("tenant_id", tenantId);

      // Restore inventory
      for (const item of items || []) {
        const { data: product } = await supabase
          .from("products")
          .select("quantity, track_quantity")
          .eq("id", item.product_id)
          .eq("tenant_id", tenantId)
          .single();

        if (product?.track_quantity) {
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

      // Update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          notes: reason ? `Cancellation reason: ${reason}` : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("tenant_id", tenantId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      results.push({
        orderId,
        success: true,
        previousStatus: order.status,
        newStatus: "cancelled",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      results.push({
        orderId,
        success: false,
        error: errorMessage,
      });

      if (!continueOnError) {
        break;
      }
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  // Emit batch cancellation event
  if (successCount > 0) {
    await eventBus.emit(
      "order.cancelled",
      createEventPayload(tenantId, {
        batchOperation: true,
        orderIds: results.filter((r) => r.success).map((r) => r.orderId),
        count: successCount,
        reason,
      })
    );
  }

  return { results, successCount, failureCount };
}
