/**
 * Recommendation Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RecommendationService } from '../recommendation';
import { ServiceFactory } from '../factory';
import { LocalRecommendationProvider } from '../providers/local-recommendation';

describe('RecommendationService', () => {
  beforeEach(() => {
    // Register local provider for testing
    ServiceFactory.registerRecommendationProvider('local', new LocalRecommendationProvider());
    process.env.RECOMMENDATION_PROVIDER = 'local';
  });

  describe('getRecommendations', () => {
    it('should get personalized recommendations successfully', async () => {
      const service = new RecommendationService();
      const result = await service.getRecommendations('550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(true);
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should validate user ID', async () => {
      const service = new RecommendationService();
      const result = await service.getRecommendations('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('User ID');
    });

    it('should validate user ID format', async () => {
      const service = new RecommendationService();
      const result = await service.getRecommendations('invalid-uuid');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid user ID');
    });

    it('should validate numResults range', async () => {
      const service = new RecommendationService();
      const result = await service.getRecommendations(
        '550e8400-e29b-41d4-a716-446655440000',
        { numResults: 101 }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('numResults');
    });

    it('should handle recommendations with options', async () => {
      const service = new RecommendationService();
      const result = await service.getRecommendations(
        '550e8400-e29b-41d4-a716-446655440000',
        {
          numResults: 5,
          context: { category: 'Electronics' },
          filterValues: { inStock: 'true' },
        }
      );

      expect(result.success).toBe(true);
      expect(result.recommendations).toBeDefined();
    });
  });

  describe('getSimilarItems', () => {
    it('should get similar items successfully', async () => {
      const service = new RecommendationService();
      const result = await service.getSimilarItems('550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(true);
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should validate item ID', async () => {
      const service = new RecommendationService();
      const result = await service.getSimilarItems('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Item ID');
    });

    it('should validate item ID format', async () => {
      const service = new RecommendationService();
      const result = await service.getSimilarItems('invalid-uuid');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid item ID');
    });

    it('should validate numResults range', async () => {
      const service = new RecommendationService();
      const result = await service.getSimilarItems(
        '550e8400-e29b-41d4-a716-446655440000',
        { numResults: 0 }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('numResults');
    });

    it('should handle similar items with filters', async () => {
      const service = new RecommendationService();
      const result = await service.getSimilarItems(
        '550e8400-e29b-41d4-a716-446655440000',
        {
          numResults: 10,
          filterValues: { category: 'Electronics' },
        }
      );

      expect(result.success).toBe(true);
      expect(result.recommendations).toBeDefined();
    });
  });

  describe('rankItems', () => {
    it('should rank items successfully', async () => {
      const service = new RecommendationService();
      const result = await service.rankItems(
        '550e8400-e29b-41d4-a716-446655440000',
        [
          '550e8400-e29b-41d4-a716-446655440001',
          '550e8400-e29b-41d4-a716-446655440002',
          '550e8400-e29b-41d4-a716-446655440003',
        ]
      );

      expect(result.success).toBe(true);
      expect(result.rankedItems).toBeDefined();
      expect(Array.isArray(result.rankedItems)).toBe(true);
    });

    it('should validate user ID', async () => {
      const service = new RecommendationService();
      const result = await service.rankItems('', ['550e8400-e29b-41d4-a716-446655440001']);

      expect(result.success).toBe(false);
      expect(result.error).toContain('User ID');
    });

    it('should validate user ID format', async () => {
      const service = new RecommendationService();
      const result = await service.rankItems('invalid-uuid', ['550e8400-e29b-41d4-a716-446655440001']);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid user ID');
    });

    it('should validate empty item IDs array', async () => {
      const service = new RecommendationService();
      const result = await service.rankItems('550e8400-e29b-41d4-a716-446655440000', []);

      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should validate maximum items', async () => {
      const service = new RecommendationService();
      const itemIds = Array.from({ length: 501 }, (_, i) => `550e8400-e29b-41d4-a716-44665544${String(i).padStart(4, '0')}`);
      const result = await service.rankItems('550e8400-e29b-41d4-a716-446655440000', itemIds);

      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });

    it('should validate item ID format', async () => {
      const service = new RecommendationService();
      const result = await service.rankItems(
        '550e8400-e29b-41d4-a716-446655440000',
        ['invalid-uuid']
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid item ID');
    });
  });

  describe('trackInteraction', () => {
    it('should track interaction successfully', async () => {
      const service = new RecommendationService();
      const result = await service.trackInteraction(
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440001',
        'view'
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate user ID', async () => {
      const service = new RecommendationService();
      const result = await service.trackInteraction(
        '',
        '550e8400-e29b-41d4-a716-446655440001',
        'view'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('User ID');
    });

    it('should validate user ID format', async () => {
      const service = new RecommendationService();
      const result = await service.trackInteraction(
        'invalid-uuid',
        '550e8400-e29b-41d4-a716-446655440001',
        'view'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid user ID');
    });

    it('should validate item ID', async () => {
      const service = new RecommendationService();
      const result = await service.trackInteraction(
        '550e8400-e29b-41d4-a716-446655440000',
        '',
        'view'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Item ID');
    });

    it('should validate item ID format', async () => {
      const service = new RecommendationService();
      const result = await service.trackInteraction(
        '550e8400-e29b-41d4-a716-446655440000',
        'invalid-uuid',
        'view'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid item ID');
    });

    it('should validate event type', async () => {
      const service = new RecommendationService();
      const result = await service.trackInteraction(
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440001',
        ''
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Event type');
    });

    it('should track interaction with session and properties', async () => {
      const service = new RecommendationService();
      const result = await service.trackInteraction(
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440001',
        'purchase',
        'session-123',
        { price: '49.99', category: 'Electronics' }
      );

      expect(result.success).toBe(true);
    });
  });

  describe('updateUserMetadata', () => {
    it('should update user metadata successfully', async () => {
      const service = new RecommendationService();
      const result = await service.updateUserMetadata(
        '550e8400-e29b-41d4-a716-446655440000',
        { age: '25', location: 'US' }
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate user ID', async () => {
      const service = new RecommendationService();
      const result = await service.updateUserMetadata('', { age: '25' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('User ID');
    });

    it('should validate user ID format', async () => {
      const service = new RecommendationService();
      const result = await service.updateUserMetadata('invalid-uuid', { age: '25' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid user ID');
    });

    it('should validate metadata object', async () => {
      const service = new RecommendationService();
      const result = await service.updateUserMetadata(
        '550e8400-e29b-41d4-a716-446655440000',
        null as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Metadata');
    });
  });

  describe('updateItemMetadata', () => {
    it('should update item metadata successfully', async () => {
      const service = new RecommendationService();
      const result = await service.updateItemMetadata(
        '550e8400-e29b-41d4-a716-446655440000',
        { category: 'Electronics', brand: 'Acme' }
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate item ID', async () => {
      const service = new RecommendationService();
      const result = await service.updateItemMetadata('', { category: 'Electronics' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Item ID');
    });

    it('should validate item ID format', async () => {
      const service = new RecommendationService();
      const result = await service.updateItemMetadata('invalid-uuid', { category: 'Electronics' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid item ID');
    });

    it('should validate metadata object', async () => {
      const service = new RecommendationService();
      const result = await service.updateItemMetadata(
        '550e8400-e29b-41d4-a716-446655440000',
        null as any
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Metadata');
    });
  });

  describe('getProviderName', () => {
    it('should return provider name', () => {
      const service = new RecommendationService();
      const providerName = service.getProviderName();

      expect(providerName).toBe('LocalRecommendationProvider');
    });
  });
});
