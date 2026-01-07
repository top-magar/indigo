"use client";

import * as React from "react";
import { cn } from "@/shared/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRoomUsers } from "@/shared/hooks/use-websocket";
import type { UserPresence } from "@/infrastructure/services/websocket-server";

// ============================================================================
// Types
// ============================================================================

export interface PresenceIndicatorProps {
  /** Room ID to show presence for */
  roomId: string;
  /** Maximum number of avatars to show before collapsing */
  maxVisible?: number;
  /** Size of the avatars */
  size?: "sm" | "md" | "lg";
  /** Whether to show online status dot */
  showStatus?: boolean;
  /** Whether to show tooltip with user names */
  showTooltip?: boolean;
  /** Additional class name */
  className?: string;
  /** Current user ID to exclude from display */
  currentUserId?: string;
  /** Custom render for empty state */
  emptyState?: React.ReactNode;
}

export interface PresenceAvatarProps {
  user: UserPresence;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  showTooltip?: boolean;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const SIZE_CLASSES = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

const STATUS_SIZE_CLASSES = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

const STATUS_COLORS = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  busy: "bg-red-500",
};

const OVERLAP_CLASSES = {
  sm: "-ml-2",
  md: "-ml-2.5",
  lg: "-ml-3",
};

// ============================================================================
// Helper Functions
// ============================================================================

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatLastSeen(lastSeen: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(lastSeen).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ============================================================================
// PresenceAvatar Component
// ============================================================================

export function PresenceAvatar({
  user,
  size = "md",
  showStatus = true,
  showTooltip = true,
  className,
}: PresenceAvatarProps) {
  const avatar = (
    <div className={cn("relative inline-block", className)}>
      <Avatar
        className={cn(
          SIZE_CLASSES[size],
          "ring-2 ring-background transition-transform hover:scale-110"
        )}
        style={{
          borderColor: user.userColor,
          boxShadow: `0 0 0 2px ${user.userColor}20`,
        }}
      >
        <AvatarImage src={user.userAvatar} alt={user.userName} />
        <AvatarFallback
          className="text-white font-medium"
          style={{ backgroundColor: user.userColor }}
        >
          {getInitials(user.userName)}
        </AvatarFallback>
      </Avatar>

      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-background",
            STATUS_SIZE_CLASSES[size],
            STATUS_COLORS[user.status]
          )}
          aria-label={`Status: ${user.status}`}
        />
      )}
    </div>
  );

  if (!showTooltip) {
    return avatar;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{avatar}</TooltipTrigger>
      <TooltipContent side="bottom" className="text-center">
        <p className="font-medium">{user.userName}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {user.status} • {formatLastSeen(user.lastSeen)}
        </p>
        {user.isTyping && (
          <p className="text-xs text-primary mt-1">
            Typing{user.typingContext ? ` in ${user.typingContext}` : "..."}
          </p>
        )}
        {user.currentPage && (
          <p className="text-xs text-muted-foreground mt-1">
            Viewing: {user.currentPage}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

// ============================================================================
// PresenceIndicator Component
// ============================================================================

export function PresenceIndicator({
  roomId,
  maxVisible = 4,
  size = "md",
  showStatus = true,
  showTooltip = true,
  className,
  currentUserId,
  emptyState,
}: PresenceIndicatorProps) {
  const allUsers = useRoomUsers(roomId);

  const users = React.useMemo(() => {
    if (!currentUserId) return allUsers;
    return allUsers.filter((u) => u.userId !== currentUserId);
  }, [allUsers, currentUserId]);

  const visibleUsers = users.slice(0, maxVisible);
  const overflowUsers = users.slice(maxVisible);
  const overflowCount = overflowUsers.length;

  if (users.length === 0) {
    if (emptyState) {
      return <>{emptyState}</>;
    }
    return null;
  }

  return (
    <TooltipProvider>
      <div
        className={cn("flex items-center", className)}
        role="group"
        aria-label={`${users.length} user${users.length !== 1 ? "s" : ""} viewing`}
      >
        <div className="flex items-center">
          {visibleUsers.map((user, index) => (
            <div
              key={user.userId}
              className={cn(index > 0 && OVERLAP_CLASSES[size])}
              style={{ zIndex: visibleUsers.length - index }}
            >
              <PresenceAvatar
                user={user}
                size={size}
                showStatus={showStatus}
                showTooltip={showTooltip}
              />
            </div>
          ))}

          {overflowCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    OVERLAP_CLASSES[size],
                    "relative inline-flex items-center justify-center rounded-full bg-muted ring-2 ring-background",
                    SIZE_CLASSES[size]
                  )}
                  style={{ zIndex: 0 }}
                >
                  <span className="font-medium text-muted-foreground">
                    +{overflowCount}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-medium mb-1">
                  {overflowCount} more user{overflowCount !== 1 ? "s" : ""}
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {overflowUsers.map((user) => (
                    <li key={user.userId} className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          STATUS_COLORS[user.status]
                        )}
                      />
                      {user.userName}
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <span className="ml-2 text-sm text-muted-foreground">
          {users.length} viewing
        </span>
      </div>
    </TooltipProvider>
  );
}

// ============================================================================
// PresenceList Component
// ============================================================================

export interface PresenceListProps {
  roomId: string;
  currentUserId?: string;
  className?: string;
  title?: string;
}

export function PresenceList({
  roomId,
  currentUserId,
  className,
  title = "People viewing",
}: PresenceListProps) {
  const users = useRoomUsers(roomId);

  if (users.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No one else is viewing
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      )}
      <ul className="space-y-1">
        {users.map((user) => (
          <li
            key={user.userId}
            className={cn(
              "flex items-center gap-2 p-2 rounded-md",
              user.userId === currentUserId && "bg-muted"
            )}
          >
            <PresenceAvatar user={user} size="sm" showTooltip={false} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.userName}
                {user.userId === currentUserId && (
                  <span className="text-muted-foreground ml-1">(you)</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.status}
                {user.isTyping && " • Typing..."}
              </p>
            </div>
            <span
              className={cn(
                "h-2 w-2 rounded-full shrink-0",
                STATUS_COLORS[user.status]
              )}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// TypingIndicator Component
// ============================================================================

export interface TypingIndicatorProps {
  roomId: string;
  currentUserId?: string;
  className?: string;
}

export function TypingIndicator({
  roomId,
  currentUserId,
  className,
}: TypingIndicatorProps) {
  const users = useRoomUsers(roomId);

  const typingUsers = React.useMemo(() => {
    return users.filter((u) => u.isTyping && u.userId !== currentUserId);
  }, [users, currentUserId]);

  if (typingUsers.length === 0) {
    return null;
  }

  const names = typingUsers.map((u) => u.userName);
  let text: string;

  if (names.length === 1) {
    text = `${names[0]} is typing...`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing...`;
  } else {
    text = `${names[0]} and ${names.length - 1} others are typing...`;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        className
      )}
    >
      <span className="flex gap-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" />
      </span>
      <span>{text}</span>
    </div>
  );
}

export default PresenceIndicator;
