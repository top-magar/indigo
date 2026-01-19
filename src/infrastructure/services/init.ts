/**
 * Service Provider Initialization
 * 
 * Registers all available providers with the ServiceFactory
 * Call this once at application startup
 */

import { ServiceFactory } from './factory';

let initialized = false;

/**
 * Initialize all service providers
 * 
 * This should be called once at application startup (e.g., in instrumentation.ts)
 */
export async function initializeServiceProviders(): Promise<void> {
  if (initialized) {
    console.log('[Services] Providers already initialized');
    return;
  }

  console.log('[Services] Initializing service providers...');

  // Only register providers in Node.js runtime (not Edge)
  // Edge runtime doesn't support Node.js modules like 'fs' and 'path'
  if (typeof process !== 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
    // Dynamically import providers to avoid loading them in Edge runtime
    const { AWSStorageProvider } = await import('./providers/aws-storage');
    const { LocalStorageProvider } = await import('./providers/local-storage');
    const { AWSEmailProvider } = await import('./providers/aws-email');
    const { LocalEmailProvider } = await import('./providers/local-email');
    const { AWSAIProvider } = await import('./providers/aws-ai');
    const { LocalAIProvider } = await import('./providers/local-ai');
    const { AWSSearchProvider } = await import('./providers/aws-search');
    const { LocalSearchProvider } = await import('./providers/local-search');
    const { AWSRecommendationProvider } = await import('./providers/aws-recommendation');
    const { LocalRecommendationProvider } = await import('./providers/local-recommendation');
    const { AWSForecastProvider } = await import('./providers/aws-forecast');
    const { LocalForecastProvider } = await import('./providers/local-forecast');

    // Register Storage Providers
    ServiceFactory.registerStorageProvider('aws', new AWSStorageProvider());
    ServiceFactory.registerStorageProvider('local', new LocalStorageProvider());

    // Register Email Providers
    ServiceFactory.registerEmailProvider('aws', new AWSEmailProvider());
    ServiceFactory.registerEmailProvider('local', new LocalEmailProvider());

    // Register AI Providers
    ServiceFactory.registerAIProvider('aws', new AWSAIProvider());
    ServiceFactory.registerAIProvider('local', new LocalAIProvider());

    // Register Search Providers
    ServiceFactory.registerSearchProvider('opensearch', new AWSSearchProvider());
    ServiceFactory.registerSearchProvider('local', new LocalSearchProvider());

    // Register Recommendation Providers
    ServiceFactory.registerRecommendationProvider('personalize', new AWSRecommendationProvider());
    ServiceFactory.registerRecommendationProvider('local', new LocalRecommendationProvider());

    // Register Forecast Providers
    ServiceFactory.registerForecastProvider('aws', new AWSForecastProvider());
    ServiceFactory.registerForecastProvider('local', new LocalForecastProvider());

    initialized = true;

    const providers = ServiceFactory.listProviders();
    console.log('[Services] Registered providers:', {
      storage: providers.storage,
      email: providers.email,
      ai: providers.ai,
      search: providers.search,
      recommendation: providers.recommendation,
      forecast: providers.forecast,
    });

    console.log('[Services] Provider initialization complete');
  } else {
    console.log('[Services] Skipping provider initialization in Edge runtime');
  }
}

/**
 * Check if providers are initialized
 */
export function isInitialized(): boolean {
  return initialized;
}

/**
 * Reset initialization state (for testing)
 */
export function resetInitialization(): void {
  initialized = false;
  ServiceFactory.clearProviders();
}
