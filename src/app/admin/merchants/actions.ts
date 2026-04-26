"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "../_lib/audit";

const uuidSchema = z.string().uuid();

export async function toggleMerchantSuspension(tenantId: string, suspend: boolean): Promise<{ error?: string }> {
  const user = await requireUser();
  if (user.role !== "platform_admin") return { error: "Unauthorized" };

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
  const user = await requireUser();
  if (user.role !== "platform_admin") return { error: "Unauthorized" };

  const parsed = uuidSchema.safeParse(tenantId);
  if (!parsed.success) return { error: "Invalid merchant ID" };

  try {
    const [existing] = await db.select({ id: tenants.id, name: tenants.name })
      .from(tenants).where(eq(tenants.id, parsed.data)).limit(1);
    if (!existing) return { error: "Merchant not found" };

    await db.delete(tenants).where(eq(tenants.id, parsed.data));

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
