import "server-only";
import { storeConfigs } from "@/db/schema/store-config";
import type { StoreLayout, StorePageType } from "@/db/schema/store-config";
import { eq, and } from "drizzle-orm";
import { withTenant } from "@/infrastructure/db";
import { getCacheService, withCache } from "@/infrastructure/services/cache";
import { cacheKeyPatterns, cacheInvalidationPatterns } from "@/config/cache";

/**
 * Store Config Repository
 * 
 * Manages visual editor layouts per page type
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.1
 * @see SYSTEM-ARCHITECTURE.md Section 9.2 (F004)
 */
export class StoreConfigRepository {
  private cache = getCacheService();

  /**
   * Invalidate all store config caches for a tenant
   */
  private invalidateStoreConfigCaches(tenantId: string): void {
    this.cache.invalidate(cacheInvalidationPatterns.allStoreConfig(tenantId));
  }

  /**
   * Find all configs for tenant
   */
  async findAll(tenantId: string) {
    const cacheKey = cacheKeyPatterns.storeConfigAll(tenantId);

    return withCache(cacheKey, "storeConfig", async () => {
      return withTenant(tenantId, async (tx) => {
        return tx.select().from(storeConfigs);
      });
    });
  }

  /**
   * Find config by page type
   */
  async findByPageType(tenantId: string, pageType: StorePageType) {
    const cacheKey = cacheKeyPatterns.storeConfigByPage(tenantId, pageType);

    return withCache(cacheKey, "storeConfig", async () => {
      return withTenant(tenantId, async (tx) => {
        const [result] = await tx
          .select()
          .from(storeConfigs)
          .where(eq(storeConfigs.pageType, pageType))
          .limit(1);
        
        return result || null;
      });
    });
  }

  /**
   * Get published layout for a page type (for storefront rendering)
   */
  async getPublishedLayout(tenantId: string, pageType: StorePageType): Promise<StoreLayout | null> {
    const cacheKey = cacheKeyPatterns.storeLayoutPublished(tenantId, pageType);

    return withCache(cacheKey, "storeConfig", async () => {
      return withTenant(tenantId, async (tx) => {
        const [config] = await tx
          .select()
          .from(storeConfigs)
          .where(
            and(
              eq(storeConfigs.pageType, pageType),
              eq(storeConfigs.isPublished, true)
            )
          )
          .limit(1);
        
        return config?.layout || null;
      });
    });
  }

  /**
   * Get draft layout for editing
   */
  async getDraftLayout(tenantId: string, pageType: StorePageType): Promise<StoreLayout | null> {
    const cacheKey = cacheKeyPatterns.storeLayoutDraft(tenantId, pageType);

    return withCache(cacheKey, "storeConfig", async () => {
      const config = await this.findByPageType(tenantId, pageType);
      
      // Return draft if exists, otherwise return published layout
      return config?.draftLayout || config?.layout || null;
    });
  }

  /**
   * Save draft layout (auto-save from editor)
   */
  async saveDraft(tenantId: string, pageType: StorePageType, layout: StoreLayout) {
    const result = await withTenant(tenantId, async (tx) => {
      const existing = await tx
        .select()
        .from(storeConfigs)
        .where(eq(storeConfigs.pageType, pageType))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        const [updated] = await tx
          .update(storeConfigs)
          .set({
            draftLayout: layout,
            updatedAt: new Date(),
          })
          .where(eq(storeConfigs.id, existing[0].id))
          .returning();
        
        return updated;
      } else {
        // Create new
        const [created] = await tx
          .insert(storeConfigs)
          .values({
            tenantId,
            pageType,
            draftLayout: layout,
            layout: { sections: [], version: 1 },
            isPublished: false,
          })
          .returning();
        
        return created;
      }
    });

    // Invalidate caches after mutation
    this.invalidateStoreConfigCaches(tenantId);

    return result;
  }

  /**
   * Publish draft layout
   */
  async publish(tenantId: string, pageType: StorePageType) {
    const result = await withTenant(tenantId, async (tx) => {
      const [config] = await tx
        .select()
        .from(storeConfigs)
        .where(eq(storeConfigs.pageType, pageType))
        .limit(1);

      if (!config) {
        throw new Error("No config found to publish");
      }

      const layoutToPublish = config.draftLayout || config.layout;
      
      const [updated] = await tx
        .update(storeConfigs)
        .set({
          layout: layoutToPublish,
          draftLayout: null, // Clear draft after publishing
          isPublished: true,
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(storeConfigs.id, config.id))
        .returning();

      return updated;
    });

    // Invalidate caches after mutation
    this.invalidateStoreConfigCaches(tenantId);

    return result;
  }

  /**
   * Discard draft changes
   */
  async discardDraft(tenantId: string, pageType: StorePageType) {
    const result = await withTenant(tenantId, async (tx) => {
      const [updated] = await tx
        .update(storeConfigs)
        .set({
          draftLayout: null,
          updatedAt: new Date(),
        })
        .where(eq(storeConfigs.pageType, pageType))
        .returning();

      return updated;
    });

    // Invalidate caches after mutation
    this.invalidateStoreConfigCaches(tenantId);

    return result;
  }

  /**
   * Get all page configs for a tenant
   */
  async getAllConfigs(tenantId: string) {
    return this.findAll(tenantId);
  }

  /**
   * Initialize default configs for a new tenant
   */
  async initializeDefaults(tenantId: string) {
    const defaultPages: StorePageType[] = ["home", "product", "category", "checkout", "cart"];
    
    const result = await withTenant(tenantId, async (tx) => {
      const configs = await Promise.all(
        defaultPages.map(pageType =>
          tx
            .insert(storeConfigs)
            .values({
              tenantId,
              pageType,
              layout: { sections: [], version: 1 },
              isPublished: false,
            })
            .returning()
        )
      );

      return configs.flat();
    });

    // Invalidate caches after mutation
    this.invalidateStoreConfigCaches(tenantId);

    return result;
  }
}

// Singleton instance
export const storeConfigRepository = new StoreConfigRepository();
