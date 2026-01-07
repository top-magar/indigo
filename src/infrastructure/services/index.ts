/**
 * Infrastructure Services
 * 
 * Core services for caching, events, notifications, etc.
 */

// Cache service
export {
  CacheService,
  getCacheService,
  buildCacheKey,
  withCache,
} from "./cache";
export type {
  CacheStorage,
  CacheGetResult,
  CacheStats,
} from "./cache";

// Event bus
export {
  eventBus,
  createEventPayload,
} from "./event-bus";
export type {
  EventType,
  EventPayload,
  EventHandler,
} from "./event-bus";

// Audit logging
export {
  AuditLogger,
  auditLogger,
  extractRequestMetadata,
} from "./audit-logger";

// Rate limiting
export {
  RateLimiter,
  getRateLimiter,
  getClientIp,
  buildRateLimitHeaders,
} from "./rate-limiter";
export type {
  RateLimitResult,
  RateLimiterStorage,
} from "./rate-limiter";

// Notification services
export {
  notificationEmitter,
  NotificationHelpers,
} from "./notification-emitter";
export type {
  NotificationEvent,
  NotificationEventData,
  NotificationEventType,
  ConnectionInfo,
  NotificationEmitterOptions,
} from "./notification-emitter";

export {
  shouldDeliverNotification,
  deliverNotification,
  deliverToChannel,
  deliverNotificationToMany,
  broadcastToTenant,
} from "./notification-delivery";
export type {
  NotificationPayload,
  NotificationPriority,
  DeliveryResult,
  NotificationDeliveryResult,
} from "./notification-delivery";

// WebSocket server
export {
  webSocketServer,
  createRoomId,
  broadcastNotification,
} from "./websocket-server";
export type {
  WebSocketMessageType,
  RoomType,
  UserPresence,
  CursorPosition,
  CommentData,
  WebSocketMessage,
  RoomState,
  WebSocketConnection,
  WebSocketServerOptions,
} from "./websocket-server";

// Domain services
export * from "./domain";

// Email services
export * from "./email";

// Order services
export * from "./order";

// Payment services
export * from "./payment";

// Product services
export * from "./product";
