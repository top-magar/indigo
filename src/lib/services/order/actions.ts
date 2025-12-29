"use server";

/**
 * Order Service - Handles all order operations and status management
 */

import { authorizedAction } from "@/lib/actions";
import { orders, orderItems, orderStatusHistory, inventoryLevels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { eventBus, createEventPayload } from "../event-bus";

// Types
export interface CreateOrderInput {
    items: Array<{
        variantId: string;
        quantity: number;
        price: string;
    }>;
    customerEmail?: string;
    customerName?: string;
    customerPhone?: string;
    shippingAddress?: string;
    shippingCity?: string;
    shippingArea?: string;
}

export interface UpdateStatusInput {
    orderId: string;
    status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
    note?: string;
    trackingNumber?: string;
}

/**
 * Create a new order
 */
export async function createOrder(input: CreateOrderInput) {
    const {
        items,
        customerEmail,
        customerName,
        customerPhone,
        shippingAddress,
        shippingCity,
        shippingArea,
    } = input;

    if (!items || items.length === 0) {
        throw new Error("Order must have at least one item");
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * item.quantity);
    }, 0);

    const result = await authorizedAction(async (tx, tenantId) => {
        // 1. Create the order
        const [order] = await tx.insert(orders).values({
            tenantId,
            status: 'pending',
            totalAmount: totalAmount.toFixed(2),
            customerEmail,
            customerName,
            customerPhone,
            shippingAddress,
            shippingCity,
            shippingArea,
        }).returning();

        // 2. Create order items
        for (const item of items) {
            await tx.insert(orderItems).values({
                tenantId,
                orderId: order.id,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.price,
            });

            // 3. Decrement inventory
            const [currentLevel] = await tx
                .select()
                .from(inventoryLevels)
                .where(eq(inventoryLevels.variantId, item.variantId));

            if (currentLevel) {
                await tx
                    .update(inventoryLevels)
                    .set({
                        quantity: Math.max(0, currentLevel.quantity - item.quantity),
                        updatedAt: new Date(),
                    })
                    .where(eq(inventoryLevels.variantId, item.variantId));
            }
        }

        // 4. Create initial status history
        await tx.insert(orderStatusHistory).values({
            tenantId,
            orderId: order.id,
            status: 'pending',
            note: 'Order placed',
        });

        // 5. Emit event
        await eventBus.emit('order.created', createEventPayload(tenantId, {
            orderId: order.id,
            totalAmount,
            itemCount: items.length,
            customerEmail,
        }));

        return order;
    });

    revalidatePath("/dashboard/orders");
    return result;
}

/**
 * Update order status
 */
export async function updateStatus(input: UpdateStatusInput) {
    const { orderId, status, note, trackingNumber } = input;

    if (!orderId || !status) {
        throw new Error("Order ID and status are required");
    }

    await authorizedAction(async (tx, tenantId) => {
        // 1. Get current order
        const [order] = await tx
            .select()
            .from(orders)
            .where(eq(orders.id, orderId));

        if (!order) {
            throw new Error("Order not found");
        }

        const previousStatus = order.status;

        // 2. Update order
        await tx
            .update(orders)
            .set({
                status,
                updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId));

        // 3. Record in history
        await tx.insert(orderStatusHistory).values({
            tenantId,
            orderId,
            status,
            note: note || null,
        });

        // 4. Emit appropriate event
        const eventData = {
            orderId,
            previousStatus,
            newStatus: status,
            trackingNumber,
        };

        switch (status) {
            case 'processing':
                await eventBus.emit('order.confirmed', createEventPayload(tenantId, eventData));
                break;
            case 'shipped':
                await eventBus.emit('order.shipped', createEventPayload(tenantId, {
                    ...eventData,
                    trackingNumber,
                }));
                break;
            case 'completed':
                await eventBus.emit('order.completed', createEventPayload(tenantId, eventData));
                break;
            case 'cancelled':
                await eventBus.emit('order.cancelled', createEventPayload(tenantId, eventData));
                break;
        }
    });

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
}

/**
 * Update order notes
 */
export async function updateNotes(orderId: string, notes: string) {
    if (!orderId) {
        throw new Error("Order ID is required");
    }

    await authorizedAction(async (tx) => {
        await tx
            .update(orders)
            .set({
                notes,
                updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId));
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
}

/**
 * Form action wrapper for updating status
 */
export async function updateOrderStatus(formData: FormData) {
    const orderId = formData.get("orderId") as string;
    const status = formData.get("status") as UpdateStatusInput['status'];
    const note = formData.get("note") as string;

    await updateStatus({ orderId, status, note });
}

/**
 * Form action wrapper for updating notes
 */
export async function updateOrderNotes(formData: FormData) {
    const orderId = formData.get("orderId") as string;
    const notes = formData.get("notes") as string;

    await updateNotes(orderId, notes);
}
