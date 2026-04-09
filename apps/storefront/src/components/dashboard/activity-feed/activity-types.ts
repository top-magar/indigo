/**
 * Activity Feed Types
 * Types and interfaces for the real-time activity stream
 */

/**
 * Activity type enum representing different activity categories
 */
export enum ActivityType {
  ORDER_CREATED = "order_created",
  ORDER_UPDATED = "order_updated",
  ORDER_SHIPPED = "order_shipped",
  ORDER_DELIVERED = "order_delivered",
  ORDER_CANCELLED = "order_cancelled",
  PRODUCT_CREATED = "product_created",
  PRODUCT_UPDATED = "product_updated",
  PRODUCT_DELETED = "product_deleted",
  CUSTOMER_JOINED = "customer_joined",
  CUSTOMER_UPDATED = "customer_updated",
  COMMENT_ADDED = "comment_added",
  MENTION = "mention",
  INVENTORY_UPDATED = "inventory_updated",
  REFUND_PROCESSED = "refund_processed",
  REVIEW_RECEIVED = "review_received",
  PROMOTION_CREATED = "promotion_created",
}

/**
 * Activity category for filtering
 */
export type ActivityCategory =
  | "all"
  | "orders"
  | "products"
  | "customers"
  | "comments"
  | "mentions";

/**
 * Actor who performed the activity
 */
export interface ActivityActor {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Avatar URL */
  avatarUrl?: string;
  /** Email address */
  email?: string;
  /** Role or title */
  role?: string;
}

/**
 * Target entity of the activity
 */
export interface ActivityTarget {
  /** Unique identifier */
  id: string;
  /** Target type (order, product, customer, etc.) */
  type: "order" | "product" | "customer" | "comment" | "inventory" | "promotion";
  /** Display name or title */
  name: string;
  /** Link to the target */
  href?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Mention in an activity
 */
export interface ActivityMention {
  /** User ID being mentioned */
  userId: string;
  /** Display name */
  name: string;
  /** Position in the message (start index) */
  startIndex: number;
  /** Position in the message (end index) */
  endIndex: number;
}

/**
 * Core activity interface
 */
export interface Activity {
  /** Unique identifier */
  id: string;
  /** Type of activity */
  type: ActivityType;
  /** Actor who performed the activity */
  actor: ActivityActor;
  /** Target of the activity */
  target?: ActivityTarget;
  /** Activity description/message */
  message: string;
  /** Mentions in the message */
  mentions?: ActivityMention[];
  /** When the activity occurred */
  createdAt: Date;
  /** Whether the activity has been read */
  read: boolean;
  /** Optional link to navigate to */
  href?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Activity filter configuration
 */
export interface ActivityFilter {
  /** Filter by activity types */
  types?: ActivityType[];
  /** Filter by category */
  category?: ActivityCategory;
  /** Filter by actor IDs */
  actorIds?: string[];
  /** Only show activities with mentions */
  mentionsOnly?: boolean;
  /** Only show unread activities */
  unreadOnly?: boolean;
  /** Date range start */
  dateFrom?: Date;
  /** Date range end */
  dateTo?: Date;
}

/**
 * Date group for activity grouping
 */
export type ActivityDateGroup =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "older";

/**
 * Grouped activities by date
 */
export interface GroupedActivities {
  group: ActivityDateGroup;
  label: string;
  activities: Activity[];
}

/**
 * Team member for filtering
 */
export interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  role?: string;
}

/**
 * Activity feed state
 */
export interface ActivityFeedState {
  /** All activities */
  activities: Activity[];
  /** Current filter */
  filter: ActivityFilter;
  /** Whether activities are loading */
  isLoading: boolean;
  /** Whether more activities are being loaded */
  isLoadingMore: boolean;
  /** Whether there are more activities to load */
  hasMore: boolean;
  /** Current page for pagination */
  page: number;
  /** Last refresh timestamp */
  lastRefreshedAt: Date | null;
  /** Error message if any */
  error: string | null;
  /** Auto-refresh enabled */
  autoRefresh: boolean;
  /** Auto-refresh interval in ms */
  autoRefreshInterval: number;
}

/**
 * Activity feed actions
 */
export interface ActivityFeedActions {
  /** Set activities */
  setActivities: (activities: Activity[]) => void;
  /** Add new activities (prepend) */
  addActivities: (activities: Activity[]) => void;
  /** Append activities (for pagination) */
  appendActivities: (activities: Activity[]) => void;
  /** Mark activity as read */
  markAsRead: (id: string) => void;
  /** Mark all as read */
  markAllAsRead: () => void;
  /** Set filter */
  setFilter: (filter: Partial<ActivityFilter>) => void;
  /** Reset filter */
  resetFilter: () => void;
  /** Load more activities */
  loadMore: () => Promise<void>;
  /** Refresh activities */
  refresh: () => Promise<void>;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set auto-refresh */
  setAutoRefresh: (enabled: boolean) => void;
  /** Set error */
  setError: (error: string | null) => void;
}

/**
 * Complete activity feed store type
 */
export type ActivityFeedStore = ActivityFeedState & ActivityFeedActions;

/**
 * Return type for the useActivityFeed hook
 */
export interface UseActivityFeedReturn {
  /** All activities */
  activities: Activity[];
  /** Grouped activities by date */
  groupedActivities: GroupedActivities[];
  /** Filtered activities */
  filteredActivities: Activity[];
  /** Current filter */
  filter: ActivityFilter;
  /** Loading state */
  isLoading: boolean;
  /** Loading more state */
  isLoadingMore: boolean;
  /** Has more to load */
  hasMore: boolean;
  /** Last refreshed timestamp */
  lastRefreshedAt: Date | null;
  /** Error message */
  error: string | null;
  /** Auto-refresh enabled */
  autoRefresh: boolean;
  /** Unread count */
  unreadCount: number;
  /** Has unread activities */
  hasUnread: boolean;
  /** Set filter */
  setFilter: (filter: Partial<ActivityFilter>) => void;
  /** Reset filter */
  resetFilter: () => void;
  /** Mark as read */
  markAsRead: (id: string) => void;
  /** Mark all as read */
  markAllAsRead: () => void;
  /** Load more */
  loadMore: () => Promise<void>;
  /** Refresh */
  refresh: () => Promise<void>;
  /** Toggle auto-refresh */
  setAutoRefresh: (enabled: boolean) => void;
}

/**
 * Activity type display configuration
 */
export interface ActivityTypeConfig {
  /** Icon component */
  icon: unknown;
  /** Icon color class */
  color: string;
  /** Background color class */
  bgColor: string;
  /** Category this type belongs to */
  category: ActivityCategory;
  /** Label for display */
  label: string;
}
