/**
 * AWS OpenSearch Service
 * 
 * Provides advanced search capabilities:
 * - Full-text search with typo tolerance
 * - Faceted filtering
 * - Autocomplete suggestions
 * - Search analytics
 */

import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { defaultProvider } from '@aws-sdk/credential-provider-node';

// Configuration
const AWS_REGION = process.env.AWS_OPENSEARCH_REGION || process.env.AWS_REGION || 'us-east-1';
const DOMAIN_ENDPOINT = process.env.AWS_OPENSEARCH_DOMAIN_ENDPOINT;
const INDEX_PREFIX = process.env.AWS_OPENSEARCH_INDEX_PREFIX || 'indigo';

// OpenSearch domain info (will be available after domain creation completes)
const DOMAIN_NAME = 'indigo-search';
const DOMAIN_ARN = `arn:aws:es:us-east-1:014498637134:domain/${DOMAIN_NAME}`;

// Authentication (using fine-grained access control)
const OPENSEARCH_USERNAME = process.env.AWS_OPENSEARCH_USERNAME || 'admin';
const OPENSEARCH_PASSWORD = process.env.AWS_OPENSEARCH_PASSWORD || 'Indigo2024!Secure';

// Lazy-initialized client
let opensearchClient: Client | null = null;

function getOpenSearchClient(): Client {
  if (!opensearchClient) {
    if (!DOMAIN_ENDPOINT) {
      throw new Error('OpenSearch domain endpoint not configured');
    }

    opensearchClient = new Client({
      ...AwsSigv4Signer({
        region: AWS_REGION,
        service: 'es',
        getCredentials: () => {
          const credentialsProvider = defaultProvider();
          return credentialsProvider();
        },
      }),
      node: DOMAIN_ENDPOINT,
    });
  }
  return opensearchClient;
}

// Types
export interface ProductDocument {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  slug: string;
  categoryId?: string;
  categoryName?: string;
  price: number;
  compareAtPrice?: number;
  status: string;
  sku?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  images?: string[];
  rating?: number;
  reviewCount?: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult<T> {
  success: boolean;
  hits?: Array<{
    document: T;
    score: number;
    highlights?: Record<string, string[]>;
  }>;
  total?: number;
  facets?: Record<string, Array<{ value: string; count: number }>>;
  suggestions?: string[];
  error?: string;
}

export interface SearchOptions {
  query: string;
  tenantId: string;
  filters?: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    stockStatus?: string;
    vendor?: string;
    productType?: string;
  };
  facets?: string[];
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  page?: number;
  pageSize?: number;
  highlight?: boolean;
}

export interface IndexResult {
  success: boolean;
  error?: string;
}

/**
 * Check if OpenSearch is enabled and configured
 */
export function isOpenSearchEnabled(): boolean {
  return process.env.AWS_OPENSEARCH_ENABLED === 'true' && !!DOMAIN_ENDPOINT;
}

/**
 * Get the index name for a tenant's products
 */
function getProductIndexName(tenantId: string): string {
  return `${INDEX_PREFIX}-products-${tenantId}`;
}

/**
 * Create product index with mappings
 */
export async function createProductIndex(tenantId: string): Promise<IndexResult> {
  if (!isOpenSearchEnabled()) {
    return { success: false, error: 'OpenSearch not configured' };
  }

  const indexName = getProductIndexName(tenantId);

  try {
    const client = getOpenSearchClient();
    
    // Check if index exists
    const exists = await client.indices.exists({ index: indexName });
    if (exists.body) {
      return { success: true };
    }

    // Create index with mappings
    await client.indices.create({
      index: indexName,
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
          analysis: {
            analyzer: {
              product_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding', 'product_synonyms'],
              },
              autocomplete_analyzer: {
                type: 'custom',
                tokenizer: 'edge_ngram_tokenizer',
                filter: ['lowercase'],
              },
            },
            tokenizer: {
              edge_ngram_tokenizer: {
                type: 'edge_ngram',
                min_gram: 2,
                max_gram: 20,
                token_chars: ['letter', 'digit'],
              },
            },
            filter: {
              product_synonyms: {
                type: 'synonym',
                synonyms: [
                  'shirt, tee, t-shirt',
                  'pants, trousers, jeans',
                  'shoes, sneakers, footwear',
                ],
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            tenantId: { type: 'keyword' },
            name: {
              type: 'text',
              analyzer: 'product_analyzer',
              fields: {
                autocomplete: {
                  type: 'text',
                  analyzer: 'autocomplete_analyzer',
                  search_analyzer: 'standard',
                },
                keyword: { type: 'keyword' },
              },
            },
            description: {
              type: 'text',
              analyzer: 'product_analyzer',
            },
            slug: { type: 'keyword' },
            categoryId: { type: 'keyword' },
            categoryName: {
              type: 'text',
              fields: { keyword: { type: 'keyword' } },
            },
            price: { type: 'float' },
            compareAtPrice: { type: 'float' },
            status: { type: 'keyword' },
            sku: { type: 'keyword' },
            vendor: {
              type: 'text',
              fields: { keyword: { type: 'keyword' } },
            },
            productType: {
              type: 'text',
              fields: { keyword: { type: 'keyword' } },
            },
            tags: { type: 'keyword' },
            images: { type: 'keyword' },
            rating: { type: 'float' },
            reviewCount: { type: 'integer' },
            stockStatus: { type: 'keyword' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
          },
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error('OpenSearch create index error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create index',
    };
  }
}

/**
 * Index a single product
 */
export async function indexProduct(
  tenantId: string,
  product: ProductDocument
): Promise<IndexResult> {
  if (!isOpenSearchEnabled()) {
    return { success: false, error: 'OpenSearch not configured' };
  }

  const indexName = getProductIndexName(tenantId);

  try {
    const client = getOpenSearchClient();
    await client.index({
      index: indexName,
      id: product.id,
      body: product,
      refresh: true,
    });

    return { success: true };
  } catch (error) {
    console.error('OpenSearch index product error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to index product',
    };
  }
}

/**
 * Bulk index products
 */
export async function bulkIndexProducts(
  tenantId: string,
  products: ProductDocument[]
): Promise<IndexResult> {
  if (!isOpenSearchEnabled()) {
    return { success: false, error: 'OpenSearch not configured' };
  }

  if (products.length === 0) {
    return { success: true };
  }

  const indexName = getProductIndexName(tenantId);

  try {
    const client = getOpenSearchClient();
    
    const body = products.flatMap(product => [
      { index: { _index: indexName, _id: product.id } },
      product,
    ]);

    const response = await client.bulk({ body, refresh: true });

    if (response.body.errors) {
      const errors = response.body.items
        .filter((item: { index?: { error?: unknown } }) => item.index?.error)
        .map((item: { index?: { error?: unknown } }) => item.index?.error);
      console.error('OpenSearch bulk index errors:', errors);
      return { success: false, error: 'Some products failed to index' };
    }

    return { success: true };
  } catch (error) {
    console.error('OpenSearch bulk index error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to bulk index products',
    };
  }
}

/**
 * Delete a product from the index
 */
export async function deleteProduct(
  tenantId: string,
  productId: string
): Promise<IndexResult> {
  if (!isOpenSearchEnabled()) {
    return { success: false, error: 'OpenSearch not configured' };
  }

  const indexName = getProductIndexName(tenantId);

  try {
    const client = getOpenSearchClient();
    await client.delete({
      index: indexName,
      id: productId,
      refresh: true,
    });

    return { success: true };
  } catch (error) {
    console.error('OpenSearch delete product error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product',
    };
  }
}

/**
 * Search products with full-text search and faceting
 */
export async function searchProducts(
  options: SearchOptions
): Promise<SearchResult<ProductDocument>> {
  if (!isOpenSearchEnabled()) {
    return { success: false, error: 'OpenSearch not configured' };
  }

  const {
    query,
    tenantId,
    filters = {},
    facets = [],
    sort,
    page = 1,
    pageSize = 20,
    highlight = true,
  } = options;

  const indexName = getProductIndexName(tenantId);

  try {
    const client = getOpenSearchClient();

    // Build query
    const must: object[] = [];
    const filter: object[] = [{ term: { tenantId } }];

    // Full-text search
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['name^3', 'name.autocomplete^2', 'description', 'categoryName', 'vendor', 'tags'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Filters
    if (filters.categoryId) {
      filter.push({ term: { categoryId: filters.categoryId } });
    }
    if (filters.status) {
      filter.push({ term: { status: filters.status } });
    }
    if (filters.stockStatus) {
      filter.push({ term: { stockStatus: filters.stockStatus } });
    }
    if (filters.vendor) {
      filter.push({ term: { 'vendor.keyword': filters.vendor } });
    }
    if (filters.productType) {
      filter.push({ term: { 'productType.keyword': filters.productType } });
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const range: { gte?: number; lte?: number } = {};
      if (filters.minPrice !== undefined) range.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) range.lte = filters.maxPrice;
      filter.push({ range: { price: range } });
    }

    // Build aggregations for facets
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aggs: Record<string, any> = {};
    if (facets.includes('category')) {
      aggs.categories = { terms: { field: 'categoryName.keyword', size: 20 } };
    }
    if (facets.includes('vendor')) {
      aggs.vendors = { terms: { field: 'vendor.keyword', size: 20 } };
    }
    if (facets.includes('productType')) {
      aggs.productTypes = { terms: { field: 'productType.keyword', size: 20 } };
    }
    if (facets.includes('priceRange')) {
      aggs.priceRanges = {
        range: {
          field: 'price',
          ranges: [
            { key: 'Under $25', to: 25 },
            { key: '$25 - $50', from: 25, to: 50 },
            { key: '$50 - $100', from: 50, to: 100 },
            { key: '$100 - $200', from: 100, to: 200 },
            { key: 'Over $200', from: 200 },
          ],
        },
      };
    }
    if (facets.includes('stockStatus')) {
      aggs.stockStatuses = { terms: { field: 'stockStatus', size: 10 } };
    }

    // Build sort
    const sortClause: Array<Record<string, { order: 'asc' | 'desc' }>> = [];
    if (sort) {
      sortClause.push({ [sort.field]: { order: sort.order } });
    } else if (query) {
      sortClause.push({ _score: { order: 'desc' } });
    } else {
      sortClause.push({ createdAt: { order: 'desc' } });
    }

    const response = await client.search({
      index: indexName,
      body: {
        from: (page - 1) * pageSize,
        size: pageSize,
        query: {
          bool: {
            must: must.length > 0 ? must : [{ match_all: {} }],
            filter,
          },
        },
        sort: sortClause,
        aggs: Object.keys(aggs).length > 0 ? aggs : undefined,
        highlight: highlight
          ? {
              fields: {
                name: {},
                description: { fragment_size: 150 },
              },
              pre_tags: ['<mark>'],
              post_tags: ['</mark>'],
            }
          : undefined,
      },
    });

    // Parse results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hits = response.body.hits.hits.map((hit: any) => ({
      document: hit._source as ProductDocument,
      score: hit._score as number,
      highlights: hit.highlight as Record<string, string[]> | undefined,
    }));

    // Parse facets
    const parsedFacets: Record<string, Array<{ value: string; count: number }>> = {};
    if (response.body.aggregations) {
      for (const [key, agg] of Object.entries(response.body.aggregations)) {
        const aggData = agg as { buckets?: Array<{ key: string; doc_count: number }> };
        if (aggData.buckets) {
          parsedFacets[key] = aggData.buckets.map(bucket => ({
            value: bucket.key,
            count: bucket.doc_count,
          }));
        }
      }
    }

    const total = typeof response.body.hits.total === 'number' 
      ? response.body.hits.total 
      : response.body.hits.total?.value || 0;

    return {
      success: true,
      hits,
      total,
      facets: parsedFacets,
    };
  } catch (error) {
    console.error('OpenSearch search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}

/**
 * Get autocomplete suggestions
 */
export async function getAutocompleteSuggestions(
  tenantId: string,
  query: string,
  limit: number = 10
): Promise<SearchResult<{ name: string; slug: string; image?: string }>> {
  if (!isOpenSearchEnabled()) {
    return { success: false, error: 'OpenSearch not configured' };
  }

  const indexName = getProductIndexName(tenantId);

  try {
    const client = getOpenSearchClient();

    const response = await client.search({
      index: indexName,
      body: {
        size: limit,
        query: {
          bool: {
            must: [
              {
                match: {
                  'name.autocomplete': {
                    query,
                    operator: 'and',
                  },
                },
              },
            ],
            filter: [
              { term: { tenantId } },
              { term: { status: 'active' } },
            ],
          },
        },
        _source: ['name', 'slug', 'images'],
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const suggestions = response.body.hits.hits.map((hit: any) => ({
      document: {
        name: hit._source?.name as string,
        slug: hit._source?.slug as string,
        image: (hit._source?.images as string[])?.[0],
      },
      score: 1,
    }));

    const total = typeof response.body.hits.total === 'number' 
      ? response.body.hits.total 
      : response.body.hits.total?.value || 0;

    return {
      success: true,
      hits: suggestions,
      total,
    };
  } catch (error) {
    console.error('OpenSearch autocomplete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Autocomplete failed',
    };
  }
}

/**
 * Get popular search terms (for search analytics)
 */
export async function getPopularSearchTerms(
  tenantId: string,
  limit: number = 10
): Promise<{ success: boolean; terms?: string[]; error?: string }> {
  // This would typically query a separate analytics index
  // For now, return empty array - implement with search analytics later
  return { success: true, terms: [] };
}
