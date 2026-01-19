/**
 * AWS Recommendation Provider
 * 
 * Implements RecommendationProvider interface using AWS Personalize
 * Wraps existing Personalize implementation from src/infrastructure/aws/personalize.ts
 */

import type {
  RecommendationProvider,
  RecommendationOptions,
  Recommendation,
  SimilarItemsOptions,
  RankedItem,
} from './types';
import {
  getPersonalizedRecommendations,
  getSimilarItems,
  getPersonalizedRanking,
  trackInteraction as trackPersonalizeInteraction,
  updateUserMetadata as updatePersonalizeUserMetadata,
  updateItemMetadata as updatePersonalizeItemMetadata,
  type InteractionEventType,
} from '@/infrastructure/aws/personalize';

export class AWSRecommendationProvider implements RecommendationProvider {
  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(
    userId: string,
    options?: RecommendationOptions
  ): Promise<Recommendation[]> {
    const result = await getPersonalizedRecommendations(userId, {
      numResults: options?.numResults,
      context: options?.context,
    });

    if (!result.success || !result.recommendations) {
      throw new Error(result.error || 'Failed to get recommendations');
    }

    return result.recommendations.map(rec => ({
      itemId: rec.itemId,
      score: rec.score,
    }));
  }

  /**
   * Get similar items recommendations
   */
  async getSimilarItems(
    itemId: string,
    options?: SimilarItemsOptions
  ): Promise<Recommendation[]> {
    const result = await getSimilarItems(itemId, {
      numResults: options?.numResults,
    });

    if (!result.success || !result.recommendations) {
      throw new Error(result.error || 'Failed to get similar items');
    }

    return result.recommendations.map(rec => ({
      itemId: rec.itemId,
      score: rec.score,
    }));
  }

  /**
   * Rank items for a user
   */
  async rankItems(userId: string, itemIds: string[]): Promise<RankedItem[]> {
    const result = await getPersonalizedRanking(userId, itemIds);

    if (!result.success || !result.rankedItems) {
      throw new Error(result.error || 'Failed to rank items');
    }

    return result.rankedItems.map((item, index) => ({
      itemId: item.itemId,
      rank: index + 1,
      score: item.score,
    }));
  }

  /**
   * Track user interaction
   */
  async trackInteraction(
    userId: string,
    itemId: string,
    eventType: string,
    sessionId?: string,
    properties?: Record<string, string>
  ): Promise<void> {
    // Generate session ID if not provided
    const effectiveSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Map event type to Personalize event type
    const personalizeEventType = this.mapEventType(eventType);

    const result = await trackPersonalizeInteraction(
      userId,
      effectiveSessionId,
      personalizeEventType,
      itemId,
      {
        properties,
      }
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to track interaction');
    }
  }

  /**
   * Update user metadata
   */
  async updateUserMetadata(userId: string, metadata: Record<string, string>): Promise<void> {
    const result = await updatePersonalizeUserMetadata(userId, metadata);

    if (!result.success) {
      throw new Error(result.error || 'Failed to update user metadata');
    }
  }

  /**
   * Update item metadata
   */
  async updateItemMetadata(itemId: string, metadata: Record<string, string>): Promise<void> {
    const result = await updatePersonalizeItemMetadata(itemId, metadata);

    if (!result.success) {
      throw new Error(result.error || 'Failed to update item metadata');
    }
  }

  /**
   * Map generic event type to Personalize event type
   */
  private mapEventType(eventType: string): InteractionEventType {
    const lowerEventType = eventType.toLowerCase();

    if (lowerEventType.includes('view')) return 'view';
    if (lowerEventType.includes('click')) return 'click';
    if (lowerEventType.includes('cart')) return 'add-to-cart';
    if (lowerEventType.includes('purchase') || lowerEventType.includes('buy')) return 'purchase';
    if (lowerEventType.includes('wishlist') || lowerEventType.includes('favorite')) return 'wishlist-add';
    if (lowerEventType.includes('search')) return 'search';

    // Default to view
    return 'view';
  }
}
