/**
 * Local Recommendation Provider
 * 
 * Mock recommendation provider for local development and testing
 * Returns mock recommendations based on simple rules
 */

import type {
  RecommendationProvider,
  RecommendationOptions,
  Recommendation,
  SimilarItemsOptions,
  RankedItem,
} from './types';

interface StoredInteraction {
  userId: string;
  itemId: string;
  eventType: string;
  timestamp: Date;
  sessionId?: string;
  properties?: Record<string, string>;
}

interface ItemMetadata {
  itemId: string;
  metadata: Record<string, string>;
}

interface UserMetadata {
  userId: string;
  metadata: Record<string, string>;
}

export class LocalRecommendationProvider implements RecommendationProvider {
  private static interactions: StoredInteraction[] = [];
  private static itemMetadata: Map<string, ItemMetadata> = new Map();
  private static userMetadata: Map<string, UserMetadata> = new Map();

  /**
   * Get personalized recommendations (returns mock data)
   */
  async getRecommendations(
    userId: string,
    options?: RecommendationOptions
  ): Promise<Recommendation[]> {
    const numResults = options?.numResults || 25;

    // Get user's interaction history
    const userInteractions = LocalRecommendationProvider.interactions
      .filter(i => i.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // If user has interactions, recommend similar items
    if (userInteractions.length > 0) {
      const recentItems = userInteractions.slice(0, 5).map(i => i.itemId);
      const recommendations: Recommendation[] = [];

      // Generate mock recommendations based on recent items
      for (let i = 0; i < numResults; i++) {
        const baseItemIndex = i % recentItems.length;
        const baseItem = recentItems[baseItemIndex];
        
        recommendations.push({
          itemId: `rec-${baseItem}-${i}`,
          score: 1.0 - (i * 0.02), // Decreasing score
          reason: `Based on your interest in ${baseItem}`,
        });
      }

      console.log(`[LocalRecommendationProvider] Generated ${recommendations.length} recommendations for user: ${userId}`);
      return recommendations;
    }

    // No interaction history - return popular items (mock)
    const recommendations: Recommendation[] = [];
    for (let i = 0; i < numResults; i++) {
      recommendations.push({
        itemId: `popular-item-${i + 1}`,
        score: 1.0 - (i * 0.01),
        reason: 'Popular item',
      });
    }

    console.log(`[LocalRecommendationProvider] Generated ${recommendations.length} popular recommendations for new user: ${userId}`);
    return recommendations;
  }

  /**
   * Get similar items (returns mock data based on shared tags/categories)
   */
  async getSimilarItems(
    itemId: string,
    options?: SimilarItemsOptions
  ): Promise<Recommendation[]> {
    const numResults = options?.numResults || 10;
    const recommendations: Recommendation[] = [];

    // Get item metadata if available
    const itemMeta = LocalRecommendationProvider.itemMetadata.get(itemId);
    const category = itemMeta?.metadata.category;
    const tags = itemMeta?.metadata.tags?.split(',') || [];

    // Generate mock similar items
    for (let i = 0; i < numResults; i++) {
      const score = 0.95 - (i * 0.05);
      
      recommendations.push({
        itemId: `similar-${itemId}-${i + 1}`,
        score,
        reason: category 
          ? `Similar category: ${category}` 
          : tags.length > 0 
            ? `Shared tags: ${tags[0]}` 
            : 'Similar item',
      });
    }

    console.log(`[LocalRecommendationProvider] Generated ${recommendations.length} similar items for: ${itemId}`);
    return recommendations;
  }

  /**
   * Rank items for a user (returns items with mock scores)
   */
  async rankItems(userId: string, itemIds: string[]): Promise<RankedItem[]> {
    // Get user's interaction history
    const userInteractions = LocalRecommendationProvider.interactions
      .filter(i => i.userId === userId)
      .reduce((acc, interaction) => {
        acc.set(interaction.itemId, (acc.get(interaction.itemId) || 0) + 1);
        return acc;
      }, new Map<string, number>());

    // Rank items based on interaction count + random factor
    const rankedItems: RankedItem[] = itemIds.map((itemId, index) => {
      const interactionCount = userInteractions.get(itemId) || 0;
      const baseScore = 0.5 + (interactionCount * 0.1);
      const randomFactor = Math.random() * 0.2;
      const score = Math.min(1.0, baseScore + randomFactor);

      return {
        itemId,
        rank: index + 1, // Will be re-ranked
        score,
      };
    });

    // Sort by score (descending) and assign ranks
    rankedItems.sort((a, b) => b.score - a.score);
    rankedItems.forEach((item, index) => {
      item.rank = index + 1;
    });

    console.log(`[LocalRecommendationProvider] Ranked ${rankedItems.length} items for user: ${userId}`);
    return rankedItems;
  }

  /**
   * Track user interaction (stores in memory)
   */
  async trackInteraction(
    userId: string,
    itemId: string,
    eventType: string,
    sessionId?: string,
    properties?: Record<string, string>
  ): Promise<void> {
    const interaction: StoredInteraction = {
      userId,
      itemId,
      eventType,
      timestamp: new Date(),
      sessionId,
      properties,
    };

    LocalRecommendationProvider.interactions.push(interaction);

    // Keep only last 10000 interactions to prevent memory issues
    if (LocalRecommendationProvider.interactions.length > 10000) {
      LocalRecommendationProvider.interactions = LocalRecommendationProvider.interactions.slice(-10000);
    }

    console.log(`[LocalRecommendationProvider] Tracked ${eventType} interaction: user=${userId}, item=${itemId}`);
  }

  /**
   * Update user metadata (stores in memory)
   */
  async updateUserMetadata(userId: string, metadata: Record<string, string>): Promise<void> {
    const existing = LocalRecommendationProvider.userMetadata.get(userId);
    
    LocalRecommendationProvider.userMetadata.set(userId, {
      userId,
      metadata: existing ? { ...existing.metadata, ...metadata } : metadata,
    });

    console.log(`[LocalRecommendationProvider] Updated user metadata for: ${userId}`);
  }

  /**
   * Update item metadata (stores in memory)
   */
  async updateItemMetadata(itemId: string, metadata: Record<string, string>): Promise<void> {
    const existing = LocalRecommendationProvider.itemMetadata.get(itemId);
    
    LocalRecommendationProvider.itemMetadata.set(itemId, {
      itemId,
      metadata: existing ? { ...existing.metadata, ...metadata } : metadata,
    });

    console.log(`[LocalRecommendationProvider] Updated item metadata for: ${itemId}`);
  }

  /**
   * Get all interactions (for testing)
   */
  static getInteractions(userId?: string): StoredInteraction[] {
    if (userId) {
      return LocalRecommendationProvider.interactions.filter(i => i.userId === userId);
    }
    return [...LocalRecommendationProvider.interactions];
  }

  /**
   * Get user metadata (for testing)
   */
  static getUserMetadata(userId: string): Record<string, string> | undefined {
    return LocalRecommendationProvider.userMetadata.get(userId)?.metadata;
  }

  /**
   * Get item metadata (for testing)
   */
  static getItemMetadata(itemId: string): Record<string, string> | undefined {
    return LocalRecommendationProvider.itemMetadata.get(itemId)?.metadata;
  }

  /**
   * Clear all data (for testing)
   */
  static clearAll(): void {
    LocalRecommendationProvider.interactions = [];
    LocalRecommendationProvider.itemMetadata.clear();
    LocalRecommendationProvider.userMetadata.clear();
  }

  /**
   * Clear interactions (for testing)
   */
  static clearInteractions(): void {
    LocalRecommendationProvider.interactions = [];
  }

  /**
   * Clear metadata (for testing)
   */
  static clearMetadata(): void {
    LocalRecommendationProvider.itemMetadata.clear();
    LocalRecommendationProvider.userMetadata.clear();
  }
}
