/**
 * Services Index - Registry and re-exports for all services
 */

// Event Bus
export { eventBus, createEventPayload } from './event-bus';
export type { EventType, EventPayload, EventHandler } from './event-bus';

// Product Service
export * from './product';

// Order Service
export * from './order';

// Payment Service
export * from './payment';

// Email Service
export * from './email';

// Domain Service
export * from './domain';
