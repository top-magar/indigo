"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { create } from "zustand";
import type {
  WebSocketMessage,
  WebSocketMessageType,
  RoomType,
  UserPresence,
  CursorPosition,
} from "@/infrastructure/services/websocket-server";

import type { ConnectionStatus } from "@/shared/types/connection";

// ============================================================================
// Types
// ============================================================================

/**
 * WebSocket connection status
 * @deprecated Use ConnectionStatus from @/lib/types/connection instead
 */
export type WebSocketStatus = ConnectionStatus;

/**
 * Message handler function type
 */
export type MessageHandler<T = unknown> = (message: WebSocketMessage<T>) => void;

/**
 * Options for the useWebSocket hook
 */
export interface UseWebSocketOptions {
  /** Tenant ID for scoping connections */
  tenantId: string;
  /** User ID for identification */
  userId: string;
  /** User display name */
  userName: string;
  /** User avatar URL */
  userAvatar?: string;
  /** Authentication token */
  token: string;
  /** Whether to automatically connect on mount */
  autoConnect?: boolean;
  /** Initial reconnection delay in ms (default: 1000) */
  reconnectDelay?: number;
  /** Maximum reconnection delay in ms (default: 30000) */
  maxReconnectDelay?: number;
  /** Maximum reconnection attempts (default: 10) */
  maxReconnectAttempts?: number;
  /** Callback when connection status changes */
  onStatusChange?: (status: ConnectionStatus) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback when a message is received */
  onMessage?: MessageHandler;
}

/**
 * Return type for the useWebSocket hook
 */
export interface UseWebSocketReturn {
  /** Current connection status */
  status: ConnectionStatus;
  /** Whether currently connected */
  isConnected: boolean;
  /** Number of reconnection attempts */
  reconnectAttempts: number;
  /** Last error that occurred */
  lastError: Error | null;
  /** Manually connect */
  connect: () => void;
  /** Manually disconnect */
  disconnect: () => void;
  /** Manually trigger a reconnection */
  reconnect: () => void;
  /** Send a message */
  sendMessage: <T>(type: WebSocketMessageType, roomId: string, data: T) => void;
  /** Join a room */
  joinRoom: (roomType: RoomType, resourceId?: string) => void;
  /** Leave a room */
  leaveRoom: (roomId: string) => void;
  /** Update cursor position */
  updateCursor: (roomId: string, cursor: CursorPosition) => void;
  /** Update typing status */
  setTyping: (roomId: string, isTyping: boolean, context?: string) => void;
  /** Subscribe to a message type */
  subscribe: (type: WebSocketMessageType, handler: MessageHandler) => () => void;
  /** Get users in a room */
  getRoomUsers: (roomId: string) => UserPresence[];
  /** Pending messages count (offline queue) */
  pendingMessagesCount: number;
}

/**
 * Queued message for offline support
 */
export interface QueuedMessage {
  id: string;
  type: WebSocketMessageType;
  roomId: string;
  data: unknown;
  timestamp: Date;
  retries: number;
}

// ============================================================================
// WebSocket Store
// ============================================================================

interface WebSocketState {
  status: ConnectionStatus;
  roomUsers: Map<string, UserPresence[]>;
  messageQueue: QueuedMessage[];
  setStatus: (status: ConnectionStatus) => void;
  setRoomUsers: (roomId: string, users: UserPresence[]) => void;
  addUserToRoom: (roomId: string, user: UserPresence) => void;
  removeUserFromRoom: (roomId: string, userId: string) => void;
  updateUserInRoom: (roomId: string, userId: string, updates: Partial<UserPresence>) => void;
  addToQueue: (message: QueuedMessage) => void;
  removeFromQueue: (messageId: string) => void;
  clearQueue: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  status: "disconnected",
  roomUsers: new Map(),
  messageQueue: [],

  setStatus: (status) => set({ status }),

  setRoomUsers: (roomId, users) =>
    set((state) => {
      const newRoomUsers = new Map(state.roomUsers);
      newRoomUsers.set(roomId, users);
      return { roomUsers: newRoomUsers };
    }),

  addUserToRoom: (roomId, user) =>
    set((state) => {
      const newRoomUsers = new Map(state.roomUsers);
      const users = newRoomUsers.get(roomId) || [];
      if (!users.find((u) => u.userId === user.userId)) {
        newRoomUsers.set(roomId, [...users, user]);
      }
      return { roomUsers: newRoomUsers };
    }),

  removeUserFromRoom: (roomId, userId) =>
    set((state) => {
      const newRoomUsers = new Map(state.roomUsers);
      const users = newRoomUsers.get(roomId) || [];
      newRoomUsers.set(
        roomId,
        users.filter((u) => u.userId !== userId)
      );
      return { roomUsers: newRoomUsers };
    }),

  updateUserInRoom: (roomId, userId, updates) =>
    set((state) => {
      const newRoomUsers = new Map(state.roomUsers);
      const users = newRoomUsers.get(roomId) || [];
      newRoomUsers.set(
        roomId,
        users.map((u) => (u.userId === userId ? { ...u, ...updates } : u))
      );
      return { roomUsers: newRoomUsers };
    }),

  addToQueue: (message) =>
    set((state) => ({
      messageQueue: [...state.messageQueue, message],
    })),

  removeFromQueue: (messageId) =>
    set((state) => ({
      messageQueue: state.messageQueue.filter((m) => m.id !== messageId),
    })),

  clearQueue: () => set({ messageQueue: [] }),
}));

// ============================================================================
// useWebSocket Hook
// ============================================================================

/**
 * React hook for WebSocket connection with auto-reconnect and offline support
 *
 * @example
 * ```tsx
 * const {
 *   status,
 *   isConnected,
 *   sendMessage,
 *   joinRoom,
 *   subscribe,
 * } = useWebSocket({
 *   tenantId: "tenant_123",
 *   userId: "user_456",
 *   userName: "John Doe",
 *   token: "auth_token",
 * });
 *
 * // Subscribe to comments
 * useEffect(() => {
 *   return subscribe("comment", (message) => {
 *     console.log("New comment:", message.data);
 *   });
 * }, [subscribe]);
 *
 * // Join an order room
 * joinRoom("order", "order_789");
 * ```
 */
export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    tenantId,
    userId,
    userName,
    userAvatar,
    token,
    autoConnect = true,
    reconnectDelay = 1000,
    maxReconnectDelay = 30000,
    maxReconnectAttempts = 10,
    onStatusChange,
    onError,
    onMessage,
  } = options;

  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnectRef = useRef(false);
  const handlersRef = useRef<Map<WebSocketMessageType, Set<MessageHandler>>>(new Map());
  const joinedRoomsRef = useRef<Set<string>>(new Set());

  const {
    status,
    roomUsers,
    messageQueue,
    setStatus,
    setRoomUsers,
    addUserToRoom,
    removeUserFromRoom,
    updateUserInRoom,
    addToQueue,
    removeFromQueue,
  } = useWebSocketStore();

  // Update status and notify
  const updateStatus = useCallback(
    (newStatus: ConnectionStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [setStatus, onStatusChange]
  );

  // Generate message ID
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        message.timestamp = new Date(message.timestamp);

        // Handle system messages
        switch (message.type) {
          case "ping":
            // Respond with pong
            wsRef.current?.send(
              JSON.stringify({
                type: "pong",
                roomId: "",
                senderId: userId,
                timestamp: new Date().toISOString(),
                data: null,
                messageId: generateMessageId(),
              })
            );
            break;

          case "room_state":
            if (message.data && typeof message.data === "object" && "users" in message.data) {
              const data = message.data as { users: UserPresence[] };
              setRoomUsers(message.roomId, data.users);
            }
            break;

          case "presence_join":
            if (message.data && typeof message.data === "object") {
              addUserToRoom(message.roomId, message.data as UserPresence);
            }
            break;

          case "presence_leave":
            if (message.data && typeof message.data === "object" && "userId" in message.data) {
              const data = message.data as { userId: string };
              removeUserFromRoom(message.roomId, data.userId);
            }
            break;

          case "cursor_move":
            if (message.data && typeof message.data === "object" && "cursor" in message.data) {
              const data = message.data as { cursor: CursorPosition };
              updateUserInRoom(message.roomId, message.senderId, {
                cursor: data.cursor,
                lastSeen: new Date(),
              });
            }
            break;

          case "typing_start":
            updateUserInRoom(message.roomId, message.senderId, {
              isTyping: true,
              lastSeen: new Date(),
            });
            break;

          case "typing_stop":
            updateUserInRoom(message.roomId, message.senderId, {
              isTyping: false,
              lastSeen: new Date(),
            });
            break;
        }

        // Call registered handlers
        const handlers = handlersRef.current.get(message.type);
        if (handlers) {
          handlers.forEach((handler) => handler(message));
        }

        // Call global message handler
        onMessage?.(message);
      } catch (error) {
        console.error("[useWebSocket] Failed to parse message:", error);
      }
    },
    [
      userId,
      generateMessageId,
      setRoomUsers,
      addUserToRoom,
      removeUserFromRoom,
      updateUserInRoom,
      onMessage,
    ]
  );

  // Schedule reconnection with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (isManualDisconnectRef.current) return;
    if (reconnectAttempts >= maxReconnectAttempts) {
      updateStatus("error");
      return;
    }

    const delay = Math.min(
      reconnectDelay * Math.pow(2, reconnectAttempts),
      maxReconnectDelay
    );

    updateStatus("reconnecting");

    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectAttempts((prev) => prev + 1);
    }, delay);
  }, [
    reconnectAttempts,
    maxReconnectAttempts,
    reconnectDelay,
    maxReconnectDelay,
    updateStatus,
  ]);

  // Flush message queue
  const flushQueue = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    messageQueue.forEach((queuedMessage) => {
      try {
        wsRef.current?.send(
          JSON.stringify({
            type: queuedMessage.type,
            roomId: queuedMessage.roomId,
            senderId: userId,
            senderName: userName,
            timestamp: new Date().toISOString(),
            data: queuedMessage.data,
            messageId: queuedMessage.id,
          })
        );
        removeFromQueue(queuedMessage.id);
      } catch {
        // Keep in queue for retry
      }
    });
  }, [messageQueue, userId, userName, removeFromQueue]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    isManualDisconnectRef.current = false;
    updateStatus("connecting");

    try {
      const wsUrl = new URL("/api/ws", window.location.origin);
      wsUrl.protocol = wsUrl.protocol.replace("http", "ws");
      wsUrl.searchParams.set("tenantId", tenantId);
      wsUrl.searchParams.set("userId", userId);
      wsUrl.searchParams.set("userName", userName);
      wsUrl.searchParams.set("token", token);
      if (userAvatar) {
        wsUrl.searchParams.set("userAvatar", userAvatar);
      }

      const ws = new WebSocket(wsUrl.toString());
      wsRef.current = ws;

      ws.onopen = () => {
        updateStatus("connected");
        setReconnectAttempts(0);
        setLastError(null);

        // Rejoin rooms
        joinedRoomsRef.current.forEach((roomId) => {
          ws.send(
            JSON.stringify({
              type: "room_join",
              roomId,
              senderId: userId,
              senderName: userName,
              timestamp: new Date().toISOString(),
              data: null,
              messageId: generateMessageId(),
            })
          );
        });

        // Flush queued messages
        flushQueue();
      };

      ws.onmessage = handleMessage;

      ws.onerror = () => {
        const error = new Error("WebSocket connection error");
        setLastError(error);
        onError?.(error);
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!isManualDisconnectRef.current) {
          updateStatus("disconnected");
          scheduleReconnect();
        }
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to connect");
      setLastError(err);
      onError?.(err);
      updateStatus("error");
    }
  }, [
    tenantId,
    userId,
    userName,
    userAvatar,
    token,
    updateStatus,
    handleMessage,
    scheduleReconnect,
    flushQueue,
    generateMessageId,
    onError,
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    updateStatus("disconnected");
    setReconnectAttempts(0);
  }, [updateStatus]);

  // Reconnect
  const reconnect = useCallback(() => {
    setReconnectAttempts(0);
    connect();
  }, [connect]);

  // Send a message
  const sendMessage = useCallback(
    <T,>(type: WebSocketMessageType, roomId: string, data: T) => {
      const messageId = generateMessageId();
      const message = {
        type,
        roomId,
        senderId: userId,
        senderName: userName,
        timestamp: new Date().toISOString(),
        data,
        messageId,
      };

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      } else {
        // Queue for later
        addToQueue({
          id: messageId,
          type,
          roomId,
          data,
          timestamp: new Date(),
          retries: 0,
        });
      }
    },
    [userId, userName, generateMessageId, addToQueue]
  );

  // Join a room
  const joinRoom = useCallback(
    (roomType: RoomType, resourceId?: string) => {
      const roomId = resourceId
        ? `${roomType}:${tenantId}:${resourceId}`
        : `${roomType}:${tenantId}`;

      joinedRoomsRef.current.add(roomId);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "room_join",
            roomId,
            roomType,
            senderId: userId,
            senderName: userName,
            timestamp: new Date().toISOString(),
            data: { resourceId },
            messageId: generateMessageId(),
          })
        );
      }
    },
    [tenantId, userId, userName, generateMessageId]
  );

  // Leave a room
  const leaveRoom = useCallback(
    (roomId: string) => {
      joinedRoomsRef.current.delete(roomId);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "room_leave",
            roomId,
            senderId: userId,
            senderName: userName,
            timestamp: new Date().toISOString(),
            data: null,
            messageId: generateMessageId(),
          })
        );
      }
    },
    [userId, userName, generateMessageId]
  );

  // Update cursor position
  const updateCursor = useCallback(
    (roomId: string, cursor: CursorPosition) => {
      sendMessage("cursor_move", roomId, { cursor });
    },
    [sendMessage]
  );

  // Set typing status
  const setTyping = useCallback(
    (roomId: string, isTyping: boolean, context?: string) => {
      sendMessage(isTyping ? "typing_start" : "typing_stop", roomId, { context });
    },
    [sendMessage]
  );

  // Subscribe to a message type
  const subscribe = useCallback(
    (type: WebSocketMessageType, handler: MessageHandler): (() => void) => {
      if (!handlersRef.current.has(type)) {
        handlersRef.current.set(type, new Set());
      }
      handlersRef.current.get(type)!.add(handler);

      return () => {
        handlersRef.current.get(type)?.delete(handler);
      };
    },
    []
  );

  // Get users in a room
  const getRoomUsers = useCallback(
    (roomId: string): UserPresence[] => {
      return roomUsers.get(roomId) || [];
    },
    [roomUsers]
  );

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && tenantId && userId && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, tenantId, userId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reconnect on attempt change
  useEffect(() => {
    if (reconnectAttempts > 0 && status === "reconnecting") {
      connect();
    }
  }, [reconnectAttempts]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    status,
    isConnected: status === "connected",
    reconnectAttempts,
    lastError,
    connect,
    disconnect,
    reconnect,
    sendMessage,
    joinRoom,
    leaveRoom,
    updateCursor,
    setTyping,
    subscribe,
    getRoomUsers,
    pendingMessagesCount: messageQueue.length,
  };
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook to get WebSocket connection status
 */
export function useWebSocketStatus(): ConnectionStatus {
  return useWebSocketStore((s) => s.status);
}

/**
 * Hook to check if WebSocket is connected
 */
export function useIsWebSocketConnected(): boolean {
  return useWebSocketStore((s) => s.status === "connected");
}

/**
 * Hook to get pending message count
 */
export function usePendingWebSocketMessages(): number {
  return useWebSocketStore((s) => s.messageQueue.length);
}

/**
 * Hook to get users in a specific room
 */
export function useRoomUsers(roomId: string): UserPresence[] {
  const roomUsers = useWebSocketStore((s) => s.roomUsers);
  return useMemo(() => roomUsers.get(roomId) || [], [roomUsers, roomId]);
}

/**
 * Hook to get typing users in a room
 */
export function useTypingUsers(roomId: string): UserPresence[] {
  const users = useRoomUsers(roomId);
  return useMemo(() => users.filter((u) => u.isTyping), [users]);
}
