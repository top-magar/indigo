/**
 * Infrastructure Services - Abstraction Layer
 * 
 * Provides unified, provider-agnostic interfaces for all external services
 * with built-in error handling, retry logic, observability, and validation
 */

// Core abstractions
export * from './error-handler';
export * from './observability';
export * from './validation';
export * from './factory';
export * from './init';

// Services
export * from './storage';
export * from './email';
export * from './ai';
export * from './search';
export * from './recommendation';
export * from './forecast';

// Provider interfaces
export * from './providers/types';

// Providers
export * from './providers/aws-storage';
export * from './providers/local-storage';
export * from './providers/aws-email';
export * from './providers/local-email';
export * from './providers/aws-ai';
export * from './providers/local-ai';
export * from './providers/aws-search';
export * from './providers/local-search';
export * from './providers/aws-recommendation';
export * from './providers/local-recommendation';
export * from './providers/aws-forecast';
export * from './providers/local-forecast';

// Re-export for convenience
export { ServiceFactory } from './factory';
export { ServiceErrorHandler, ErrorCategory } from './error-handler';
export { ServiceObservability } from './observability';
export { ServiceValidator } from './validation';
export { initializeServiceProviders, isInitialized, resetInitialization } from './init';
export { StorageService } from './storage';
export { EmailService } from './email';
export { AIService } from './ai';
export { SearchService } from './search';
export { RecommendationService } from './recommendation';
export { ForecastService } from './forecast';
export { AWSStorageProvider } from './providers/aws-storage';
export { LocalStorageProvider } from './providers/local-storage';
export { AWSEmailProvider } from './providers/aws-email';
export { LocalEmailProvider } from './providers/local-email';
export { AWSAIProvider } from './providers/aws-ai';
export { LocalAIProvider } from './providers/local-ai';
export { AWSSearchProvider } from './providers/aws-search';
export { LocalSearchProvider } from './providers/local-search';
export { AWSRecommendationProvider } from './providers/aws-recommendation';
export { LocalRecommendationProvider } from './providers/local-recommendation';
export { AWSForecastProvider } from './providers/aws-forecast';
export { LocalForecastProvider } from './providers/local-forecast';
