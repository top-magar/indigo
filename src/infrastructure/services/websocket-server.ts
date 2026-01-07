/**
 * WebSocket Server Manager
 * Handles bidirectional real-time communication for comments, live collaboration, and presence
 */

import type { NotificationType } from "@/components/dashboard/notifications/types";

// ============================================================================
// Types
// ============================================================================

/**
 * WebSocket message types for real-time collaboration
 */
export type WebSocketMessageType =
  | "comment"
  | "comment_reply"
  | "comment_reaction"
  | "comment_resolved"
  | "presence_join"
  | "presence_leave"
  | "presence_update"
  | "cursor_move"
  | "typing_start"
  | "typing_stop"
  | "document_change"
  | "notification"
  | "ping"
  | "pong"
  | "error"
  | "room_join"
  | "room_leave"
  | "room_state";

/**
 * Room types for scoping WebSocket connections
 */
export type RoomType = "tenant" | "order" | "document" | "product" | "customer";

/**
 * User presence information
 */
export interface UserPresence {
  userId: string;
  userName: string;
  userAvatar?: string;
  userColor: string;
  status: "online" | "away" | "busy";
  lastSeen: Date;
  cursor?: CursorPosition;
  currentPage?: string;
  isTyping?: boolean;
  typingContext?: string;
}

/**
 * Cursor position for live cursors
 */
export interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
  scrollTop?: number;
  scrollLeft?: number;
}

/**
 * Comment data structure
 */
export interface CommentData {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  parentId?: string;
  targetType: "order" | "product" | "customer" | "document";
  targetId: string;
  position?: { x: number; y: number };
  resolved?: boolean;
  reactions?: Array<{ emoji: string; userId: string }>;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  roomId: string;
  roomType: RoomType;
  senderId: string;
  senderName?: string;
  timestamp: Date;
  data: T;
  messageId: string;
}

/**
 * Room state containing all active users and their presence
 */
export interface RoomState {
  roomId: string;
  roomType: RoomType;
  users: Map<string, UserPresence>;
  createdAt: Date;
  lastActivity: Date;
}

/**
 * Connection information for tracking WebSocket connections
 */
export interface WebSocketConnection {
  connectionId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  tenantId: string;
  rooms: Set<string>;
  connectedAt: Date;
  lastPing: Date;
  userColor: string;
  socket: WebSocket | null;
  controller?: ReadableStreamDefaultController<Uint8Array>;
}

/**
 * WebSocket server configuration options
 */
export interface WebSocketServerOptions {
  heartbeatInterval?: number;
  connectionTimeout?: number;
  maxConnectionsPerUser?: number;
  maxRoomsPerConnection?: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_OPTIONS: Required<WebSocketServerOptions> = {
  heartbeatInterval: 30000, // 30 seconds
  connectionTimeout: 300000, // 5 minutes
  maxConnectionsPerUser: 5,
  maxRoomsPerConnection: 20,
};

// Predefined colors for user cursors
const USER_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

// ============================================================================
// WebSocket Server Manager
// ============================================================================

/**
 * WebSocketServer class - singleton for managing WebSocket connections
 */
class WebSocketServer {
  private connections: Map<string, WebSocketConnection> = new Map();
  private rooms: Map<string, RoomState> = new Map();
  private userConnections: Map<string, Set<string>> = new Map();
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();
  private options: Required<WebSocketServerOptions>;
  private colorIndex: number = 0;

  constructor(options: WebSocketServerOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  // --------------------------------------------------------------------------
  // Helper Methods
  // --------------------------------------------------------------------------

  private generateConnectionId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private getNextUserColor(): string {
    const color = USER_COLORS[this.colorIndex % USER_COLORS.length];
    this.colorIndex++;
    return color;
  }

  private buildRoomId(roomType: RoomType, tenantId: string, resourceId?: string): string {
    if (resourceId) {
      return `${roomType}:${tenantId}:${resourceId}`;
    }
    return `${roomType}:${tenantId}`;
  }

  private parseRoomId(roomId: string): { roomType: RoomType; tenantId: string; resourceId?: string } {
    const parts = roomId.split(":");
    return {
      roomType: parts[0] as RoomType,
      tenantId: parts[1],
      resourceId: parts[2],
    };
  }

  // --------------------------------------------------------------------------
  // Connection Management
  // --------------------------------------------------------------------------

  /**
   * Register a new WebSocket connection
   */
  registerConnection(
    userId: string,
    userName: string,
    tenantId: string,
    socket: WebSocket | null = null,
    controller?: ReadableStreamDefaultController<Uint8Array>,
    userAvatar?: string
  ): string {
    // Check max connections per user
    const existingConnections = this.userConnections.get(userId);
    if (existingConnections && existingConnections.size >= this.options.maxConnectionsPerUser) {
      // Remove oldest connection
      const oldestConnectionId = existingConnections.values().next().value;
      if (oldestConnectionId) {
        this.removeConnection(oldestConnectionId);
      }
    }

    const connectionId = this.generateConnectionId();
    const userColor = this.getNextUserColor();
    const now = new Date();

    const connection: WebSocketConnection = {
      connectionId,
      userId,
      userName,
      userAvatar,
      tenantId,
      rooms: new Set(),
      connectedAt: now,
      lastPing: now,
      userColor,
      socket,
      controller,
    };

    this.connections.set(connectionId, connection);

    // Track user connections
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(connectionId);

    // Auto-join tenant room
    this.joinRoom(connectionId, "tenant", tenantId);

    // Start heartbeat
    this.startHeartbeat(connectionId);

    console.log(`[WebSocketServer] Connection registered: ${connectionId} for user: ${userId}`);

    return connectionId;
  }

  /**
   * Remove a connection and clean up
   */
  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Leave all rooms
    for (const roomId of connection.rooms) {
      this.leaveRoom(connectionId, roomId);
    }

    // Stop heartbeat
    this.stopHeartbeat(connectionId);

    // Remove from user connections
    const userConns = this.userConnections.get(connection.userId);
    if (userConns) {
      userConns.delete(connectionId);
      if (userConns.size === 0) {
        this.userConnections.delete(connection.userId);
      }
    }

    // Close socket/controller
    try {
      if (connection.socket) {
        connection.socket.close();
      }
      if (connection.controller) {
        connection.controller.close();
      }
    } catch {
      // Already closed
    }

    this.connections.delete(connectionId);
    console.log(`[WebSocketServer] Connection removed: ${connectionId}`);
  }

  // --------------------------------------------------------------------------
  // Room Management
  // --------------------------------------------------------------------------

  /**
   * Join a room
   */
  joinRoom(
    connectionId: string,
    roomType: RoomType,
    tenantId: string,
    resourceId?: string
  ): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) return false;

    // Check max rooms
    if (connection.rooms.size >= this.options.maxRoomsPerConnection) {
      console.warn(`[WebSocketServer] Max rooms reached for connection: ${connectionId}`);
      return false;
    }

    const roomId = this.buildRoomId(roomType, tenantId, resourceId);

    // Create room if doesn't exist
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        roomId,
        roomType,
        users: new Map(),
        createdAt: new Date(),
        lastActivity: new Date(),
      });
    }

    const room = this.rooms.get(roomId)!;

    // Add user presence to room
    const presence: UserPresence = {
      userId: connection.userId,
      userName: connection.userName,
      userAvatar: connection.userAvatar,
      userColor: connection.userColor,
      status: "online",
      lastSeen: new Date(),
    };

    room.users.set(connection.userId, presence);
    room.lastActivity = new Date();
    connection.rooms.add(roomId);

    // Broadcast join to room
    this.broadcastToRoom(roomId, {
      type: "presence_join",
      roomId,
      roomType,
      senderId: connection.userId,
      senderName: connection.userName,
      timestamp: new Date(),
      data: presence,
      messageId: this.generateMessageId(),
    }, connectionId);

    // Send room state to joining user
    this.sendToConnection(connectionId, {
      type: "room_state",
      roomId,
      roomType,
      senderId: "system",
      timestamp: new Date(),
      data: {
        users: Array.from(room.users.values()),
      },
      messageId: this.generateMessageId(),
    });

    console.log(`[WebSocketServer] ${connection.userName} joined room: ${roomId}`);
    return true;
  }

  /**
   * Leave a room
   */
  leaveRoom(connectionId: string, roomId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    // Remove user from room
    room.users.delete(connection.userId);
    connection.rooms.delete(roomId);

    // Broadcast leave to room
    this.broadcastToRoom(roomId, {
      type: "presence_leave",
      roomId,
      roomType: room.roomType,
      senderId: connection.userId,
      senderName: connection.userName,
      timestamp: new Date(),
      data: { userId: connection.userId },
      messageId: this.generateMessageId(),
    });

    // Clean up empty rooms (except tenant rooms)
    if (room.users.size === 0 && room.roomType !== "tenant") {
      this.rooms.delete(roomId);
    }

    console.log(`[WebSocketServer] ${connection.userName} left room: ${roomId}`);
  }

  // --------------------------------------------------------------------------
  // Message Handling
  // --------------------------------------------------------------------------

  /**
   * Send message to a specific connection
   */
  sendToConnection(connectionId: string, message: WebSocketMessage): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) return false;

    try {
      const messageStr = JSON.stringify({
        ...message,
        timestamp: message.timestamp.toISOString(),
      });

      if (connection.socket && connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.send(messageStr);
        return true;
      }

      if (connection.controller) {
        const encoder = new TextEncoder();
        connection.controller.enqueue(encoder.encode(`data: ${messageStr}\n\n`));
        return true;
      }

      return false;
    } catch (error) {
      console.error(`[WebSocketServer] Failed to send to ${connectionId}:`, error);
      this.removeConnection(connectionId);
      return false;
    }
  }

  /**
   * Broadcast message to all connections in a room
   */
  broadcastToRoom(
    roomId: string,
    message: WebSocketMessage,
    excludeConnectionId?: string
  ): number {
    const room = this.rooms.get(roomId);
    if (!room) return 0;

    let sentCount = 0;

    for (const [connId, connection] of this.connections) {
      if (connection.rooms.has(roomId) && connId !== excludeConnectionId) {
        if (this.sendToConnection(connId, message)) {
          sentCount++;
        }
      }
    }

    return sentCount;
  }

  /**
   * Broadcast message to all connections for a tenant
   */
  broadcastToTenant(tenantId: string, message: WebSocketMessage): number {
    let sentCount = 0;

    for (const [connId, connection] of this.connections) {
      if (connection.tenantId === tenantId) {
        if (this.sendToConnection(connId, message)) {
          sentCount++;
        }
      }
    }

    return sentCount;
  }

  /**
   * Send message to a specific user (all their connections)
   */
  sendToUser(userId: string, message: WebSocketMessage): number {
    const userConns = this.userConnections.get(userId);
    if (!userConns) return 0;

    let sentCount = 0;
    for (const connId of userConns) {
      if (this.sendToConnection(connId, message)) {
        sentCount++;
      }
    }

    return sentCount;
  }

  // --------------------------------------------------------------------------
  // Collaboration Features
  // --------------------------------------------------------------------------

  /**
   * Update cursor position
   */
  updateCursor(connectionId: string, roomId: string, cursor: CursorPosition): void {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.rooms.has(roomId)) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const presence = room.users.get(connection.userId);
    if (presence) {
      presence.cursor = cursor;
      presence.lastSeen = new Date();
    }

    this.broadcastToRoom(roomId, {
      type: "cursor_move",
      roomId,
      roomType: room.roomType,
      senderId: connection.userId,
      senderName: connection.userName,
      timestamp: new Date(),
      data: {
        cursor,
        userColor: connection.userColor,
      },
      messageId: this.generateMessageId(),
    }, connectionId);
  }

  /**
   * Update typing status
   */
  updateTypingStatus(
    connectionId: string,
    roomId: string,
    isTyping: boolean,
    context?: string
  ): void {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.rooms.has(roomId)) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const presence = room.users.get(connection.userId);
    if (presence) {
      presence.isTyping = isTyping;
      presence.typingContext = context;
      presence.lastSeen = new Date();
    }

    this.broadcastToRoom(roomId, {
      type: isTyping ? "typing_start" : "typing_stop",
      roomId,
      roomType: room.roomType,
      senderId: connection.userId,
      senderName: connection.userName,
      timestamp: new Date(),
      data: { context },
      messageId: this.generateMessageId(),
    }, connectionId);
  }

  /**
   * Broadcast a comment
   */
  broadcastComment(
    tenantId: string,
    roomType: RoomType,
    resourceId: string,
    comment: CommentData
  ): void {
    const roomId = this.buildRoomId(roomType, tenantId, resourceId);

    this.broadcastToRoom(roomId, {
      type: "comment",
      roomId,
      roomType,
      senderId: comment.authorId,
      senderName: comment.authorName,
      timestamp: new Date(),
      data: comment,
      messageId: this.generateMessageId(),
    });

    // Also broadcast to tenant room for activity feed
    const tenantRoomId = this.buildRoomId("tenant", tenantId);
    this.broadcastToRoom(tenantRoomId, {
      type: "comment",
      roomId: tenantRoomId,
      roomType: "tenant",
      senderId: comment.authorId,
      senderName: comment.authorName,
      timestamp: new Date(),
      data: comment,
      messageId: this.generateMessageId(),
    });
  }

  // --------------------------------------------------------------------------
  // Heartbeat Management
  // --------------------------------------------------------------------------

  private startHeartbeat(connectionId: string): void {
    const interval = setInterval(() => {
      const connection = this.connections.get(connectionId);
      if (!connection) {
        this.stopHeartbeat(connectionId);
        return;
      }

      const now = new Date();
      const timeSinceLastPing = now.getTime() - connection.lastPing.getTime();

      if (timeSinceLastPing > this.options.connectionTimeout) {
        console.log(`[WebSocketServer] Connection timeout: ${connectionId}`);
        this.removeConnection(connectionId);
        return;
      }

      // Send ping
      this.sendToConnection(connectionId, {
        type: "ping",
        roomId: "",
        roomType: "tenant",
        senderId: "system",
        timestamp: now,
        data: null,
        messageId: this.generateMessageId(),
      });
    }, this.options.heartbeatInterval);

    this.heartbeatIntervals.set(connectionId, interval);
  }

  private stopHeartbeat(connectionId: string): void {
    const interval = this.heartbeatIntervals.get(connectionId);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(connectionId);
    }
  }

  /**
   * Handle pong response from client
   */
  handlePong(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastPing = new Date();
    }
  }

  // --------------------------------------------------------------------------
  // Query Methods
  // --------------------------------------------------------------------------

  /**
   * Get all users in a room
   */
  getRoomUsers(roomId: string): UserPresence[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.users.values());
  }

  /**
   * Get room state
   */
  getRoomState(roomId: string): RoomState | null {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Get connection count
   */
  getConnectionCount(tenantId?: string): number {
    if (!tenantId) return this.connections.size;

    let count = 0;
    for (const connection of this.connections.values()) {
      if (connection.tenantId === tenantId) count++;
    }
    return count;
  }

  /**
   * Get active rooms for a tenant
   */
  getTenantRooms(tenantId: string): RoomState[] {
    const rooms: RoomState[] = [];
    for (const room of this.rooms.values()) {
      const { tenantId: roomTenantId } = this.parseRoomId(room.roomId);
      if (roomTenantId === tenantId) {
        rooms.push(room);
      }
    }
    return rooms;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userConnections.has(userId) && this.userConnections.get(userId)!.size > 0;
  }

  /**
   * Get online users for a tenant
   */
  getOnlineUsers(tenantId: string): UserPresence[] {
    const tenantRoomId = this.buildRoomId("tenant", tenantId);
    return this.getRoomUsers(tenantRoomId);
  }

  /**
   * Clean up stale connections
   */
  cleanupStaleConnections(): number {
    const now = new Date();
    let cleanedCount = 0;

    for (const [connectionId, connection] of this.connections) {
      const timeSinceLastPing = now.getTime() - connection.lastPing.getTime();
      if (timeSinceLastPing > this.options.connectionTimeout) {
        this.removeConnection(connectionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[WebSocketServer] Cleaned up ${cleanedCount} stale connections`);
    }

    return cleanedCount;
  }
}

// Export singleton instance
export const webSocketServer = new WebSocketServer();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Helper to create a room ID
 */
export function createRoomId(
  roomType: RoomType,
  tenantId: string,
  resourceId?: string
): string {
  if (resourceId) {
    return `${roomType}:${tenantId}:${resourceId}`;
  }
  return `${roomType}:${tenantId}`;
}

/**
 * Helper to broadcast a notification via WebSocket
 */
export function broadcastNotification(
  tenantId: string,
  type: NotificationType,
  title: string,
  message: string,
  href?: string,
  metadata?: Record<string, unknown>
): void {
  const roomId = createRoomId("tenant", tenantId);
  
  webSocketServer.broadcastToTenant(tenantId, {
    type: "notification",
    roomId,
    roomType: "tenant",
    senderId: "system",
    timestamp: new Date(),
    data: {
      notificationType: type,
      title,
      message,
      href,
      metadata,
    },
    messageId: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  });
}
