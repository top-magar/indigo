"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useNotificationStore } from "./use-notifications";
import type { NotificationEvent, NotificationEventData } from "@/infrastructure/services/notification-emitter";
import type { CreateNotificationInput } from "@/components/dashboard/notifications/types";
import type { ConnectionStatus } from "@/shared/types/connection";

/**
 * Options for the useRealtimeNotifications hook
 */
export interface UseRealtimeNotificationsOptions {
  /** Tenant ID for scoping notifications */
  tenantId: string;
  /** Optional user ID for user-specific notifications */
  userId?: string;
  /** Whether to automatically connect on mount */
  autoConnect?: boolean;
  /** Reconnection delay in ms (default: 3000) */
  reconnectDelay?: number;
  /** Maximum reconnection attempts (default: 5) */
  maxReconnectAttempts?: number;
  /** Callback when a new notification arrives */
  onNotification?: (notification: NotificationEventData) => void;
  /** Callback when connection status changes */
  onStatusChange?: (status: ConnectionStatus) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Return type for the useRealtimeNotifications hook
 */
export interface UseRealtimeNotificationsReturn {
  /** Current connection status */
  status: ConnectionStatus;
  /** Whether currently connected */
  isConnected: boolean;
  /** Number of reconnection attempts */
  reconnectAttempts: number;
  /** Last error that occurred */
  lastError: Error | null;
  /** Manually connect to the SSE stream */
  connect: () => void;
  /** Manually disconnect from the SSE stream */
  disconnect: () => void;
  /** Manually trigger a reconnection */
  reconnect: () => void;
}

/**
 * Hook for connecting to real-time notification stream via SSE
 */
export function useRealtimeNotifications(
  options: UseRealtimeNotificationsOptions
): UseRealtimeNotificationsReturn {
  const {
    tenantId,
    userId,
    autoConnect = true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
    onNotification,
    onStatusChange,
    onError,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnectRef = useRef(false);

  const addNotification = useNotificationStore((s) => s.addNotification);

  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  const handleNotification = useCallback((event: MessageEvent) => {
    try {
      const parsed: NotificationEvent = JSON.parse(event.data);
      
      if (parsed.type === "notification" && parsed.data) {
        const notificationData = parsed.data;
        
        const notification: NotificationEventData = {
          ...notificationData,
          createdAt: new Date(notificationData.createdAt),
        };

        const input: CreateNotificationInput = {
          type: notification.type,
          title: notification.title,
          message: notification.message,
          href: notification.href,
          metadata: notification.metadata,
        };
        addNotification(input);

        onNotification?.(notification);
      }
    } catch (error) {
      console.error("[useRealtimeNotifications] Failed to parse notification:", error);
    }
  }, [addNotification, onNotification]);

  const handleHeartbeat = useCallback(() => {
    if (reconnectAttempts > 0) {
      setReconnectAttempts(0);
    }
  }, [reconnectAttempts]);

  const handleConnected = useCallback(() => {
    updateStatus("connected");
    setReconnectAttempts(0);
    setLastError(null);
  }, [updateStatus]);

  const scheduleReconnect = useCallback(() => {
    if (isManualDisconnectRef.current) return;
    if (reconnectAttempts >= maxReconnectAttempts) {
      updateStatus("error");
      return;
    }

    const delay = reconnectDelay * Math.pow(2, reconnectAttempts);

    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectAttempts((prev) => prev + 1);
    }, delay);
  }, [reconnectAttempts, maxReconnectAttempts, reconnectDelay, updateStatus]);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    isManualDisconnectRef.current = false;
    updateStatus("connecting");

    const url = new URL("/api/notifications/stream", window.location.origin);
    url.searchParams.set("tenantId", tenantId);
    if (userId) {
      url.searchParams.set("userId", userId);
    }

    try {
      const eventSource = new EventSource(url.toString());
      eventSourceRef.current = eventSource;

      eventSource.onerror = () => {
        const error = new Error("SSE connection error");
        setLastError(error);
        onError?.(error);
        
        if (eventSource.readyState === EventSource.CLOSED) {
          updateStatus("disconnected");
          scheduleReconnect();
        }
      };

      eventSource.addEventListener("notification", handleNotification);
      eventSource.addEventListener("heartbeat", handleHeartbeat);
      eventSource.addEventListener("connected", handleConnected);

    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to connect");
      setLastError(err);
      onError?.(err);
      updateStatus("error");
    }
  }, [tenantId, userId, updateStatus, handleNotification, handleHeartbeat, handleConnected, scheduleReconnect, onError]);

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    updateStatus("disconnected");
    setReconnectAttempts(0);
  }, [updateStatus]);

  const reconnect = useCallback(() => {
    setReconnectAttempts(0);
    connect();
  }, [connect]);

  useEffect(() => {
    if (autoConnect && tenantId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, tenantId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (status === "connected" || status === "connecting") {
      reconnect();
    }
  }, [tenantId, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    status,
    isConnected: status === "connected",
    reconnectAttempts,
    lastError,
    connect,
    disconnect,
    reconnect,
  };
}

export function useNotificationConnectionStatus(
  options: Pick<UseRealtimeNotificationsOptions, "tenantId" | "userId">
): ConnectionStatus {
  const { status } = useRealtimeNotifications({
    ...options,
    autoConnect: true,
  });
  return status;
}

export type { NotificationEventData };
// Re-export ConnectionStatus for backward compatibility
export type { ConnectionStatus } from "@/shared/types/connection";
