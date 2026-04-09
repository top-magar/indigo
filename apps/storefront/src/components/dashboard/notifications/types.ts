/**
 * Notification types for the dashboard notification center
 */

/**
 * Enum representing different notification categories
 */
export type NotificationType =
  | "order_received"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "low_stock"
  | "out_of_stock"
  | "payment_received"
  | "payment_failed"
  | "refund_processed"
  | "customer_registered"
  | "review_received"
  | "system_alert"
  | "system_update"
  | "promotion_started"
  | "promotion_ended";

/**
 * Notification category for filtering
 */
export type NotificationCategory =
  | "all"
  | "unread"
  | "orders"
  | "inventory"
  | "system";

/**
 * Metadata that can be attached to notifications
 */
export interface NotificationMetadata {
  /** Order ID for order-related notifications */
  orderId?: string;
  /** Order number for display */
  orderNumber?: string;
  /** Product ID for inventory notifications */
  productId?: string;
  /** Product name for display */
  productName?: string;
  /** Customer ID for customer-related notifications */
  customerId?: string;
  /** Customer name for display */
  customerName?: string;
  /** Amount for payment notifications */
  amount?: number;
  /** Currency code */
  currency?: string;
  /** Stock quantity for inventory notifications */
  stockQuantity?: number;
  /** Any additional data */
  [key: string]: unknown;
}

/**
 * Core notification interface
 */
export interface Notification {
  /** Unique identifier */
  id: string;
  /** Type of notification */
  type: NotificationType;
  /** Notification title */
  title: string;
  /** Notification message/description */
  message: string;
  /** When the notification was created */
  createdAt: Date;
  /** Whether the notification has been read */
  read: boolean;
  /** Optional link to navigate to when clicked */
  href?: string;
  /** Additional metadata */
  metadata?: NotificationMetadata;
}

/**
 * Input for creating a new notification
 */
export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  href?: string;
  metadata?: NotificationMetadata;
}

/**
 * Notification store state
 */
export interface NotificationState {
  /** All notifications */
  notifications: Notification[];
  /** Whether notifications are loading */
  isLoading: boolean;
}

/**
 * Notification store actions
 */
export interface NotificationActions {
  /** Add a new notification */
  addNotification: (input: CreateNotificationInput) => string;
  /** Mark a notification as read */
  markAsRead: (id: string) => void;
  /** Mark all notifications as read */
  markAllAsRead: () => void;
  /** Remove a notification */
  removeNotification: (id: string) => void;
  /** Clear all notifications */
  clearAll: () => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
}

/**
 * Complete notification store type
 */
export type NotificationStore = NotificationState & NotificationActions;

/**
 * Configuration for notification type display
 */
export interface NotificationTypeConfig {
  /** Icon from Lucide React */
  icon: unknown;
  /** Icon color class */
  color: string;
  /** Background color class */
  bgColor: string;
  /** Category this type belongs to */
  category: NotificationCategory;
}

/**
 * Return type for the useNotifications hook
 */
export interface UseNotificationsReturn {
  /** All notifications */
  notifications: Notification[];
  /** Unread notifications count */
  unreadCount: number;
  /** Whether there are any unread notifications */
  hasUnread: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Get notifications filtered by category */
  getByCategory: (category: NotificationCategory) => Notification[];
  /** Get unread notifications */
  getUnread: () => Notification[];
  /** Add a notification */
  addNotification: (input: CreateNotificationInput) => string;
  /** Mark a notification as read */
  markAsRead: (id: string) => void;
  /** Mark all as read */
  markAllAsRead: () => void;
  /** Remove a notification */
  removeNotification: (id: string) => void;
  /** Clear all notifications */
  clearAll: () => void;
}
