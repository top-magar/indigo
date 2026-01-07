import "server-only";
import { products, categories } from "@/db/schema/products";
import { eq, and, ilike, or, lte, gt, desc } from "drizzle-orm";
import { withTenant } from "@/infrastructure/db";
import { QueryOptions } from "@/infrastructure/repositories/base";
import { getCacheService, withCache } from "@/infrastructure/services/cache";
import { cacheKeyPatterns, cacheInvalidationPatterns } from "@/config/cache";

/**
 * Product statistics
 */
export interface ProductStats {
    total: number;
    active: number;
    draft: number;
    archived: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
}

const LOW_STOCK_THRESHOLD = 10;

/**
 * Product Repository
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.1
 * @see SYSTEM-ARCHITECTURE.md Section 9.2 (F005)
 */
export class ProductRepository {
  private cache = getCacheService();

  /**
   * Invalidate all product-related caches for a tenant
   */
  private invalidateProductCaches(tenantId: string): void {
    this.cache.invalidate(cacheInvalidationPatterns.allProducts(tenantId));
  }

  /**
   * Find all products for tenant with optional category join
   */
  async findAll(tenantId: string, options?: QueryOptions) {
    // Build cache key with options
    const cacheKey = options 
      ? `${cacheKeyPatterns.productList(tenantId)}:${options.limit || 'all'}:${options.offset || 0}`
      : cacheKeyPatterns.productList(tenantId);

    return withCache(cacheKey, "products", async () => {
      return withTenant(tenantId, async (tx) => {
        let query = tx
          .select({
            id: products.id,
            tenantId: products.tenantId,
            categoryId: products.categoryId,
            name: products.name,
            slug: products.slug,
            description: products.description,
            price: products.price,
            compareAtPrice: products.compareAtPrice,
            costPrice: products.costPrice,
            sku: products.sku,
            barcode: products.barcode,
            quantity: products.quantity,
            trackQuantity: products.trackQuantity,
            allowBackorder: products.allowBackorder,
            weight: products.weight,
            weightUnit: products.weightUnit,
            status: products.status,
            hasVariants: products.hasVariants,
            vendor: products.vendor,
            productType: products.productType,
            images: products.images,
            metadata: products.metadata,
            createdAt: products.createdAt,
            updatedAt: products.updatedAt,
            categoryName: categories.name,
          })
          .from(products)
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .orderBy(desc(products.createdAt));
        
        if (options?.limit) {
          query = query.limit(options.limit) as typeof query;
        }
        
        if (options?.offset) {
          query = query.offset(options.offset) as typeof query;
        }
        
        return query;
      });
    });
  }


  /**
   * Find product by ID
   */
  async findById(tenantId: string, id: string) {
    const cacheKey = cacheKeyPatterns.productById(tenantId, id);

    return withCache(cacheKey, "products", async () => {
      return withTenant(tenantId, async (tx) => {
        const [result] = await tx
          .select()
          .from(products)
          .where(eq(products.id, id))
          .limit(1);
        
        return result || null;
      });
    });
  }

  /**
   * Find product by slug (unique within tenant)
   */
  async findBySlug(tenantId: string, slug: string) {
    const cacheKey = cacheKeyPatterns.productBySlug(tenantId, slug);

    return withCache(cacheKey, "products", async () => {
      return withTenant(tenantId, async (tx) => {
        const [result] = await tx
          .select()
          .from(products)
          .where(eq(products.slug, slug))
          .limit(1);
        
        return result || null;
      });
    });
  }

  /**
   * Find all active products (for storefront)
   */
  async findActive(tenantId: string, options?: QueryOptions) {
    const cacheKey = options
      ? `${cacheKeyPatterns.activeProducts(tenantId)}:${options.limit || 'all'}:${options.offset || 0}`
      : cacheKeyPatterns.activeProducts(tenantId);

    return withCache(cacheKey, "products", async () => {
      return withTenant(tenantId, async (tx) => {
        let query = tx
          .select()
          .from(products)
          .where(eq(products.status, "active"));
        
        if (options?.limit) {
          query = query.limit(options.limit) as typeof query;
        }
        
        if (options?.offset) {
          query = query.offset(options.offset) as typeof query;
        }
        
        return query;
      });
    });
  }

  /**
   * Find products by status
   */
  async findByStatus(tenantId: string, status: string | string[], options?: QueryOptions) {
    const statusKey = Array.isArray(status) ? status.sort().join(',') : status;
    const cacheKey = options
      ? `${cacheKeyPatterns.productsByStatus(tenantId, statusKey)}:${options.limit || 'all'}:${options.offset || 0}`
      : cacheKeyPatterns.productsByStatus(tenantId, statusKey);

    return withCache(cacheKey, "products", async () => {
      return withTenant(tenantId, async (tx) => {
        const statuses = Array.isArray(status) ? status : [status];
        let query = tx
          .select({
            id: products.id,
            tenantId: products.tenantId,
            categoryId: products.categoryId,
            name: products.name,
            slug: products.slug,
            description: products.description,
            price: products.price,
            compareAtPrice: products.compareAtPrice,
            costPrice: products.costPrice,
            sku: products.sku,
            barcode: products.barcode,
            quantity: products.quantity,
            trackQuantity: products.trackQuantity,
            allowBackorder: products.allowBackorder,
            status: products.status,
            images: products.images,
            createdAt: products.createdAt,
            updatedAt: products.updatedAt,
            categoryName: categories.name,
          })
          .from(products)
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .where(
            statuses.length === 1
              ? eq(products.status, statuses[0] as "draft" | "active" | "archived")
              : or(...statuses.map(s => eq(products.status, s as "draft" | "active" | "archived")))
          )
          .orderBy(desc(products.createdAt));
        
        if (options?.limit) {
          query = query.limit(options.limit) as typeof query;
        }
        
        if (options?.offset) {
          query = query.offset(options.offset) as typeof query;
        }
        
        return query;
      });
    });
  }

  /**
   * Find products by category (active products only for storefront)
   */
  async findByCategory(tenantId: string, categoryId: string, options?: QueryOptions) {
    const cacheKey = options
      ? `${cacheKeyPatterns.productsByCategory(tenantId, categoryId)}:${options.limit || 'all'}:${options.offset || 0}`
      : cacheKeyPatterns.productsByCategory(tenantId, categoryId);

    return withCache(cacheKey, "products", async () => {
      return withTenant(tenantId, async (tx) => {
        let query = tx
          .select({
            id: products.id,
            tenantId: products.tenantId,
            categoryId: products.categoryId,
            name: products.name,
            slug: products.slug,
            description: products.description,
            price: products.price,
            compareAtPrice: products.compareAtPrice,
            costPrice: products.costPrice,
            sku: products.sku,
            barcode: products.barcode,
            quantity: products.quantity,
            trackQuantity: products.trackQuantity,
            allowBackorder: products.allowBackorder,
            status: products.status,
            images: products.images,
            createdAt: products.createdAt,
            updatedAt: products.updatedAt,
            categoryName: categories.name,
          })
          .from(products)
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .where(and(eq(products.categoryId, categoryId), eq(products.status, "active")))
          .orderBy(desc(products.createdAt));
        
        if (options?.limit) {
          query = query.limit(options.limit) as typeof query;
        }
        
        if (options?.offset) {
          query = query.offset(options.offset) as typeof query;
        }
        
        return query;
      });
    });
  }


  /**
   * Find products by stock level
   */
  async findByStockLevel(tenantId: string, level: "low" | "out" | "in", options?: QueryOptions) {
    return withTenant(tenantId, async (tx) => {
      let whereClause;
      if (level === "low") {
        whereClause = and(lte(products.quantity, LOW_STOCK_THRESHOLD), gt(products.quantity, 0));
      } else if (level === "out") {
        whereClause = eq(products.quantity, 0);
      } else {
        whereClause = gt(products.quantity, LOW_STOCK_THRESHOLD);
      }

      let query = tx
        .select({
          id: products.id,
          tenantId: products.tenantId,
          categoryId: products.categoryId,
          name: products.name,
          slug: products.slug,
          description: products.description,
          price: products.price,
          compareAtPrice: products.compareAtPrice,
          costPrice: products.costPrice,
          sku: products.sku,
          barcode: products.barcode,
          quantity: products.quantity,
          trackQuantity: products.trackQuantity,
          allowBackorder: products.allowBackorder,
          status: products.status,
          images: products.images,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(whereClause)
        .orderBy(desc(products.createdAt));
      
      if (options?.limit) {
        query = query.limit(options.limit) as typeof query;
      }
      
      if (options?.offset) {
        query = query.offset(options.offset) as typeof query;
      }
      
      return query;
    });
  }

  /**
   * Search products by name, SKU, or description
   */
  async search(tenantId: string, query: string, options?: QueryOptions) {
    return withTenant(tenantId, async (tx) => {
      const searchPattern = `%${query}%`;
      let dbQuery = tx
        .select({
          id: products.id,
          tenantId: products.tenantId,
          categoryId: products.categoryId,
          name: products.name,
          slug: products.slug,
          description: products.description,
          price: products.price,
          compareAtPrice: products.compareAtPrice,
          costPrice: products.costPrice,
          sku: products.sku,
          barcode: products.barcode,
          quantity: products.quantity,
          trackQuantity: products.trackQuantity,
          allowBackorder: products.allowBackorder,
          status: products.status,
          images: products.images,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          categoryName: categories.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(
          or(
            ilike(products.name, searchPattern),
            ilike(products.sku, searchPattern),
            ilike(products.description, searchPattern)
          )
        )
        .orderBy(desc(products.createdAt));
      
      if (options?.limit) {
        dbQuery = dbQuery.limit(options.limit) as typeof dbQuery;
      }
      
      if (options?.offset) {
        dbQuery = dbQuery.offset(options.offset) as typeof dbQuery;
      }
      
      return dbQuery;
    });
  }

  /**
   * Get product statistics
   */
  async getStats(tenantId: string): Promise<ProductStats> {
    const cacheKey = cacheKeyPatterns.productStats(tenantId);

    return withCache(cacheKey, "products", async () => {
      return withTenant(tenantId, async (tx) => {
        const all = await tx.select().from(products);
        
        return {
          total: all.length,
          active: all.filter(p => p.status === "active").length,
          draft: all.filter(p => p.status === "draft").length,
          archived: all.filter(p => p.status === "archived").length,
          lowStock: all.filter(p => (p.quantity || 0) <= LOW_STOCK_THRESHOLD && (p.quantity || 0) > 0).length,
          outOfStock: all.filter(p => (p.quantity || 0) === 0).length,
          totalValue: all.reduce((sum, p) => sum + ((p.quantity || 0) * parseFloat(p.price || "0")), 0),
        };
      });
    });
  }

  /**
   * Create a new product
   */
  async create(
    tenantId: string,
    data: Omit<typeof products.$inferInsert, "id" | "tenantId" | "createdAt" | "updatedAt">
  ) {
    const result = await withTenant(tenantId, async (tx) => {
      const [created] = await tx
        .insert(products)
        .values({
          ...data,
          tenantId,
        })
        .returning();
      
      return created;
    });

    // Invalidate caches after mutation
    this.invalidateProductCaches(tenantId);
    
    return result;
  }

  /**
   * Update a product
   */
  async update(
    tenantId: string,
    id: string,
    data: Partial<Omit<typeof products.$inferInsert, "id" | "tenantId" | "createdAt">>
  ) {
    const result = await withTenant(tenantId, async (tx) => {
      const [updated] = await tx
        .update(products)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id))
        .returning();
      
      return updated;
    });

    // Invalidate caches after mutation
    this.invalidateProductCaches(tenantId);
    
    return result;
  }

  /**
   * Delete a product
   */
  async delete(tenantId: string, id: string) {
    await withTenant(tenantId, async (tx) => {
      await tx.delete(products).where(eq(products.id, id));
    });

    // Invalidate caches after mutation
    this.invalidateProductCaches(tenantId);
  }

  /**
   * Update product status
   */
  async updateStatus(tenantId: string, id: string, status: "draft" | "active" | "archived") {
    return this.update(tenantId, id, { status });
  }

  /**
   * Get product count by status
   */
  async countByStatus(tenantId: string) {
    const cacheKey = `${cacheKeyPatterns.productStats(tenantId)}:counts`;

    return withCache(cacheKey, "products", async () => {
      return withTenant(tenantId, async (tx) => {
        const all = await tx.select().from(products);
        
        return {
          total: all.length,
          active: all.filter(p => p.status === "active").length,
          draft: all.filter(p => p.status === "draft").length,
          archived: all.filter(p => p.status === "archived").length,
        };
      });
    });
  }
}

// Singleton instance
export const productRepository = new ProductRepository();
