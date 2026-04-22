"use client";

import { useState, useCallback } from "react";
import { Wifi, WifiOff, RotateCw } from "lucide-react";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useSyncQueue } from "@/hooks/use-sync-queue";
import { SyncStatus } from "./sync-status";

export interface OfflineIndicatorProps {
  /** Additional class names */
  className?: string;
  /** Whether to show the sync details popover */
  showSyncDetails?: boolean;
  /** Callback when sync is triggered */
  onSync?: () => void;
}

/**
 * Offline indicator component for the dashboard header
 * Shows online/offline status with animated transitions
 * Click to see sync details when there are pending operations
 */
export function OfflineIndicator({
  className,
  showSyncDetails = true,
  onSync,
}: OfflineIndicatorProps) {
  const [open, setOpen] = useState(false);
  const { isOnline, wasOffline, resetWasOffline } = useOnlineStatus();
  const { pendingCount, isSyncing, processQueue } = useSyncQueue();

  const handleSync = useCallback(async () => {
    if (onSync) {
      onSync();
    } else {
      await processQueue();
    }
    resetWasOffline();
  }, [onSync, processQueue, resetWasOffline]);

  // Determine the current state
  const showPendingBadge = pendingCount > 0;
  const showSyncingState = isSyncing;
  const showOfflineState = !isOnline;
  const showReconnectedState = isOnline && wasOffline && pendingCount > 0;

  // Get the appropriate icon and styling
  const getIconAndStyle = () => {
    if (showOfflineState) {
      return {
        Icon: WifiOff,
        iconClass: "text-destructive",
        bgClass: "bg-destructive/10 hover:bg-destructive/20",
        ariaLabel: "Offline",
      };
    }
    if (showSyncingState) {
      return {
        Icon: RotateCw,
        iconClass: "text-primary animate-spin",
        bgClass: "bg-primary/10 hover:bg-primary/20",
        ariaLabel: "Syncing",
      };
    }
    if (showReconnectedState) {
      return {
        Icon: Wifi,
        iconClass: "text-warning",
        bgClass: "bg-warning/10 hover:bg-warning/15",
        ariaLabel: "Back online - pending sync",
      };
    }
    return {
      Icon: Wifi,
      iconClass: "text-success",
      bgClass: "hover:bg-muted",
      ariaLabel: "Online",
    };
  };

  const { Icon, iconClass, bgClass, ariaLabel } = getIconAndStyle();

  // If online with no pending items and wasn't recently offline, show minimal indicator
  if (isOnline && !wasOffline && pendingCount === 0 && !isSyncing) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn("relative", className)}
        aria-label="Online"
        disabled
      >
        <Wifi className="size-4 text-muted-foreground" />
      </Button>
    );
  }

  const trigger = (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn("relative transition-colors duration-300", bgClass, className)}
      aria-label={ariaLabel}
    >
      <Icon className={cn("size-4 transition-colors duration-300", iconClass)} />
      {showPendingBadge && (
        <Badge
          variant="secondary"
          className={cn(
            "absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] font-semibold",
            "animate-in fade-in zoom-in duration-200",
            showOfflineState && "bg-destructive text-destructive-foreground"
          )}
        >
          {pendingCount > 99 ? "99+" : pendingCount}
        </Badge>
      )}
    </Button>
  );

  if (!showSyncDetails) {
    return trigger;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0" sideOffset={8}>
        <SyncStatus onSync={handleSync} onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

/**
 * Compact offline indicator for mobile or tight spaces
 */
export function OfflineIndicatorCompact({ className }: { className?: string }) {
  const { isOnline } = useOnlineStatus();
  const { pendingCount, isSyncing } = useSyncQueue();

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium",
        !isOnline
          ? "bg-destructive/10 text-destructive"
          : isSyncing
          ? "bg-primary/10 text-primary"
          : "bg-warning/10 text-warning",
        className
      )}
    >
      {!isOnline ? (
        <WifiOff className="size-3" />
      ) : isSyncing ? (
        <RotateCw className="size-3 animate-spin" />
      ) : (
        <Wifi className="size-3" />
      )}
      <span>
        {!isOnline
          ? "Offline"
          : isSyncing
          ? "Syncing..."
          : `${pendingCount} pending`}
      </span>
    </div>
  );
}
