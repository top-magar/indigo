"use client";

import { useCallback } from "react";
import { WifiOff, RefreshCw, Clock, AlertCircle, Database } from "lucide-react";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/shared/hooks/use-online-status";

export interface OfflineFallbackProps {
  className?: string;
  title?: string;
  description?: string;
  showCachedDataInfo?: boolean;
  cachedAt?: Date | null;
  onRetry?: () => void;
  retryLabel?: string;
  children?: React.ReactNode;
}


/**
 * Fallback UI for pages that require network access
 * Shows cached data indicator and retry options
 */
export function OfflineFallback({
  className,
  title = "You're offline",
  description = "This page requires an internet connection to load fresh data.",
  showCachedDataInfo = true,
  cachedAt,
  onRetry,
  retryLabel = "Try again",
  children,
}: OfflineFallbackProps) {
  const { isOnline } = useOnlineStatus();

  const formatCachedTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  }, [onRetry]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] p-8 text-center",
        className
      )}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[var(--ds-red-100)] rounded-full blur-xl" />
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[var(--ds-red-100)]">
          <WifiOff className="h-8 w-8 text-[var(--ds-red-700)]" />
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-[var(--ds-gray-600)] max-w-md mb-6">
        {description}
      </p>

      {showCachedDataInfo && cachedAt && (
        <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]">
          <Clock className="h-4 w-4 shrink-0" />
          <span className="text-sm">
            Showing cached data from {formatCachedTime(cachedAt)}
          </span>
        </div>
      )}

      {children}

      <div className="flex items-center gap-3 mt-4">
        <Button
          variant="outline"
          onClick={handleRetry}
          disabled={!isOnline}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {retryLabel}
        </Button>
      </div>

      {!isOnline && (
        <p className="text-xs text-[var(--ds-gray-600)] mt-4">
          Retry will be available when you&apos;re back online
        </p>
      )}
    </div>
  );
}


/**
 * Stale data warning banner
 * Shows when displaying cached data that may be outdated
 */
export function StaleDataWarning({
  className,
  cachedAt,
  onRefresh,
}: {
  className?: string;
  cachedAt?: Date | null;
  onRefresh?: () => void;
}) {
  const { isOnline } = useOnlineStatus();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-[var(--ds-amber-300)] bg-[var(--ds-amber-100)] px-4 py-3",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <AlertCircle className="h-4 w-4 text-[var(--ds-amber-700)] shrink-0" />
        <div className="text-sm">
          <span className="font-medium text-[var(--ds-amber-700)]">Data may be outdated</span>
          {cachedAt && (
            <span className="text-[var(--ds-gray-600)]">
              {" "}
              · Last updated {formatTime(cachedAt)}
            </span>
          )}
        </div>
      </div>
      {onRefresh && isOnline && (
        <Button variant="ghost" size="xs" onClick={onRefresh} className="gap-1.5">
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      )}
    </div>
  );
}

/**
 * Cached data indicator badge
 * Small indicator showing data is from cache
 */
export function CachedDataBadge({
  className,
  cachedAt,
}: {
  className?: string;
  cachedAt?: Date | null;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-[var(--ds-gray-100)] px-2.5 py-1 text-xs text-[var(--ds-gray-600)]",
        className
      )}
    >
      <Database className="h-3 w-3" />
      <span>Cached{cachedAt && ` · ${formatRelativeTime(cachedAt)}`}</span>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return date.toLocaleDateString();
}
