"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

// ============================================================================
// STORE SETTINGS
// ============================================================================

export async function updateStoreSettings(formData: FormData): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedUser();

        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const logoUrl = formData.get("logoUrl") as string;
        const primaryColor = formData.get("primaryColor") as string;
        const secondaryColor = formData.get("secondaryColor") as string;
        const currency = formData.get("currency") as string;

        if (!name?.trim()) {
            return { error: "Store name is required" };
        }

        const { error } = await supabase
            .from("tenants")
            .update({
                name,
                description: description || null,
                logo_url: logoUrl || null,
                primary_color: primaryColor || "#000000",
                secondary_color: secondaryColor || "#ffffff",
                currency: currency || "USD",
                updated_at: new Date().toISOString(),
            })
            .eq("id", tenantId);

        if (error) {
            return { error: `Failed to update store settings: ${error.message}` };
        }

        revalidatePath("/dashboard/settings");
        return {};
    } catch (err) {
        console.error("Update store settings error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update settings" };
    }
}

export async function updateStoreSeoSettings(formData: FormData): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedUser();

        const metaTitle = formData.get("metaTitle") as string;
        const metaDescription = formData.get("metaDescription") as string;
        const ogImage = formData.get("ogImage") as string;
        const googleAnalyticsId = formData.get("googleAnalyticsId") as string;
        const facebookPixelId = formData.get("facebookPixelId") as string;

        // Get current settings
        const { data: tenant } = await supabase
            .from("tenants")
            .select("settings")
            .eq("id", tenantId)
            .single();

        const settings = (tenant?.settings as Record<string, unknown>) || {};
        settings.seo = {
            metaTitle: metaTitle || null,
            metaDescription: metaDescription || null,
            ogImage: ogImage || null,
        };
        settings.analytics = {
            googleAnalyticsId: googleAnalyticsId || null,
            facebookPixelId: facebookPixelId || null,
        };

        const { error } = await supabase
            .from("tenants")
            .update({ settings, updated_at: new Date().toISOString() })
            .eq("id", tenantId);

        if (error) {
            return { error: `Failed to update SEO settings: ${error.message}` };
        }

        revalidatePath("/dashboard/settings");
        return {};
    } catch (err) {
        console.error("Update SEO settings error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update settings" };
    }
}

export async function updateStoreSocialSettings(formData: FormData): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedUser();

        const facebook = formData.get("facebook") as string;
        const instagram = formData.get("instagram") as string;
        const twitter = formData.get("twitter") as string;
        const tiktok = formData.get("tiktok") as string;
        const youtube = formData.get("youtube") as string;
        const linkedin = formData.get("linkedin") as string;

        // Get current settings
        const { data: tenant } = await supabase
            .from("tenants")
            .select("settings")
            .eq("id", tenantId)
            .single();

        const settings = (tenant?.settings as Record<string, unknown>) || {};
        settings.social = {
            facebook: facebook || null,
            instagram: instagram || null,
            twitter: twitter || null,
            tiktok: tiktok || null,
            youtube: youtube || null,
            linkedin: linkedin || null,
        };

        const { error } = await supabase
            .from("tenants")
            .update({ settings, updated_at: new Date().toISOString() })
            .eq("id", tenantId);

        if (error) {
            return { error: `Failed to update social settings: ${error.message}` };
        }

        revalidatePath("/dashboard/settings");
        return {};
    } catch (err) {
        console.error("Update social settings error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update settings" };
    }
}

// ============================================================================
// USER/ACCOUNT SETTINGS
// ============================================================================

export async function updateUserProfile(formData: FormData): Promise<{ error?: string }> {
    try {
        const { supabase, user } = await getAuthenticatedUser();

        const fullName = formData.get("fullName") as string;
        const avatarUrl = formData.get("avatarUrl") as string;

        const { error } = await supabase
            .from("users")
            .update({
                full_name: fullName || null,
                avatar_url: avatarUrl || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        if (error) {
            return { error: `Failed to update profile: ${error.message}` };
        }

        revalidatePath("/dashboard/settings/account");
        return {};
    } catch (err) {
        console.error("Update user profile error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update profile" };
    }
}

export async function updateUserEmail(formData: FormData): Promise<{ error?: string }> {
    try {
        const { supabase } = await getAuthenticatedUser();

        const newEmail = formData.get("email") as string;

        if (!newEmail?.trim()) {
            return { error: "Email is required" };
        }

        const { error } = await supabase.auth.updateUser({ email: newEmail });

        if (error) {
            return { error: `Failed to update email: ${error.message}` };
        }

        return {};
    } catch (err) {
        console.error("Update email error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update email" };
    }
}

export async function updateUserPassword(formData: FormData): Promise<{ error?: string }> {
    try {
        const { supabase } = await getAuthenticatedUser();

        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (!newPassword || newPassword.length < 8) {
            return { error: "Password must be at least 8 characters" };
        }

        if (newPassword !== confirmPassword) {
            return { error: "Passwords do not match" };
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            return { error: `Failed to update password: ${error.message}` };
        }

        return {};
    } catch (err) {
        console.error("Update password error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update password" };
    }
}

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

export async function updateNotificationSettings(formData: FormData): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedUser();

        const orderNotifications = formData.get("orderNotifications") === "true";
        const lowStockAlerts = formData.get("lowStockAlerts") === "true";
        const lowStockThreshold = parseInt(formData.get("lowStockThreshold") as string) || 10;
        const customerSignups = formData.get("customerSignups") === "true";
        const weeklyReports = formData.get("weeklyReports") === "true";
        const marketingEmails = formData.get("marketingEmails") === "true";

        // Get current settings
        const { data: tenant } = await supabase
            .from("tenants")
            .select("settings")
            .eq("id", tenantId)
            .single();

        const settings = (tenant?.settings as Record<string, unknown>) || {};
        settings.notifications = {
            orderNotifications,
            lowStockAlerts,
            lowStockThreshold,
            customerSignups,
            weeklyReports,
            marketingEmails,
        };

        const { error } = await supabase
            .from("tenants")
            .update({ settings, updated_at: new Date().toISOString() })
            .eq("id", tenantId);

        if (error) {
            return { error: `Failed to update notification settings: ${error.message}` };
        }

        revalidatePath("/dashboard/settings/notifications");
        return {};
    } catch (err) {
        console.error("Update notification settings error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update settings" };
    }
}

// ============================================================================
// TEAM MANAGEMENT
// ============================================================================

export async function inviteTeamMember(formData: FormData): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId, userData } = await getAuthenticatedUser();

        // Only owners can invite team members
        if (userData.role !== "owner") {
            return { error: "Only store owners can invite team members" };
        }

        const email = formData.get("email") as string;
        const role = formData.get("role") as "admin" | "staff";

        if (!email?.trim()) {
            return { error: "Email is required" };
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .eq("tenant_id", tenantId)
            .single();

        if (existingUser) {
            return { error: "User already exists in your team" };
        }

        // In a real app, you'd send an invitation email here
        // For now, we'll just return success
        // The invited user would need to sign up and be linked to this tenant

        return {};
    } catch (err) {
        console.error("Invite team member error:", err);
        return { error: err instanceof Error ? err.message : "Failed to send invitation" };
    }
}

export async function updateTeamMemberRole(
    memberId: string,
    newRole: "admin" | "staff"
): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId, userData } = await getAuthenticatedUser();

        // Only owners can change roles
        if (userData.role !== "owner") {
            return { error: "Only store owners can change team member roles" };
        }

        const { error } = await supabase
            .from("users")
            .update({ role: newRole, updated_at: new Date().toISOString() })
            .eq("id", memberId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { error: `Failed to update role: ${error.message}` };
        }

        revalidatePath("/dashboard/settings/team");
        return {};
    } catch (err) {
        console.error("Update team member role error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update role" };
    }
}

export async function removeTeamMember(memberId: string): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId, userData, user } = await getAuthenticatedUser();

        // Only owners can remove team members
        if (userData.role !== "owner") {
            return { error: "Only store owners can remove team members" };
        }

        // Can't remove yourself
        if (memberId === user.id) {
            return { error: "You cannot remove yourself from the team" };
        }

        const { error } = await supabase
            .from("users")
            .delete()
            .eq("id", memberId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { error: `Failed to remove team member: ${error.message}` };
        }

        revalidatePath("/dashboard/settings/team");
        return {};
    } catch (err) {
        console.error("Remove team member error:", err);
        return { error: err instanceof Error ? err.message : "Failed to remove team member" };
    }
}

// ============================================================================
// CHECKOUT SETTINGS
// ============================================================================

export async function updateCheckoutSettings(formData: FormData): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedUser();

        const guestCheckout = formData.get("guestCheckout") === "true";
        const requirePhone = formData.get("requirePhone") === "true";
        const requireCompany = formData.get("requireCompany") === "true";
        const orderNotes = formData.get("orderNotes") === "true";
        const termsUrl = formData.get("termsUrl") as string;
        const privacyUrl = formData.get("privacyUrl") as string;
        const refundPolicy = formData.get("refundPolicy") as string;

        // Get current settings
        const { data: tenant } = await supabase
            .from("tenants")
            .select("settings")
            .eq("id", tenantId)
            .single();

        const settings = (tenant?.settings as Record<string, unknown>) || {};
        settings.checkout = {
            guestCheckout,
            requirePhone,
            requireCompany,
            orderNotes,
            termsUrl: termsUrl || null,
            privacyUrl: privacyUrl || null,
            refundPolicy: refundPolicy || null,
        };

        const { error } = await supabase
            .from("tenants")
            .update({ settings, updated_at: new Date().toISOString() })
            .eq("id", tenantId);

        if (error) {
            return { error: `Failed to update checkout settings: ${error.message}` };
        }

        revalidatePath("/dashboard/settings/checkout");
        return {};
    } catch (err) {
        console.error("Update checkout settings error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update settings" };
    }
}
