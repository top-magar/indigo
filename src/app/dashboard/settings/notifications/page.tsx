import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { NotificationsSettingsClient } from "./notifications-settings-client";
import { getNotificationPreferences } from "./actions";

export const metadata: Metadata = {
  title: "Notification Settings | Dashboard",
  description: "Manage your notification preferences.",
};

export default async function NotificationsSettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  if (!userData?.tenant_id) redirect("/auth/login");

  // Load user's notification preferences
  const { data: preferences, error } = await getNotificationPreferences();

  if (error || !preferences) {
    // If there's an error loading preferences, show with empty defaults
    // The client component will handle initialization
    return (
      <NotificationsSettingsClient 
        initialPreferences={{
          preferences: [],
          quietHours: null,
        }}
        userRole={userData.role}
      />
    );
  }

  return (
    <NotificationsSettingsClient 
      initialPreferences={preferences}
      userRole={userData.role}
    />
  );
}
