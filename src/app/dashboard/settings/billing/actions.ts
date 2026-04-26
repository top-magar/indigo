"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { plans } from "@/db/schema/billing";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const requestSchema = z.object({
  planId: z.string().uuid(),
  billingCycle: z.enum(["monthly", "yearly"]),
});

export async function requestUpgrade(input: z.infer<typeof requestSchema>): Promise<{ error?: string; paymentInfo?: { planName: string; amount: string; cycle: string } }> {
  const user = await requireUser();
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const [plan] = await db.select().from(plans).where(eq(plans.id, parsed.data.planId)).limit(1);
  if (!plan) return { error: "Plan not found" };

  const amount = parsed.data.billingCycle === "yearly" && plan.priceYearly
    ? plan.priceYearly
    : plan.priceMonthly;

  return {
    paymentInfo: {
      planName: plan.name,
      amount,
      cycle: parsed.data.billingCycle,
    },
  };
}
