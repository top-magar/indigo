/**
 * Notification Event Emitter Service
 * Manages real-time notification broadcasting to connected SSE clients
 */

import type { CreateNotificationInput, NotificationType } from "@/components/dashboard/notifications/types";

// Forward declaration for circular dependency avoidance
// The actual delivery service is imported dynamically when needed
type NotificationPayload = {
  type: NotificationType;
  title: string;
  message: string;
  href?: string;
  metadata?: Record<string, unknown>;
  priority?: "urgent" | "high" | "normal" | "low";
};

/**
 * Notification event types for real-time streaming
 */
export type NotificationEventType = 
  | "notification"
  | "heartbeat"
  | "connected"
  | "reconnect";

/**
 * Real-time notification event payload
 */
export interface NotificationEvent {
  type: NotificationEventType;
  data: NotificationEventData | null;
  timestamp: Date;
}

/**
 * Notification event data structure
 */
export interface NotificationEventData extends CreateNotificationInput {
  id: string;
  createdAt: Date;
}

/**
 * Connection info for tracking active SSE connections
 */
export interface ConnectionInfo {
  tenantId: string;
  userId?: string;
  controller: ReadableStreamDefaultController<Uint8Array>;
  connectedAt: Date;
  lastPing: Date;
}

/**
 * Notification emitter options
 */
export interface NotificationEmitterOptions {
  heartbeatInterval?: number; // ms
  connectionTimeout?: number; // ms
}

const DEFAULT_OPTIONS: Required<NotificationEmitterOptions> = {
  heartbeatInterval: 30000, // 30 seconds
  connectionTimeout: 300000, // 5 minutes
};

/**
 * NotificationEmitter class - singleton for managing SSE connections
 */
class NotificationEmitter {
  private connections: Map<string, ConnectionInfo> = new Map();
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();
  private options: Required<NotificationEmitterOptions>;

  constructor(options: NotificationEmitterOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Generate a unique connection ID
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate a unique notification ID
   */
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Format SSE message
   */
  private formatSSEMessage(event: NotificationEvent): string {
    const eventType = event.type;
    const data = JSON.stringify({
      ...event,
      timestamp: event.timestamp.toISOString(),
      data: event.data ? {
        ...event.data,
        createdAt: event.data.createdAt.toISOString(),
      } : null,
    });
    return `event: ${eventType}\ndata: ${data}\n\n`;
  }

  /**
   * Encode message to Uint8Array for streaming
   */
  private encodeMessage(message: string): Uint8Array {
    return new TextEncoder().encode(message);
  }

  /**
   * Register a new SSE connection
   */
  registerConnection(
    tenantId: string,
    controller: ReadableStreamDefaultController<Uint8Array>,
    userId?: string
  ): string {
    const connectionId = this.generateConnectionId();
    const now = new Date();

    const connectionInfo: ConnectionInfo = {
      tenantId,
      userId,
      controller,
      connectedAt: now,
      lastPing: now,
    };

    this.connections.set(connectionId, connectionInfo);

    // Send connected event
    this.sendToConnection(connectionId, {
      type: "connected",
      data: null,
      timestamp: now,
    });

    // Start heartbeat for this connection
    this.startHeartbeat(connectionId);

    console.log(`[NotificationEmitter] Connection registered: ${connectionId} for tenant: ${tenantId}`);

    return connectionId;
  }

  /**
   * Remove a connection
   */
  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // Stop heartbeat
      this.stopHeartbeat(connectionId);

      // Close the controller if possible
      try {
        connection.controller.close();
      } catch {
        // Controller may already be closed
      }

      this.connections.delete(connectionId);
      console.log(`[NotificationEmitter] Connection removed: ${connectionId}`);
    }
  }

  /**
   * Start heartbeat for a connection
   */
  private startHeartbeat(connectionId: string): void {
    const interval = setInterval(() => {
      const connection = this.connections.get(connectionId);
      if (!connection) {
        this.stopHeartbeat(connectionId);
        return;
      }

      // Check for connection timeout
      const now = new Date();
      const timeSinceLastPing = now.getTime() - connection.lastPing.getTime();
      if (timeSinceLastPing > this.options.connectionTimeout) {
        console.log(`[NotificationEmitter] Connection timeout: ${connectionId}`);
        this.removeConnection(connectionId);
        return;
      }

      // Send heartbeat
      this.sendToConnection(connectionId, {
        type: "heartbeat",
        data: null,
        timestamp: now,
      });

      connection.lastPing = now;
    }, this.options.heartbeatInterval);

    this.heartbeatIntervals.set(connectionId, interval);
  }

  /**
   * Stop heartbeat for a connection
   */
  private stopHeartbeat(connectionId: string): void {
    const interval = this.heartbeatIntervals.get(connectionId);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(connectionId);
    }
  }

  /**
   * Send event to a specific connection
   */
  private sendToConnection(connectionId: string, event: NotificationEvent): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) return false;

    try {
      const message = this.formatSSEMessage(event);
      connection.controller.enqueue(this.encodeMessage(message));
      return true;
    } catch (error) {
      console.error(`[NotificationEmitter] Failed to send to connection ${connectionId}:`, error);
      this.removeConnection(connectionId);
      return false;
    }
  }

  /**
   * Broadcast notification to all connections for a tenant
   */
  broadcastToTenant(tenantId: string, input: CreateNotificationInput): string {
    const notificationId = this.generateNotificationId();
    const now = new Date();

    const eventData: NotificationEventData = {
      id: notificationId,
      ...input,
      createdAt: now,
    };

    const event: NotificationEvent = {
      type: "notification",
      data: eventData,
      timestamp: now,
    };

    let sentCount = 0;
    for (const [connectionId, connection] of this.connections) {
      if (connection.tenantId === tenantId) {
        if (this.sendToConnection(connectionId, event)) {
          sentCount++;
        }
      }
    }

    console.log(`[NotificationEmitter] Broadcast to tenant ${tenantId}: ${sentCount} connections`);
    return notificationId;
  }

  /**
   * Broadcast notification to a specific user
   */
  broadcastToUser(tenantId: string, userId: string, input: CreateNotificationInput): string {
    const notificationId = this.generateNotificationId();
    const now = new Date();

    const eventData: NotificationEventData = {
      id: notificationId,
      ...input,
      createdAt: now,
    };

    const event: NotificationEvent = {
      type: "notification",
      data: eventData,
      timestamp: now,
    };

    let sentCount = 0;
    for (const [connectionId, connection] of this.connections) {
      if (connection.tenantId === tenantId && connection.userId === userId) {
        if (this.sendToConnection(connectionId, event)) {
          sentCount++;
        }
      }
    }

    console.log(`[NotificationEmitter] Broadcast to user ${userId}: ${sentCount} connections`);
    return notificationId;
  }

  /**
   * Broadcast notification to all connections (system-wide)
   */
  broadcastAll(input: CreateNotificationInput): string {
    const notificationId = this.generateNotificationId();
    const now = new Date();

    const eventData: NotificationEventData = {
      id: notificationId,
      ...input,
      createdAt: now,
    };

    const event: NotificationEvent = {
      type: "notification",
      data: eventData,
      timestamp: now,
    };

    let sentCount = 0;
    for (const [connectionId] of this.connections) {
      if (this.sendToConnection(connectionId, event)) {
        sentCount++;
      }
    }

    console.log(`[NotificationEmitter] Broadcast to all: ${sentCount} connections`);
    return notificationId;
  }

  /**
   * Get connection count for a tenant
   */
  getConnectionCount(tenantId?: string): number {
    if (!tenantId) {
      return this.connections.size;
    }
    let count = 0;
    for (const connection of this.connections.values()) {
      if (connection.tenantId === tenantId) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get all active connections info (for debugging)
   */
  getActiveConnections(): Array<{
    connectionId: string;
    tenantId: string;
    userId?: string;
    connectedAt: Date;
    lastPing: Date;
  }> {
    return Array.from(this.connections.entries()).map(([connectionId, info]) => ({
      connectionId,
      tenantId: info.tenantId,
      userId: info.userId,
      connectedAt: info.connectedAt,
      lastPing: info.lastPing,
    }));
  }

  /**
   * Clean up stale connections
   */
  cleanupStaleConnections(): number {
    const now = new Date();
    let cleanedCount = 0;

    for (const [connectionId, connection] of this.connections) {
      const timeSinceLastPing = now.getTime() - connection.lastPing.getTime();
      if (timeSinceLastPing > this.options.connectionTimeout) {
        this.removeConnection(connectionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[NotificationEmitter] Cleaned up ${cleanedCount} stale connections`);
    }

    return cleanedCount;
  }

  /**
   * Emit notification to a user using the delivery service
   * This method respects user preferences and quiet hours before delivering
   * 
   * @param userId - Target user ID
   * @param tenantId - Tenant ID for multi-tenant isolation
   * @param notification - Notification payload
   * @param userEmail - Optional user email for email channel delivery
   * @returns Promise with delivery results
   */
  async emitToUser(
    userId: string,
    tenantId: string,
    notification: NotificationPayload,
    userEmail?: string
  ): Promise<{
    delivered: boolean;
    results: Array<{ success: boolean; channel: string; error?: string; notificationId?: string }>;
    skippedChannels: string[];
  }> {
    // Dynamic import to avoid circular dependency
    const { deliverNotification } = await import("./notification-delivery");
    
    return deliverNotification(userId, tenantId, notification, userEmail);
  }
}

// Export singleton instance
export const notificationEmitter = new NotificationEmitter();

/**
 * Helper functions for common notification types
 */
export const NotificationHelpers = {
  /**
   * Send order notification
   */
  orderNotification(
    tenantId: string,
    type: Extract<NotificationType, "order_received" | "order_shipped" | "order_delivered" | "order_cancelled">,
    orderNumber: string,
    customerName: string,
    amount?: number,
    currency?: string
  ): string {
    const titles: Record<string, string> = {
      order_received: `New Order #${orderNumber}`,
      order_shipped: `Order #${orderNumber} Shipped`,
      order_delivered: `Order #${orderNumber} Delivered`,
      order_cancelled: `Order #${orderNumber} Cancelled`,
    };

    const messages: Record<string, string> = {
      order_received: `${customerName} placed a new order${amount ? ` for ${currency || "$"}${amount.toFixed(2)}` : ""}`,
      order_shipped: `Order #${orderNumber} has been shipped to ${customerName}`,
      order_delivered: `Order #${orderNumber} was delivered to ${customerName}`,
      order_cancelled: `Order #${orderNumber} from ${customerName} was cancelled`,
    };

    return notificationEmitter.broadcastToTenant(tenantId, {
      type,
      title: titles[type],
      message: messages[type],
      href: `/dashboard/orders/${orderNumber}`,
      metadata: { orderNumber, customerName, amount, currency },
    });
  },

  /**
   * Send inventory notification
   */
  inventoryNotification(
    tenantId: string,
    type: Extract<NotificationType, "low_stock" | "out_of_stock">,
    productName: string,
    productId: string,
    stockQuantity: number
  ): string {
    const titles: Record<string, string> = {
      low_stock: `Low Stock Alert: ${productName}`,
      out_of_stock: `Out of Stock: ${productName}`,
    };

    const messages: Record<string, string> = {
      low_stock: `${productName} is running low with only ${stockQuantity} units remaining`,
      out_of_stock: `${productName} is now out of stock`,
    };

    return notificationEmitter.broadcastToTenant(tenantId, {
      type,
      title: titles[type],
      message: messages[type],
      href: `/dashboard/inventory?product=${productId}`,
      metadata: { productId, productName, stockQuantity },
    });
  },

  /**
   * Send system notification
   */
  systemNotification(
    tenantId: string,
    title: string,
    message: string,
    href?: string
  ): string {
    return notificationEmitter.broadcastToTenant(tenantId, {
      type: "system_alert",
      title,
      message,
      href,
    });
  },

  /**
   * Send mention notification to specific user
   */
  mentionNotification(
    tenantId: string,
    userId: string,
    mentionedBy: string,
    context: string,
    href?: string
  ): string {
    return notificationEmitter.broadcastToUser(tenantId, userId, {
      type: "system_alert",
      title: `${mentionedBy} mentioned you`,
      message: context,
      href,
      metadata: { mentionedBy },
    });
  },
};

export type { NotificationType };
