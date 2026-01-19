/**
 * Indigo Search Service
 * 
 * Provides intelligent search capabilities for e-commerce:
 * - Full-text search with typo tolerance
 * - Faceted filtering
 * - Autocomplete suggestions
 * - Search analytics
 * 
 * Powered by: AWS OpenSearch
 */

import {
  searchProducts as opensearchSearch,
  getAutocompleteSuggestions as opensearchAutocomplete,
  indexProduct as opensearchIndex,
  bulkIndexProducts as opensearchBulkIndex,
  deleteProduct as opensearchDelete,
  createProductIndex as opensearchCreateIndex,
  isOpenSearchEnabled,
  type ProductDocument,
} from '@/infrastructure/aws/opensearch';
import type {
  IndigoServiceResult,
  SearchOptions,
  SearchResults,
  SearchHit,
  SearchFacet,
  AutocompleteResult,
  ServiceStatus,
} from './types';

// ============================================================================
// Indigo Search - Product Search
// ============================================================================

/**
 * Search products with intelligent full-text search
 * 
 * @example
 * ```ts
 * const results = await IndigoSearch.search({
 *   query: 'blue running shoes',
 *   tenantId: 'store-123',
 *   filters: { minPrice: 50, maxPrice: 200 },
 *   includeFacets: true,
 * });
 * ```
 */
export async function search(
  options: SearchOptions
): Promise<IndigoServiceResult<SearchResults<ProductDocument>>> {
  const startTime = Date.now();

  if (!isOpenSearchEnabled()) {
    return {
      success: false,
      error: 'Search service is not configured',
    };
  }

  try {
    // Map Indigo sort options to OpenSearch
    const sortField = options.sort?.field === 'relevance' 
      ? undefined 
      : options.sort?.field;

    const result = await opensearchSearch({
      query: options.query,
      tenantId: options.tenantId,
      filters: options.filters,
      facets: options.includeFacets 
        ? ['category', 'vendor', 'productType', 'priceRange', 'stockStatus']
        : undefined,
      sort: sortField ? { field: sortField, order: options.sort?.order || 'desc' } : undefined,
      page: options.page,
      pageSize: options.pageSize,
      highlight: options.includeHighlights,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Search failed',
      };
    }

    // Transform facets to Indigo format
    const facets: SearchFacet[] = result.facets 
      ? Object.entries(result.facets).map(([field, values]) => ({
          field,
          values,
        }))
      : [];

    return {
      success: true,
      data: {
        hits: result.hits || [],
        total: result.total || 0,
        facets,
        suggestions: result.suggestions,
        queryTime: Date.now() - startTime,
      },
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-search',
      },
    };
  } catch (error) {
    console.error('[IndigoSearch] Search failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}

/**
 * Get autocomplete suggestions as user types
 * 
 * @example
 * ```ts
 * const suggestions = await IndigoSearch.autocomplete('store-123', 'blu');
 * // Returns: [{ name: 'Blue T-Shirt', slug: 'blue-t-shirt', ... }]
 * ```
 */
export async function autocomplete(
  tenantId: string,
  query: string,
  limit: number = 8
): Promise<IndigoServiceResult<AutocompleteResult[]>> {
  const startTime = Date.now();

  if (!isOpenSearchEnabled()) {
    return {
      success: false,
      error: 'Search service is not configured',
    };
  }

  if (query.length < 2) {
    return {
      success: true,
      data: [],
    };
  }

  try {
    const result = await opensearchAutocomplete(tenantId, query, limit);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Autocomplete failed',
      };
    }

    const suggestions: AutocompleteResult[] = (result.hits || []).map(hit => ({
      name: hit.document.name,
      slug: hit.document.slug,
      image: hit.document.image,
    }));

    return {
      success: true,
      data: suggestions,
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-search',
      },
    };
  } catch (error) {
    console.error('[IndigoSearch] Autocomplete failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Autocomplete failed',
    };
  }
}

// ============================================================================
// Indigo Search - Index Management
// ============================================================================

/**
 * Index a product for search
 * 
 * @example
 * ```ts
 * await IndigoSearch.indexProduct('store-123', {
 *   id: 'prod-1',
 *   name: 'Blue T-Shirt',
 *   ...
 * });
 * ```
 */
export async function indexProduct(
  tenantId: string,
  product: ProductDocument
): Promise<IndigoServiceResult> {
  if (!isOpenSearchEnabled()) {
    return {
      success: false,
      error: 'Search service is not configured',
    };
  }

  try {
    const result = await opensearchIndex(tenantId, product);
    return {
      success: result.success,
      error: result.error,
    };
  } catch (error) {
    console.error('[IndigoSearch] Index product failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to index product',
    };
  }
}

/**
 * Bulk index multiple products
 * 
 * @example
 * ```ts
 * await IndigoSearch.bulkIndex('store-123', products);
 * ```
 */
export async function bulkIndex(
  tenantId: string,
  products: ProductDocument[]
): Promise<IndigoServiceResult<{ indexed: number }>> {
  if (!isOpenSearchEnabled()) {
    return {
      success: false,
      error: 'Search service is not configured',
    };
  }

  try {
    const result = await opensearchBulkIndex(tenantId, products);
    return {
      success: result.success,
      data: { indexed: products.length },
      error: result.error,
    };
  } catch (error) {
    console.error('[IndigoSearch] Bulk index failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to bulk index products',
    };
  }
}

/**
 * Remove a product from the search index
 * 
 * @example
 * ```ts
 * await IndigoSearch.removeProduct('store-123', 'prod-1');
 * ```
 */
export async function removeProduct(
  tenantId: string,
  productId: string
): Promise<IndigoServiceResult> {
  if (!isOpenSearchEnabled()) {
    return {
      success: false,
      error: 'Search service is not configured',
    };
  }

  try {
    const result = await opensearchDelete(tenantId, productId);
    return {
      success: result.success,
      error: result.error,
    };
  } catch (error) {
    console.error('[IndigoSearch] Remove product failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove product',
    };
  }
}

/**
 * Initialize search index for a tenant
 * 
 * @example
 * ```ts
 * await IndigoSearch.initializeIndex('store-123');
 * ```
 */
export async function initializeIndex(tenantId: string): Promise<IndigoServiceResult> {
  if (!isOpenSearchEnabled()) {
    return {
      success: false,
      error: 'Search service is not configured',
    };
  }

  try {
    const result = await opensearchCreateIndex(tenantId);
    return {
      success: result.success,
      error: result.error,
    };
  } catch (error) {
    console.error('[IndigoSearch] Initialize index failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize search index',
    };
  }
}

// ============================================================================
// Service Status
// ============================================================================

/**
 * Check if Indigo Search service is available
 */
export function isAvailable(): boolean {
  return isOpenSearchEnabled();
}

/**
 * Get Indigo Search service status
 */
export function getStatus(): ServiceStatus {
  const enabled = isOpenSearchEnabled();
  
  return {
    name: 'Indigo Search',
    enabled,
    healthy: enabled, // Would do health check in production
    lastChecked: new Date().toISOString(),
    features: [
      'Full-text Search',
      'Typo Tolerance',
      'Faceted Filtering',
      'Autocomplete',
      'Search Analytics',
    ],
  };
}

// ============================================================================
// Namespace Export
// ============================================================================

export const IndigoSearch = {
  search,
  autocomplete,
  indexProduct,
  bulkIndex,
  removeProduct,
  initializeIndex,
  isAvailable,
  getStatus,
};

// Re-export ProductDocument type for convenience
export type { ProductDocument };
