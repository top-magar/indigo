"use server";

import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

const log = createLogger("actions:account");

export async function updateUserProfile(formData: FormData): Promise<{ error?: string }> {
  try {
    const { user, supabase } = await getAuthenticatedClient();
    const fullName = z.string().min(1).parse(formData.get("fullName"));
    const avatarUrl = (formData.get("avatarUrl") as string) || null;

    const { error } = await supabase
      .from("users")
      .update({ full_name: fullName, avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) return { error: error.message };
    revalidatePath("/dashboard/settings/account");
    revalidateTag("dashboard", "seconds");
    return {};
  } catch (err) {
    log.error("Update profile error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update profile" };
  }
}

export async function updateUserEmail(formData: FormData): Promise<{ error?: string }> {
  try {
    const { supabase } = await getAuthenticatedClient();
    const email = z.string().email().parse(formData.get("email"));

    const { error } = await supabase.auth.updateUser({ email });
    if (error) return { error: error.message };
    return {};
  } catch (err) {
    log.error("Update email error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update email" };
  }
}

export async function updateUserPassword(formData: FormData): Promise<{ error?: string }> {
  try {
    const { supabase } = await getAuthenticatedClient();
    const newPassword = z.string().min(8, "Password must be at least 8 characters").parse(formData.get("newPassword"));
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) return { error: "Passwords do not match" };

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return {};
  } catch (err) {
    log.error("Update password error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update password" };
  }
}
