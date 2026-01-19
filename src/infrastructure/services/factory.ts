/**
 * Service Factory
 * 
 * Central registry for service providers with automatic provider selection
 * based on environment configuration
 */

import type {
  StorageProvider,
  EmailProvider,
  AIProvider,
  SearchProvider,
  RecommendationProvider,
  ForecastProvider,
} from './providers/types';

export class ServiceFactory {
  private static storageProviders = new Map<string, StorageProvider>();
  private static emailProviders = new Map<string, EmailProvider>();
  private static aiProviders = new Map<string, AIProvider>();
  private static searchProviders = new Map<string, SearchProvider>();
  private static recommendationProviders = new Map<string, RecommendationProvider>();
  private static forecastProviders = new Map<string, ForecastProvider>();

  // ============================================================================
  // Registration Methods
  // ============================================================================

  static registerStorageProvider(name: string, provider: StorageProvider): void {
    this.storageProviders.set(name, provider);
  }

  static registerEmailProvider(name: string, provider: EmailProvider): void {
    this.emailProviders.set(name, provider);
  }

  static registerAIProvider(name: string, provider: AIProvider): void {
    this.aiProviders.set(name, provider);
  }

  static registerSearchProvider(name: string, provider: SearchProvider): void {
    this.searchProviders.set(name, provider);
  }

  static registerRecommendationProvider(name: string, provider: RecommendationProvider): void {
    this.recommendationProviders.set(name, provider);
  }

  static registerForecastProvider(name: string, provider: ForecastProvider): void {
    this.forecastProviders.set(name, provider);
  }

  // ============================================================================
  // Provider Getters
  // ============================================================================

  static getStorageProvider(): StorageProvider {
    const providerName = process.env.STORAGE_PROVIDER || 'aws';
    const provider = this.storageProviders.get(providerName);

    if (!provider) {
      throw new Error(
        `Storage provider "${providerName}" not registered. Available: ${Array.from(this.storageProviders.keys()).join(', ')}`
      );
    }

    return provider;
  }

  static getEmailProvider(): EmailProvider {
    const providerName = process.env.EMAIL_PROVIDER || 'aws';
    const provider = this.emailProviders.get(providerName);

    if (!provider) {
      throw new Error(
        `Email provider "${providerName}" not registered. Available: ${Array.from(this.emailProviders.keys()).join(', ')}`
      );
    }

    return provider;
  }

  static getAIProvider(): AIProvider {
    const providerName = process.env.AI_PROVIDER || 'aws';
    const provider = this.aiProviders.get(providerName);

    if (!provider) {
      throw new Error(
        `AI provider "${providerName}" not registered. Available: ${Array.from(this.aiProviders.keys()).join(', ')}`
      );
    }

    return provider;
  }

  static getSearchProvider(): SearchProvider {
    const providerName = process.env.SEARCH_PROVIDER || 'opensearch';
    const provider = this.searchProviders.get(providerName);

    if (!provider) {
      throw new Error(
        `Search provider "${providerName}" not registered. Available: ${Array.from(this.searchProviders.keys()).join(', ')}`
      );
    }

    return provider;
  }

  static getRecommendationProvider(): RecommendationProvider {
    const providerName = process.env.RECOMMENDATION_PROVIDER || 'personalize';
    const provider = this.recommendationProviders.get(providerName);

    if (!provider) {
      throw new Error(
        `Recommendation provider "${providerName}" not registered. Available: ${Array.from(this.recommendationProviders.keys()).join(', ')}`
      );
    }

    return provider;
  }

  static getForecastProvider(): ForecastProvider {
    const providerName = process.env.FORECAST_PROVIDER || 'local';
    const provider = this.forecastProviders.get(providerName);

    if (!provider) {
      throw new Error(
        `Forecast provider "${providerName}" not registered. Available: ${Array.from(this.forecastProviders.keys()).join(', ')}`
      );
    }

    return provider;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  static listProviders(): {
    storage: string[];
    email: string[];
    ai: string[];
    search: string[];
    recommendation: string[];
    forecast: string[];
  } {
    return {
      storage: Array.from(this.storageProviders.keys()),
      email: Array.from(this.emailProviders.keys()),
      ai: Array.from(this.aiProviders.keys()),
      search: Array.from(this.searchProviders.keys()),
      recommendation: Array.from(this.recommendationProviders.keys()),
      forecast: Array.from(this.forecastProviders.keys()),
    };
  }

  static isProviderRegistered(type: string, name: string): boolean {
    switch (type) {
      case 'storage':
        return this.storageProviders.has(name);
      case 'email':
        return this.emailProviders.has(name);
      case 'ai':
        return this.aiProviders.has(name);
      case 'search':
        return this.searchProviders.has(name);
      case 'recommendation':
        return this.recommendationProviders.has(name);
      case 'forecast':
        return this.forecastProviders.has(name);
      default:
        return false;
    }
  }

  static clearProviders(): void {
    this.storageProviders.clear();
    this.emailProviders.clear();
    this.aiProviders.clear();
    this.searchProviders.clear();
    this.recommendationProviders.clear();
    this.forecastProviders.clear();
  }
}
