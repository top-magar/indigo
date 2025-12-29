/**
 * Create Return Workflow
 * Handles return request creation with validation
 */

import { createClient } from "@/lib/supabase/server";
import { createStep, createStepWithCompensation, runWorkflow, WorkflowContext } from "../engine";
import { eventBus, createEventPayload } from "@/lib/services/event-bus";

// Types
export interface ReturnItem {
  orderItemId: string;
  quantity: number;
  reason?: string;
  condition?: "unopened" | "opened" | "damaged" | "defective";
}

export interface CreateReturnInput {
  orderId: string;
  customerId?: string;
  reason?: "defective" | "wrong_item" | "not_as_described" | "changed_mind" | "other";
  customerNotes?: string;
  refundMethod?: "original" | "store_credit" | "manual";
  shippingPaidBy?: "customer" | "store";
  items: ReturnItem[];
}

interface Return {
  id: string;
  tenant_id: string;
  return_number: string;
  status: string;
  [key: string]: unknown;
}

interface Order {
  id: string;
  status: string;
  customer_id?: string;
  [key: string]: unknown;
}

/**
 * Step 1: Validate return request
 */
const validateReturnStep = createStep<
  CreateReturnInput,
  { input: CreateReturnInput; order: Order }
>(
  "validate-return",
  async (input, context) => {
    const { supabase, tenantId } = context;

    if (!input.items?.length) {
      throw new Error("Return must have at least one item");
    }

    // Get order
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", input.orderId)
      .eq("tenant_id", tenantId)
      .single();

    if (error || !order) {
      throw new Error("Order not found");
    }

    // Check if order can be returned
    const returnableStatuses = ["delivered", "completed"];
    if (!returnableStatuses.includes(order.status)) {
      throw new Error(
        `Cannot create return for order with status "${order.status}". ` +
        `Order must be delivered or completed.`
      );
    }

    // Validate items exist in order
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("id, quantity")
      .eq("order_id", input.orderId)
      .eq("tenant_id", tenantId);

    const orderItemIds = new Set(orderItems?.map((i) => i.id) || []);
    
    for (const item of input.items) {
      if (!orderItemIds.has(item.orderItemId)) {
        throw new Error(`Order item not found: ${item.orderItemId}`);
      }
      
      const orderItem = orderItems?.find((i) => i.id === item.orderItemId);
      if (orderItem && item.quantity > orderItem.quantity) {
        throw new Error(
          `Return quantity (${item.quantity}) exceeds order quantity (${orderItem.quantity})`
        );
      }
    }

    return { input, order: order as Order };
  }
);

/**
 * Step 2: Generate return number
 */
const generateReturnNumberStep = createStep<
  { input: CreateReturnInput; order: Order },
  { input: CreateReturnInput; order: Order; returnNumber: string }
>(
  "generate-return-number",
  async ({ input, order }, context) => {
    const { supabase, tenantId } = context;

    const { count } = await supabase
      .from("returns")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId);

    const returnNumber = `RET-${String((count ?? 0) + 1).padStart(6, "0")}`;

    return { input, order, returnNumber };
  }
);

/**
 * Step 3: Create return record
 */
const createReturnRecordStep = createStepWithCompensation<
  { input: CreateReturnInput; order: Order; returnNumber: string },
  { returnRecord: Return; input: CreateReturnInput },
  string
>(
  "create-return-record",
  async ({ input, order, returnNumber }, context) => {
    const { supabase, tenantId } = context;

    const { data: returnRecord, error } = await supabase
      .from("returns")
      .insert({
        tenant_id: tenantId,
        order_id: input.orderId,
        customer_id: input.customerId || order.customer_id || null,
        return_number: returnNumber,
        status: "requested",
        reason: input.reason || null,
        customer_notes: input.customerNotes || null,
        refund_method: input.refundMethod || "original",
        shipping_paid_by: input.shippingPaidBy || "customer",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create return: ${error.message}`);
    }

    return {
      data: { returnRecord: returnRecord as Return, input },
      compensationData: returnRecord.id,
    };
  },
  async (returnId, context) => {
    const { supabase } = context;
    await supabase.from("returns").delete().eq("id", returnId);
  }
);

/**
 * Step 4: Create return items
 */
const createReturnItemsStep = createStepWithCompensation<
  { returnRecord: Return; input: CreateReturnInput },
  { returnRecord: Return },
  string
>(
  "create-return-items",
  async ({ returnRecord, input }, context) => {
    const { supabase } = context;

    const itemsToInsert = input.items.map((item) => ({
      return_id: returnRecord.id,
      order_item_id: item.orderItemId,
      quantity: item.quantity,
      reason: item.reason || null,
      condition: item.condition || "unopened",
    }));

    const { error } = await supabase.from("return_items").insert(itemsToInsert);

    if (error) {
      throw new Error(`Failed to create return items: ${error.message}`);
    }

    return {
      data: { returnRecord },
      compensationData: returnRecord.id,
    };
  },
  async (returnId, context) => {
    const { supabase } = context;
    await supabase.from("return_items").delete().eq("return_id", returnId);
  }
);

/**
 * Step 5: Update order status
 */
const updateOrderStatusStep = createStep<
  { returnRecord: Return },
  { returnRecord: Return }
>(
  "update-order-for-return",
  async ({ returnRecord }, context) => {
    const { supabase, tenantId } = context;

    // Get the return to find the order
    const { data: returnData } = await supabase
      .from("returns")
      .select("order_id")
      .eq("id", returnRecord.id)
      .single();

    if (returnData?.order_id) {
      await supabase
        .from("orders")
        .update({
          status: "returned",
          updated_at: new Date().toISOString(),
        })
        .eq("id", returnData.order_id)
        .eq("tenant_id", tenantId);
    }

    return { returnRecord };
  }
);

/**
 * Step 6: Emit return created event
 */
const emitReturnCreatedStep = createStep<
  { returnRecord: Return },
  { returnRecord: Return }
>(
  "emit-return-created",
  async ({ returnRecord }, context) => {
    await eventBus.emit(
      "order.returned",
      createEventPayload(context.tenantId, {
        returnId: returnRecord.id,
        returnNumber: returnRecord.return_number,
        status: returnRecord.status,
      })
    );

    return { returnRecord };
  }
);

export interface CreateReturnWorkflowResult {
  returnRecord: Return;
}

/**
 * Create a return request with validation
 * Automatically rolls back on failure
 */
export async function createReturnWorkflow(
  tenantId: string,
  input: CreateReturnInput
): Promise<CreateReturnWorkflowResult> {
  const supabase = await createClient();

  const context: WorkflowContext = {
    tenantId,
    supabase,
    completedSteps: [],
  };

  const steps = [
    validateReturnStep,
    generateReturnNumberStep,
    createReturnRecordStep,
    createReturnItemsStep,
    updateOrderStatusStep,
    emitReturnCreatedStep,
  ];

  return runWorkflow<CreateReturnInput, CreateReturnWorkflowResult>(
    steps,
    input,
    context
  );
}
