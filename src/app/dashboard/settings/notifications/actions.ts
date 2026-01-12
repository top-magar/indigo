"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { 
  notificationPreferencesRepository,
  type NotificationCategory,
  type NotificationChannel,
  type NotificationFrequency,
  type NotificationPreferenceInput,
  type QuietHoursInput,
  type UserNotificationPreferences,
} from "@/features/notifications/repositories";

/**
 * Server Actions for Notification Preferences
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.1
 */

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("*, tenants(*)")
    .eq("id", user.id)
    .single();

  if (!userData?.tenant_id) {
    redirect("/login");
  }

  return { supabase, user, userData, tenantId: userData.tenant_id };
}

/**
 * Get notification preferences for the current user
 */
export async function getNotificationPreferences(): Promise<{
  data?: UserNotificationPreferences;
  error?: string;
}> {
  try {
    const { user, tenantId } = await getAuthenticatedUser();
    
    const preferences = await notificationPreferencesRepository.findByUser(
      tenantId,
      user.id
    );

    // If no preferences exist, initialize defaults
    if (preferences.preferences.length === 0) {
      await notificationPreferencesRepository.initializeDefaults(tenantId, user.id);
      const newPreferences = await notificationPreferencesRepository.findByUser(
        tenantId,
        user.id
      );
      return { data: newPreferences };
    }

    return { data: preferences };
  } catch (err) {
    console.error("Get notification preferences error:", err);
    return { error: err instanceof Error ? err.message : "Failed to load preferences" };
  }
}

/**
 * Update notification preferences for the current user
 */
export async function updateNotificationPreferences(
  preferences: NotificationPreferenceInput[]
): Promise<{ error?: string }> {
  try {
    const { user, tenantId } = await getAuthenticatedUser();

    await notificationPreferencesRepository.bulkUpsertPreferences(
      tenantId,
      user.id,
      preferences
    );

    revalidatePath("/dashboard/settings/notifications");
    return {};
  } catch (err) {
    console.error("Update notification preferences error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update preferences" };
  }
}

/**
 * Update a single notification preference
 */
export async function updateSinglePreference(
  category: NotificationCategory,
  channel: NotificationChannel,
  enabled: boolean,
  frequency: NotificationFrequency
): Promise<{ error?: string }> {
  try {
    const { user, tenantId } = await getAuthenticatedUser();

    await notificationPreferencesRepository.upsertPreference(
      tenantId,
      user.id,
      { category, channel, enabled, frequency }
    );

    revalidatePath("/dashboard/settings/notifications");
    return {};
  } catch (err) {
    console.error("Update single preference error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update preference" };
  }
}

/**
 * Update quiet hours settings
 */
export async function updateQuietHours(
  input: QuietHoursInput
): Promise<{ error?: string }> {
  try {
    const { user, tenantId } = await getAuthenticatedUser();

    await notificationPreferencesRepository.upsertQuietHours(
      tenantId,
      user.id,
      input
    );

    revalidatePath("/dashboard/settings/notifications");
    return {};
  } catch (err) {
    console.error("Update quiet hours error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update quiet hours" };
  }
}

/**
 * Reset all notification preferences to defaults
 */
export async function resetNotificationPreferences(): Promise<{ error?: string }> {
  try {
    const { user, tenantId } = await getAuthenticatedUser();

    // Delete existing preferences
    await notificationPreferencesRepository.deleteUserPreferences(tenantId, user.id);
    
    // Re-initialize with defaults
    await notificationPreferencesRepository.initializeDefaults(tenantId, user.id);

    revalidatePath("/dashboard/settings/notifications");
    return {};
  } catch (err) {
    console.error("Reset notification preferences error:", err);
    return { error: err instanceof Error ? err.message : "Failed to reset preferences" };
  }
}
