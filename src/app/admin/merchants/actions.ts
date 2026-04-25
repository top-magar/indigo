"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleMerchantSuspension(tenantId: string, suspend: boolean): Promise<{ error?: string }> {
  const user = await requireUser();
  if (user.role !== "platform_admin") return { error: "Unauthorized" };

  try {
    await db.update(tenants)
      .set({
        settings: sql`COALESCE(${tenants.settings}, '{}'::jsonb) || ${JSON.stringify({ suspended: suspend })}::jsonb`,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    revalidatePath("/admin/merchants");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update merchant" };
  }
}
