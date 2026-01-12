"use client";

import { useCallback } from "react";
import { RotateCw, CheckCircle, Clock, AlertCircle, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useOnlineStatus } from "@/shared/hooks/use-online-status";
import { useSyncQueue } from "@/shared/hooks/use-sync-queue";
import type { SyncQueueItem, SyncStatus as SyncStatusType } from "./offline-types";

export interface SyncStatusProps {
  className?: string;
  onSync?: () => void;
  onClose?: () => void;
}


export function SyncStatus({ className, onSync, onClose }: SyncStatusProps) {
  const { isOnline } = useOnlineStatus();
  const {
    pendingItems,
    failedItems,
    pendingCount,
    failedCount,
    isSyncing,
    syncProgress,
    lastSyncAt,
    processQueue,
    retryOperation,
    retryAllFailed,
    clearCompleted,
    removeOperation,
  } = useSyncQueue();

  const handleSync = useCallback(async () => {
    if (onSync) {
      onSync();
    } else {
      await processQueue();
    }
  }, [onSync, processQueue]);

  const formatLastSync = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const allItems = [...pendingItems, ...failedItems];
  const hasItems = allItems.length > 0;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Sync Status</h2>
          <StatusBadge isOnline={isOnline} isSyncing={isSyncing} />
        </div>
        {lastSyncAt && (
          <span className="text-xs text-[var(--ds-gray-600)]">
            Last sync: {formatLastSync(lastSyncAt)}
          </span>
        )}
      </div>

      {isSyncing && (
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--ds-gray-600)]">Syncing changes...</span>
            <span className="text-xs font-medium">{syncProgress}%</span>
          </div>
          <Progress value={syncProgress} className="h-1.5" />
        </div>
      )}

      <ScrollArea className="h-[240px]">
        {hasItems ? (
          <div className="p-2 space-y-1">
            {allItems.map((item) => (
              <SyncQueueItemRow
                key={item.id}
                item={item}
                onRetry={() => retryOperation(item.id)}
                onRemove={() => removeOperation(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <CheckCircle className="h-8 w-8 text-[var(--ds-green-700)] mb-2" />
            <p className="text-sm font-medium">All synced</p>
            <p className="text-xs text-[var(--ds-gray-600)]">
              No pending changes to sync
            </p>
          </div>
        )}
      </ScrollArea>

      <Separator />
      <div className="p-3 flex items-center justify-between gap-2">
        {failedCount > 0 && (
          <Button
            variant="ghost"
            size="xs"
            onClick={retryAllFailed}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry failed ({failedCount})
          </Button>
        )}
        <div className="flex-1" />
        <Button
          variant="default"
          size="sm"
          onClick={handleSync}
          disabled={!isOnline || isSyncing || pendingCount === 0}
          className="text-xs"
        >
          {isSyncing ? (
            <>
              <RotateCw className="h-3 w-3 mr-1 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RotateCw className="h-3 w-3 mr-1" />
              Sync now
            </>
          )}
        </Button>
      </div>
    </div>
  );
}


function StatusBadge({ isOnline, isSyncing }: { isOnline: boolean; isSyncing: boolean }) {
  if (isSyncing) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        Syncing
      </span>
    );
  }
  if (!isOnline) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ds-red-100)] px-2 py-0.5 text-[10px] font-medium text-[var(--ds-red-700)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--ds-red-700)]" />
        Offline
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ds-green-100)] px-2 py-0.5 text-[10px] font-medium text-[var(--ds-green-700)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--ds-green-700)]" />
      Online
    </span>
  );
}


interface SyncQueueItemRowProps {
  item: SyncQueueItem;
  onRetry: () => void;
  onRemove: () => void;
}

function SyncQueueItemRow({ item, onRetry, onRemove }: SyncQueueItemRowProps) {
  const getStatusIcon = (status: SyncStatusType) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3.5 w-3.5 text-[var(--ds-gray-600)]" />;
      case "syncing":
        return <RotateCw className="h-3.5 w-3.5 text-primary animate-spin" />;
      case "completed":
        return <CheckCircle className="h-3.5 w-3.5 text-[var(--ds-green-700)]" />;
      case "failed":
        return <AlertCircle className="h-3.5 w-3.5 text-[var(--ds-red-700)]" />;
      case "conflict":
        return <AlertCircle className="h-3.5 w-3.5 text-[var(--ds-amber-700)]" />;
      default:
        return null;
    }
  };

  const getOperationLabel = () => {
    const typeLabels = { create: "Create", update: "Update", delete: "Delete", batch: "Batch" };
    return typeLabels[item.type] || item.type;
  };

  return (
    <div className={cn(
      "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
      item.status === "failed" && "bg-[var(--ds-red-100)]",
      item.status === "syncing" && "bg-primary/5"
    )}>
      {getStatusIcon(item.status)}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-medium truncate">{item.entityName || item.entityId}</span>
          <span className="text-[var(--ds-gray-600)]">·</span>
          <span className="text-[var(--ds-gray-600)] capitalize">{item.entityType}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[var(--ds-gray-600)]">
          <span>{getOperationLabel()}</span>
          {item.error && <span className="text-[var(--ds-red-700)] truncate">· {item.error}</span>}
        </div>
      </div>
      {item.status === "failed" && (
        <Button variant="ghost" size="icon-xs" onClick={onRetry} title="Retry">
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
      <Button variant="ghost" size="icon-xs" onClick={onRemove} title="Remove">
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
