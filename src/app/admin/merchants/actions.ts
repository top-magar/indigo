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

export async function approveVerification(tenantId: string): Promise<{ error?: string }> {
  const user = await requirePermission("manage_merchants");
  const parsed = uuidSchema.safeParse(tenantId);
  if (!parsed.success) return { error: "Invalid ID" };

  try {
    const { tenantKyc } = await import("@/db/schema/tenant-kyc");
    const { isNull } = await import("drizzle-orm");

    // Validate: tenant exists, not deleted, KYC is pending
    const [tenant] = await db.select({ id: tenants.id, deletedAt: tenants.deletedAt })
      .from(tenants).where(eq(tenants.id, parsed.data)).limit(1);
    if (!tenant) return { error: "Merchant not found" };
    if (tenant.deletedAt) return { error: "Merchant is deleted" };

    const [kyc] = await db.select({ status: tenantKyc.status })
      .from(tenantKyc).where(eq(tenantKyc.tenantId, parsed.data)).limit(1);
    if (!kyc) return { error: "No verification submission found" };
    if (kyc.status !== "pending") return { error: `Cannot approve — status is ${kyc.status}` };

    await db.update(tenantKyc).set({
      status: "verified", verifiedBy: user.id, verifiedAt: new Date(), updatedAt: new Date(),
    }).where(eq(tenantKyc.tenantId, parsed.data));

    logAdminAction({ actorId: user.id, actorEmail: user.email, action: "merchant.reactivate", targetType: "kyc", targetId: parsed.data });
    revalidatePath("/admin/merchants");
    const { revalidateTag } = await import("next/cache");
    revalidateTag("store-tenant", "seconds");
    return {};
  } catch { return { error: "Failed to approve" }; }
}

export async function rejectVerification(tenantId: string, reason: string): Promise<{ error?: string }> {
  const user = await requirePermission("manage_merchants");
  const parsed = uuidSchema.safeParse(tenantId);
  if (!parsed.success) return { error: "Invalid ID" };

  const reasonSchema = z.string().min(1).max(1000);
  const parsedReason = reasonSchema.safeParse(reason);
  if (!parsedReason.success) return { error: "Rejection reason required (max 1000 chars)" };

  try {
    const { tenantKyc } = await import("@/db/schema/tenant-kyc");

    // Validate KYC is pending
    const [kyc] = await db.select({ status: tenantKyc.status })
      .from(tenantKyc).where(eq(tenantKyc.tenantId, parsed.data)).limit(1);
    if (!kyc) return { error: "No verification submission found" };
    if (kyc.status !== "pending") return { error: `Cannot reject — status is ${kyc.status}` };

    await db.update(tenantKyc).set({
      status: "rejected", rejectionReason: parsedReason.data, updatedAt: new Date(),
    }).where(eq(tenantKyc.tenantId, parsed.data));

    logAdminAction({ actorId: user.id, actorEmail: user.email, action: "merchant.suspend", targetType: "kyc", targetId: parsed.data });
    revalidatePath("/admin/merchants");
    const { revalidateTag } = await import("next/cache");
    revalidateTag("store-tenant", "seconds");
    return {};
  } catch { return { error: "Failed to reject" }; }
}
