"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  ChevronDown,
  CheckCircle,
  Activity as ActivityIcon,
  Wifi,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ActivityItem } from "./activity-item";
import { ActivityFilters, hasActiveFilters } from "./activity-filters";
import { useActivityFeed, MOCK_TEAM_MEMBERS } from "@/shared/hooks/use-activity-feed";
import type { Activity, ActivityFilter } from "./activity-types";

export interface ActivityFeedProps {
  className?: string;
  maxHeight?: string | number;
  showFilters?: boolean;
  showHeader?: boolean;
  compactItems?: boolean;
  onActivityClick?: (activity: Activity) => void;
  onMentionClick?: (userId: string, name: string) => void;
}

export function ActivityFeed({
  className,
  maxHeight = "600px",
  showFilters = true,
  showHeader = true,
  compactItems = false,
  onActivityClick,
  onMentionClick,
}: ActivityFeedProps) {
  const router = useRouter();
  const {
    groupedActivities,
    filter,
    isLoading,
    isLoadingMore,
    hasMore,
    lastRefreshedAt,
    error,
    autoRefresh,
    unreadCount,
    hasUnread,
    setFilter,
    resetFilter,
    markAsRead,
    markAllAsRead,
    loadMore,
    refresh,
    setAutoRefresh,
  } = useActivityFeed();

  const handleActivityClick = useCallback(
    (activity: Activity) => {
      markAsRead(activity.id);
      if (onActivityClick) {
        onActivityClick(activity);
      } else if (activity.href) {
        router.push(activity.href);
      }
    },
    [markAsRead, onActivityClick, router]
  );

  const handleMentionClick = useCallback(
    (userId: string, name: string) => {
      if (onMentionClick) {
        onMentionClick(userId, name);
      } else {
        setFilter({ actorIds: [userId] });
      }
    },
    [onMentionClick, setFilter]
  );

  const handleFilterChange = useCallback(
    (newFilter: Partial<ActivityFilter>) => {
      setFilter(newFilter);
    },
    [setFilter]
  );

  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const isFiltered = hasActiveFilters(filter);
  const totalActivities = groupedActivities.reduce(
    (sum, group) => sum + group.activities.length,
    0
  );

  return (
    <div className={cn("flex flex-col", className)}>
      {showHeader && (
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Activity Feed</h2>
            {hasUnread && (
              <Badge variant="secondary" className="text-[10px]">
                {unreadCount} new
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {autoRefresh ? (
                <Wifi className="h-3.5 w-3.5 text-chart-2" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="text-[10px] text-muted-foreground">
                {autoRefresh ? "Live" : "Paused"}
              </span>
            </div>

            {hasUnread && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleMarkAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
              />
            </Button>
          </div>
        </div>
      )}

      {showFilters && (
        <div className="border-b px-4 py-2">
          <ActivityFilters
            filter={filter}
            onFilterChange={handleFilterChange}
            onReset={resetFilter}
            teamMembers={MOCK_TEAM_MEMBERS}
            compact
          />
        </div>
      )}

      <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/30">
        <div className="flex items-center gap-2">
          <Switch
            id="auto-refresh"
            size="sm"
            checked={autoRefresh}
            onCheckedChange={setAutoRefresh}
          />
          <Label htmlFor="auto-refresh" className="text-xs cursor-pointer">
            Auto-refresh
          </Label>
        </div>
        {lastRefreshedAt && (
          <span className="text-[10px] text-muted-foreground">
            Updated {formatDistanceToNow(lastRefreshedAt, { addSuffix: true })}
          </span>
        )}
      </div>

      <ScrollArea
        className="flex-1"
        style={{ maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight }}
      >
        {isLoading && totalActivities === 0 ? (
          <ActivityFeedSkeleton />
        ) : error ? (
          <ActivityFeedError error={error} onRetry={handleRefresh} />
        ) : totalActivities === 0 ? (
          <ActivityFeedEmpty isFiltered={isFiltered} onReset={resetFilter} />
        ) : (
          <div className="p-2">
            {groupedActivities.map((group) => (
              <div key={group.group} className="mb-4 last:mb-0">
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-2 py-1.5 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {group.label}
                  </span>
                </div>

                <div className="space-y-1">
                  {group.activities.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      onClick={handleActivityClick}
                      onMentionClick={handleMentionClick}
                      compact={compactItems}
                    />
                  ))}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="pt-2 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full"
                >
                  {isLoadingMore ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5 mr-1.5" />
                      Load more
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function ActivityFeedSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityFeedError({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <p className="text-sm text-destructive mb-4">{error}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
        Try again
      </Button>
    </div>
  );
}

function ActivityFeedEmpty({
  isFiltered,
  onReset,
}: {
  isFiltered: boolean;
  onReset: () => void;
}) {
  if (isFiltered) {
    return (
      <EmptyState
        icon={ActivityIcon}
        title="No matching activities"
        description="Try adjusting your filters to see more activities."
        size="sm"
        className="h-[300px]"
        action={{
          label: "Clear filters",
          onClick: onReset,
        }}
      />
    );
  }

  return (
    <EmptyState
      icon={ActivityIcon}
      title="No activities yet"
      description="Activities will appear here as your team takes actions."
      size="sm"
      className="h-[300px]"
    />
  );
}

export { ActivityFeedSkeleton, ActivityFeedError, ActivityFeedEmpty };
