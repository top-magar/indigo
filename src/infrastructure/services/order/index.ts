/**
 * OrderService — Domain facade for all order operations.
 *
 * Delegates to:
 *   - OrderRepository for data access
 *   - Workflow engine for multi-step mutations
 *   - Event bus for side effects (emails, notifications)
 *
 * All dashboard actions and API routes should go through this service.
 */

import { orderRepository } from "@/features/orders/repositories";
import {
  createOrderWorkflow,
  updateOrderStatusWorkflow,
  cancelOrderWorkflow,
  createReturnWorkflow,
  processRefundWorkflow,
  type CreateOrderInput,
  type UpdateOrderStatusInput,
  type CancelOrderInput,
  type CreateReturnInput,
  type ProcessRefundInput,
} from "@/infrastructure/workflows/order";
import { eventBus, createEventPayload } from "@/infrastructure/services/event-bus";
import type { OrderStatus, PaymentStatus } from "@/shared/types/status";

// ── Queries ──

export async function getOrders(tenantId: string, options?: { status?: OrderStatus; limit?: number; offset?: number }) {
  return orderRepository.findAll(tenantId, options);
}

export async function getOrder(tenantId: string, orderId: string) {
  return orderRepository.findWithItems(tenantId, orderId);
}

export async function getOrderByNumber(tenantId: string, orderNumber: string) {
  return orderRepository.findByOrderNumber(tenantId, orderNumber);
}

export async function getOrderStats(tenantId: string) {
  return orderRepository.getStats(tenantId);
}

export async function searchOrders(tenantId: string, query: string, options?: { limit?: number; offset?: number }) {
  return orderRepository.search(tenantId, query, options);
}

// ── Commands (via workflows) ──

export async function createOrder(tenantId: string, input: CreateOrderInput) {
  const result = await createOrderWorkflow(tenantId, input);

  eventBus.emit("order.created", createEventPayload(tenantId, {
    orderId: result.order.id,
    tenantId,
    orderNumber: result.order.order_number,
  })).catch(() => {});

  return result;
}

export async function updateStatus(tenantId: string, input: UpdateOrderStatusInput) {
  return updateOrderStatusWorkflow(tenantId, input);
}

export async function cancelOrder(tenantId: string, input: CancelOrderInput) {
  return cancelOrderWorkflow(tenantId, input);
}

export async function createReturn(tenantId: string, input: CreateReturnInput) {
  return createReturnWorkflow(tenantId, input);
}

export async function processRefund(tenantId: string, input: ProcessRefundInput) {
  return processRefundWorkflow(tenantId, input);
}

// ── Direct repository operations (no workflow needed) ──

export async function updateNotes(tenantId: string, orderId: string, notes: string) {
  return orderRepository.addNote(tenantId, orderId, notes);
}

export async function updatePaymentStatus(tenantId: string, orderId: string, status: PaymentStatus) {
  return orderRepository.updatePaymentStatus(tenantId, orderId, status);
}

export async function createFulfillment(
  tenantId: string,
  orderId: string,
  data: { trackingNumber?: string; trackingUrl?: string; shippingCarrier?: string; warehouse?: string; items: { orderLineId: string; quantity: number }[] }
) {
  return orderRepository.createFulfillment(tenantId, orderId, data);
}
