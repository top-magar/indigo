"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { tenantKyc } from "@/db/schema/tenant-kyc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const kycSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(255),
  phone: z.string().regex(/^(98|97|96)\d{8}$/, "Enter a valid Nepal phone number (98XXXXXXXX)"),
  businessType: z.enum(["individual", "company"]),
  businessAddress: z.string().min(5, "Address must be at least 5 characters").max(500),
  panNumber: z.string().regex(/^\d{9}$/, "PAN must be exactly 9 digits"),
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

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { error: firstError?.message || "Please fill all required fields correctly" };
  }

  try {
    // Check existing status — block if already verified or pending
    const [existing] = await db.select({ id: tenantKyc.id, status: tenantKyc.status, updatedAt: tenantKyc.updatedAt })
      .from(tenantKyc).where(eq(tenantKyc.tenantId, user.tenantId)).limit(1);

    if (existing?.status === "verified") return { error: "Your store is already verified" };
    if (existing?.status === "pending") return { error: "Verification is already pending review" };

    // Rate limit: 1 hour between submissions
    if (existing?.updatedAt && Date.now() - existing.updatedAt.getTime() < 3600000) {
      return { error: "Please wait at least 1 hour before resubmitting" };
    }

    if (existing) {
      // Resubmission after rejection
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
