/**
 * AWS Search Provider
 * 
 * Implements SearchProvider interface using AWS OpenSearch
 * Wraps existing OpenSearch implementation from src/infrastructure/aws/opensearch.ts
 */

import type { SearchProvider, SearchDocument, SearchQuery, SearchResults } from './types';
import {
  indexProduct,
  bulkIndexProducts,
  deleteProduct,
  searchProducts,
  getAutocompleteSuggestions,
  createProductIndex,
  type ProductDocument,
  type SearchOptions,
} from '@/infrastructure/aws/opensearch';

export class AWSSearchProvider implements SearchProvider {
  /**
   * Index a single document
   */
  async index(document: SearchDocument): Promise<void> {
    // Convert SearchDocument to ProductDocument
    const productDoc: ProductDocument = {
      id: document.id,
      tenantId: document.tenantId,
      name: (document.name as string) || '',
      description: document.description as string | undefined,
      slug: (document.slug as string) || '',
      categoryId: document.categoryId as string | undefined,
      categoryName: document.categoryName as string | undefined,
      price: (document.price as number) || 0,
      compareAtPrice: document.compareAtPrice as number | undefined,
      status: (document.status as string) || 'active',
      sku: document.sku as string | undefined,
      vendor: document.vendor as string | undefined,
      productType: document.productType as string | undefined,
      tags: document.tags as string[] | undefined,
      images: document.images as string[] | undefined,
      rating: document.rating as number | undefined,
      reviewCount: document.reviewCount as number | undefined,
      stockStatus: (document.stockStatus as 'in_stock' | 'low_stock' | 'out_of_stock') || 'in_stock',
      createdAt: (document.createdAt as string) || new Date().toISOString(),
      updatedAt: (document.updatedAt as string) || new Date().toISOString(),
    };

    const result = await indexProduct(document.tenantId, productDoc);

    if (!result.success) {
      throw new Error(result.error || 'Failed to index document');
    }
  }

  /**
   * Bulk index documents
   */
  async bulkIndex(documents: SearchDocument[]): Promise<void> {
    if (documents.length === 0) return;

    // Group by tenant ID
    const byTenant = new Map<string, ProductDocument[]>();

    for (const doc of documents) {
      const productDoc: ProductDocument = {
        id: doc.id,
        tenantId: doc.tenantId,
        name: (doc.name as string) || '',
        description: doc.description as string | undefined,
        slug: (doc.slug as string) || '',
        categoryId: doc.categoryId as string | undefined,
        categoryName: doc.categoryName as string | undefined,
        price: (doc.price as number) || 0,
        compareAtPrice: doc.compareAtPrice as number | undefined,
        status: (doc.status as string) || 'active',
        sku: doc.sku as string | undefined,
        vendor: doc.vendor as string | undefined,
        productType: doc.productType as string | undefined,
        tags: doc.tags as string[] | undefined,
        images: doc.images as string[] | undefined,
        rating: doc.rating as number | undefined,
        reviewCount: doc.reviewCount as number | undefined,
        stockStatus: (doc.stockStatus as 'in_stock' | 'low_stock' | 'out_of_stock') || 'in_stock',
        createdAt: (doc.createdAt as string) || new Date().toISOString(),
        updatedAt: (doc.updatedAt as string) || new Date().toISOString(),
      };

      const existing = byTenant.get(doc.tenantId) || [];
      existing.push(productDoc);
      byTenant.set(doc.tenantId, existing);
    }

    // Bulk index per tenant
    for (const [tenantId, products] of byTenant.entries()) {
      const result = await bulkIndexProducts(tenantId, products);

      if (!result.success) {
        throw new Error(result.error || 'Failed to bulk index documents');
      }
    }
  }

  /**
   * Delete a document
   */
  async delete(documentId: string, tenantId: string): Promise<void> {
    const result = await deleteProduct(tenantId, documentId);

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete document');
    }
  }

  /**
   * Search documents
   */
  async search<T = SearchDocument>(query: SearchQuery): Promise<SearchResults<T>> {
    // Convert SearchQuery to SearchOptions
    const searchOptions: SearchOptions = {
      query: query.query,
      tenantId: query.tenantId,
      filters: query.filters as SearchOptions['filters'],
      facets: query.facets,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
      highlight: query.highlight,
    };

    const result = await searchProducts(searchOptions);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    // Convert hits to generic type
    const hits = result.hits?.map(hit => ({
      document: hit.document as unknown as T,
      score: hit.score,
      highlights: hit.highlights,
    }));

    return {
      success: true,
      hits,
      total: result.total,
      facets: result.facets,
    };
  }

  /**
   * Get autocomplete suggestions
   */
  async autocomplete(query: string, tenantId: string, limit: number = 10): Promise<string[]> {
    const result = await getAutocompleteSuggestions(tenantId, query, limit);

    if (!result.success || !result.hits) {
      return [];
    }

    // Extract product names from hits
    return result.hits.map(hit => hit.document.name);
  }

  /**
   * Create index for a tenant
   */
  async createIndex(tenantId: string): Promise<void> {
    const result = await createProductIndex(tenantId);

    if (!result.success) {
      throw new Error(result.error || 'Failed to create index');
    }
  }

  /**
   * Delete index for a tenant (not implemented in OpenSearch wrapper)
   */
  async deleteIndex(tenantId: string): Promise<void> {
    // Not implemented in the OpenSearch wrapper
    // Would need to add deleteProductIndex() to opensearch.ts
    console.warn(`[AWSSearchProvider] Delete index not implemented for tenant: ${tenantId}`);
  }
}
