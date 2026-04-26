import { db } from "@/infrastructure/db";
import { users } from "@/db/schema/users";
import { platformInvites } from "@/db/schema/platform-invites";
import { eq, desc } from "drizzle-orm";
import { requirePermission } from "../_lib/permissions";
import { getPlatformUser } from "../_lib/permissions";
import TeamClient from "./team-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Team | Admin" };

export default async function TeamPage() {
  const currentUser = await getPlatformUser();
  const canManage = currentUser.platformRole === "super_admin";

  // If not super_admin or admin, redirect
  if (currentUser.platformRole !== "super_admin" && currentUser.platformRole !== "admin") {
    const { redirect } = await import("next/navigation");
    redirect("/admin");
  }

  const [members, invites] = await Promise.all([
    db.select({
      id: users.id, email: users.email, fullName: users.fullName,
      platformRole: users.platformRole, createdAt: users.createdAt,
    }).from(users).where(eq(users.role, "platform_admin")).orderBy(users.createdAt),
    canManage
      ? db.select().from(platformInvites).where(eq(platformInvites.status, "pending")).orderBy(desc(platformInvites.createdAt))
      : Promise.resolve([]),
  ]);

  return (
    <TeamClient
      members={members.map(m => ({ ...m, createdAt: m.createdAt?.toISOString() ?? null }))}
      invites={invites.map(i => ({ ...i, expiresAt: i.expiresAt.toISOString(), createdAt: i.createdAt.toISOString() }))}
      canManage={canManage}
      currentUserId={currentUser.id}
    />
  );
}
