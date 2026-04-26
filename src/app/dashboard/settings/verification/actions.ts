"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { tenantKyc } from "@/db/schema/tenant-kyc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const kycSchema = z.object({
  fullName: z.string().min(2).max(255),
  phone: z.string().min(10).max(20),
  businessType: z.enum(["individual", "company"]),
  businessAddress: z.string().min(5).max(500),
  panNumber: z.string().min(5).max(50),
  registrationNumber: z.string().max(100).optional(),
});

export async function submitVerification(formData: FormData): Promise<{ error?: string }> {
  const user = await requireUser();

  const parsed = kycSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    businessType: formData.get("businessType"),
    businessAddress: formData.get("businessAddress"),
    panNumber: formData.get("panNumber"),
    registrationNumber: formData.get("registrationNumber") || undefined,
  });
  if (!parsed.success) return { error: "Please fill all required fields correctly" };

  try {
    // Upsert — allow resubmission after rejection
    const [existing] = await db.select({ id: tenantKyc.id })
      .from(tenantKyc).where(eq(tenantKyc.tenantId, user.tenantId)).limit(1);

    if (existing) {
      await db.update(tenantKyc).set({
        ...parsed.data, status: "pending", rejectionReason: null, updatedAt: new Date(),
      }).where(eq(tenantKyc.tenantId, user.tenantId));
    } else {
      await db.insert(tenantKyc).values({
        tenantId: user.tenantId, ...parsed.data,
      });
    }

    revalidatePath("/dashboard/settings/verification");
    return {};
  } catch {
    return { error: "Failed to submit verification" };
  }
}
