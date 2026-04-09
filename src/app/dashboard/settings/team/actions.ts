"use server";

import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const log = createLogger("actions:team");

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

    // TODO: Send invitation email
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
