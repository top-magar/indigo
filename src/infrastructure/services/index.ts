/**
 * Infrastructure Services - Abstraction Layer
 * 
 * IMPORTANT: Do NOT use wildcard re-exports here.
 * Import specific services directly from their modules to enable tree-shaking.
 * 
 * Example:
 *   import { StorageService } from '@/infrastructure/services/storage'
 *   import { EmailService } from '@/infrastructure/services/email'
 * 
 * This barrel file only re-exports the core abstractions and factory.
 * Provider implementations should be imported directly when needed.
 */

// Core abstractions only
export { ServiceErrorHandler, ErrorCategory, type ServiceError } from './error-handler';
export { ServiceFactory } from './factory';
export { initializeServiceProviders, isInitialized, resetInitialization } from './init';

// Service facades (these are lightweight wrappers)
export { StorageService } from './storage';
export { EmailService } from './email';
export { SearchService } from './search';
export { getMessagingProvider, WhatsAppProvider, SparrowSMSProvider } from './messaging';
export type { MessagingProvider, MessagePayload, MessageResult } from './messaging';

// Provider type interfaces
export type {
  StorageProvider,
  EmailProvider,
  AIProvider,
  SearchProvider,
  RecommendationProvider,
  ForecastProvider,
} from './providers/types';
