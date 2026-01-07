/**
 * Create Order Workflow
 * Orchestrates order creation with inventory reservation and payment
 */

import { createClient } from "@/infrastructure/supabase/server";
import { createStep, createStepWithCompensation, runWorkflow, WorkflowContext } from "../engine";
import { eventBus, createEventPayload } from "@/infrastructure/services/event-bus";

// Types
export interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  title: string;
}

export interface CreateOrderInput {
  customerId?: string;
  customerEmail: string;
  customerName?: string;
  items: OrderItem[];
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  shippingMethod?: string;
  shippingCost?: number;
  discountCode?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

interface Order {
  id: string;
  tenant_id: string;
  order_number: string;
  status: string;
  total: number;
  [key: string]: unknown;
}

interface InventoryReservation {
  productId: string;
  variantId?: string;
  quantity: number;
  previousQuantity: number;
}

/**
 * Step 1: Validate order input and check inventory
 */
const validateOrderStep = createStep<
  CreateOrderInput,
  CreateOrderInput
>(
  "validate-order",
  async (input, context) => {
    const { supabase, tenantId } = context;

    if (!input.items?.length) {
      throw new Error("Order must have at least one item");
    }

    if (!input.customerEmail) {
      throw new Error("Customer email is required");
    }

    // Check inventory for all items
    for (const item of input.items) {
      const { data: product } = await supabase
        .from("products")
        .select("id, name, quantity, track_quantity, allow_backorder")
        .eq("id", item.productId)
        .eq("tenant_id", tenantId)
        .single();

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.track_quantity && !product.allow_backorder) {
        if (product.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`
          );
        }
      }
    }

    return input;
  }
);

/**
 * Step 2: Reserve inventory
 */
const reserveInventoryStep = createStepWithCompensation<
  CreateOrderInput,
  { input: CreateOrderInput; reservations: InventoryReservation[] },
  InventoryReservation[]
>(
  "reserve-inventory",
  async (input, context) => {
    const { supabase, tenantId } = context;
    const reservations: InventoryReservation[] = [];

    for (const item of input.items) {
      // Get current quantity
      const { data: product } = await supabase
        .from("products")
        .select("quantity, track_quantity")
        .eq("id", item.productId)
        .eq("tenant_id", tenantId)
        .single();

      if (!product) continue;

      if (product.track_quantity) {
        const previousQuantity = product.quantity;
        const newQuantity = previousQuantity - item.quantity;

        // Update inventory
        const { error } = await supabase
          .from("products")
          .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
          .eq("id", item.productId)
          .eq("tenant_id", tenantId);

        if (error) {
          throw new Error(`Failed to reserve inventory: ${error.message}`);
        }

        reservations.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          previousQuantity,
        });
      }
    }

    return {
      data: { input, reservations },
      compensationData: reservations,
    };
  },
  async (reservations, context) => {
    const { supabase, tenantId } = context;

    // Restore inventory
    for (const reservation of reservations) {
      await supabase
        .from("products")
        .update({
          quantity: reservation.previousQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reservation.productId)
        .eq("tenant_id", tenantId);
    }
  }
);

/**
 * Step 3: Create order record
 */
const createOrderRecordStep = createStepWithCompensation<
  { input: CreateOrderInput; reservations: InventoryReservation[] },
  { order: Order; input: CreateOrderInput },
  string
>(
  "create-order-record",
  async ({ input, reservations }, context) => {
    const { supabase, tenantId } = context;

    // Calculate totals
    const subtotal = input.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = input.shippingCost || 0;
    const total = subtotal + shippingCost;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        tenant_id: tenantId,
        order_number: orderNumber,
        customer_id: input.customerId || null,
        customer_email: input.customerEmail,
        customer_name: input.customerName || null,
        status: "pending",
        subtotal,
        shipping_cost: shippingCost,
        total,
        shipping_address: input.shippingAddress,
        billing_address: input.billingAddress || input.shippingAddress,
        shipping_method: input.shippingMethod || null,
        discount_code: input.discountCode || null,
        notes: input.notes || null,
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }

    return {
      data: { order: order as Order, input },
      compensationData: order.id,
    };
  },
  async (orderId, context) => {
    const { supabase, tenantId } = context;
    await supabase
      .from("orders")
      .delete()
      .eq("id", orderId)
      .eq("tenant_id", tenantId);
  }
);

/**
 * Step 4: Create order items
 */
const createOrderItemsStep = createStepWithCompensation<
  { order: Order; input: CreateOrderInput },
  { order: Order },
  string
>(
  "create-order-items",
  async ({ order, input }, context) => {
    const { supabase, tenantId } = context;

    const itemsToInsert = input.items.map((item) => ({
      tenant_id: tenantId,
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId || null,
      title: item.title,
      quantity: item.quantity,
      unit_price: item.price,
      total: item.price * item.quantity,
    }));

    const { error } = await supabase.from("order_items").insert(itemsToInsert);

    if (error) {
      throw new Error(`Failed to create order items: ${error.message}`);
    }

    return {
      data: { order },
      compensationData: order.id,
    };
  },
  async (orderId, context) => {
    const { supabase, tenantId } = context;
    await supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId)
      .eq("tenant_id", tenantId);
  }
);

/**
 * Step 5: Emit order created event
 */
const emitOrderCreatedStep = createStep<
  { order: Order },
  { order: Order }
>(
  "emit-order-created",
  async ({ order }, context) => {
    await eventBus.emit(
      "order.created",
      createEventPayload(context.tenantId, {
        orderId: order.id,
        orderNumber: order.order_number,
        total: order.total,
        status: order.status,
      })
    );

    return { order };
  }
);

export interface CreateOrderWorkflowResult {
  order: Order;
}

/**
 * Create an order with inventory reservation
 * Automatically rolls back on failure
 */
export async function createOrderWorkflow(
  tenantId: string,
  input: CreateOrderInput
): Promise<CreateOrderWorkflowResult> {
  const supabase = await createClient();

  const context: WorkflowContext = {
    tenantId,
    supabase,
    completedSteps: [],
  };

  const steps = [
    validateOrderStep,
    reserveInventoryStep,
    createOrderRecordStep,
    createOrderItemsStep,
    emitOrderCreatedStep,
  ];

  return runWorkflow<CreateOrderInput, CreateOrderWorkflowResult>(
    steps,
    input,
    context
  );
}
