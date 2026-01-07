import "server-only";
import {
  dashboardLayouts,
  type DashboardLayout,
  type DashboardWidget,
} from "@/db/schema/dashboard-layouts";
import { eq, and, desc } from "drizzle-orm";
import { withTenant } from "@/infrastructure/db";

/**
 * Dashboard Layouts Repository
 * 
 * Manages dashboard layout persistence with tenant isolation.
 * Supports multiple named layouts per user with default selection.
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.1
 * @see SYSTEM-ARCHITECTURE.md Section 5.2 (Multitenancy Safeguards)
 */

// Input types
export interface DashboardLayoutCreateInput {
  layoutName: string;
  widgets: DashboardWidget[];
  columns?: number;
  rowHeight?: number;
  gap?: number;
  isDefault?: boolean;
}

export interface DashboardLayoutUpdateInput {
  layoutName?: string;
  widgets?: DashboardWidget[];
  columns?: number;
  rowHeight?: number;
  gap?: number;
  isDefault?: boolean;
}

export interface LayoutPreferencesInput {
  widgets: DashboardWidget[];
  columns: number;
  rowHeight: number;
  gap: number;
}

export class DashboardLayoutsRepository {
  /**
   * Create a new dashboard layout
   */
  async create(
    tenantId: string,
    userId: string,
    input: DashboardLayoutCreateInput
  ): Promise<DashboardLayout> {
    return withTenant(tenantId, async (tx) => {
      // If this layout is set as default, unset other defaults for this user
      if (input.isDefault) {
        await tx
          .update(dashboardLayouts)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(
            and(
              eq(dashboardLayouts.tenantId, tenantId),
              eq(dashboardLayouts.userId, userId),
              eq(dashboardLayouts.isDefault, true)
            )
          );
      }

      const [created] = await tx
        .insert(dashboardLayouts)
        .values({
          tenantId,
          userId,
          layoutName: input.layoutName,
          widgets: input.widgets,
          columns: input.columns ?? 12,
          rowHeight: input.rowHeight ?? 100,
          gap: input.gap ?? 16,
          isDefault: input.isDefault ?? false,
        })
        .returning();

      return created;
    });
  }

  /**
   * Get a layout by ID
   */
  async getById(tenantId: string, layoutId: string): Promise<DashboardLayout | null> {
    return withTenant(tenantId, async (tx) => {
      const [result] = await tx
        .select()
        .from(dashboardLayouts)
        .where(eq(dashboardLayouts.id, layoutId))
        .limit(1);

      return result || null;
    });
  }

  /**
   * Get all layouts for a user
   */
  async getByUserId(tenantId: string, userId: string): Promise<DashboardLayout[]> {
    return withTenant(tenantId, async (tx) => {
      const results = await tx
        .select()
        .from(dashboardLayouts)
        .where(
          and(
            eq(dashboardLayouts.tenantId, tenantId),
            eq(dashboardLayouts.userId, userId)
          )
        )
        .orderBy(desc(dashboardLayouts.updatedAt));

      return results;
    });
  }

  /**
   * Get the default layout for a user
   */
  async getDefaultForUser(tenantId: string, userId: string): Promise<DashboardLayout | null> {
    return withTenant(tenantId, async (tx) => {
      // First try to get the explicitly set default
      const [defaultLayout] = await tx
        .select()
        .from(dashboardLayouts)
        .where(
          and(
            eq(dashboardLayouts.tenantId, tenantId),
            eq(dashboardLayouts.userId, userId),
            eq(dashboardLayouts.isDefault, true)
          )
        )
        .limit(1);

      if (defaultLayout) {
        return defaultLayout;
      }

      // If no default is set, return the most recently updated layout
      const [mostRecent] = await tx
        .select()
        .from(dashboardLayouts)
        .where(
          and(
            eq(dashboardLayouts.tenantId, tenantId),
            eq(dashboardLayouts.userId, userId)
          )
        )
        .orderBy(desc(dashboardLayouts.updatedAt))
        .limit(1);

      return mostRecent || null;
    });
  }

  /**
   * Update a layout
   */
  async update(
    tenantId: string,
    layoutId: string,
    input: DashboardLayoutUpdateInput
  ): Promise<DashboardLayout | null> {
    return withTenant(tenantId, async (tx) => {
      // Get the existing layout to find the userId
      const [existing] = await tx
        .select()
        .from(dashboardLayouts)
        .where(eq(dashboardLayouts.id, layoutId))
        .limit(1);

      if (!existing) {
        return null;
      }

      // If setting this as default, unset other defaults for this user
      if (input.isDefault) {
        await tx
          .update(dashboardLayouts)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(
            and(
              eq(dashboardLayouts.tenantId, tenantId),
              eq(dashboardLayouts.userId, existing.userId),
              eq(dashboardLayouts.isDefault, true)
            )
          );
      }

      const [updated] = await tx
        .update(dashboardLayouts)
        .set({
          ...(input.layoutName !== undefined && { layoutName: input.layoutName }),
          ...(input.widgets !== undefined && { widgets: input.widgets }),
          ...(input.columns !== undefined && { columns: input.columns }),
          ...(input.rowHeight !== undefined && { rowHeight: input.rowHeight }),
          ...(input.gap !== undefined && { gap: input.gap }),
          ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
          updatedAt: new Date(),
        })
        .where(eq(dashboardLayouts.id, layoutId))
        .returning();

      return updated || null;
    });
  }

  /**
   * Delete a layout
   */
  async delete(tenantId: string, layoutId: string): Promise<boolean> {
    return withTenant(tenantId, async (tx) => {
      const result = await tx
        .delete(dashboardLayouts)
        .where(eq(dashboardLayouts.id, layoutId))
        .returning({ id: dashboardLayouts.id });

      return result.length > 0;
    });
  }

  /**
   * Save layout preferences (upsert)
   * 
   * Creates or updates the default layout for a user.
   * This is the main method used by the dashboard to persist layout changes.
   */
  async saveLayoutPreferences(
    tenantId: string,
    userId: string,
    preferences: LayoutPreferencesInput
  ): Promise<DashboardLayout> {
    return withTenant(tenantId, async (tx) => {
      // Check if user has a default layout
      const [existing] = await tx
        .select()
        .from(dashboardLayouts)
        .where(
          and(
            eq(dashboardLayouts.tenantId, tenantId),
            eq(dashboardLayouts.userId, userId),
            eq(dashboardLayouts.isDefault, true)
          )
        )
        .limit(1);

      if (existing) {
        // Update existing default layout
        const [updated] = await tx
          .update(dashboardLayouts)
          .set({
            widgets: preferences.widgets,
            columns: preferences.columns,
            rowHeight: preferences.rowHeight,
            gap: preferences.gap,
            updatedAt: new Date(),
          })
          .where(eq(dashboardLayouts.id, existing.id))
          .returning();

        return updated;
      } else {
        // Create new default layout
        const [created] = await tx
          .insert(dashboardLayouts)
          .values({
            tenantId,
            userId,
            layoutName: "Default",
            widgets: preferences.widgets,
            columns: preferences.columns,
            rowHeight: preferences.rowHeight,
            gap: preferences.gap,
            isDefault: true,
          })
          .returning();

        return created;
      }
    });
  }

  /**
   * Set a layout as the default for a user
   */
  async setDefault(tenantId: string, userId: string, layoutId: string): Promise<boolean> {
    return withTenant(tenantId, async (tx) => {
      // Unset all other defaults for this user
      await tx
        .update(dashboardLayouts)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(
          and(
            eq(dashboardLayouts.tenantId, tenantId),
            eq(dashboardLayouts.userId, userId),
            eq(dashboardLayouts.isDefault, true)
          )
        );

      // Set the specified layout as default
      const result = await tx
        .update(dashboardLayouts)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(
          and(
            eq(dashboardLayouts.id, layoutId),
            eq(dashboardLayouts.userId, userId)
          )
        )
        .returning({ id: dashboardLayouts.id });

      return result.length > 0;
    });
  }

  /**
   * Duplicate a layout
   */
  async duplicate(
    tenantId: string,
    layoutId: string,
    newName: string
  ): Promise<DashboardLayout | null> {
    return withTenant(tenantId, async (tx) => {
      // Get the source layout
      const [source] = await tx
        .select()
        .from(dashboardLayouts)
        .where(eq(dashboardLayouts.id, layoutId))
        .limit(1);

      if (!source) {
        return null;
      }

      // Create a copy with the new name
      const [created] = await tx
        .insert(dashboardLayouts)
        .values({
          tenantId,
          userId: source.userId,
          layoutName: newName,
          widgets: source.widgets,
          columns: source.columns,
          rowHeight: source.rowHeight,
          gap: source.gap,
          isDefault: false, // Duplicates are never default
        })
        .returning();

      return created;
    });
  }
}

// Singleton instance
export const dashboardLayoutsRepository = new DashboardLayoutsRepository();

// Re-export types
export type { DashboardLayout, DashboardWidget };
