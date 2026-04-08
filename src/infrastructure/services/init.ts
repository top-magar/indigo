/**
 * Service Provider Initialization
 * 
 * Registers all available providers with the ServiceFactory
 * Call this once at application startup
 */

import { createLogger } from "@/lib/logger";
import { ServiceFactory } from './factory';

const log = createLogger("infra:init");

let initialized = false;

/**
 * Initialize all service providers
 * 
 * This should be called once at application startup (e.g., in instrumentation.ts)
 */
export async function initializeServiceProviders(): Promise<void> {
  if (initialized) {
    log.info('[Services] Providers already initialized');
    return;
  }

  log.info('[Services] Initializing service providers...');

  // Only register providers in Node.js runtime (not Edge)
  // Edge runtime doesn't support Node.js modules like 'fs' and 'path'
  if (typeof process !== 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
    // Dynamically import providers to avoid loading them in Edge runtime
    const { AWSStorageProvider } = await import('./providers/aws-storage');
    const { LocalStorageProvider } = await import('./providers/local-storage');
    const { AWSEmailProvider } = await import('./providers/aws-email');
    const { LocalEmailProvider } = await import('./providers/local-email');
    const { LocalSearchProvider } = await import('./providers/local-search');

    // Register Storage Providers
    ServiceFactory.registerStorageProvider('aws', new AWSStorageProvider());
    ServiceFactory.registerStorageProvider('local', new LocalStorageProvider());

    // Register Email Providers
    ServiceFactory.registerEmailProvider('aws', new AWSEmailProvider());
    ServiceFactory.registerEmailProvider('local', new LocalEmailProvider());

    // Register AI Providers

    // Register Search Providers
    ServiceFactory.registerSearchProvider('local', new LocalSearchProvider());

    // Register event listeners
    const { registerEmailListeners } = await import('./email/actions');
    registerEmailListeners();


    // Register Forecast Providers

    initialized = true;

    const providers = ServiceFactory.listProviders();
    log.info('[Services] Registered providers:', {
      storage: providers.storage,
      email: providers.email,
      ai: providers.ai,
      search: providers.search,
      forecast: providers.forecast,
    });

    log.info('[Services] Provider initialization complete');
  } else {
    log.info('[Services] Skipping provider initialization in Edge runtime');
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
