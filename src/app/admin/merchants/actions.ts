"use server";

import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "../_lib/audit";
import { requirePermission } from "../_lib/permissions";

const uuidSchema = z.string().uuid();

export async function toggleMerchantSuspension(tenantId: string, suspend: boolean): Promise<{ error?: string }> {
  const user = await requirePermission("manage_merchants");

  const parsed = uuidSchema.safeParse(tenantId);
  if (!parsed.success) return { error: "Invalid merchant ID" };

  try {
    const [existing] = await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.id, parsed.data)).limit(1);
    if (!existing) return { error: "Merchant not found" };

    await db.update(tenants)
      .set({
        settings: sql`COALESCE(${tenants.settings}, '{}'::jsonb) || ${JSON.stringify({ suspended: suspend })}::jsonb`,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, parsed.data));

    revalidatePath("/admin/merchants");
    logAdminAction({
      actorId: user.id, actorEmail: user.email,
      action: suspend ? "merchant.suspend" : "merchant.reactivate",
      targetType: "tenant", targetId: parsed.data, targetName: existing.id,
    });
    return {};
  } catch {
    return { error: "Failed to update merchant" };
  }
}

export async function deleteMerchant(tenantId: string): Promise<{ error?: string }> {
  const user = await requirePermission("delete_merchants");

  const parsed = uuidSchema.safeParse(tenantId);
  if (!parsed.success) return { error: "Invalid merchant ID" };

  try {
    const [existing] = await db.select({ id: tenants.id, name: tenants.name })
      .from(tenants).where(eq(tenants.id, parsed.data)).limit(1);
    if (!existing) return { error: "Merchant not found" };

    // Soft delete — set deleted_at, can be restored within 30 days
    await db.update(tenants)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(tenants.id, parsed.data));

    logAdminAction({
      actorId: user.id, actorEmail: user.email, action: "merchant.delete",
      targetType: "tenant", targetId: parsed.data, targetName: existing.name,
    });
    revalidatePath("/admin/merchants");
    return {};
  } catch {
    return { error: "Failed to delete merchant" };
  }
}

export async function restoreMerchant(tenantId: string): Promise<{ error?: string }> {
  const user = await requirePermission("delete_merchants");

  const parsed = uuidSchema.safeParse(tenantId);
  if (!parsed.success) return { error: "Invalid merchant ID" };

  try {
    await db.update(tenants)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(eq(tenants.id, parsed.data));

    logAdminAction({
      actorId: user.id, actorEmail: user.email, action: "merchant.reactivate",
      targetType: "tenant", targetId: parsed.data,
    });
    revalidatePath("/admin/merchants");
    return {};
  } catch {
    return { error: "Failed to restore merchant" };
  }
}
