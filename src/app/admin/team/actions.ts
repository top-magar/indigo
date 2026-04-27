"use server";

import { db } from "@/infrastructure/db";
import { users } from "@/db/schema/users";
import { platformInvites } from "@/db/schema/platform-invites";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomBytes } from "crypto";
import { requirePermission } from "../_lib/permissions";
import { logAdminAction } from "../_lib/audit";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "support", "finance"]),
});

export async function invitePlatformMember(input: z.infer<typeof inviteSchema>): Promise<{ error?: string }> {
  const user = await requirePermission("manage_team");
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const { email, role } = parsed.data;

  // Check if already a platform member
  const [existing] = await db.select({ id: users.id })
    .from(users).where(eq(users.email, email)).limit(1);
  if (existing) return { error: "This email is already registered" };

  // Check for pending invite
  const [pendingInvite] = await db.select({ id: platformInvites.id })
    .from(platformInvites)
    .where(eq(platformInvites.email, email))
    .limit(1);
  if (pendingInvite) return { error: "An invite is already pending for this email" };

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 86400000); // 7 days

  await db.insert(platformInvites).values({
    email, platformRole: role, token, invitedBy: user.id, expiresAt,
  });

  // Send invite email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite?token=${token}`;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: emailError } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Indigo Platform <noreply@indigo.store>",
      to: email,
      subject: "You've been invited to Indigo Admin",
      html: `<p>You've been invited to join the Indigo platform team as <strong>${role}</strong>.</p>
        <p><a href="${inviteUrl}">Accept Invite</a></p>
        <p>This link expires in 7 days.</p>`,
      headers: { "X-Entity-Ref-ID": `platform-invite/${token}` },
    });
    if (emailError) console.error("Invite email failed:", emailError.message);
  } catch {
    // Email failed but invite is created — admin can share link manually
  }

  logAdminAction({
    actorId: user.id, actorEmail: user.email, action: "settings.update",
    targetType: "invite", targetName: `${email} as ${role}`,
  });

  revalidatePath("/admin/team");
  return {};
}

export async function removePlatformMember(memberId: string): Promise<{ error?: string }> {
  const user = await requirePermission("manage_team");
  if (memberId === user.id) return { error: "Cannot remove yourself" };

  const [member] = await db.select({ id: users.id, email: users.email, platformRole: users.platformRole })
    .from(users).where(eq(users.id, memberId)).limit(1);
  if (!member) return { error: "Member not found" };
  if (member.platformRole === "super_admin") return { error: "Cannot remove the owner" };

  // Remove platform access — delete the user row entirely since they have no tenant
  await db.delete(users).where(eq(users.id, memberId));

  logAdminAction({
    actorId: user.id, actorEmail: user.email, action: "settings.update",
    targetType: "user", targetId: memberId, targetName: `Removed ${member.email}`,
  });

  revalidatePath("/admin/team");
  return {};
}

const changeRoleSchema = z.object({
  memberId: z.string().uuid(),
  newRole: z.enum(["admin", "support", "finance"]),
});

export async function changeRole(memberId: string, newRole: string): Promise<{ error?: string }> {
  const user = await requirePermission("manage_team");
  const parsed = changeRoleSchema.safeParse({ memberId, newRole });
  if (!parsed.success) return { error: "Invalid input" };
  if (parsed.data.memberId === user.id) return { error: "Cannot change your own role" };

  const [member] = await db.select({ id: users.id, platformRole: users.platformRole })
    .from(users).where(eq(users.id, parsed.data.memberId)).limit(1);
  if (!member) return { error: "Member not found" };
  if (member.platformRole === "super_admin") return { error: "Cannot change owner role" };

  await db.update(users)
    .set({ platformRole: parsed.data.newRole, updatedAt: new Date() })
    .where(eq(users.id, parsed.data.memberId));

  revalidatePath("/admin/team");
  return {};
}

export async function cancelInvite(inviteId: string): Promise<{ error?: string }> {
  const user = await requirePermission("manage_team");
  const parsed = z.string().uuid().safeParse(inviteId);
  if (!parsed.success) return { error: "Invalid invite ID" };
  await db.delete(platformInvites).where(eq(platformInvites.id, parsed.data));
  revalidatePath("/admin/team");
  return {};
}
