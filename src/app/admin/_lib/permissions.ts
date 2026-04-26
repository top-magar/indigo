import "server-only";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/infrastructure/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { cache } from "react";
import type { PlatformRole, Permission } from "./types";

export type { PlatformRole, Permission } from "./types";

const ROLE_PERMISSIONS: Record<PlatformRole, Permission[]> = {
  super_admin: [
    "view_overview", "view_merchants", "manage_merchants", "delete_merchants",
    "view_billing", "manage_billing", "view_settings", "manage_settings",
    "view_team", "manage_team", "export_data", "view_audit",
  ],
  admin: [
    "view_overview", "view_merchants", "manage_merchants",
    "view_billing", "manage_billing", "view_settings",
    "view_team", "export_data", "view_audit",
  ],
  support: [
    "view_overview", "view_merchants",
  ],
  finance: [
    "view_overview", "view_billing", "manage_billing", "export_data",
  ],
};

export function hasPermission(role: PlatformRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: PlatformRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/** Get current platform user with role. Cached per request. */
export const getPlatformUser = cache(async () => {
  const user = await requireUser();

  const [dbUser] = await db.select({ platformRole: users.platformRole, role: users.role })
    .from(users).where(eq(users.id, user.id)).limit(1);

  // Allow access if role is platform_admin OR if they have a platformRole
  if (user.role !== "platform_admin" && !dbUser?.platformRole) redirect("/dashboard");

  const platformRole = (dbUser?.platformRole as PlatformRole) || "support";
  return { ...user, platformRole, permissions: getPermissions(platformRole) };
});

/** Require a specific permission. Redirects to /admin if denied. */
export async function requirePermission(permission: Permission) {
  const user = await getPlatformUser();
  if (!hasPermission(user.platformRole, permission)) redirect("/admin");
  return user;
}
