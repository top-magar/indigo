"use client";

import { useState, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Wifi01Icon,
  WifiDisconnected01Icon,
  RotateClockwiseIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOnlineStatus } from "@/shared/hooks/use-online-status";
import { useSyncQueue } from "@/shared/hooks/use-sync-queue";
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
        icon: WifiDisconnected01Icon,
        iconClass: "text-destructive",
        bgClass: "bg-destructive/10 hover:bg-destructive/20",
        ariaLabel: "Offline",
      };
    }
    if (showSyncingState) {
      return {
        icon: RotateClockwiseIcon,
        iconClass: "text-primary animate-spin",
        bgClass: "bg-primary/10 hover:bg-primary/20",
        ariaLabel: "Syncing",
      };
    }
    if (showReconnectedState) {
      return {
        icon: Wifi01Icon,
        iconClass: "text-warning",
        bgClass: "bg-warning/10 hover:bg-warning/20",
        ariaLabel: "Back online - pending sync",
      };
    }
    return {
      icon: Wifi01Icon,
      iconClass: "text-success",
      bgClass: "hover:bg-muted",
      ariaLabel: "Online",
    };
  };

  const { icon, iconClass, bgClass, ariaLabel } = getIconAndStyle();

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
        <HugeiconsIcon
          icon={Wifi01Icon}
          className="h-4 w-4 text-muted-foreground/50"
        />
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
      <HugeiconsIcon
        icon={icon}
        className={cn("h-4 w-4 transition-all duration-300", iconClass)}
      />
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
      <HugeiconsIcon
        icon={!isOnline ? WifiDisconnected01Icon : isSyncing ? RotateClockwiseIcon : Wifi01Icon}
        className={cn("h-3 w-3", isSyncing && "animate-spin")}
      />
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
