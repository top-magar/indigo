import "server-only";
import { 
    collections, 
    collectionProducts,
    CollectionType,
} from "@/db/schema/collections";
import { products } from "@/db/schema/products";
import { eq, desc, ilike, or, count, and } from "drizzle-orm";
import { withTenant } from "@/infrastructure/db";
import { QueryOptions } from "@/infrastructure/repositories/base";

export type CollectionCreateInput = {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    imageAlt?: string;
    metaTitle?: string;
    metaDescription?: string;
    isActive?: boolean;
    sortOrder?: number;
    type?: CollectionType;
    conditions?: Record<string, unknown>;
};

export type CollectionUpdateInput = Partial<CollectionCreateInput>;

export interface CollectionWithProductCount {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    isActive: boolean | null;
    type: CollectionType | null;
    productCount: number;
}

export interface CollectionStats {
    total: number;
    active: number;
    manual: number;
    automatic: number;
    empty: number;
}

export class CollectionRepository {
    async findAll(tenantId: string, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            let query = tx
                .select()
                .from(collections)
                .orderBy(collections.sortOrder, desc(collections.createdAt));

            if (options?.limit) {
                query = query.limit(options.limit) as typeof query;
            }

            if (options?.offset) {
                query = query.offset(options.offset) as typeof query;
            }

            return query;
        });
    }

    async findById(tenantId: string, id: string) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .select()
                .from(collections)
                .where(eq(collections.id, id))
                .limit(1);

            return result || null;
        });
    }

    async findBySlug(tenantId: string, slug: string) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .select()
                .from(collections)
                .where(eq(collections.slug, slug))
                .limit(1);

            return result || null;
        });
    }

    async findActive(tenantId: string, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            let query = tx
                .select()
                .from(collections)
                .where(eq(collections.isActive, true))
                .orderBy(collections.sortOrder);

            if (options?.limit) {
                query = query.limit(options.limit) as typeof query;
            }

            if (options?.offset) {
                query = query.offset(options.offset) as typeof query;
            }

            return query;
        });
    }

    async search(tenantId: string, query: string, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            const searchPattern = `%${query}%`;
            let dbQuery = tx
                .select()
                .from(collections)
                .where(
                    or(
                        ilike(collections.name, searchPattern),
                        ilike(collections.description, searchPattern)
                    )
                )
                .orderBy(desc(collections.createdAt));

            if (options?.limit) {
                dbQuery = dbQuery.limit(options.limit) as typeof dbQuery;
            }

            if (options?.offset) {
                dbQuery = dbQuery.offset(options.offset) as typeof dbQuery;
            }

            return dbQuery;
        });
    }

    async getStats(tenantId: string): Promise<CollectionStats> {
        return withTenant(tenantId, async (tx) => {
            const allCollections = await tx.select().from(collections);
            
            const productCounts = await tx
                .select({
                    collectionId: collectionProducts.collectionId,
                    count: count(collectionProducts.productId),
                })
                .from(collectionProducts)
                .groupBy(collectionProducts.collectionId);

            const countMap = new Map(productCounts.map(pc => [pc.collectionId, Number(pc.count)]));
            const emptyCount = allCollections.filter(c => !countMap.has(c.id) || countMap.get(c.id) === 0).length;

            return {
                total: allCollections.length,
                active: allCollections.filter(c => c.isActive).length,
                manual: allCollections.filter(c => c.type === "manual").length,
                automatic: allCollections.filter(c => c.type === "automatic").length,
                empty: emptyCount,
            };
        });
    }

    async create(tenantId: string, data: CollectionCreateInput) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .insert(collections)
                .values({
                    tenantId,
                    name: data.name,
                    slug: data.slug,
                    description: data.description,
                    imageUrl: data.imageUrl,
                    imageAlt: data.imageAlt,
                    metaTitle: data.metaTitle,
                    metaDescription: data.metaDescription,
                    isActive: data.isActive ?? true,
                    sortOrder: data.sortOrder ?? 0,
                    type: data.type || "manual",
                    conditions: data.conditions,
                })
                .returning();

            return result;
        });
    }

    async update(tenantId: string, id: string, data: CollectionUpdateInput) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .update(collections)
                .set({
                    ...data,
                    updatedAt: new Date(),
                })
                .where(eq(collections.id, id))
                .returning();

            return result || null;
        });
    }

    async delete(tenantId: string, id: string) {
        return withTenant(tenantId, async (tx) => {
            await tx.delete(collections).where(eq(collections.id, id));
        });
    }

    async getProducts(tenantId: string, collectionId: string, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            let query = tx
                .select({
                    product: products,
                    position: collectionProducts.position,
                })
                .from(collectionProducts)
                .innerJoin(products, eq(collectionProducts.productId, products.id))
                .where(eq(collectionProducts.collectionId, collectionId))
                .orderBy(collectionProducts.position);

            if (options?.limit) {
                query = query.limit(options.limit) as typeof query;
            }

            if (options?.offset) {
                query = query.offset(options.offset) as typeof query;
            }

            const results = await query;
            return results.map(r => ({ ...r.product, position: r.position }));
        });
    }

    async addProduct(tenantId: string, collectionId: string, productId: string, position?: number) {
        return withTenant(tenantId, async (tx) => {
            const [existing] = await tx
                .select()
                .from(collectionProducts)
                .where(
                    and(
                        eq(collectionProducts.collectionId, collectionId),
                        eq(collectionProducts.productId, productId)
                    )
                )
                .limit(1);

            if (existing) {
                if (position !== undefined) {
                    await tx
                        .update(collectionProducts)
                        .set({ position })
                        .where(eq(collectionProducts.id, existing.id));
                }
                return existing;
            }

            const [result] = await tx
                .insert(collectionProducts)
                .values({
                    collectionId,
                    productId,
                    position: position ?? 0,
                })
                .returning();

            return result;
        });
    }

    async removeProduct(tenantId: string, collectionId: string, productId: string) {
        return withTenant(tenantId, async (tx) => {
            await tx
                .delete(collectionProducts)
                .where(
                    and(
                        eq(collectionProducts.collectionId, collectionId),
                        eq(collectionProducts.productId, productId)
                    )
                );
        });
    }

    async reorderProducts(tenantId: string, collectionId: string, productIds: string[]) {
        return withTenant(tenantId, async (tx) => {
            for (let i = 0; i < productIds.length; i++) {
                await tx
                    .update(collectionProducts)
                    .set({ position: i })
                    .where(
                        and(
                            eq(collectionProducts.collectionId, collectionId),
                            eq(collectionProducts.productId, productIds[i])
                        )
                    );
            }
        });
    }

    async findWithProductCount(tenantId: string, id: string): Promise<CollectionWithProductCount | null> {
        return withTenant(tenantId, async (tx) => {
            const [collection] = await tx
                .select()
                .from(collections)
                .where(eq(collections.id, id))
                .limit(1);

            if (!collection) return null;

            const [countResult] = await tx
                .select({ count: count() })
                .from(collectionProducts)
                .where(eq(collectionProducts.collectionId, id));

            return {
                id: collection.id,
                name: collection.name,
                slug: collection.slug,
                description: collection.description,
                imageUrl: collection.imageUrl,
                isActive: collection.isActive,
                type: collection.type,
                productCount: Number(countResult?.count || 0),
            };
        });
    }

    async getCollectionsForProduct(tenantId: string, productId: string) {
        return withTenant(tenantId, async (tx) => {
            const results = await tx
                .select({ collection: collections })
                .from(collectionProducts)
                .innerJoin(collections, eq(collectionProducts.collectionId, collections.id))
                .where(eq(collectionProducts.productId, productId));

            return results.map(r => r.collection);
        });
    }
}

export const collectionRepository = new CollectionRepository();
