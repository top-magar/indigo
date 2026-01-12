"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { WifiOff, X, Info } from "lucide-react";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/shared/hooks/use-online-status";
import { useSyncQueue } from "@/shared/hooks/use-sync-queue";

export interface OfflineBannerProps {
  className?: string;
  dismissible?: boolean;
  showPendingCount?: boolean;
}


/**
 * Full-width banner shown when the user is offline
 * Dismissible but reappears on navigation
 */
export function OfflineBanner({
  className,
  dismissible = true,
  showPendingCount = true,
}: OfflineBannerProps) {
  const pathname = usePathname();
  const { isOnline } = useOnlineStatus();
  const { pendingCount } = useSyncQueue();
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissed state on navigation
  useEffect(() => {
    setIsDismissed(false);
  }, [pathname]);

  // Reset dismissed state when going back online
  useEffect(() => {
    if (isOnline) {
      setIsDismissed(false);
    }
  }, [isOnline]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
  }, []);

  // Don't show if online or dismissed
  if (isOnline || isDismissed) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "relative flex items-center justify-center gap-3 bg-[var(--ds-red-100)] px-4 py-2.5",
        "border-b border-[var(--ds-red-300)]",
        "animate-in slide-in-from-top duration-300",
        className
      )}
    >
      <WifiOff className="h-4 w-4 text-[var(--ds-red-700)] shrink-0" />
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-[var(--ds-red-700)]">You&apos;re offline</span>
        <span className="text-[var(--ds-red-600)]">—</span>
        <span className="text-[var(--ds-red-600)]">
          Changes will sync when you&apos;re back online
        </span>
        {showPendingCount && pendingCount > 0 && (
          <>
            <span className="text-[var(--ds-red-600)]">·</span>
            <span className="text-[var(--ds-red-600)]">
              {pendingCount} pending {pendingCount === 1 ? "change" : "changes"}
            </span>
          </>
        )}
      </div>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleDismiss}
          className="absolute right-2 text-[var(--ds-red-600)] hover:text-[var(--ds-red-700)] hover:bg-[var(--ds-red-200)]"
          aria-label="Dismiss offline banner"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}


/**
 * Compact offline banner for tight spaces
 */
export function OfflineBannerCompact({ className }: { className?: string }) {
  const { isOnline } = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-2 rounded-md bg-[var(--ds-red-100)] px-3 py-1.5 text-xs",
        "animate-in fade-in duration-200",
        className
      )}
    >
      <WifiOff className="h-3.5 w-3.5 text-[var(--ds-red-700)]" />
      <span className="text-[var(--ds-red-700)] font-medium">Offline mode</span>
    </div>
  );
}

/**
 * Reconnected banner shown briefly when coming back online
 */
export function ReconnectedBanner({ className }: { className?: string }) {
  const { isOnline, wasOffline, resetWasOffline } = useOnlineStatus();
  const { pendingCount, isSyncing } = useSyncQueue();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShow(true);
      // Auto-hide after 5 seconds if no pending items
      if (pendingCount === 0 && !isSyncing) {
        const timer = setTimeout(() => {
          setShow(false);
          resetWasOffline();
        }, 5000);
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [isOnline, wasOffline, pendingCount, isSyncing, resetWasOffline]);

  if (!show) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-3 bg-[var(--ds-green-100)] px-4 py-2.5",
        "border-b border-[var(--ds-green-300)]",
        "animate-in slide-in-from-top duration-300",
        className
      )}
    >
      <Info className="h-4 w-4 text-[var(--ds-green-700)] shrink-0" />
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-[var(--ds-green-700)]">Back online</span>
        {pendingCount > 0 && (
          <>
            <span className="text-[var(--ds-green-600)]">—</span>
            <span className="text-[var(--ds-green-600)]">
              {isSyncing
                ? "Syncing your changes..."
                : `${pendingCount} ${pendingCount === 1 ? "change" : "changes"} ready to sync`}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
