/**
 * Notification Delivery Service
 * 
 * Handles notification delivery with respect to user preferences and quiet hours.
 * Supports multiple channels: in_app, email, and push (placeholder for future).
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.1
 */

import { 
  notificationPreferencesRepository,
  type NotificationCategory,
  type NotificationChannel,
} from "@/features/notifications/repositories";
import { notificationEmitter } from "./notification-emitter";
import { EmailService } from "./email";
import type { NotificationType, NotificationMetadata } from "@/components/dashboard/notifications/types";

// Email service instance
const emailService = new EmailService();

/**
 * Priority levels for notifications
 * - urgent: Always delivered immediately, ignores quiet hours
 * - high: Delivered immediately during active hours, queued during quiet hours
 * - normal: Respects all preferences and quiet hours
 * - low: May be batched or delayed based on frequency settings
 */
export type NotificationPriority = "urgent" | "high" | "normal" | "low";

/**
 * Notification payload for delivery
 */
export interface NotificationPayload {
  /** Type of notification (maps to NotificationType) */
  type: NotificationType;
  /** Notification title */
  title: string;
  /** Notification message/description */
  message: string;
  /** Optional link to navigate to when clicked */
  href?: string;
  /** Additional metadata */
  metadata?: NotificationMetadata;
  /** Priority level (defaults to "normal") */
  priority?: NotificationPriority;
}

/**
 * Result of a delivery attempt
 */
export interface DeliveryResult {
  success: boolean;
  channel: NotificationChannel;
  error?: string;
  notificationId?: string;
}

/**
 * Result of delivering to all channels
 */
export interface NotificationDeliveryResult {
  delivered: boolean;
  results: DeliveryResult[];
  skippedChannels: NotificationChannel[];
}

/**
 * Map notification types to categories
 */
function getNotificationCategory(type: NotificationType): NotificationCategory {
  const categoryMap: Record<NotificationType, NotificationCategory> = {
    order_received: "orders",
    order_shipped: "orders",
    order_delivered: "orders",
    order_cancelled: "orders",
    low_stock: "inventory",
    out_of_stock: "inventory",
    payment_received: "orders",
    payment_failed: "orders",
    refund_processed: "orders",
    customer_registered: "orders",
    review_received: "orders",
    system_alert: "system",
    system_update: "system",
    promotion_started: "system",
    promotion_ended: "system",
  };
  
  return categoryMap[type] || "system";
}

/**
 * Check if current time is within quiet hours for a user
 */
async function isWithinQuietHours(
  tenantId: string,
  userId: string
): Promise<boolean> {
  const quietHours = await notificationPreferencesRepository.getQuietHours(tenantId, userId);
  
  if (!quietHours || !quietHours.enabled) {
    return false;
  }
  
  const { startTime, endTime, timezone } = quietHours;
  
  // Get current time in user's timezone
  const now = new Date();
  const userTime = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone || "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  
  // Parse times to minutes since midnight for comparison
  const parseTime = (time: string | null): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  
  const currentMinutes = parseTime(userTime);
  const startMinutes = parseTime(startTime);
  const endMinutes = parseTime(endTime);
  
  // Handle overnight quiet hours (e.g., 22:00 - 08:00)
  if (startMinutes > endMinutes) {
    // Quiet hours span midnight
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // Quiet hours within same day
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
}

/**
 * Check if a notification should be delivered to a specific channel
 * 
 * @param userId - User ID to check preferences for
 * @param tenantId - Tenant ID for multi-tenant isolation
 * @param category - Notification category
 * @param channel - Delivery channel to check
 * @returns Whether the notification should be delivered
 */
export async function shouldDeliverNotification(
  userId: string,
  tenantId: string,
  category: NotificationCategory,
  channel: NotificationChannel
): Promise<boolean> {
  try {
    const { deliver } = await notificationPreferencesRepository.shouldDeliver(
      tenantId,
      userId,
      category,
      channel
    );
    
    return deliver;
  } catch (error) {
    console.error("[NotificationDelivery] Error checking preferences:", error);
    // Default to delivering in_app notifications on error
    return channel === "in_app";
  }
}

/**
 * Deliver notification to a specific channel
 * 
 * @param channel - Channel to deliver to
 * @param userId - Target user ID
 * @param tenantId - Tenant ID
 * @param payload - Notification payload
 * @param userEmail - User's email address (required for email channel)
 * @returns Delivery result
 */
export async function deliverToChannel(
  channel: NotificationChannel,
  userId: string,
  tenantId: string,
  payload: NotificationPayload,
  userEmail?: string
): Promise<DeliveryResult> {
  try {
    switch (channel) {
      case "in_app": {
        // Use notification emitter for in-app notifications
        const notificationId = notificationEmitter.broadcastToUser(tenantId, userId, {
          type: payload.type,
          title: payload.title,
          message: payload.message,
          href: payload.href,
          metadata: payload.metadata,
        });
        
        return {
          success: true,
          channel: "in_app",
          notificationId,
        };
      }
      
      case "email": {
        if (!userEmail) {
          return {
            success: false,
            channel: "email",
            error: "User email not provided",
          };
        }
        
        // Use email service for email notifications
        const result = await emailService.send({
          to: userEmail,
          subject: payload.title,
          html: `<h1>${payload.title}</h1><p>${payload.message}</p>${payload.href ? `<p><a href="${payload.href}">View Details</a></p>` : ''}`,
          text: `${payload.title}\n\n${payload.message}${payload.href ? `\n\nView Details: ${payload.href}` : ''}`,
        });
        
        return {
          success: result.success,
          channel: "email",
          error: result.error,
          notificationId: result.messageId,
        };
      }
      
      case "push": {
        // Push notifications are a placeholder for future implementation
        console.log("[NotificationDelivery] Push notifications not yet implemented");
        return {
          success: false,
          channel: "push",
          error: "Push notifications not yet implemented",
        };
      }
      
      default: {
        return {
          success: false,
          channel,
          error: `Unknown channel: ${channel}`,
        };
      }
    }
  } catch (error) {
    console.error(`[NotificationDelivery] Error delivering to ${channel}:`, error);
    return {
      success: false,
      channel,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Deliver notification to a user via appropriate channels based on preferences
 * 
 * @param userId - Target user ID
 * @param tenantId - Tenant ID for multi-tenant isolation
 * @param payload - Notification payload
 * @param userEmail - Optional user email for email channel
 * @returns Delivery results for all channels
 */
export async function deliverNotification(
  userId: string,
  tenantId: string,
  payload: NotificationPayload,
  userEmail?: string
): Promise<NotificationDeliveryResult> {
  const category = getNotificationCategory(payload.type);
  const priority = payload.priority || "normal";
  const channels: NotificationChannel[] = ["in_app", "email", "push"];
  
  const results: DeliveryResult[] = [];
  const skippedChannels: NotificationChannel[] = [];
  
  // Check quiet hours for non-urgent notifications
  const inQuietHours = await isWithinQuietHours(tenantId, userId);
  
  for (const channel of channels) {
    // Skip push for now (not implemented)
    if (channel === "push") {
      skippedChannels.push(channel);
      continue;
    }
    
    // Check if user has enabled this channel for this category
    const shouldDeliver = await shouldDeliverNotification(userId, tenantId, category, channel);
    
    if (!shouldDeliver) {
      skippedChannels.push(channel);
      continue;
    }
    
    // Check quiet hours (urgent notifications bypass quiet hours)
    if (inQuietHours && priority !== "urgent") {
      // During quiet hours, only deliver in_app notifications (they're silent)
      // Email and push are held until quiet hours end
      if (channel !== "in_app") {
        console.log(`[NotificationDelivery] Skipping ${channel} during quiet hours for user ${userId}`);
        skippedChannels.push(channel);
        continue;
      }
    }
    
    // Deliver to channel
    const result = await deliverToChannel(channel, userId, tenantId, payload, userEmail);
    results.push(result);
  }
  
  const delivered = results.some(r => r.success);
  
  console.log(
    `[NotificationDelivery] Delivered notification to user ${userId}: ` +
    `${results.filter(r => r.success).length}/${results.length} channels successful, ` +
    `${skippedChannels.length} skipped`
  );
  
  return {
    delivered,
    results,
    skippedChannels,
  };
}

/**
 * Deliver notification to multiple users
 * 
 * @param userIds - Array of user IDs to deliver to
 * @param tenantId - Tenant ID
 * @param payload - Notification payload
 * @param userEmails - Map of userId to email address
 * @returns Map of userId to delivery results
 */
export async function deliverNotificationToMany(
  userIds: string[],
  tenantId: string,
  payload: NotificationPayload,
  userEmails?: Map<string, string>
): Promise<Map<string, NotificationDeliveryResult>> {
  const results = new Map<string, NotificationDeliveryResult>();
  
  // Deliver to each user in parallel
  await Promise.all(
    userIds.map(async (userId) => {
      const userEmail = userEmails?.get(userId);
      const result = await deliverNotification(userId, tenantId, payload, userEmail);
      results.set(userId, result);
    })
  );
  
  return results;
}

/**
 * Broadcast notification to all users in a tenant (respects individual preferences)
 * 
 * Note: This is a simplified version that only broadcasts via in_app.
 * For email/push to all users, you'd need to fetch all user emails first.
 * 
 * @param tenantId - Tenant ID
 * @param payload - Notification payload
 * @returns Notification ID from the broadcast
 */
export function broadcastToTenant(
  tenantId: string,
  payload: NotificationPayload
): string {
  return notificationEmitter.broadcastToTenant(tenantId, {
    type: payload.type,
    title: payload.title,
    message: payload.message,
    href: payload.href,
    metadata: payload.metadata,
  });
}

// Export types
export type { NotificationCategory, NotificationChannel };
