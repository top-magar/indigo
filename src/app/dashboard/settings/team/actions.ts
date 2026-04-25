"use server";

import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const log = createLogger("actions:team");

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || "team@resend.dev";

export async function inviteTeamMember(formData: FormData): Promise<{ error?: string }> {
  try {
    const { user, supabase } = await getAuthenticatedClient();
    if (user.role !== "owner") return { error: "Only store owners can invite team members" };

    const email = z.string().email().parse(formData.get("email"));
    const role = z.enum(["admin", "staff"]).parse(formData.get("role"));

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .eq("tenant_id", user.tenantId)
      .single();

    if (existing) return { error: "User already exists in your team" };

    // Get tenant name for the email
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name")
      .eq("id", user.tenantId)
      .single();

    const storeName = tenant?.name || "the store";
    const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/signup?invite=${encodeURIComponent(email)}&tenant=${user.tenantId}&role=${role}`;

    // Send invitation email
    if (resend) {
      const { error: emailError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `You've been invited to join ${storeName} on Indigo`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <div style="width: 28px; height: 28px; border-radius: 7px; background: #09090b; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">I</div>
            <h2 style="font-size: 20px; font-weight: 600; color: #09090b; margin: 24px 0 8px;">You're invited!</h2>
            <p style="font-size: 15px; color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
              ${user.email} has invited you to join <strong>${storeName}</strong> as ${role === "admin" ? "an admin" : "a staff member"} on Indigo.
            </p>
            <a href="${signupUrl}" style="display: inline-block; padding: 12px 24px; border-radius: 8px; background: #09090b; color: #fff; text-decoration: none; font-size: 14px; font-weight: 500;">
              Accept Invitation
            </a>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 32px;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        `,
      });
      if (emailError) {
        log.error("Failed to send invitation email:", emailError);
        return { error: "Failed to send invitation email. Please try again." };
      }
    } else {
      log.warn("RESEND_API_KEY not configured — invitation email not sent");
    }

    revalidatePath("/dashboard/settings/team");
    return {};
  } catch (err) {
    log.error("Invite team member error:", err);
    return { error: err instanceof Error ? err.message : "Failed to send invitation" };
  }
}

export async function updateTeamMemberRole(memberId: string, newRole: "admin" | "staff"): Promise<{ error?: string }> {
  try {
    const { user, supabase } = await getAuthenticatedClient();
    if (user.role !== "owner") return { error: "Only store owners can change roles" };

    const id = z.string().uuid().parse(memberId);
    const { error } = await supabase
      .from("users")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("tenant_id", user.tenantId);

    if (error) return { error: error.message };
    revalidatePath("/dashboard/settings/team");
    return {};
  } catch (err) {
    log.error("Update role error:", err);
    return { error: err instanceof Error ? err.message : "Failed to update role" };
  }
}

export async function removeTeamMember(memberId: string): Promise<{ error?: string }> {
  try {
    const { user, supabase } = await getAuthenticatedClient();
    if (user.role !== "owner") return { error: "Only store owners can remove team members" };
    if (memberId === user.id) return { error: "You cannot remove yourself" };

    const id = z.string().uuid().parse(memberId);
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .eq("tenant_id", user.tenantId);

    if (error) return { error: error.message };
    revalidatePath("/dashboard/settings/team");
    return {};
  } catch (err) {
    log.error("Remove team member error:", err);
    return { error: err instanceof Error ? err.message : "Failed to remove team member" };
  }
}
