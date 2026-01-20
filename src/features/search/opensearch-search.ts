'use server';

import { db } from '@/infrastructure/db';
import { products, categories } from '@/db/schema';
import { eq, and, ilike, or, sql, desc, asc, gte, lte } from 'drizzle-orm';
import { SearchService } from '@/infrastructure/services';

interface SearchFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  vendor?: string;
}

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string;
  compareAtPrice?: string | null;
  images: { url: string; alt?: string }[];
  categoryName?: string;
  rating?: number;
  reviewCount?: number;
  stockStatus?: string;
  highlights?: Record<string, string[]>;
}

interface SearchResponse {
  success: boolean;
  products: SearchResult[];
  total: number;
  facets?: Record<string, Array<{ value: string; count: number }>>;
  source: 'opensearch' | 'database';
  error?: string;
}

/**
 * Search products with OpenSearch or fallback to database
 */
export async function searchProducts(
  tenantId: string,
  query: string,
  options?: {
    filters?: SearchFilters;
    sort?: { field: string; order: 'asc' | 'desc' };
    page?: number;
    pageSize?: number;
    includeFacets?: boolean;
  }
): Promise<SearchResponse> {
  const {
    filters = {},
    sort,
    page = 1,
    pageSize = 20,
    includeFacets = false,
  } = options || {};

  // Try SearchService (handles OpenSearch with automatic fallback)
  try {
    const searchService = new SearchService();
    
    const result = await searchService.search({
      query,
      tenantId,
      filters: {
        categoryId: filters.categoryId,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        status: filters.status || 'active',
        stockStatus: filters.stockStatus,
        vendor: filters.vendor,
      },
      facets: includeFacets 
        ? ['category', 'vendor', 'priceRange', 'stockStatus'] 
        : undefined,
      sort,
      page,
      pageSize,
      highlight: true,
    });

    if (result.success && result.hits) {
      return {
        success: true,
        products: result.hits.map(hit => {
          const doc = hit.document as Record<string, unknown>;
          return {
            id: String(doc.id || ''),
            name: String(doc.name || ''),
            slug: String(doc.slug || ''),
            description: String(doc.description || ''),
            price: String(doc.price || '0'),
            compareAtPrice: doc.compareAtPrice 
              ? String(doc.compareAtPrice) 
              : null,
            images: Array.isArray(doc.images) 
              ? doc.images.map((url: unknown) => ({ url: String(url) })) 
              : [],
            categoryName: String(doc.categoryName || ''),
            rating: Number(doc.rating || 0),
            reviewCount: Number(doc.reviewCount || 0),
            stockStatus: String(doc.stockStatus || 'in_stock'),
            highlights: hit.highlights,
          };
        }),
        total: result.total || 0,
        facets: result.facets,
        source: 'opensearch',
      };
    }
  } catch (error) {
    console.error('SearchService error, falling back to database:', error);
  }

  // Fallback to database search
  return searchProductsDatabase(tenantId, query, options);
}


/**
 * Database fallback search
 */
async function searchProductsDatabase(
  tenantId: string,
  query: string,
  options?: {
    filters?: SearchFilters;
    sort?: { field: string; order: 'asc' | 'desc' };
    page?: number;
    pageSize?: number;
  }
): Promise<SearchResponse> {
  const {
    filters = {},
    sort,
    page = 1,
    pageSize = 20,
  } = options || {};

  try {
    const conditions = [
      eq(products.tenantId, tenantId),
      eq(products.status, (filters.status as 'draft' | 'active' | 'archived') || 'active'),
    ];

    // Text search
    if (query) {
      conditions.push(
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.description, `%${query}%`),
          ilike(products.sku, `%${query}%`)
        )!
      );
    }

    // Category filter
    if (filters.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }

    // Price filters
    if (filters.minPrice !== undefined) {
      conditions.push(gte(products.price, String(filters.minPrice)));
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(products.price, String(filters.maxPrice)));
    }

    // Vendor filter
    if (filters.vendor) {
      conditions.push(eq(products.vendor, filters.vendor));
    }

    // Stock status filter
    if (filters.stockStatus) {
      switch (filters.stockStatus) {
        case 'in_stock':
          conditions.push(sql`${products.quantity} > 10`);
          break;
        case 'low_stock':
          conditions.push(sql`${products.quantity} > 0 AND ${products.quantity} <= 10`);
          break;
        case 'out_of_stock':
          conditions.push(sql`${products.quantity} = 0`);
          break;
      }
    }

    // Build sort
    let orderBy;
    if (sort) {
      const column = sort.field === 'price' ? products.price
        : sort.field === 'name' ? products.name
        : sort.field === 'createdAt' ? products.createdAt
        : products.createdAt;
      orderBy = sort.order === 'asc' ? asc(column) : desc(column);
    } else {
      orderBy = desc(products.createdAt);
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(and(...conditions));

    // Get products with pagination
    const offset = (page - 1) * pageSize;
    const searchResults = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        images: products.images,
        quantity: products.quantity,
        categoryId: products.categoryId,
      })
      .from(products)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset);

    // Get category names
    const categoryIds = [...new Set(searchResults.map(p => p.categoryId).filter(Boolean))];
    const categoryMap = new Map<string, string>();
    
    if (categoryIds.length > 0) {
      const cats = await db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .where(sql`${categories.id} IN (${categoryIds.map(id => `'${id}'`).join(',')})`);
      
      cats.forEach(c => categoryMap.set(c.id, c.name));
    }

    return {
      success: true,
      products: searchResults.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        images: (p.images as { url: string; alt?: string }[]) || [],
        categoryName: p.categoryId ? categoryMap.get(p.categoryId) : undefined,
        stockStatus: getStockStatus(p.quantity || 0),
      })),
      total: count,
      source: 'database',
    };
  } catch (error) {
    console.error('Database search error:', error);
    return {
      success: false,
      products: [],
      total: 0,
      source: 'database',
      error: 'Search failed',
    };
  }
}

function getStockStatus(quantity: number): string {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= 10) return 'low_stock';
  return 'in_stock';
}

/**
 * Get autocomplete suggestions
 */
export async function getAutocomplete(
  tenantId: string,
  query: string,
  limit: number = 8
): Promise<{
  success: boolean;
  suggestions: Array<{ name: string; slug: string; image?: string }>;
  source: 'opensearch' | 'database';
}> {
  // Try SearchService (handles OpenSearch with automatic fallback)
  try {
    const searchService = new SearchService();
    const result = await searchService.autocomplete(query, tenantId, limit);
    
    if (result.success && result.suggestions) {
      return {
        success: true,
        suggestions: result.suggestions.map(s => ({ name: s, slug: s.toLowerCase().replace(/\s+/g, '-'), images: [] })),
        source: 'opensearch',
      };
    }
  } catch (error) {
    console.error('SearchService autocomplete error, falling back to database:', error);
  }

  // Fallback to database
  try {
    const suggestions = await db
      .select({
        name: products.name,
        slug: products.slug,
        images: products.images,
      })
      .from(products)
      .where(and(
        eq(products.tenantId, tenantId),
        eq(products.status, 'active'),
        ilike(products.name, `${query}%`)
      ))
      .limit(limit);

    return {
      success: true,
      suggestions: suggestions.map(s => ({
        name: s.name,
        slug: s.slug,
        image: (s.images as { url: string }[])?.[0]?.url,
      })),
      source: 'database',
    };
  } catch (error) {
    console.error('Autocomplete error:', error);
    return {
      success: false,
      suggestions: [],
      source: 'database',
    };
  }
}
