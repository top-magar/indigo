'use server';

import { db } from '@/infrastructure/db';
import { products, categories } from '@/db/schema/products';
import { collections } from '@/db/schema/collections';
import { eq, and, ilike, or, desc } from 'drizzle-orm';
import { generateProductDescription } from '@/infrastructure/aws/bedrock';

interface SearchResult {
  type: 'product' | 'category' | 'collection';
  id: string;
  name: string;
  slug: string;
  image?: string;
  price?: string;
  description?: string;
}

/**
 * AI-enhanced search with intelligent suggestions
 */
export async function searchWithAI(
  tenantId: string,
  query: string,
  options?: { limit?: number; includeAI?: boolean }
) {
  const { limit = 10, includeAI = true } = options || {};

  try {
    const searchTerm = `%${query}%`;

    // Search products
    const productResults = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        images: products.images,
        description: products.description,
      })
      .from(products)
      .where(and(
        eq(products.tenantId, tenantId),
        eq(products.status, 'active'),
        or(
          ilike(products.name, searchTerm),
          ilike(products.description, searchTerm)
        )
      ))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    // Search categories
    const categoryResults = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
        description: categories.description,
      })
      .from(categories)
      .where(and(
        eq(categories.tenantId, tenantId),
        or(
          ilike(categories.name, searchTerm),
          ilike(categories.description, searchTerm)
        )
      ))
      .limit(5);

    // Search collections
    const collectionResults = await db
      .select({
        id: collections.id,
        name: collections.name,
        slug: collections.slug,
        imageUrl: collections.imageUrl,
        description: collections.description,
      })
      .from(collections)
      .where(and(
        eq(collections.tenantId, tenantId),
        or(
          ilike(collections.name, searchTerm),
          ilike(collections.description, searchTerm)
        )
      ))
      .limit(5);

    // Format results
    const results: SearchResult[] = [
      ...productResults.map(p => ({
        type: 'product' as const,
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images?.[0]?.url,
        price: p.price,
        description: p.description || undefined,
      })),
      ...categoryResults.map(c => ({
        type: 'category' as const,
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.imageUrl || undefined,
        description: c.description || undefined,
      })),
      ...collectionResults.map(c => ({
        type: 'collection' as const,
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.imageUrl || undefined,
        description: c.description || undefined,
      })),
    ];

    // Generate AI suggestions if enabled and no results found
    let aiSuggestions: string[] = [];
    if (includeAI && results.length === 0 && process.env.AWS_BEDROCK_MODEL_ID) {
      aiSuggestions = await generateSearchSuggestions(query);
    }

    return {
      success: true,
      results,
      suggestions: aiSuggestions,
      totalProducts: productResults.length,
      totalCategories: categoryResults.length,
      totalCollections: collectionResults.length,
    };
  } catch (error) {
    console.error('[AI Search] Failed:', error);
    return {
      success: false,
      results: [],
      suggestions: [],
      error: 'Search failed',
    };
  }
}

/**
 * Generate AI-powered search suggestions when no results found
 */
async function generateSearchSuggestions(query: string): Promise<string[]> {
  try {
    const prompt = `A customer searched for "${query}" in an e-commerce store but found no results.
    
Suggest 3 alternative search terms they might try. Return only the suggestions, one per line, no numbering or bullets.

Focus on:
- Common misspellings or variations
- Related product categories
- Broader or narrower terms`;

    const response = await generateProductDescription(prompt, []);
    
    if (response.success && response.content) {
      return response.content
        .split('\n')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0 && s.length < 50)
        .slice(0, 3);
    }
    
    return [];
  } catch (error) {
    console.error('[AI Search Suggestions] Failed:', error);
    return [];
  }
}

/**
 * Get popular search terms for autocomplete
 */
export async function getPopularSearches(tenantId: string, limit = 5) {
  try {
    // Get top product names as popular searches
    const popularProducts = await db
      .select({ name: products.name })
      .from(products)
      .where(and(
        eq(products.tenantId, tenantId),
        eq(products.status, 'active')
      ))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    return popularProducts.map(p => p.name);
  } catch (error) {
    console.error('[Popular Searches] Failed:', error);
    return [];
  }
}

/**
 * Get autocomplete suggestions as user types
 */
export async function getAutocompleteSuggestions(
  tenantId: string,
  query: string,
  limit = 5
) {
  if (query.length < 2) {
    return [];
  }

  try {
    const searchTerm = `${query}%`;

    const suggestions = await db
      .select({ name: products.name })
      .from(products)
      .where(and(
        eq(products.tenantId, tenantId),
        eq(products.status, 'active'),
        ilike(products.name, searchTerm)
      ))
      .limit(limit);

    return suggestions.map(s => s.name);
  } catch (error) {
    console.error('[Autocomplete] Failed:', error);
    return [];
  }
}
