/**
 * Process Refund Workflow
 * Handles refund processing with inventory restoration
 */

import { createClient } from "@/lib/supabase/server";
import { createStep, createStepWithCompensation, runWorkflow, WorkflowContext } from "../engine";
import { eventBus, createEventPayload } from "@/lib/services/event-bus";

// Types
export interface ProcessRefundInput {
  returnId: string;
  refundAmount: number;
  restoreInventory?: boolean;
  adminNotes?: string;
}

interface Return {
  id: string;
  tenant_id: string;
  return_number: string;
  order_id: string;
  customer_id?: string;
  status: string;
  refund_method: string;
  [key: string]: unknown;
}

interface ReturnItem {
  id: string;
  order_item_id: string;
  quantity: number;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
}

interface InventoryRestoration {
  productId: string;
  quantity: number;
  previousQuantity: number;
}

/**
 * Step 1: Validate refund request
 */
const validateRefundStep = createStep<
  ProcessRefundInput,
  { input: ProcessRefundInput; returnRecord: Return; returnItems: ReturnItem[] }
>(
  "validate-refund",
  async (input, context) => {
    const { supabase, tenantId } = context;

    // Get return
    const { data: returnRecord, error } = await supabase
      .from("returns")
      .select("*")
      .eq("id", input.returnId)
      .eq("tenant_id", tenantId)
      .single();

    if (error || !returnRecord) {
      throw new Error("Return not found");
    }

    // Check if return can be refunded
    const refundableStatuses = ["received", "approved"];
    if (!refundableStatuses.includes(returnRecord.status)) {
      throw new Error(
        `Cannot process refund for return with status "${returnRecord.status}". ` +
        `Return must be received or approved.`
      );
    }

    if (input.refundAmount <= 0) {
      throw new Error("Refund amount must be greater than 0");
    }

    // Get return items
    const { data: returnItems } = await supabase
      .from("return_items")
      .select("*")
      .eq("return_id", input.returnId);

    return {
      input,
      returnRecord: returnRecord as Return,
      returnItems: (returnItems || []) as ReturnItem[],
    };
  }
);

/**
 * Step 2: Restore inventory (optional)
 */
const restoreInventoryStep = createStepWithCompensation<
  { input: ProcessRefundInput; returnRecord: Return; returnItems: ReturnItem[] },
  { input: ProcessRefundInput; returnRecord: Return; restorations: InventoryRestoration[] },
  InventoryRestoration[]
>(
  "restore-inventory",
  async ({ input, returnRecord, returnItems }, context) => {
    const { supabase, tenantId } = context;
    const restorations: InventoryRestoration[] = [];

    if (!input.restoreInventory || !returnItems.length) {
      return {
        data: { input, returnRecord, restorations: [] },
        compensationData: [],
      };
    }

    // Get order items to find product IDs
    const orderItemIds = returnItems.map((ri) => ri.order_item_id);
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("id, product_id, quantity")
      .in("id", orderItemIds);

    const orderItemMap = new Map(
      (orderItems || []).map((oi) => [oi.id, oi as OrderItem])
    );

    // Restore inventory for each return item
    for (const returnItem of returnItems) {
      const orderItem = orderItemMap.get(returnItem.order_item_id);
      if (!orderItem) continue;

      // Get current product quantity
      const { data: product } = await supabase
        .from("products")
        .select("quantity, track_quantity")
        .eq("id", orderItem.product_id)
        .eq("tenant_id", tenantId)
        .single();

      if (!product?.track_quantity) continue;

      const previousQuantity = product.quantity;
      const newQuantity = previousQuantity + returnItem.quantity;

      // Update inventory
      const { error } = await supabase
        .from("products")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderItem.product_id)
        .eq("tenant_id", tenantId);

      if (error) {
        throw new Error(`Failed to restore inventory: ${error.message}`);
      }

      restorations.push({
        productId: orderItem.product_id,
        quantity: returnItem.quantity,
        previousQuantity,
      });
    }

    return {
      data: { input, returnRecord, restorations },
      compensationData: restorations,
    };
  },
  async (restorations, context) => {
    const { supabase, tenantId } = context;

    // Revert inventory changes
    for (const restoration of restorations) {
      await supabase
        .from("products")
        .update({
          quantity: restoration.previousQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", restoration.productId)
        .eq("tenant_id", tenantId);
    }
  }
);

/**
 * Step 3: Create store credit (if applicable)
 */
const createStoreCreditStep = createStepWithCompensation<
  { input: ProcessRefundInput; returnRecord: Return; restorations: InventoryRestoration[] },
  { input: ProcessRefundInput; returnRecord: Return; storeCreditId?: string },
  string | null
>(
  "create-store-credit",
  async ({ input, returnRecord, restorations }, context) => {
    const { supabase, tenantId } = context;

    if (returnRecord.refund_method !== "store_credit" || !returnRecord.customer_id) {
      return {
        data: { input, returnRecord, storeCreditId: undefined },
        compensationData: null,
      };
    }

    const { data: storeCredit, error } = await supabase
      .from("store_credits")
      .insert({
        tenant_id: tenantId,
        customer_id: returnRecord.customer_id,
        amount: input.refundAmount,
        balance: input.refundAmount,
        currency_code: "USD",
        reason: "return_refund",
        source_type: "return",
        source_id: returnRecord.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create store credit: ${error.message}`);
    }

    // Create initial transaction
    await supabase.from("store_credit_transactions").insert({
      store_credit_id: storeCredit.id,
      type: "credit",
      amount: input.refundAmount,
      balance_after: input.refundAmount,
      notes: `Refund for return ${returnRecord.return_number}`,
    });

    return {
      data: { input, returnRecord, storeCreditId: storeCredit.id },
      compensationData: storeCredit.id,
    };
  },
  async (storeCreditId, context) => {
    if (!storeCreditId) return;
    
    const { supabase } = context;
    await supabase.from("store_credit_transactions").delete().eq("store_credit_id", storeCreditId);
    await supabase.from("store_credits").delete().eq("id", storeCreditId);
  }
);

/**
 * Step 4: Update return status
 */
const updateReturnStatusStep = createStepWithCompensation<
  { input: ProcessRefundInput; returnRecord: Return; storeCreditId?: string },
  { returnRecord: Return },
  { returnId: string; previousStatus: string }
>(
  "update-return-status",
  async ({ input, returnRecord }, context) => {
    const { supabase, tenantId } = context;

    const previousStatus = returnRecord.status;

    const { data: updatedReturn, error } = await supabase
      .from("returns")
      .update({
        status: "refunded",
        refund_amount: input.refundAmount,
        admin_notes: input.adminNotes || null,
        refunded_at: new Date().toISOString(),
      })
      .eq("id", input.returnId)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update return status: ${error.message}`);
    }

    return {
      data: { returnRecord: updatedReturn as Return },
      compensationData: { returnId: input.returnId, previousStatus },
    };
  },
  async ({ returnId, previousStatus }, context) => {
    const { supabase, tenantId } = context;
    await supabase
      .from("returns")
      .update({
        status: previousStatus,
        refund_amount: null,
        refunded_at: null,
      })
      .eq("id", returnId)
      .eq("tenant_id", tenantId);
  }
);

/**
 * Step 5: Emit refund processed event
 */
const emitRefundProcessedStep = createStep<
  { returnRecord: Return },
  { returnRecord: Return }
>(
  "emit-refund-processed",
  async ({ returnRecord }, context) => {
    await eventBus.emit(
      "order.refunded",
      createEventPayload(context.tenantId, {
        returnId: returnRecord.id,
        returnNumber: returnRecord.return_number,
        refundAmount: returnRecord.refund_amount,
        refundMethod: returnRecord.refund_method,
      })
    );

    return { returnRecord };
  }
);

export interface ProcessRefundWorkflowResult {
  returnRecord: Return;
}

/**
 * Process a refund with optional inventory restoration
 * Automatically rolls back on failure
 */
export async function processRefundWorkflow(
  tenantId: string,
  input: ProcessRefundInput
): Promise<ProcessRefundWorkflowResult> {
  const supabase = await createClient();

  const context: WorkflowContext = {
    tenantId,
    supabase,
    completedSteps: [],
  };

  const steps = [
    validateRefundStep,
    restoreInventoryStep,
    createStoreCreditStep,
    updateReturnStatusStep,
    emitRefundProcessedStep,
  ];

  return runWorkflow<ProcessRefundInput, ProcessRefundWorkflowResult>(
    steps,
    input,
    context
  );
}
