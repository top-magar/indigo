/**
 * Inngest functions for OpenSearch synchronization
 * 
 * Handles:
 * - Product indexing on create/update
 * - Product deletion from index
 * - Full reindex for a tenant
 */

import { inngest } from '../index';
import { db } from '@/infrastructure/db';
import { products, categories } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { SearchService } from '@/infrastructure/services';
import type { SearchDocument } from '@/infrastructure/services/providers/types';

// Product document type for search indexing
type ProductDocument = SearchDocument;

const LOW_STOCK_THRESHOLD = 10;

/**
 * Index a single product when created or updated
 */
export const indexProductOnChange = inngest.createFunction(
  { id: 'opensearch-index-product', name: 'Index Product in OpenSearch' },
  { event: 'product/updated' },
  async ({ event, step }) => {
    const searchService = new SearchService();
    const { productId, tenantId } = event.data;

    // Ensure index exists
    await step.run('ensure-index', async () => {
      await searchService.createIndex(tenantId);
    });

    // Fetch product data
    const product = await step.run('fetch-product', async () => {
      const [p] = await db
        .select()
        .from(products)
        .where(and(
          eq(products.id, productId),
          eq(products.tenantId, tenantId)
        ))
        .limit(1);
      return p;
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Get category name
    const categoryName = await step.run('fetch-category', async () => {
      if (!product.categoryId) return undefined;
      const [cat] = await db
        .select({ name: categories.name })
        .from(categories)
        .where(eq(categories.id, product.categoryId))
        .limit(1);
      return cat?.name ?? undefined;
    });

    // Build document
    const document: ProductDocument = {
      id: product.id,
      tenantId: product.tenantId,
      name: product.name,
      description: product.description ?? undefined,
      slug: product.slug,
      categoryId: product.categoryId ?? undefined,
      categoryName: categoryName ?? undefined,
      price: parseFloat(product.price),
      compareAtPrice: product.compareAtPrice 
        ? parseFloat(product.compareAtPrice) 
        : undefined,
      status: product.status,
      sku: product.sku || undefined,
      vendor: product.vendor || undefined,
      productType: product.productType || undefined,
      images: (product.images as { url: string }[])?.map(i => i.url),
      stockStatus: getStockStatus(product.quantity || 0),
      createdAt: new Date(product.createdAt).toISOString(),
      updatedAt: new Date(product.updatedAt).toISOString(),
    };

    // Index the product
    const result = await step.run('index-product', async () => {
      return searchService.index(document);
    });

    return result;
  }
);

/**
 * Remove product from index when deleted
 */
export const removeProductOnDelete = inngest.createFunction(
  { id: 'opensearch-remove-product', name: 'Remove Product from OpenSearch' },
  { event: 'product/deleted' },
  async ({ event, step }) => {
    const searchService = new SearchService();
    const { productId, tenantId } = event.data;

    const result = await step.run('delete-product', async () => {
      return searchService.delete(productId, tenantId);
    });

    return result;
  }
);

function getStockStatus(quantity: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
}


/**
 * Full reindex of all products for a tenant
 * Triggered manually or on schedule
 */
export const reindexAllProducts = inngest.createFunction(
  { 
    id: 'opensearch-reindex-all', 
    name: 'Reindex All Products in OpenSearch',
    throttle: {
      limit: 1,
      period: '5m',
      key: 'event.data.tenantId',
    },
  },
  { event: 'opensearch/reindex-all' },
  async ({ event, step }) => {
    const searchService = new SearchService();
    const { tenantId } = event.data;

    // Ensure index exists
    await step.run('ensure-index', async () => {
      await searchService.createIndex(tenantId);
    });

    // Fetch all active products
    const allProducts = await step.run('fetch-all-products', async () => {
      return db
        .select()
        .from(products)
        .where(and(
          eq(products.tenantId, tenantId),
          eq(products.status, 'active')
        ));
    });

    if (allProducts.length === 0) {
      return { success: true, indexed: 0 };
    }

    // Get all category names
    const categoryIds = [...new Set(allProducts.map(p => p.categoryId).filter(Boolean))];
    const categoryMap = new Map<string, string>();

    if (categoryIds.length > 0) {
      const cats = await step.run('fetch-categories', async () => {
        return db
          .select({ id: categories.id, name: categories.name })
          .from(categories)
          .where(eq(categories.tenantId, tenantId));
      });
      cats.forEach(c => categoryMap.set(c.id, c.name));
    }

    // Build documents
    const documents: ProductDocument[] = allProducts.map(product => ({
      id: product.id,
      tenantId: product.tenantId,
      name: product.name,
      description: product.description || undefined,
      slug: product.slug,
      categoryId: product.categoryId || undefined,
      categoryName: product.categoryId ? categoryMap.get(product.categoryId) : undefined,
      price: parseFloat(product.price),
      compareAtPrice: product.compareAtPrice 
        ? parseFloat(product.compareAtPrice) 
        : undefined,
      status: product.status,
      sku: product.sku || undefined,
      vendor: product.vendor || undefined,
      productType: product.productType || undefined,
      images: (product.images as { url: string }[])?.map(i => i.url),
      stockStatus: getStockStatus(product.quantity || 0),
      createdAt: new Date(product.createdAt).toISOString(),
      updatedAt: new Date(product.updatedAt).toISOString(),
    }));

    // Bulk index in batches of 100
    const batchSize = 100;
    let indexed = 0;

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;

      await step.run(`index-batch-${batchNum}`, async () => {
        const result = await searchService.bulkIndex(batch);
        if (result.success) {
          indexed += batch.length;
        }
        return result;
      });
    }

    return { success: true, indexed, total: documents.length };
  }
);

/**
 * Scheduled daily reindex for all tenants
 */
export const scheduledReindex = inngest.createFunction(
  { 
    id: 'opensearch-scheduled-reindex', 
    name: 'Scheduled OpenSearch Reindex',
  },
  { cron: '0 3 * * *' }, // Run at 3 AM daily
  async ({ step }) => {
    // Get all tenants using Drizzle
    const { tenants: tenantsTable } = await import('@/db/schema');
    const tenants = await step.run('fetch-tenants', async () => {
      return db
        .select({ id: tenantsTable.id })
        .from(tenantsTable);
    });

    // Trigger reindex for each tenant
    for (const tenant of tenants) {
      await step.sendEvent('trigger-reindex', {
        name: 'opensearch/reindex-all',
        data: { tenantId: tenant.id },
      });
    }

    return { success: true, tenantsQueued: tenants.length };
  }
);
