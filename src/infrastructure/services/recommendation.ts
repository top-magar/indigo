/**
 * Recommendation Service
 * 
 * Unified recommendation interface with automatic provider selection,
 * error handling, retry logic, circuit breaker, and observability
 */

import { ServiceFactory } from './factory';
import { ServiceErrorHandler } from './error-handler';
import { ServiceObservability } from './observability';
import { ServiceValidator } from './validation';
import type {
  RecommendationProvider,
  RecommendationOptions,
  Recommendation,
  SimilarItemsOptions,
  RankedItem,
} from './providers/types';

export class RecommendationService {
  private provider: RecommendationProvider;

  constructor() {
    this.provider = ServiceFactory.getRecommendationProvider();
  }

  /**
   * Get personalized recommendations with validation, retry, circuit breaker, and observability
   */
  async getRecommendations(
    userId: string,
    options?: RecommendationOptions
  ): Promise<{ success: boolean; recommendations?: Recommendation[]; error?: string }> {
    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      return { success: false, error: 'User ID is required' };
    }

    const userIdValidation = ServiceValidator.validateUUID(userId);
    if (!userIdValidation.valid) {
      return { success: false, error: `Invalid user ID: ${userIdValidation.error}` };
    }

    // Validate options
    if (options?.numResults !== undefined && (options.numResults < 1 || options.numResults > 100)) {
      return { success: false, error: 'numResults must be between 1 and 100' };
    }

    // Track and execute with retry and circuit breaker
    try {
      const recommendations = await ServiceObservability.trackOperation(
        'getRecommendations',
        this.provider.constructor.name,
        () => ServiceObservability.withCircuitBreaker(
          'recommendation-get-recommendations',
          () => ServiceErrorHandler.withRetry(
            () => this.provider.getRecommendations(userId, options),
            {
              maxRetries: 2,
              backoffMs: 500,
              onRetry: (attempt, error) => {
                ServiceObservability.log(
                  'warn',
                  `Get recommendations retry attempt ${attempt}`,
                  'getRecommendations',
                  this.provider.constructor.name,
                  { error: error.message, userId }
                );
              },
            }
          )
        ),
        {
          metadata: {
            userId,
            numResults: options?.numResults,
            hasContext: !!options?.context,
            hasFilters: !!options?.filterValues,
          },
        }
      );

      return { success: true, recommendations };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Get recommendations failed after retries',
        'getRecommendations',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recommendations',
      };
    }
  }

  /**
   * Get similar items with validation, retry, circuit breaker, and observability
   */
  async getSimilarItems(
    itemId: string,
    options?: SimilarItemsOptions
  ): Promise<{ success: boolean; recommendations?: Recommendation[]; error?: string }> {
    // Validate item ID
    if (!itemId || typeof itemId !== 'string') {
      return { success: false, error: 'Item ID is required' };
    }

    const itemIdValidation = ServiceValidator.validateUUID(itemId);
    if (!itemIdValidation.valid) {
      return { success: false, error: `Invalid item ID: ${itemIdValidation.error}` };
    }

    // Validate options
    if (options?.numResults !== undefined && (options.numResults < 1 || options.numResults > 100)) {
      return { success: false, error: 'numResults must be between 1 and 100' };
    }

    // Track and execute with retry and circuit breaker
    try {
      const recommendations = await ServiceObservability.trackOperation(
        'getSimilarItems',
        this.provider.constructor.name,
        () => ServiceObservability.withCircuitBreaker(
          'recommendation-get-similar-items',
          () => ServiceErrorHandler.withRetry(
            () => this.provider.getSimilarItems(itemId, options),
            {
              maxRetries: 2,
              backoffMs: 500,
              onRetry: (attempt, error) => {
                ServiceObservability.log(
                  'warn',
                  `Get similar items retry attempt ${attempt}`,
                  'getSimilarItems',
                  this.provider.constructor.name,
                  { error: error.message, itemId }
                );
              },
            }
          )
        ),
        {
          metadata: {
            itemId,
            numResults: options?.numResults,
            hasFilters: !!options?.filterValues,
          },
        }
      );

      return { success: true, recommendations };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Get similar items failed after retries',
        'getSimilarItems',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get similar items',
      };
    }
  }

  /**
   * Rank items for a user with validation, retry, and observability
   */
  async rankItems(
    userId: string,
    itemIds: string[]
  ): Promise<{ success: boolean; rankedItems?: RankedItem[]; error?: string }> {
    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      return { success: false, error: 'User ID is required' };
    }

    const userIdValidation = ServiceValidator.validateUUID(userId);
    if (!userIdValidation.valid) {
      return { success: false, error: `Invalid user ID: ${userIdValidation.error}` };
    }

    // Validate item IDs
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return { success: false, error: 'Item IDs array is required and cannot be empty' };
    }

    if (itemIds.length > 500) {
      return { success: false, error: 'Cannot rank more than 500 items at once' };
    }

    for (const itemId of itemIds) {
      const itemIdValidation = ServiceValidator.validateUUID(itemId);
      if (!itemIdValidation.valid) {
        return { success: false, error: `Invalid item ID: ${itemIdValidation.error}` };
      }
    }

    // Track and execute with retry
    try {
      const rankedItems = await ServiceObservability.trackOperation(
        'rankItems',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.rankItems(userId, itemIds),
          {
            maxRetries: 2,
            backoffMs: 500,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Rank items retry attempt ${attempt}`,
                'rankItems',
                this.provider.constructor.name,
                { error: error.message, userId, itemCount: itemIds.length }
              );
            },
          }
        ),
        {
          metadata: {
            userId,
            itemCount: itemIds.length,
          },
        }
      );

      return { success: true, rankedItems };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Rank items failed after retries',
        'rankItems',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to rank items',
      };
    }
  }

  /**
   * Track user interaction with validation, retry, and observability
   */
  async trackInteraction(
    userId: string,
    itemId: string,
    eventType: string,
    sessionId?: string,
    properties?: Record<string, string>
  ): Promise<{ success: boolean; error?: string }> {
    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      return { success: false, error: 'User ID is required' };
    }

    const userIdValidation = ServiceValidator.validateUUID(userId);
    if (!userIdValidation.valid) {
      return { success: false, error: `Invalid user ID: ${userIdValidation.error}` };
    }

    // Validate item ID
    if (!itemId || typeof itemId !== 'string') {
      return { success: false, error: 'Item ID is required' };
    }

    const itemIdValidation = ServiceValidator.validateUUID(itemId);
    if (!itemIdValidation.valid) {
      return { success: false, error: `Invalid item ID: ${itemIdValidation.error}` };
    }

    // Validate event type
    if (!eventType || typeof eventType !== 'string') {
      return { success: false, error: 'Event type is required' };
    }

    const eventTypeValidation = ServiceValidator.validateTextLength(eventType, 50, 1);
    if (!eventTypeValidation.valid) {
      return { success: false, error: `Invalid event type: ${eventTypeValidation.error}` };
    }

    // Track and execute with retry
    try {
      await ServiceObservability.trackOperation(
        'trackInteraction',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.trackInteraction(userId, itemId, eventType, sessionId, properties),
          {
            maxRetries: 2,
            backoffMs: 200,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Track interaction retry attempt ${attempt}`,
                'trackInteraction',
                this.provider.constructor.name,
                { error: error.message, userId, itemId, eventType }
              );
            },
          }
        ),
        {
          metadata: {
            userId,
            itemId,
            eventType,
            hasSessionId: !!sessionId,
            hasProperties: !!properties,
          },
        }
      );

      return { success: true };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Track interaction failed after retries',
        'trackInteraction',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track interaction',
      };
    }
  }

  /**
   * Update user metadata with validation, retry, and observability
   */
  async updateUserMetadata(
    userId: string,
    metadata: Record<string, string>
  ): Promise<{ success: boolean; error?: string }> {
    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      return { success: false, error: 'User ID is required' };
    }

    const userIdValidation = ServiceValidator.validateUUID(userId);
    if (!userIdValidation.valid) {
      return { success: false, error: `Invalid user ID: ${userIdValidation.error}` };
    }

    // Validate metadata
    if (!metadata || typeof metadata !== 'object') {
      return { success: false, error: 'Metadata is required' };
    }

    // Track and execute with retry
    try {
      await ServiceObservability.trackOperation(
        'updateUserMetadata',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.updateUserMetadata(userId, metadata),
          {
            maxRetries: 2,
            backoffMs: 300,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Update user metadata retry attempt ${attempt}`,
                'updateUserMetadata',
                this.provider.constructor.name,
                { error: error.message, userId }
              );
            },
          }
        ),
        {
          metadata: {
            userId,
            metadataKeys: Object.keys(metadata),
          },
        }
      );

      return { success: true };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Update user metadata failed after retries',
        'updateUserMetadata',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user metadata',
      };
    }
  }

  /**
   * Update item metadata with validation, retry, and observability
   */
  async updateItemMetadata(
    itemId: string,
    metadata: Record<string, string>
  ): Promise<{ success: boolean; error?: string }> {
    // Validate item ID
    if (!itemId || typeof itemId !== 'string') {
      return { success: false, error: 'Item ID is required' };
    }

    const itemIdValidation = ServiceValidator.validateUUID(itemId);
    if (!itemIdValidation.valid) {
      return { success: false, error: `Invalid item ID: ${itemIdValidation.error}` };
    }

    // Validate metadata
    if (!metadata || typeof metadata !== 'object') {
      return { success: false, error: 'Metadata is required' };
    }

    // Track and execute with retry
    try {
      await ServiceObservability.trackOperation(
        'updateItemMetadata',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.updateItemMetadata(itemId, metadata),
          {
            maxRetries: 2,
            backoffMs: 300,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Update item metadata retry attempt ${attempt}`,
                'updateItemMetadata',
                this.provider.constructor.name,
                { error: error.message, itemId }
              );
            },
          }
        ),
        {
          metadata: {
            itemId,
            metadataKeys: Object.keys(metadata),
          },
        }
      );

      return { success: true };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Update item metadata failed after retries',
        'updateItemMetadata',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update item metadata',
      };
    }
  }

  /**
   * Get the current provider name
   */
  getProviderName(): string {
    return this.provider.constructor.name;
  }
}
