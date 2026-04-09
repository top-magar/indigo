import "server-only";
import { 
    orders, 
    orderItems, 
    orderStatusHistory, 
    fulfillments,
    fulfillmentLines,
    orderTransactions,
    orderEvents,
    OrderStatus,
    PaymentStatus,
    FulfillmentStatus,
} from "@/db/schema";
import { eq, and, desc, gte, lte, ilike, or } from "drizzle-orm";
import { withTenant } from "@/infrastructure/db";
import { AppError } from "@/shared/errors";
import { QueryOptions } from "@/infrastructure/repositories/base";

/**
 * Valid order status transitions
 */
const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    draft: ["unconfirmed", "pending", "cancelled"],
    unconfirmed: ["pending", "confirmed", "cancelled"],
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "returned"],
    delivered: ["completed", "returned"],
    completed: ["returned"],
    cancelled: [],
    returned: ["refunded"],
    refunded: [],
};

/**
 * Order create input type
 */
export type OrderCreateInput = {
    orderNumber: string;
    customerId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    fulfillmentStatus?: FulfillmentStatus;
    subtotal: string;
    discountTotal?: string;
    shippingTotal?: string;
    taxTotal?: string;
    total: string;
    currency?: string;
    itemsCount?: number;
    shippingAddress?: Record<string, unknown>;
    billingAddress?: Record<string, unknown>;
    customerEmail?: string;
    customerName?: string;
    customerNote?: string;
    internalNotes?: string;
    shippingMethod?: string;
    shippingCarrier?: string;
    discountId?: string;
    discountCode?: string;
    discountName?: string;
    stripePaymentIntentId?: string;
    metadata?: Record<string, unknown>;
};

/**
 * Order item create input type
 */
export type OrderItemCreateInput = {
    orderId: string;
    productId?: string;
    variantId?: string;
    productName: string;
    productSku?: string;
    productImage?: string;
    variantTitle?: string;
    options?: unknown[];
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    taxRate?: string;
    taxAmount?: string;
    discountAmount?: string;
    metadata?: Record<string, unknown>;
};

/**
 * Order statistics
 */
export interface OrderStats {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    todayCount: number;
    todayRevenue: number;
    totalRevenue: number;
    unpaidCount: number;
}

/**
 * Order Repository
 */
export class OrderRepository {
    /**
     * Find all orders for tenant
     */
    async findAll(tenantId: string, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            let query = tx
                .select()
                .from(orders)
                .orderBy(desc(orders.createdAt));

            if (options?.limit) {
                query = query.limit(options.limit) as typeof query;
            }

            if (options?.offset) {
                query = query.offset(options.offset) as typeof query;
            }

            return query;
        });
    }

    /**
     * Find order by ID
     */
    async findById(tenantId: string, id: string) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .select()
                .from(orders)
                .where(eq(orders.id, id))
                .limit(1);

            return result || null;
        });
    }

    /**
     * Find order by order number
     */
    async findByOrderNumber(tenantId: string, orderNumber: string) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .select()
                .from(orders)
                .where(eq(orders.orderNumber, orderNumber))
                .limit(1);

            return result || null;
        });
    }

    /**
     * Find order by Stripe Payment Intent ID (for webhooks)
     */
    async findByPaymentIntent(tenantId: string, paymentIntentId: string) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .select()
                .from(orders)
                .where(eq(orders.stripePaymentIntentId, paymentIntentId))
                .limit(1);

            return result || null;
        });
    }

    /**
     * Find orders by status
     */
    async findByStatus(tenantId: string, status: OrderStatus, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            let query = tx
                .select()
                .from(orders)
                .where(eq(orders.status, status))
                .orderBy(desc(orders.createdAt));

            if (options?.limit) {
                query = query.limit(options.limit) as typeof query;
            }

            if (options?.offset) {
                query = query.offset(options.offset) as typeof query;
            }

            return query;
        });
    }

    /**
     * Find orders by payment status
     */
    async findByPaymentStatus(tenantId: string, paymentStatus: PaymentStatus, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            let query = tx
                .select()
                .from(orders)
                .where(eq(orders.paymentStatus, paymentStatus))
                .orderBy(desc(orders.createdAt));

            if (options?.limit) {
                query = query.limit(options.limit) as typeof query;
            }

            if (options?.offset) {
                query = query.offset(options.offset) as typeof query;
            }

            return query;
        });
    }

    /**
     * Find orders by customer email
     */
    async findByCustomerEmail(tenantId: string, email: string) {
        return withTenant(tenantId, async (tx) => {
            return tx
                .select()
                .from(orders)
                .where(eq(orders.customerEmail, email))
                .orderBy(desc(orders.createdAt));
        });
    }

    /**
     * Find orders by customer ID
     */
    async findByCustomerId(tenantId: string, customerId: string, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            let query = tx
                .select()
                .from(orders)
                .where(eq(orders.customerId, customerId))
                .orderBy(desc(orders.createdAt));

            if (options?.limit) {
                query = query.limit(options.limit) as typeof query;
            }

            if (options?.offset) {
                query = query.offset(options.offset) as typeof query;
            }

            return query;
        });
    }

    /**
     * Find orders within date range
     */
    async findByDateRange(tenantId: string, startDate: Date, endDate: Date, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            let query = tx
                .select()
                .from(orders)
                .where(
                    and(
                        gte(orders.createdAt, startDate),
                        lte(orders.createdAt, endDate)
                    )
                )
                .orderBy(desc(orders.createdAt));

            if (options?.limit) {
                query = query.limit(options.limit) as typeof query;
            }

            if (options?.offset) {
                query = query.offset(options.offset) as typeof query;
            }

            return query;
        });
    }

    /**
     * Search orders by order number, customer name, or email
     */
    async search(tenantId: string, query: string, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            const searchPattern = `%${query}%`;
            let dbQuery = tx
                .select()
                .from(orders)
                .where(
                    or(
                        ilike(orders.orderNumber, searchPattern),
                        ilike(orders.customerName, searchPattern),
                        ilike(orders.customerEmail, searchPattern)
                    )
                )
                .orderBy(desc(orders.createdAt));

            if (options?.limit) {
                dbQuery = dbQuery.limit(options.limit) as typeof dbQuery;
            }

            if (options?.offset) {
                dbQuery = dbQuery.offset(options.offset) as typeof dbQuery;
            }

            return dbQuery;
        });
    }

    /**
     * Create a new order
     */
    async create(tenantId: string, data: OrderCreateInput) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .insert(orders)
                .values({
                    tenantId,
                    orderNumber: data.orderNumber,
                    customerId: data.customerId,
                    status: data.status || "pending",
                    paymentStatus: data.paymentStatus || "pending",
                    fulfillmentStatus: data.fulfillmentStatus || "unfulfilled",
                    subtotal: data.subtotal,
                    discountTotal: data.discountTotal || "0",
                    shippingTotal: data.shippingTotal || "0",
                    taxTotal: data.taxTotal || "0",
                    total: data.total,
                    currency: data.currency || "USD",
                    itemsCount: data.itemsCount || 0,
                    shippingAddress: data.shippingAddress,
                    billingAddress: data.billingAddress,
                    customerEmail: data.customerEmail,
                    customerName: data.customerName,
                    customerNote: data.customerNote,
                    internalNotes: data.internalNotes,
                    shippingMethod: data.shippingMethod,
                    shippingCarrier: data.shippingCarrier,
                    discountId: data.discountId,
                    discountCode: data.discountCode,
                    discountName: data.discountName,
                    stripePaymentIntentId: data.stripePaymentIntentId,
                    metadata: data.metadata || {},
                })
                .returning();

            // Record order creation event
            await tx.insert(orderEvents).values({
                tenantId,
                orderId: result.id,
                type: "order_created",
                message: `Order ${data.orderNumber} created`,
            });

            return result;
        });
    }

    /**
     * Add items to an order
     */
    async addItems(tenantId: string, orderId: string, items: OrderItemCreateInput[]) {
        return withTenant(tenantId, async (tx) => {
            const insertedItems = [];
            for (const item of items) {
                const [inserted] = await tx
                    .insert(orderItems)
                    .values({
                        tenantId,
                        orderId,
                        productId: item.productId,
                        variantId: item.variantId,
                        productName: item.productName,
                        productSku: item.productSku,
                        productImage: item.productImage,
                        variantTitle: item.variantTitle,
                        options: item.options || [],
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        taxRate: item.taxRate,
                        taxAmount: item.taxAmount,
                        discountAmount: item.discountAmount,
                        metadata: item.metadata || {},
                    })
                    .returning();
                insertedItems.push(inserted);
            }

            // Update items count
            await tx
                .update(orders)
                .set({
                    itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
                    updatedAt: new Date(),
                })
                .where(eq(orders.id, orderId));

            return insertedItems;
        });
    }

    /**
     * Update order status with validation and history tracking
     */
    async updateStatus(
        tenantId: string,
        orderId: string,
        newStatus: OrderStatus,
        note?: string,
        userId?: string,
        userName?: string
    ) {
        return withTenant(tenantId, async (tx) => {
            // Get current order
            const [order] = await tx
                .select()
                .from(orders)
                .where(eq(orders.id, orderId))
                .limit(1);

            if (!order) {
                throw new AppError("Order not found", "ORDER_NOT_FOUND");
            }

            // Validate status transition
            const currentStatus = order.status;
            const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus] || [];

            if (!allowedTransitions.includes(newStatus)) {
                throw new AppError(
                    `Cannot transition from ${currentStatus} to ${newStatus}`,
                    "INVALID_STATUS_TRANSITION"
                );
            }

            // Update order status
            const [updatedOrder] = await tx
                .update(orders)
                .set({
                    status: newStatus,
                    updatedAt: new Date(),
                })
                .where(eq(orders.id, orderId))
                .returning();

            // Record status history
            await tx.insert(orderStatusHistory).values({
                tenantId,
                orderId,
                status: newStatus,
                note,
                createdBy: userId,
            });

            // Record event
            await tx.insert(orderEvents).values({
                tenantId,
                orderId,
                type: "status_changed",
                message: `Status changed from ${currentStatus} to ${newStatus}${note ? `: ${note}` : ""}`,
                userId,
                userName,
            });

            return updatedOrder;
        });
    }

    /**
     * Update payment status
     */
    async updatePaymentStatus(
        tenantId: string,
        orderId: string,
        paymentStatus: PaymentStatus,
        stripePaymentIntentId?: string
    ) {
        return withTenant(tenantId, async (tx) => {
            const [updatedOrder] = await tx
                .update(orders)
                .set({
                    paymentStatus,
                    ...(stripePaymentIntentId && { stripePaymentIntentId }),
                    updatedAt: new Date(),
                })
                .where(eq(orders.id, orderId))
                .returning();

            // Record event
            await tx.insert(orderEvents).values({
                tenantId,
                orderId,
                type: "payment_status_changed",
                message: `Payment status changed to ${paymentStatus}`,
            });

            return updatedOrder;
        });
    }

    /**
     * Update fulfillment status
     */
    async updateFulfillmentStatus(
        tenantId: string,
        orderId: string,
        fulfillmentStatus: FulfillmentStatus
    ) {
        return withTenant(tenantId, async (tx) => {
            const [updatedOrder] = await tx
                .update(orders)
                .set({
                    fulfillmentStatus,
                    updatedAt: new Date(),
                })
                .where(eq(orders.id, orderId))
                .returning();

            return updatedOrder;
        });
    }

    /**
     * Get order with items
     */
    async findWithItems(tenantId: string, orderId: string) {
        return withTenant(tenantId, async (tx) => {
            const [order] = await tx
                .select()
                .from(orders)
                .where(eq(orders.id, orderId))
                .limit(1);

            if (!order) {
                return null;
            }

            const items = await tx
                .select()
                .from(orderItems)
                .where(eq(orderItems.orderId, orderId));

            const history = await tx
                .select()
                .from(orderStatusHistory)
                .where(eq(orderStatusHistory.orderId, orderId))
                .orderBy(desc(orderStatusHistory.createdAt));

            const events = await tx
                .select()
                .from(orderEvents)
                .where(eq(orderEvents.orderId, orderId))
                .orderBy(desc(orderEvents.createdAt));

            const orderFulfillments = await tx
                .select()
                .from(fulfillments)
                .where(eq(fulfillments.orderId, orderId));

            const transactions = await tx
                .select()
                .from(orderTransactions)
                .where(eq(orderTransactions.orderId, orderId))
                .orderBy(desc(orderTransactions.createdAt));

            return {
                ...order,
                items,
                statusHistory: history,
                events,
                fulfillments: orderFulfillments,
                transactions,
            };
        });
    }

    /**
     * Get order statistics for dashboard
     */
    async getStats(tenantId: string): Promise<OrderStats> {
        return withTenant(tenantId, async (tx) => {
            const allOrders = await tx.select().from(orders);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today);

            return {
                total: allOrders.length,
                pending: allOrders.filter(o => o.status === "pending").length,
                confirmed: allOrders.filter(o => o.status === "confirmed").length,
                processing: allOrders.filter(o => o.status === "processing").length,
                shipped: allOrders.filter(o => o.status === "shipped").length,
                delivered: allOrders.filter(o => o.status === "delivered").length,
                cancelled: allOrders.filter(o => o.status === "cancelled").length,
                todayCount: todayOrders.length,
                todayRevenue: todayOrders.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0),
                totalRevenue: allOrders
                    .filter(o => o.paymentStatus === "paid")
                    .reduce((sum, o) => sum + parseFloat(o.total || "0"), 0),
                unpaidCount: allOrders.filter(o => o.paymentStatus === "pending").length,
            };
        });
    }

    /**
     * Create a fulfillment for an order
     */
    async createFulfillment(
        tenantId: string,
        orderId: string,
        data: {
            trackingNumber?: string;
            trackingUrl?: string;
            shippingCarrier?: string;
            warehouse?: string;
            items: { orderLineId: string; quantity: number }[];
        }
    ) {
        return withTenant(tenantId, async (tx) => {
            // Create fulfillment
            const [fulfillment] = await tx
                .insert(fulfillments)
                .values({
                    tenantId,
                    orderId,
                    trackingNumber: data.trackingNumber,
                    trackingUrl: data.trackingUrl,
                    shippingCarrier: data.shippingCarrier,
                    warehouse: data.warehouse,
                    status: "pending",
                })
                .returning();

            // Create fulfillment lines
            for (const item of data.items) {
                await tx.insert(fulfillmentLines).values({
                    tenantId,
                    fulfillmentId: fulfillment.id,
                    orderLineId: item.orderLineId,
                    quantity: item.quantity,
                });

                // Update quantity fulfilled on order item
                const [orderItem] = await tx
                    .select()
                    .from(orderItems)
                    .where(eq(orderItems.id, item.orderLineId))
                    .limit(1);

                if (orderItem) {
                    await tx
                        .update(orderItems)
                        .set({
                            quantityFulfilled: (orderItem.quantityFulfilled || 0) + item.quantity,
                        })
                        .where(eq(orderItems.id, item.orderLineId));
                }
            }

            // Record event
            await tx.insert(orderEvents).values({
                tenantId,
                orderId,
                type: "fulfillment_created",
                message: `Fulfillment created${data.trackingNumber ? ` with tracking: ${data.trackingNumber}` : ""}`,
            });

            return fulfillment;
        });
    }

    /**
     * Record a transaction for an order
     */
    async recordTransaction(
        tenantId: string,
        orderId: string,
        data: {
            type: "authorization" | "charge" | "refund" | "void" | "capture" | "chargeback";
            status: "pending" | "success" | "failed" | "cancelled";
            amount: string;
            currency?: string;
            paymentMethod?: string;
            paymentGateway?: string;
            gatewayTransactionId?: string;
            metadata?: Record<string, unknown>;
        }
    ) {
        return withTenant(tenantId, async (tx) => {
            const [transaction] = await tx
                .insert(orderTransactions)
                .values({
                    tenantId,
                    orderId,
                    type: data.type,
                    status: data.status,
                    amount: data.amount,
                    currency: data.currency || "USD",
                    paymentMethod: data.paymentMethod,
                    paymentGateway: data.paymentGateway,
                    gatewayTransactionId: data.gatewayTransactionId,
                    metadata: data.metadata || {},
                })
                .returning();

            return transaction;
        });
    }

    /**
     * Add internal note to order
     */
    async addNote(tenantId: string, orderId: string, note: string, userId?: string, userName?: string) {
        return withTenant(tenantId, async (tx) => {
            await tx.insert(orderEvents).values({
                tenantId,
                orderId,
                type: "note_added",
                message: note,
                userId,
                userName,
            });

            // Also append to internal notes
            const [order] = await tx
                .select()
                .from(orders)
                .where(eq(orders.id, orderId))
                .limit(1);

            if (order) {
                const existingNotes = order.internalNotes || "";
                const timestamp = new Date().toISOString();
                const newNote = `[${timestamp}] ${userName || "System"}: ${note}`;
                const updatedNotes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;

                await tx
                    .update(orders)
                    .set({
                        internalNotes: updatedNotes,
                        updatedAt: new Date(),
                    })
                    .where(eq(orders.id, orderId));
            }
        });
    }

    /**
     * Update order fields
     */
    async update(
        tenantId: string,
        orderId: string,
        data: Partial<Omit<OrderCreateInput, "orderNumber">>
    ) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .update(orders)
                .set({
                    ...data,
                    updatedAt: new Date(),
                })
                .where(eq(orders.id, orderId))
                .returning();

            return result || null;
        });
    }

    /**
     * Delete an order (typically only for pending orders)
     */
    async delete(tenantId: string, orderId: string) {
        return withTenant(tenantId, async (tx) => {
            // Delete related records first
            await tx.delete(orderEvents).where(eq(orderEvents.orderId, orderId));
            await tx.delete(orderStatusHistory).where(eq(orderStatusHistory.orderId, orderId));
            await tx.delete(orderTransactions).where(eq(orderTransactions.orderId, orderId));
            
            // Delete fulfillment lines and fulfillments
            const orderFulfillments = await tx
                .select({ id: fulfillments.id })
                .from(fulfillments)
                .where(eq(fulfillments.orderId, orderId));
            
            for (const f of orderFulfillments) {
                await tx.delete(fulfillmentLines).where(eq(fulfillmentLines.fulfillmentId, f.id));
            }
            await tx.delete(fulfillments).where(eq(fulfillments.orderId, orderId));
            
            // Delete order items
            await tx.delete(orderItems).where(eq(orderItems.orderId, orderId));
            
            // Delete order
            await tx.delete(orders).where(eq(orders.id, orderId));
        });
    }
}

// Singleton instance
export const orderRepository = new OrderRepository();
