'use server';

import { db } from '@/infrastructure/db';
import { products, orderItems, orders } from '@/db/schema';
import { eq, and, desc, sql, ne, inArray } from 'drizzle-orm';
import { RecommendationService } from '@/infrastructure/services';

// Interaction event types for tracking
type InteractionEventType = 'view' | 'click' | 'add_to_cart' | 'purchase' | 'like' | 'share';

interface RecommendationOptions {
  tenantId: string;
  customerId?: string;
  productId?: string;
  limit?: number;
  sessionId?: string;
}

/**
 * Get personalized product recommendations for a customer
 * Uses AWS Personalize if enabled, falls back to collaborative filtering
 */
export async function getRecommendations(options: RecommendationOptions) {
  const { tenantId, customerId, limit = 8 } = options;

  try {
    // If no customer, return trending products
    if (!customerId) {
      return getTrendingProducts({ tenantId, limit });
    }

    // Try RecommendationService (handles AWS Personalize with automatic fallback)
    const recommendationService = new RecommendationService();
    const personalizeResult = await recommendationService.getRecommendations(customerId, {
      numResults: limit,
    });

    if (personalizeResult.success && personalizeResult.recommendations?.length) {
      const productIds = personalizeResult.recommendations.map(r => r.itemId);
      
      // Fetch full product details
      const recommendedProducts = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          compareAtPrice: products.compareAtPrice,
          images: products.images,
        })
        .from(products)
        .where(and(
          eq(products.tenantId, tenantId),
          eq(products.status, 'active'),
          inArray(products.id, productIds)
        ))
        .limit(limit);

      // Sort by Personalize ranking
      const sortedProducts = productIds
        .map(id => recommendedProducts.find(p => p.id === id))
        .filter(Boolean);

      return { 
        success: true, 
        products: sortedProducts,
        source: 'personalize' as const,
      };
    }

    // Fallback to SQL-based collaborative filtering
    // Get products the customer has purchased
    const purchasedProducts = await db
      .select({ productId: orderItems.productId })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(
        eq(orders.tenantId, tenantId),
        eq(orders.customerId, customerId)
      ));

    const purchasedIds = purchasedProducts.map(p => p.productId).filter(Boolean) as string[];

    if (purchasedIds.length === 0) {
      return getTrendingProducts({ tenantId, limit });
    }

    // Find products frequently bought together with purchased products
    // (customers who bought X also bought Y)
    const recommendations = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        images: products.images,
      })
      .from(products)
      .innerJoin(orderItems, eq(products.id, orderItems.productId))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(
        eq(products.tenantId, tenantId),
        eq(products.status, 'active'),
        // Exclude already purchased products
        sql`${products.id} NOT IN (${purchasedIds.map(id => `'${id}'`).join(',')})`
      ))
      .groupBy(products.id)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return { success: true, products: recommendations, source: 'collaborative' as const };
  } catch (error) {
    console.error('[Recommendations] Failed:', error);
    return { success: false, products: [], error: 'Failed to get recommendations' };
  }
}

/**
 * Get related products based on category
 * Uses AWS Personalize Similar Items if enabled
 */
export async function getRelatedProducts(options: RecommendationOptions) {
  const { tenantId, productId, customerId, limit = 4 } = options;

  if (!productId) {
    return { success: false, products: [], error: 'Product ID required' };
  }

  try {
    // Try RecommendationService Similar Items (handles AWS Personalize with automatic fallback)
    const recommendationService = new RecommendationService();
    const similarResult = await recommendationService.getSimilarItems(productId, {
      numResults: limit,
    });

    if (similarResult.success && similarResult.recommendations?.length) {
      const productIds = similarResult.recommendations.map(r => r.itemId);
      
      // Fetch full product details
      const relatedProducts = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          compareAtPrice: products.compareAtPrice,
          images: products.images,
        })
        .from(products)
        .where(and(
          eq(products.tenantId, tenantId),
          eq(products.status, 'active'),
          inArray(products.id, productIds)
        ))
        .limit(limit);

      return { 
        success: true, 
        products: relatedProducts,
        source: 'personalize' as const,
      };
    }

    // Fallback to category-based recommendations
    // Get the source product
    const [sourceProduct] = await db
      .select({
        categoryId: products.categoryId,
      })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!sourceProduct) {
      return { success: false, products: [], error: 'Product not found' };
    }

    // Find products in the same category
    const relatedProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        images: products.images,
      })
      .from(products)
      .where(and(
        eq(products.tenantId, tenantId),
        eq(products.status, 'active'),
        ne(products.id, productId),
        sourceProduct.categoryId 
          ? eq(products.categoryId, sourceProduct.categoryId)
          : sql`true`
      ))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    return { success: true, products: relatedProducts, source: 'category' as const };
  } catch (error) {
    console.error('[Related Products] Failed:', error);
    return { success: false, products: [], error: 'Failed to get related products' };
  }
}

/**
 * Get trending products based on recent sales
 */
export async function getTrendingProducts(options: Omit<RecommendationOptions, 'customerId' | 'productId'>) {
  const { tenantId, limit = 8 } = options;

  try {
    // Get products with most orders in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendingProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        images: products.images,
        orderCount: sql<number>`count(${orderItems.id})::int`,
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, and(
        eq(orderItems.orderId, orders.id),
        sql`${orders.createdAt} >= ${thirtyDaysAgo}`
      ))
      .where(and(
        eq(products.tenantId, tenantId),
        eq(products.status, 'active')
      ))
      .groupBy(products.id)
      .orderBy(desc(sql`count(${orderItems.id})`), desc(products.createdAt))
      .limit(limit);

    return { success: true, products: trendingProducts };
  } catch (error) {
    console.error('[Trending Products] Failed:', error);
    return { success: false, products: [], error: 'Failed to get trending products' };
  }
}


/**
 * Track user interaction for personalization
 * Call this when users view, click, add to cart, or purchase products
 */
export async function trackProductInteraction(
  userId: string,
  sessionId: string,
  eventType: InteractionEventType,
  productId: string,
  options?: {
    eventValue?: number;
    properties?: Record<string, string>;
  }
) {
  try {
    const recommendationService = new RecommendationService();
    const result = await recommendationService.trackInteraction(
      userId, 
      productId, 
      eventType, 
      sessionId,
      options?.properties
    );
    return { success: result.success, tracked: true };
  } catch (error) {
    console.error('[Track Interaction] Failed:', error);
    return { success: false, tracked: false };
  }
}

/**
 * Get "Customers Also Bought" recommendations
 * Based on purchase patterns from other customers
 */
export async function getFrequentlyBoughtTogether(options: RecommendationOptions) {
  const { tenantId, productId, limit = 4 } = options;

  if (!productId) {
    return { success: false, products: [], error: 'Product ID required' };
  }

  try {
    // Find orders containing this product
    const ordersWithProduct = await db
      .select({ orderId: orderItems.orderId })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(
        eq(orders.tenantId, tenantId),
        eq(orderItems.productId, productId)
      ));

    const orderIds = ordersWithProduct.map(o => o.orderId);

    if (orderIds.length === 0) {
      return getRelatedProducts(options);
    }

    // Find other products in those orders
    const frequentlyBought = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        images: products.images,
        frequency: sql<number>`count(*)::int`,
      })
      .from(products)
      .innerJoin(orderItems, eq(products.id, orderItems.productId))
      .where(and(
        eq(products.tenantId, tenantId),
        eq(products.status, 'active'),
        ne(products.id, productId),
        inArray(orderItems.orderId, orderIds)
      ))
      .groupBy(products.id)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return { success: true, products: frequentlyBought };
  } catch (error) {
    console.error('[Frequently Bought Together] Failed:', error);
    return { success: false, products: [], error: 'Failed to get recommendations' };
  }
}

/**
 * Get recently viewed products for a customer
 * Requires tracking to be enabled
 */
export async function getRecentlyViewed(options: RecommendationOptions) {
  const { tenantId, customerId, limit = 8 } = options;

  if (!customerId) {
    return { success: false, products: [], error: 'Customer ID required' };
  }

  // This would typically query a views tracking table
  // For now, return empty - implement with view tracking
  return { success: true, products: [] };
}
