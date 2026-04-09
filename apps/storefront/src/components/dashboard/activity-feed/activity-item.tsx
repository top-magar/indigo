"use client";

import { useMemo, useCallback, Fragment } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ShoppingCart,
  Truck,
  PackageCheck,
  X,
  PackagePlus,
  Pencil,
  Trash2,
  UserPlus,
  UserPen,
  MessageSquare,
  AtSign,
  Package,
  RotateCcw,
  Star,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  type Activity,
  type ActivityTypeConfig,
  ActivityType,
} from "./activity-types";

// Use AtSign as MentionIcon
const MentionIcon = AtSign;

// Configuration for each activity type
const activityConfig: Record<ActivityType, ActivityTypeConfig> = {
  [ActivityType.ORDER_CREATED]: {
    icon: ShoppingCart,
    color: "text-info",
    bgColor: "bg-info/10",
    category: "orders",
    label: "Order Created",
  },
  [ActivityType.ORDER_UPDATED]: {
    icon: Pencil,
    color: "text-ds-teal-700",
    bgColor: "bg-ds-teal-700/10",
    category: "orders",
    label: "Order Updated",
  },
  [ActivityType.ORDER_SHIPPED]: {
    icon: Truck,
    color: "text-success",
    bgColor: "bg-success/10",
    category: "orders",
    label: "Order Shipped",
  },
  [ActivityType.ORDER_DELIVERED]: {
    icon: PackageCheck,
    color: "text-success",
    bgColor: "bg-success/10",
    category: "orders",
    label: "Order Delivered",
  },
  [ActivityType.ORDER_CANCELLED]: {
    icon: X,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    category: "orders",
    label: "Order Cancelled",
  },
  [ActivityType.PRODUCT_CREATED]: {
    icon: PackagePlus,
    color: "text-ds-blue-700",
    bgColor: "bg-ds-blue-700/10",
    category: "products",
    label: "Product Created",
  },
  [ActivityType.PRODUCT_UPDATED]: {
    icon: Pencil,
    color: "text-ds-teal-700",
    bgColor: "bg-ds-teal-700/10",
    category: "products",
    label: "Product Updated",
  },
  [ActivityType.PRODUCT_DELETED]: {
    icon: Trash2,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    category: "products",
    label: "Product Deleted",
  },
  [ActivityType.CUSTOMER_JOINED]: {
    icon: UserPlus,
    color: "text-ds-blue-700",
    bgColor: "bg-ds-blue-700/10",
    category: "customers",
    label: "Customer Joined",
  },
  [ActivityType.CUSTOMER_UPDATED]: {
    icon: UserPen,
    color: "text-ds-teal-700",
    bgColor: "bg-ds-teal-700/10",
    category: "customers",
    label: "Customer Updated",
  },
  [ActivityType.COMMENT_ADDED]: {
    icon: MessageSquare,
    color: "text-ds-purple-700",
    bgColor: "bg-ds-purple-700/10",
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
    icon: Package,
    color: "text-ds-teal-700",
    bgColor: "bg-ds-teal-700/10",
    category: "products",
    label: "Inventory Updated",
  },
  [ActivityType.REFUND_PROCESSED]: {
    icon: RotateCcw,
    color: "text-warning",
    bgColor: "bg-warning/10",
    category: "orders",
    label: "Refund Processed",
  },
  [ActivityType.REVIEW_RECEIVED]: {
    icon: Star,
    color: "text-ds-purple-700",
    bgColor: "bg-ds-purple-700/10",
    category: "customers",
    label: "Review Received",
  },
  [ActivityType.PROMOTION_CREATED]: {
    icon: Tag,
    color: "text-info",
    bgColor: "bg-info/10",
    category: "products",
    label: "Promotion Created",
  },
};

// Default config for unknown types
const defaultConfig: ActivityTypeConfig = {
  icon: MessageSquare,
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
          "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !activity.read && "bg-muted",
          className
        )}
      >
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            config.bgColor
          )}
        >
          {(() => {
            const Icon = config.icon as LucideIcon;
            return <Icon className={cn("h-3 w-3", config.color)} />;
          })()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs truncate">
            <span className="font-medium">{activity.actor.name}</span>{" "}
            <span className="text-muted-foreground">{activity.message}</span>
          </p>
        </div>

        <span className="text-xs text-muted-foreground shrink-0">
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
        "relative flex gap-[13px] p-[13px] rounded-lg transition-colors cursor-pointer",
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
        <Avatar className="shrink-0">
          {activity.actor.avatarUrl ? (
            <AvatarImage src={activity.actor.avatarUrl} alt={activity.actor.name} />
          ) : null}
          <AvatarFallback>{getInitials(activity.actor.name)}</AvatarFallback>
        </Avatar>
      ) : (
        <div
          className={cn(
            "flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-lg",
            config.bgColor
          )}
        >
          {(() => {
            const Icon = config.icon as LucideIcon;
            return <Icon className={cn("h-4 w-4", config.color)} />;
          })()}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 pr-[13px]">
        <div className="flex items-center gap-[8px] mb-[8px]">
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

        <div className="flex items-center gap-[8px] mt-[8px]">
          {/* Activity type badge */}
          <div className="flex items-center gap-1">
            {(() => {
              const Icon = config.icon as LucideIcon;
              return <Icon className={cn("h-3 w-3", config.color)} />;
            })()}
            <span className="text-xs text-muted-foreground">
              {config.label}
            </span>
          </div>

          <span className="text-muted-foreground">•</span>

          {/* Timestamp */}
          <span className="text-xs text-muted-foreground">
            {relativeTime}
          </span>

          {/* Mention indicator */}
          {hasMentions && (
            <Fragment>
              <span className="text-muted-foreground">•</span>
              <Badge variant="outline" className="text-[9px] h-4 gap-0.5">
                <MentionIcon className="h-2.5 w-2.5" />
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
