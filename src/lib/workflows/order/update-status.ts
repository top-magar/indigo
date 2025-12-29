/**
 * Update Order Status Workflow
 * Handles order status transitions with validation
 */

import { createClient } from "@/lib/supabase/server";
import { createStep, createStepWithCompensation, runWorkflow, WorkflowContext } from "../engine";
import { eventBus, createEventPayload } from "@/lib/services/event-bus";

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

export interface UpdateOrderStatusInput {
  orderId: string;
  status: string;
  note?: string;
}

interface Order {
  id: string;
  tenant_id: string;
  order_number: string;
  status: string;
  [key: string]: unknown;
}

/**
 * Step 1: Validate status transition
 */
const validateStatusTransitionStep = createStep<
  UpdateOrderStatusInput,
  { input: UpdateOrderStatusInput; currentOrder: Order }
>(
  "validate-status-transition",
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

    const allowedTransitions = STATUS_TRANSITIONS[order.status] || [];
    
    if (!allowedTransitions.includes(input.status)) {
      throw new Error(
        `Invalid status transition from "${order.status}" to "${input.status}". ` +
        `Allowed: ${allowedTransitions.join(", ") || "none"}`
      );
    }

    return { input, currentOrder: order as Order };
  }
);

/**
 * Step 2: Update order status
 */
const updateStatusStep = createStepWithCompensation<
  { input: UpdateOrderStatusInput; currentOrder: Order },
  { order: Order; previousStatus: string },
  { orderId: string; previousStatus: string }
>(
  "update-order-status",
  async ({ input, currentOrder }, context) => {
    const { supabase, tenantId } = context;

    const { data: order, error } = await supabase
      .from("orders")
      .update({
        status: input.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.orderId)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }

    return {
      data: { order: order as Order, previousStatus: currentOrder.status },
      compensationData: { orderId: input.orderId, previousStatus: currentOrder.status },
    };
  },
  async ({ orderId, previousStatus }, context) => {
    const { supabase, tenantId } = context;
    await supabase
      .from("orders")
      .update({
        status: previousStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("tenant_id", tenantId);
  }
);

/**
 * Step 3: Record status history
 */
const recordStatusHistoryStep = createStep<
  { order: Order; previousStatus: string },
  { order: Order }
>(
  "record-status-history",
  async ({ order, previousStatus }, context) => {
    const { supabase, tenantId } = context;
    const input = context.completedSteps.find((s) => s.id === "validate-status-transition")
      ?.output as { input: UpdateOrderStatusInput } | undefined;

    // Try to insert status history (table may not exist)
    try {
      await supabase.from("order_status_history").insert({
        tenant_id: tenantId,
        order_id: order.id,
        from_status: previousStatus,
        to_status: order.status,
        note: input?.input.note || null,
      });
    } catch {
      // Status history table may not exist, continue
    }

    return { order };
  }
);

/**
 * Step 4: Emit status change event
 */
const emitStatusChangedStep = createStep<
  { order: Order },
  { order: Order }
>(
  "emit-status-changed",
  async ({ order }, context) => {
    // Map status to event type
    const eventMap: Record<string, string> = {
      confirmed: "order.confirmed",
      processing: "order.processing",
      shipped: "order.shipped",
      delivered: "order.completed",
      completed: "order.completed",
      cancelled: "order.cancelled",
    };

    const eventType = eventMap[order.status];
    if (eventType) {
      await eventBus.emit(
        eventType as Parameters<typeof eventBus.emit>[0],
        createEventPayload(context.tenantId, {
          orderId: order.id,
          orderNumber: order.order_number,
          status: order.status,
        })
      );
    }

    return { order };
  }
);

export interface UpdateOrderStatusWorkflowResult {
  order: Order;
}

/**
 * Update order status with validation and history tracking
 */
export async function updateOrderStatusWorkflow(
  tenantId: string,
  input: UpdateOrderStatusInput
): Promise<UpdateOrderStatusWorkflowResult> {
  const supabase = await createClient();

  const context: WorkflowContext = {
    tenantId,
    supabase,
    completedSteps: [],
  };

  const steps = [
    validateStatusTransitionStep,
    updateStatusStep,
    recordStatusHistoryStep,
    emitStatusChangedStep,
  ];

  return runWorkflow<UpdateOrderStatusInput, UpdateOrderStatusWorkflowResult>(
    steps,
    input,
    context
  );
}
