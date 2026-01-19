/**
 * Search Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SearchService } from '../search';
import { ServiceFactory } from '../factory';
import { LocalSearchProvider } from '../providers/local-search';

describe('SearchService', () => {
  beforeEach(() => {
    // Register local provider for testing
    ServiceFactory.registerSearchProvider('local', new LocalSearchProvider());
    process.env.SEARCH_PROVIDER = 'local';
  });

  describe('index', () => {
    it('should index a document successfully', async () => {
      const service = new SearchService();
      const result = await service.index({
        id: 'product-123',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Wireless Keyboard',
        description: 'Ergonomic wireless keyboard',
        price: 49.99,
        category: 'Electronics',
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate document ID', async () => {
      const service = new SearchService();
      const result = await service.index({
        id: '',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Product',
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Document ID');
    });

    it('should validate tenant ID', async () => {
      const service = new SearchService();
      const result = await service.index({
        id: 'product-123',
        tenantId: '',
        name: 'Product',
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tenant ID');
    });

    it('should validate document object', async () => {
      const service = new SearchService();
      const result = await service.index(null as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Document is required');
    });
  });

  describe('bulkIndex', () => {
    it('should bulk index documents successfully', async () => {
      const service = new SearchService();
      const result = await service.bulkIndex([
        { id: 'product-1', tenantId: '550e8400-e29b-41d4-a716-446655440000', name: 'Product 1', price: 10 },
        { id: 'product-2', tenantId: '550e8400-e29b-41d4-a716-446655440000', name: 'Product 2', price: 20 },
      ]);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate empty array', async () => {
      const service = new SearchService();
      const result = await service.bulkIndex([]);

      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should validate maximum bulk size', async () => {
      const service = new SearchService();
      const documents = Array.from({ length: 1001 }, (_, i) => ({
        id: `product-${i}`,
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        name: `Product ${i}`,
      }));
      const result = await service.bulkIndex(documents);

      expect(result.success).toBe(false);
      expect(result.error).toContain('1000');
    });

    it('should validate all documents have required fields', async () => {
      const service = new SearchService();
      const result = await service.bulkIndex([
        { id: 'product-1', tenantId: '550e8400-e29b-41d4-a716-446655440000', name: 'Product 1' },
        { id: '', tenantId: '550e8400-e29b-41d4-a716-446655440000', name: 'Product 2' },
      ] as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('id and tenantId');
    });
  });

  describe('delete', () => {
    it('should delete a document successfully', async () => {
      const service = new SearchService();
      const result = await service.delete('product-123', '550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate document ID', async () => {
      const service = new SearchService();
      const result = await service.delete('', '550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Document ID');
    });

    it('should validate tenant ID', async () => {
      const service = new SearchService();
      const result = await service.delete('product-123', '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tenant ID');
    });
  });

  describe('search', () => {
    it('should search documents successfully', async () => {
      const service = new SearchService();
      const result = await service.search({
        query: 'wireless keyboard',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.success).toBe(true);
      expect(result.hits).toBeDefined();
      expect(Array.isArray(result.hits)).toBe(true);
    });

    it('should validate query string', async () => {
      const service = new SearchService();
      const result = await service.search({
        query: '',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Query');
    });

    it('should validate tenant ID', async () => {
      const service = new SearchService();
      const result = await service.search({
        query: 'test',
        tenantId: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tenant ID');
    });

    it('should validate page number', async () => {
      const service = new SearchService();
      const result = await service.search({
        query: 'test',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        page: 0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Page');
    });

    it('should validate page size', async () => {
      const service = new SearchService();
      const result = await service.search({
        query: 'test',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        pageSize: 101,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Page size');
    });

    it('should handle search with filters', async () => {
      const service = new SearchService();
      const result = await service.search({
        query: 'keyboard',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        filters: { category: 'Electronics' },
      });

      expect(result.success).toBe(true);
      expect(result.hits).toBeDefined();
    });
  });

  describe('autocomplete', () => {
    it('should get autocomplete suggestions successfully', async () => {
      const service = new SearchService();
      const result = await service.autocomplete('wire', '550e8400-e29b-41d4-a716-446655440000', 5);

      expect(result.success).toBe(true);
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should validate query string', async () => {
      const service = new SearchService();
      const result = await service.autocomplete('', '550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Query');
    });

    it('should validate tenant ID', async () => {
      const service = new SearchService();
      const result = await service.autocomplete('test', '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tenant ID');
    });

    it('should validate limit range', async () => {
      const service = new SearchService();
      const result = await service.autocomplete('test', '550e8400-e29b-41d4-a716-446655440000', 51);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Limit');
    });

    it('should use default limit', async () => {
      const service = new SearchService();
      const result = await service.autocomplete('test', '550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(true);
      expect(result.suggestions).toBeDefined();
    });
  });

  describe('createIndex', () => {
    it('should create index successfully', async () => {
      const service = new SearchService();
      const result = await service.createIndex('550e8400-e29b-41d4-a716-446655440000');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate tenant ID', async () => {
      const service = new SearchService();
      const result = await service.createIndex('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tenant ID');
    });
  });

  describe('getProviderName', () => {
    it('should return provider name', () => {
      const service = new SearchService();
      const providerName = service.getProviderName();

      expect(providerName).toBe('LocalSearchProvider');
    });
  });
});
