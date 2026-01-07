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
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
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

    const totalAmount = items.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * item.quantity);
    }, 0);

    const result = await authorizedAction(async (tx, tenantId) => {
        const [order] = await tx.insert(orders).values({
            tenantId,
            orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
            status: 'pending',
            total: totalAmount.toFixed(2),
            customerEmail,
            customerName,
            shippingAddress: shippingAddress ? {
                address: shippingAddress,
                city: shippingCity,
                area: shippingArea,
                phone: customerPhone,
            } : undefined,
        }).returning();

        for (const item of items) {
            await tx.insert(orderItems).values({
                tenantId,
                orderId: order.id,
                variantId: item.variantId,
                productName: "Product",
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: (parseFloat(item.price) * item.quantity).toFixed(2),
            });

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

        await tx.insert(orderStatusHistory).values({
            tenantId,
            orderId: order.id,
            status: 'pending',
            note: 'Order placed',
        });

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
        const [order] = await tx
            .select()
            .from(orders)
            .where(eq(orders.id, orderId));

        if (!order) {
            throw new Error("Order not found");
        }

        const previousStatus = order.status;

        await tx
            .update(orders)
            .set({
                status,
                updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId));

        await tx.insert(orderStatusHistory).values({
            tenantId,
            orderId,
            status,
            note: note || null,
        });

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
            case 'delivered':
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
                metadata: { notes },
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
