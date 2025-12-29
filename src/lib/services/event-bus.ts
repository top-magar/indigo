/**
 * Event Bus - Core communication layer for modular services
 * Enables services to communicate asynchronously while remaining decoupled
 */

// Event type definitions
export type EventType =
    // Order events
    | 'order.created'
    | 'order.confirmed'
    | 'order.processing'
    | 'order.shipped'
    | 'order.delivered'
    | 'order.completed'
    | 'order.cancelled'
    | 'order.returned'
    | 'order.refunded'
    // Payment events
    | 'payment.initiated'
    | 'payment.completed'
    | 'payment.failed'
    | 'refund.initiated'
    | 'refund.completed'
    // Product events
    | 'product.created'
    | 'product.updated'
    | 'product.deleted'
    | 'product.archived'
    | 'stock.updated'
    | 'stock.low'
    | 'stock.out'
    | 'stock.reserved'
    | 'stock.released'
    // Variant events
    | 'variant.created'
    | 'variant.updated'
    | 'variant.deleted'
    // Collection events
    | 'collection.created'
    | 'collection.updated'
    | 'collection.deleted'
    // Customer events
    | 'customer.created'
    | 'customer.updated'
    | 'customer.deleted'
    // User events
    | 'user.created'
    | 'user.verified'
    | 'user.login';

// Event payload types
export interface EventPayload {
    tenantId: string;
    timestamp: Date;
    data: Record<string, unknown>;
}

// Event handler type
export type EventHandler = (payload: EventPayload) => Promise<void>;

/**
 * EventBus class - singleton pattern for in-process event handling
 */
class EventBus {
    private handlers: Map<EventType, EventHandler[]> = new Map();
    private eventLog: Array<{ event: EventType; payload: EventPayload; timestamp: Date }> = [];

    /**
     * Subscribe to an event
     */
    on(event: EventType, handler: EventHandler): () => void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event)!.push(handler);

        // Return unsubscribe function
        return () => {
            const handlers = this.handlers.get(event);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index > -1) handlers.splice(index, 1);
            }
        };
    }

    /**
     * Emit an event to all subscribers
     */
    async emit(event: EventType, payload: EventPayload): Promise<void> {
        // Log the event
        this.eventLog.push({ event, payload, timestamp: new Date() });

        // Get handlers
        const handlers = this.handlers.get(event) || [];

        // Execute all handlers (fire and forget for now)
        const results = await Promise.allSettled(
            handlers.map(handler => handler(payload))
        );

        // Log any failures
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Event handler failed for ${event}:`, result.reason);
            }
        });
    }

    /**
     * Get recent events (for debugging)
     */
    getRecentEvents(limit = 10) {
        return this.eventLog.slice(-limit);
    }

    /**
     * Clear event log
     */
    clearLog() {
        this.eventLog = [];
    }
}

// Export singleton instance
export const eventBus = new EventBus();

/**
 * Helper to create typed event payloads
 */
export function createEventPayload(
    tenantId: string,
    data: Record<string, unknown>
): EventPayload {
    return {
        tenantId,
        timestamp: new Date(),
        data,
    };
}
