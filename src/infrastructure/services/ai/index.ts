/**
 * Indigo AI Services - Abstraction Layer
 * 
 * This module provides a unified interface for AI-powered features in the Indigo platform.
 * Under the hood, these services are powered by AWS, but exposed as Indigo-branded capabilities.
 * 
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    Indigo Platform Layer                        │
 * │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
 * │  │ Indigo AI    │ │ Indigo       │ │ Indigo       │            │
 * │  │ Assistant    │ │ Search       │ │ Insights     │            │
 * │  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘            │
 * │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
 * │  │ Indigo       │ │ Indigo       │ │ Indigo       │            │
 * │  │ Recommend    │ │ Content      │ │ Media        │            │
 * │  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘            │
 * └─────────┼────────────────┼────────────────┼────────────────────┘
 *           │                │                │
 * ┌─────────┼────────────────┼────────────────┼────────────────────┐
 * │         ▼                ▼                ▼                    │
 * │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
 * │  │ AWS Bedrock  │ │ AWS          │ │ AWS          │            │
 * │  │ (Claude/Nova)│ │ OpenSearch   │ │ Personalize  │            │
 * │  └──────────────┘ └──────────────┘ └──────────────┘            │
 * │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
 * │  │ AWS          │ │ AWS          │ │ AWS          │            │
 * │  │ Comprehend   │ │ SageMaker    │ │ Rekognition  │            │
 * │  └──────────────┘ └──────────────┘ └──────────────┘            │
 * │                    AWS Infrastructure                          │
 * └────────────────────────────────────────────────────────────────┘
 * 
 * Usage:
 * ```ts
 * import { IndigoAI, IndigoSearch, IndigoRecommendations } from '@/infrastructure/services/ai';
 * 
 * // Generate product description
 * const description = await IndigoAI.generateDescription('Blue T-Shirt', ['cotton', 'casual']);
 * 
 * // Search products
 * const results = await IndigoSearch.search({ query: 'blue shirt', tenantId: 'store-123' });
 * 
 * // Get recommendations
 * const recs = await IndigoRecommendations.getRecommendations({ type: 'personalized', userId: 'user-1' });
 * ```
 */

import { IndigoAI } from './indigo-ai';
import { IndigoSearch } from './indigo-search';
import { IndigoRecommendations } from './indigo-recommendations';
import { IndigoInsights } from './indigo-insights';
import { IndigoContent } from './indigo-content';
import { IndigoMedia } from './indigo-media';
import type { IndigoServicesStatus } from './types';

// Re-export all Indigo AI services
export * from './indigo-ai';
export * from './indigo-search';
export * from './indigo-recommendations';
export * from './indigo-insights';
export * from './indigo-content';
export * from './indigo-media';
export * from './types';

// ============================================================================
// Unified Service Status
// ============================================================================

/**
 * Get status of all Indigo AI services
 * 
 * @example
 * ```ts
 * const status = await getIndigoServicesStatus();
 * console.log('AI Service:', status.ai.healthy ? 'Online' : 'Offline');
 * ```
 */
export async function getIndigoServicesStatus(): Promise<IndigoServicesStatus> {
  const [aiStatus, searchStatus, recommendationsStatus, insightsStatus, contentStatus, mediaStatus] = await Promise.all([
    IndigoAI.getStatus(),
    IndigoSearch.getStatus(),
    IndigoRecommendations.getStatus(),
    IndigoInsights.getStatus(),
    IndigoContent.getStatus(),
    IndigoMedia.getStatus(),
  ]);

  return {
    ai: aiStatus,
    search: searchStatus,
    recommendations: recommendationsStatus,
    insights: insightsStatus,
    content: contentStatus,
    media: mediaStatus,
  };
}

/**
 * Indigo Services - Unified namespace for all AI services
 */
export const IndigoServices = {
  AI: IndigoAI,
  Search: IndigoSearch,
  Recommendations: IndigoRecommendations,
  Insights: IndigoInsights,
  Content: IndigoContent,
  Media: IndigoMedia,
  getStatus: getIndigoServicesStatus,
};
