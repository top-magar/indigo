/**
 * Indigo Recommendations Service
 * 
 * Provides personalized product recommendations:
 * - Personalized recommendations based on user behavior
 * - Similar product suggestions
 * - Trending products
 * - Frequently bought together
 * 
 * Powered by: AWS Personalize
 */

import {
  getPersonalizedRecommendations,
  getSimilarItems,
  getPersonalizedRanking,
  trackInteraction as personalizeTrackInteraction,
  trackInteractionsBatch,
  updateUserMetadata,
  updateItemMetadata,
  isPersonalizeEnabled,
  type InteractionEventType,
} from '@/infrastructure/aws/personalize';
import type {
  IndigoServiceResult,
  RecommendationType,
  RecommendationOptions,
  RecommendedProduct,
  RecommendationResults,
  TrackInteractionOptions,
  ServiceStatus,
} from './types';

// ============================================================================
// Indigo Recommendations - Get Recommendations
// ============================================================================

/**
 * Get product recommendations
 * 
 * @example
 * ```ts
 * // Personalized recommendations for a user
 * const results = await IndigoRecommendations.getRecommendations({
 *   type: 'personalized',
 *   userId: 'user-123',
 *   limit: 10,
 * });
 * 
 * // Similar products
 * const similar = await IndigoRecommendations.getRecommendations({
 *   type: 'similar',
 *   productId: 'prod-456',
 *   limit: 6,
 * });
 * ```
 */
export async function getRecommendations(
  options: RecommendationOptions
): Promise<IndigoServiceResult<RecommendationResults>> {
  const startTime = Date.now();

  if (!isPersonalizeEnabled()) {
    return {
      success: false,
      error: 'Recommendations service is not configured',
    };
  }

  try {
    let recommendations: RecommendedProduct[] = [];

    switch (options.type) {
      case 'personalized':
        if (!options.userId) {
          return { success: false, error: 'userId is required for personalized recommendations' };
        }
        const personalizedResult = await getPersonalizedRecommendations(options.userId, {
          numResults: options.limit || 10,
          context: options.context,
        });
        if (personalizedResult.success && personalizedResult.recommendations) {
          recommendations = personalizedResult.recommendations
            .filter(r => !options.excludeIds?.includes(r.itemId))
            .map(r => ({
              productId: r.itemId,
              score: r.score,
              reason: 'Based on your browsing history',
            }));
        }
        break;

      case 'similar':
        if (!options.productId) {
          return { success: false, error: 'productId is required for similar recommendations' };
        }
        const similarResult = await getSimilarItems(options.productId, {
          userId: options.userId,
          numResults: options.limit || 10,
        });
        if (similarResult.success && similarResult.recommendations) {
          recommendations = similarResult.recommendations
            .filter(r => !options.excludeIds?.includes(r.itemId))
            .map(r => ({
              productId: r.itemId,
              score: r.score,
              reason: 'Similar to items you viewed',
            }));
        }
        break;

      case 'trending':
        // For trending, we use personalized recommendations without a specific user
        // This returns popular items
        const trendingResult = await getPersonalizedRecommendations('anonymous', {
          numResults: options.limit || 10,
        });
        if (trendingResult.success && trendingResult.recommendations) {
          recommendations = trendingResult.recommendations
            .filter(r => !options.excludeIds?.includes(r.itemId))
            .map(r => ({
              productId: r.itemId,
              score: r.score,
              reason: 'Trending now',
            }));
        }
        break;

      case 'frequently-bought':
        if (!options.productId) {
          return { success: false, error: 'productId is required for frequently-bought recommendations' };
        }
        // Use similar items with purchase context
        const frequentResult = await getSimilarItems(options.productId, {
          userId: options.userId,
          numResults: options.limit || 6,
        });
        if (frequentResult.success && frequentResult.recommendations) {
          recommendations = frequentResult.recommendations
            .filter(r => !options.excludeIds?.includes(r.itemId))
            .map(r => ({
              productId: r.itemId,
              score: r.score,
              reason: 'Frequently bought together',
            }));
        }
        break;

      case 'recently-viewed':
        // This would typically come from session storage or a separate tracking system
        // For now, return personalized recommendations
        if (!options.userId) {
          return { success: false, error: 'userId is required for recently-viewed recommendations' };
        }
        const recentResult = await getPersonalizedRecommendations(options.userId, {
          numResults: options.limit || 10,
        });
        if (recentResult.success && recentResult.recommendations) {
          recommendations = recentResult.recommendations
            .filter(r => !options.excludeIds?.includes(r.itemId))
            .map(r => ({
              productId: r.itemId,
              score: r.score,
              reason: 'Based on your recent activity',
            }));
        }
        break;
    }

    return {
      success: true,
      data: {
        recommendations,
        type: options.type,
        generatedAt: new Date().toISOString(),
      },
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-recommendations',
      },
    };
  } catch (error) {
    console.error('[IndigoRecommendations] Get recommendations failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recommendations',
    };
  }
}

/**
 * Get personalized ranking for a list of products
 * Useful for re-ordering search results or category pages
 * 
 * @example
 * ```ts
 * const ranked = await IndigoRecommendations.rankProducts(
 *   'user-123',
 *   ['prod-1', 'prod-2', 'prod-3']
 * );
 * ```
 */
export async function rankProducts(
  userId: string,
  productIds: string[]
): Promise<IndigoServiceResult<RecommendedProduct[]>> {
  const startTime = Date.now();

  if (!isPersonalizeEnabled()) {
    return {
      success: false,
      error: 'Recommendations service is not configured',
    };
  }

  try {
    const result = await getPersonalizedRanking(userId, productIds);

    if (!result.success || !result.rankedItems) {
      return {
        success: false,
        error: result.error || 'Failed to rank products',
      };
    }

    const rankedProducts: RecommendedProduct[] = result.rankedItems.map(item => ({
      productId: item.itemId,
      score: item.score,
    }));

    return {
      success: true,
      data: rankedProducts,
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-recommendations',
      },
    };
  } catch (error) {
    console.error('[IndigoRecommendations] Rank products failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to rank products',
    };
  }
}

// ============================================================================
// Indigo Recommendations - Interaction Tracking
// ============================================================================

/**
 * Track a user interaction for improving recommendations
 * 
 * @example
 * ```ts
 * await IndigoRecommendations.trackInteraction({
 *   userId: 'user-123',
 *   sessionId: 'session-abc',
 *   type: 'view',
 *   productId: 'prod-456',
 * });
 * ```
 */
export async function trackInteraction(
  options: TrackInteractionOptions
): Promise<IndigoServiceResult> {
  if (!isPersonalizeEnabled()) {
    // Silently succeed if not configured - don't block user actions
    return { success: true };
  }

  try {
    // Map Indigo interaction types to Personalize event types
    const eventTypeMap: Record<TrackInteractionOptions['type'], InteractionEventType> = {
      view: 'view',
      click: 'click',
      'add-to-cart': 'add-to-cart',
      purchase: 'purchase',
      'wishlist-add': 'wishlist-add',
      search: 'search',
      review: 'view', // Map review to view for now
    };

    const result = await personalizeTrackInteraction(
      options.userId,
      options.sessionId,
      eventTypeMap[options.type],
      options.productId,
      {
        eventValue: options.value,
        properties: options.metadata,
      }
    );

    return {
      success: result.success,
      error: result.error,
    };
  } catch (error) {
    console.error('[IndigoRecommendations] Track interaction failed:', error);
    // Don't fail user actions due to tracking errors
    return { success: true };
  }
}

/**
 * Track multiple interactions in batch
 * 
 * @example
 * ```ts
 * await IndigoRecommendations.trackInteractionsBatch('user-123', 'session-abc', [
 *   { type: 'view', productId: 'prod-1' },
 *   { type: 'add-to-cart', productId: 'prod-2' },
 * ]);
 * ```
 */
export async function trackBatch(
  userId: string,
  sessionId: string,
  interactions: Array<{
    type: TrackInteractionOptions['type'];
    productId: string;
    value?: number;
    timestamp?: Date;
  }>
): Promise<IndigoServiceResult> {
  if (!isPersonalizeEnabled()) {
    return { success: true };
  }

  try {
    const eventTypeMap: Record<TrackInteractionOptions['type'], InteractionEventType> = {
      view: 'view',
      click: 'click',
      'add-to-cart': 'add-to-cart',
      purchase: 'purchase',
      'wishlist-add': 'wishlist-add',
      search: 'search',
      review: 'view',
    };

    const result = await trackInteractionsBatch(
      userId,
      sessionId,
      interactions.map(i => ({
        eventType: eventTypeMap[i.type],
        itemId: i.productId,
        eventValue: i.value,
        timestamp: i.timestamp,
      }))
    );

    return {
      success: result.success,
      error: result.error,
    };
  } catch (error) {
    console.error('[IndigoRecommendations] Track batch failed:', error);
    return { success: true };
  }
}

// ============================================================================
// Indigo Recommendations - Data Sync
// ============================================================================

/**
 * Update user profile for better recommendations
 * 
 * @example
 * ```ts
 * await IndigoRecommendations.updateUserProfile('user-123', {
 *   preferredCategories: 'electronics,clothing',
 *   membershipTier: 'premium',
 * });
 * ```
 */
export async function updateUserProfile(
  userId: string,
  properties: Record<string, string | number>
): Promise<IndigoServiceResult> {
  if (!isPersonalizeEnabled()) {
    return { success: true };
  }

  try {
    const result = await updateUserMetadata(userId, properties);
    return {
      success: result.success,
      error: result.error,
    };
  } catch (error) {
    console.error('[IndigoRecommendations] Update user profile failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user profile',
    };
  }
}

/**
 * Update product metadata for recommendations
 * 
 * @example
 * ```ts
 * await IndigoRecommendations.updateProductMetadata('prod-123', {
 *   category: 'electronics',
 *   price: 99.99,
 *   brand: 'TechCo',
 * });
 * ```
 */
export async function updateProductMetadata(
  productId: string,
  properties: Record<string, string | number>
): Promise<IndigoServiceResult> {
  if (!isPersonalizeEnabled()) {
    return { success: true };
  }

  try {
    const result = await updateItemMetadata(productId, properties);
    return {
      success: result.success,
      error: result.error,
    };
  } catch (error) {
    console.error('[IndigoRecommendations] Update product metadata failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product metadata',
    };
  }
}

// ============================================================================
// Service Status
// ============================================================================

/**
 * Check if Indigo Recommendations service is available
 */
export function isAvailable(): boolean {
  return isPersonalizeEnabled();
}

/**
 * Get Indigo Recommendations service status
 */
export function getStatus(): ServiceStatus {
  const enabled = isPersonalizeEnabled();
  
  return {
    name: 'Indigo Recommendations',
    enabled,
    healthy: enabled,
    lastChecked: new Date().toISOString(),
    features: [
      'Personalized Recommendations',
      'Similar Products',
      'Trending Items',
      'Frequently Bought Together',
      'Personalized Ranking',
      'Interaction Tracking',
    ],
  };
}

// ============================================================================
// Namespace Export
// ============================================================================

export const IndigoRecommendations = {
  getRecommendations,
  rankProducts,
  trackInteraction,
  trackBatch,
  updateUserProfile,
  updateProductMetadata,
  isAvailable,
  getStatus,
};
