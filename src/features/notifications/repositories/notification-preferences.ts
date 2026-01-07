import "server-only";
import { 
  notificationPreferences, 
  quietHoursSettings,
  type NotificationCategory,
  type NotificationChannel,
  type NotificationFrequency,
  type NotificationPreference,
  type QuietHoursSetting,
} from "@/db/schema/notification-preferences";
import { eq, and } from "drizzle-orm";
import { withTenant } from "@/infrastructure/db";

/**
 * Notification Preferences Repository
 * 
 * Manages user notification preferences with tenant isolation.
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.1
 * @see SYSTEM-ARCHITECTURE.md Section 5.2 (Multitenancy Safeguards)
 */

// Input types
export interface NotificationPreferenceInput {
  category: NotificationCategory;
  channel: NotificationChannel;
  enabled: boolean;
  frequency: NotificationFrequency;
}

export interface QuietHoursInput {
  enabled: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface UserNotificationPreferences {
  preferences: NotificationPreference[];
  quietHours: QuietHoursSetting | null;
}

// Default preferences for new users
const ALL_CATEGORIES: NotificationCategory[] = ["orders", "inventory", "system", "mentions"];
const ALL_CHANNELS: NotificationChannel[] = ["in_app", "email", "push"];

export class NotificationPreferencesRepository {
  /**
   * Get all notification preferences for a user
   */
  async findByUser(tenantId: string, userId: string): Promise<UserNotificationPreferences> {
    return withTenant(tenantId, async (tx) => {
      const preferences = await tx
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));

      const [quietHours] = await tx
        .select()
        .from(quietHoursSettings)
        .where(eq(quietHoursSettings.userId, userId))
        .limit(1);

      return {
        preferences,
        quietHours: quietHours || null,
      };
    });
  }

  /**
   * Get a specific preference
   */
  async findPreference(
    tenantId: string, 
    userId: string, 
    category: NotificationCategory, 
    channel: NotificationChannel
  ): Promise<NotificationPreference | null> {
    return withTenant(tenantId, async (tx) => {
      const [result] = await tx
        .select()
        .from(notificationPreferences)
        .where(
          and(
            eq(notificationPreferences.userId, userId),
            eq(notificationPreferences.category, category),
            eq(notificationPreferences.channel, channel)
          )
        )
        .limit(1);

      return result || null;
    });
  }

  /**
   * Upsert a notification preference
   */
  async upsertPreference(
    tenantId: string,
    userId: string,
    input: NotificationPreferenceInput
  ): Promise<NotificationPreference> {
    return withTenant(tenantId, async (tx) => {
      // Check if preference exists
      const [existing] = await tx
        .select()
        .from(notificationPreferences)
        .where(
          and(
            eq(notificationPreferences.userId, userId),
            eq(notificationPreferences.category, input.category),
            eq(notificationPreferences.channel, input.channel)
          )
        )
        .limit(1);

      if (existing) {
        // Update existing
        const [updated] = await tx
          .update(notificationPreferences)
          .set({
            enabled: input.enabled,
            frequency: input.frequency,
            updatedAt: new Date(),
          })
          .where(eq(notificationPreferences.id, existing.id))
          .returning();

        return updated;
      } else {
        // Create new
        const [created] = await tx
          .insert(notificationPreferences)
          .values({
            tenantId,
            userId,
            category: input.category,
            channel: input.channel,
            enabled: input.enabled,
            frequency: input.frequency,
          })
          .returning();

        return created;
      }
    });
  }

  /**
   * Bulk upsert notification preferences
   */
  async bulkUpsertPreferences(
    tenantId: string,
    userId: string,
    inputs: NotificationPreferenceInput[]
  ): Promise<NotificationPreference[]> {
    const results: NotificationPreference[] = [];

    for (const input of inputs) {
      const result = await this.upsertPreference(tenantId, userId, input);
      results.push(result);
    }

    return results;
  }

  /**
   * Get or create quiet hours settings for a user
   */
  async getQuietHours(tenantId: string, userId: string): Promise<QuietHoursSetting | null> {
    return withTenant(tenantId, async (tx) => {
      const [result] = await tx
        .select()
        .from(quietHoursSettings)
        .where(eq(quietHoursSettings.userId, userId))
        .limit(1);

      return result || null;
    });
  }

  /**
   * Upsert quiet hours settings
   */
  async upsertQuietHours(
    tenantId: string,
    userId: string,
    input: QuietHoursInput
  ): Promise<QuietHoursSetting> {
    return withTenant(tenantId, async (tx) => {
      // Check if settings exist
      const [existing] = await tx
        .select()
        .from(quietHoursSettings)
        .where(eq(quietHoursSettings.userId, userId))
        .limit(1);

      if (existing) {
        // Update existing
        const [updated] = await tx
          .update(quietHoursSettings)
          .set({
            enabled: input.enabled,
            startTime: input.startTime,
            endTime: input.endTime,
            timezone: input.timezone,
            updatedAt: new Date(),
          })
          .where(eq(quietHoursSettings.id, existing.id))
          .returning();

        return updated;
      } else {
        // Create new
        const [created] = await tx
          .insert(quietHoursSettings)
          .values({
            tenantId,
            userId,
            enabled: input.enabled,
            startTime: input.startTime,
            endTime: input.endTime,
            timezone: input.timezone,
          })
          .returning();

        return created;
      }
    });
  }

  /**
   * Initialize default preferences for a new user
   */
  async initializeDefaults(tenantId: string, userId: string): Promise<void> {
    await withTenant(tenantId, async (tx) => {
      // Create default preferences for all category/channel combinations
      const defaultPrefs = ALL_CATEGORIES.flatMap(category =>
        ALL_CHANNELS.map(channel => ({
          tenantId,
          userId,
          category,
          channel,
          enabled: channel !== "push", // Push disabled by default (future feature)
          frequency: "realtime" as NotificationFrequency,
        }))
      );

      // Insert all defaults (ignore conflicts)
      for (const pref of defaultPrefs) {
        await tx
          .insert(notificationPreferences)
          .values(pref)
          .onConflictDoNothing();
      }

      // Create default quiet hours (disabled)
      await tx
        .insert(quietHoursSettings)
        .values({
          tenantId,
          userId,
          enabled: false,
          startTime: "22:00",
          endTime: "08:00",
          timezone: "UTC",
        })
        .onConflictDoNothing();
    });
  }

  /**
   * Check if notifications should be delivered for a user/category/channel
   */
  async shouldDeliver(
    tenantId: string,
    userId: string,
    category: NotificationCategory,
    channel: NotificationChannel
  ): Promise<{ deliver: boolean; frequency: NotificationFrequency }> {
    const pref = await this.findPreference(tenantId, userId, category, channel);

    if (!pref || !pref.enabled) {
      return { deliver: false, frequency: "realtime" };
    }

    return { deliver: true, frequency: pref.frequency || "realtime" };
  }

  /**
   * Delete all preferences for a user (for account deletion)
   */
  async deleteUserPreferences(tenantId: string, userId: string): Promise<void> {
    await withTenant(tenantId, async (tx) => {
      await tx
        .delete(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));

      await tx
        .delete(quietHoursSettings)
        .where(eq(quietHoursSettings.userId, userId));
    });
  }
}

// Singleton instance
export const notificationPreferencesRepository = new NotificationPreferencesRepository();

// Re-export types from schema
export type {
  NotificationCategory,
  NotificationChannel,
  NotificationFrequency,
  NotificationPreference,
  QuietHoursSetting,
};
