"use client";

import { useMemo, useCallback, Fragment } from "react";
import { formatDistanceToNow } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingCart01Icon,
  DeliveryTruck01Icon,
  PackageDeliveredIcon,
  Cancel01Icon,
  PackageAddIcon,
  Edit02Icon,
  Delete02Icon,
  UserAdd01Icon,
  UserEdit01Icon,
  Comment01Icon,
  Mail01Icon,
  PackageIcon,
  RedoIcon,
  StarIcon,
  SaleTag01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/shared/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  type Activity,
  type ActivityTypeConfig,
  ActivityType,
} from "./activity-types";

// HugeIcon type
type HugeIcon = typeof ShoppingCart01Icon;

// Use Mail01Icon as a substitute for MentionIcon (@ symbol)
const MentionIcon = Mail01Icon;

// Configuration for each activity type
const activityConfig: Record<ActivityType, ActivityTypeConfig> = {
  [ActivityType.ORDER_CREATED]: {
    icon: ShoppingCart01Icon,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    category: "orders",
    label: "Order Created",
  },
  [ActivityType.ORDER_UPDATED]: {
    icon: Edit02Icon,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    category: "orders",
    label: "Order Updated",
  },
  [ActivityType.ORDER_SHIPPED]: {
    icon: DeliveryTruck01Icon,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    category: "orders",
    label: "Order Shipped",
  },
  [ActivityType.ORDER_DELIVERED]: {
    icon: PackageDeliveredIcon,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    category: "orders",
    label: "Order Delivered",
  },
  [ActivityType.ORDER_CANCELLED]: {
    icon: Cancel01Icon,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    category: "orders",
    label: "Order Cancelled",
  },
  [ActivityType.PRODUCT_CREATED]: {
    icon: PackageAddIcon,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    category: "products",
    label: "Product Created",
  },
  [ActivityType.PRODUCT_UPDATED]: {
    icon: Edit02Icon,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    category: "products",
    label: "Product Updated",
  },
  [ActivityType.PRODUCT_DELETED]: {
    icon: Delete02Icon,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    category: "products",
    label: "Product Deleted",
  },
  [ActivityType.CUSTOMER_JOINED]: {
    icon: UserAdd01Icon,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    category: "customers",
    label: "Customer Joined",
  },
  [ActivityType.CUSTOMER_UPDATED]: {
    icon: UserEdit01Icon,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    category: "customers",
    label: "Customer Updated",
  },
  [ActivityType.COMMENT_ADDED]: {
    icon: Comment01Icon,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    category: "comments",
    label: "Comment Added",
  },
  [ActivityType.MENTION]: {
    icon: MentionIcon,
    color: "text-primary",
    bgColor: "bg-primary/10",
    category: "mentions",
    label: "Mention",
  },
  [ActivityType.INVENTORY_UPDATED]: {
    icon: PackageIcon,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    category: "products",
    label: "Inventory Updated",
  },
  [ActivityType.REFUND_PROCESSED]: {
    icon: RedoIcon,
    color: "text-warning",
    bgColor: "bg-warning/10",
    category: "orders",
    label: "Refund Processed",
  },
  [ActivityType.REVIEW_RECEIVED]: {
    icon: StarIcon,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    category: "customers",
    label: "Review Received",
  },
  [ActivityType.PROMOTION_CREATED]: {
    icon: SaleTag01Icon,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    category: "products",
    label: "Promotion Created",
  },
};

// Default config for unknown types
const defaultConfig: ActivityTypeConfig = {
  icon: Comment01Icon,
  color: "text-muted-foreground",
  bgColor: "bg-muted",
  category: "all",
  label: "Activity",
};

export interface ActivityItemProps {
  activity: Activity;
  onClick?: (activity: Activity) => void;
  onMentionClick?: (userId: string, name: string) => void;
  className?: string;
  showAvatar?: boolean;
  compact?: boolean;
}

/**
 * Parse message and render with highlighted mentions
 */
function renderMessageWithMentions(
  message: string,
  mentions: Activity["mentions"],
  onMentionClick?: (userId: string, name: string) => void
): React.ReactNode {
  if (!mentions || mentions.length === 0) {
    return message;
  }

  // Find all @mentions in the message
  const mentionRegex = /@([A-Za-z\s]+?)(?=[\s,."']|$)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(message)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(message.slice(lastIndex, match.index));
    }

    const mentionName = match[1];
    const mention = mentions.find((m) => m.name === mentionName);

    if (mention) {
      parts.push(
        <button
          key={`mention-${match.index}`}
          onClick={(e) => {
            e.stopPropagation();
            onMentionClick?.(mention.userId, mention.name);
          }}
          className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1 py-0.5 text-primary hover:bg-primary/20 transition-colors font-medium"
        >
          @{mentionName}
        </button>
      );
    } else {
      parts.push(
        <span key={`mention-${match.index}`} className="text-primary font-medium">
          @{mentionName}
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < message.length) {
    parts.push(message.slice(lastIndex));
  }

  return parts.length > 0 ? parts : message;
}

/**
 * Get initials from a name
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ActivityItem({
  activity,
  onClick,
  onMentionClick,
  className,
  showAvatar = true,
  compact = false,
}: ActivityItemProps) {
  const config = activityConfig[activity.type] || defaultConfig;

  const handleClick = useCallback(() => {
    onClick?.(activity);
  }, [onClick, activity]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const relativeTime = useMemo(
    () => formatDistanceToNow(activity.createdAt, { addSuffix: true }),
    [activity.createdAt]
  );

  const renderedMessage = useMemo(
    () => renderMessageWithMentions(activity.message, activity.mentions, onMentionClick),
    [activity.message, activity.mentions, onMentionClick]
  );

  const hasMentions = activity.mentions && activity.mentions.length > 0;

  if (compact) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer",
          "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !activity.read && "bg-muted/30",
          className
        )}
      >
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            config.bgColor
          )}
        >
          <HugeiconsIcon
            icon={config.icon as HugeIcon}
            className={cn("h-3 w-3", config.color)}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs truncate">
            <span className="font-medium">{activity.actor.name}</span>{" "}
            <span className="text-muted-foreground">{activity.message}</span>
          </p>
        </div>

        <span className="text-[10px] text-muted-foreground/70 shrink-0">
          {relativeTime}
        </span>

        {!activity.read && (
          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
        )}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex gap-3 p-3 rounded-lg transition-colors cursor-pointer",
        "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !activity.read && "bg-muted/30",
        className
      )}
    >
      {/* Unread indicator */}
      {!activity.read && (
        <div className="absolute top-3 right-3">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
        </div>
      )}

      {/* Avatar or Icon */}
      {showAvatar ? (
        <Avatar size="sm" className="shrink-0">
          {activity.actor.avatarUrl ? (
            <AvatarImage src={activity.actor.avatarUrl} alt={activity.actor.name} />
          ) : null}
          <AvatarFallback>{getInitials(activity.actor.name)}</AvatarFallback>
        </Avatar>
      ) : (
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            config.bgColor
          )}
        >
          <HugeiconsIcon
            icon={config.icon as HugeIcon}
            className={cn("h-4 w-4", config.color)}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium truncate">{activity.actor.name}</span>
          {activity.actor.role && (
            <Badge variant="secondary" className="text-[9px] h-4">
              {activity.actor.role}
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          {renderedMessage}
        </p>

        <div className="flex items-center gap-2 mt-1.5">
          {/* Activity type badge */}
          <div className="flex items-center gap-1">
            <HugeiconsIcon
              icon={config.icon as HugeIcon}
              className={cn("h-3 w-3", config.color)}
            />
            <span className="text-[10px] text-muted-foreground/70">
              {config.label}
            </span>
          </div>

          <span className="text-muted-foreground/50">•</span>

          {/* Timestamp */}
          <span className="text-[10px] text-muted-foreground/70">
            {relativeTime}
          </span>

          {/* Mention indicator */}
          {hasMentions && (
            <Fragment>
              <span className="text-muted-foreground/50">•</span>
              <Badge variant="outline" className="text-[9px] h-4 gap-0.5">
                <HugeiconsIcon icon={MentionIcon} className="h-2.5 w-2.5" />
                {activity.mentions!.length}
              </Badge>
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

export function getActivityConfig(type: ActivityType): ActivityTypeConfig {
  return activityConfig[type] || defaultConfig;
}

export { activityConfig };
