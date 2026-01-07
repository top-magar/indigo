import "server-only";
import { categories, products } from "@/db/schema";
import { eq, ilike, isNull, sql, count } from "drizzle-orm";
import { withTenant } from "@/infrastructure/db";
import { QueryOptions } from "@/infrastructure/repositories/base";
import { getCacheService, withCache } from "@/infrastructure/services/cache";
import { cacheKeyPatterns, cacheInvalidationPatterns } from "@/config/cache";

export type CategoryCreateInput = Omit<
  typeof categories.$inferInsert,
  "id" | "tenantId" | "createdAt" | "updatedAt"
>;

export type CategoryUpdateInput = Partial<
  Omit<typeof categories.$inferInsert, "id" | "tenantId" | "createdAt">
>;

export interface CategoryWithProductCount {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  imageUrl: string | null;
  sortOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;
}

export interface CategoryStats {
  total: number;
  withProducts: number;
  empty: number;
}

export class CategoryRepository {
  private cache = getCacheService();

  private invalidateCategoryCaches(tenantId: string): void {
    this.cache.invalidate(cacheInvalidationPatterns.allCategories(tenantId));
  }

  async findAll(tenantId: string, options?: QueryOptions) {
    const cacheKey = options
      ? `${cacheKeyPatterns.categoryList(tenantId)}:${options.limit || 'all'}:${options.offset || 0}`
      : cacheKeyPatterns.categoryList(tenantId);

    return withCache(cacheKey, "categories", async () => {
      return withTenant(tenantId, async (tx) => {
        let query = tx.select().from(categories).orderBy(categories.sortOrder);

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

  async findById(tenantId: string, id: string) {
    const cacheKey = cacheKeyPatterns.categoryById(tenantId, id);

    return withCache(cacheKey, "categories", async () => {
      return withTenant(tenantId, async (tx) => {
        const [result] = await tx
          .select()
          .from(categories)
          .where(eq(categories.id, id))
          .limit(1);

        return result || null;
      });
    });
  }

  async findBySlug(tenantId: string, slug: string) {
    const cacheKey = cacheKeyPatterns.categoryBySlug(tenantId, slug);

    return withCache(cacheKey, "categories", async () => {
      return withTenant(tenantId, async (tx) => {
        const [result] = await tx
          .select()
          .from(categories)
          .where(eq(categories.slug, slug))
          .limit(1);

        return result || null;
      });
    });
  }

  async findByParent(tenantId: string, parentId: string) {
    const cacheKey = cacheKeyPatterns.categoryChildren(tenantId, parentId);

    return withCache(cacheKey, "categories", async () => {
      return withTenant(tenantId, async (tx) => {
        return tx
          .select()
          .from(categories)
          .where(eq(categories.parentId, parentId))
          .orderBy(categories.sortOrder);
      });
    });
  }

  async findRoots(tenantId: string) {
    const cacheKey = cacheKeyPatterns.categoryRoots(tenantId);

    return withCache(cacheKey, "categories", async () => {
      return withTenant(tenantId, async (tx) => {
        return tx
          .select()
          .from(categories)
          .where(isNull(categories.parentId))
          .orderBy(categories.sortOrder);
      });
    });
  }

  async search(tenantId: string, query: string) {
    return withTenant(tenantId, async (tx) => {
      return tx
        .select()
        .from(categories)
        .where(ilike(categories.name, `%${query}%`))
        .orderBy(categories.sortOrder);
    });
  }

  async create(tenantId: string, data: CategoryCreateInput) {
    const result = await withTenant(tenantId, async (tx) => {
      const [created] = await tx
        .insert(categories)
        .values({
          ...data,
          tenantId,
        })
        .returning();

      return created;
    });

    this.invalidateCategoryCaches(tenantId);

    return result;
  }

  async update(tenantId: string, id: string, data: CategoryUpdateInput) {
    const result = await withTenant(tenantId, async (tx) => {
      const [updated] = await tx
        .update(categories)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(categories.id, id))
        .returning();

      return updated || null;
    });

    this.invalidateCategoryCaches(tenantId);

    return result;
  }

  async delete(tenantId: string, id: string) {
    await withTenant(tenantId, async (tx) => {
      await tx.delete(categories).where(eq(categories.id, id));
    });

    this.invalidateCategoryCaches(tenantId);
  }

  async getStats(tenantId: string): Promise<CategoryStats> {
    const cacheKey = cacheKeyPatterns.categoryStats(tenantId);

    return withCache(cacheKey, "categories", async () => {
      return withTenant(tenantId, async (tx) => {
        const allCategories = await tx.select().from(categories);

        const categoriesWithProducts = await tx
          .select({ categoryId: products.categoryId })
          .from(products)
          .where(sql`${products.categoryId} IS NOT NULL`)
          .groupBy(products.categoryId);

        const withProductsCount = categoriesWithProducts.length;
        const total = allCategories.length;

        return {
          total,
          withProducts: withProductsCount,
          empty: total - withProductsCount,
        };
      });
    });
  }

  async getWithProductCount(tenantId: string): Promise<CategoryWithProductCount[]> {
    const cacheKey = cacheKeyPatterns.categoryWithCounts(tenantId);

    return withCache(cacheKey, "categories", async () => {
      return withTenant(tenantId, async (tx) => {
        const result = await tx
          .select({
            id: categories.id,
            tenantId: categories.tenantId,
            name: categories.name,
            slug: categories.slug,
            description: categories.description,
            parentId: categories.parentId,
            imageUrl: categories.imageUrl,
            sortOrder: categories.sortOrder,
            createdAt: categories.createdAt,
            updatedAt: categories.updatedAt,
            productCount: count(products.id),
          })
          .from(categories)
          .leftJoin(products, eq(categories.id, products.categoryId))
          .groupBy(categories.id)
          .orderBy(categories.sortOrder);

        return result.map((row) => ({
          ...row,
          productCount: Number(row.productCount),
        }));
      });
    });
  }
}

export const categoryRepository = new CategoryRepository();
