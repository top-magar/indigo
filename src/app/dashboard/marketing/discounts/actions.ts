"use server";

import { db } from "@/lib/db";
import { discounts, voucherCodes, discountUsages } from "@/db/schema";
import { eq, and, desc, sql, ilike, or, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createDiscountSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    kind: z.enum(["sale", "voucher"]),
    type: z.enum(["percentage", "fixed", "free_shipping"]),
    value: z.coerce.number().min(0).default(0),
    scope: z.enum(["entire_order", "specific_products"]),
    applyOncePerOrder: z.boolean().default(false),
    minOrderAmount: z.coerce.number().min(0).optional().nullable(),
    minQuantity: z.coerce.number().min(0).optional().nullable(),
    minCheckoutItemsQuantity: z.coerce.number().min(0).optional().nullable(),
    usageLimit: z.coerce.number().min(0).optional().nullable(),
    applyOncePerCustomer: z.boolean().default(false),
    onlyForStaff: z.boolean().default(false),
    singleUse: z.boolean().default(false),
    startsAt: z.string().optional().nullable(),
    endsAt: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
    applicableProductIds: z.array(z.string()).optional(),
    applicableCollectionIds: z.array(z.string()).optional(),
    applicableCategoryIds: z.array(z.string()).optional(),
    applicableVariantIds: z.array(z.string()).optional(),
    countries: z.array(z.string()).optional(),
});

const updateDiscountSchema = createDiscountSchema.partial().extend({
    id: z.string().uuid(),
});

const createVoucherCodeSchema = z.object({
    discountId: z.string().uuid(),
    code: z.string().min(1).max(50).toUpperCase(),
    usageLimit: z.coerce.number().min(0).optional().nullable(),
    isManuallyCreated: z.boolean().default(false),
});

const generateVoucherCodesSchema = z.object({
    discountId: z.string().uuid(),
    quantity: z.coerce.number().min(1).max(50),
    prefix: z.string().max(20).optional(),
});

// ============================================================================
// TYPES
// ============================================================================

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;
export type UpdateDiscountInput = z.infer<typeof updateDiscountSchema>;
export type CreateVoucherCodeInput = z.infer<typeof createVoucherCodeSchema>;
export type GenerateVoucherCodesInput = z.infer<typeof generateVoucherCodesSchema>;

// Get tenant ID from authenticated user
async function getTenantId(): Promise<string | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    return userData?.tenant_id || null;
}

// ============================================================================
// DISCOUNT ACTIONS
// ============================================================================

// List discounts with filters
export async function getDiscounts(options?: {
    search?: string;
    kind?: "all" | "sale" | "voucher";
    status?: "all" | "active" | "inactive" | "expired" | "scheduled";
    type?: "all" | "percentage" | "fixed" | "free_shipping";
    limit?: number;
    offset?: number;
}) {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Not authenticated", data: [] };
    }
    
    const { search, kind = "all", status = "all", type = "all", limit = 50, offset = 0 } = options || {};

    try {
        const conditions = [eq(discounts.tenantId, tenantId)];

        if (search) {
            conditions.push(
                or(
                    ilike(discounts.name, `%${search}%`),
                    ilike(discounts.description, `%${search}%`)
                )!
            );
        }

        if (kind !== "all") {
            conditions.push(eq(discounts.kind, kind));
        }

        if (type !== "all") {
            conditions.push(eq(discounts.type, type));
        }

        const results = await db
            .select()
            .from(discounts)
            .where(and(...conditions))
            .orderBy(desc(discounts.createdAt))
            .limit(limit)
            .offset(offset);

        // Filter by status in application layer
        const now = new Date();
        const filtered = results.filter((d) => {
            if (status === "all") return true;
            if (status === "active") return d.isActive && (!d.endsAt || d.endsAt > now) && (!d.startsAt || d.startsAt <= now);
            if (status === "inactive") return !d.isActive;
            if (status === "expired") return d.endsAt && d.endsAt < now;
            if (status === "scheduled") return d.startsAt && d.startsAt > now;
            return true;
        });

        return { success: true, data: filtered };
    } catch (error) {
        console.error("Failed to fetch discounts:", error);
        return { success: false, error: "Failed to fetch discounts" };
    }
}

// Get single discount with codes
export async function getDiscount(id: string) {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const [discount] = await db
            .select()
            .from(discounts)
            .where(and(eq(discounts.id, id), eq(discounts.tenantId, tenantId)));

        if (!discount) {
            return { success: false, error: "Discount not found" };
        }

        // Get voucher codes if it's a voucher
        let codes: typeof voucherCodes.$inferSelect[] = [];
        if (discount.kind === "voucher") {
            codes = await db
                .select()
                .from(voucherCodes)
                .where(eq(voucherCodes.discountId, id))
                .orderBy(desc(voucherCodes.createdAt));
        }

        return { success: true, data: { ...discount, codes } };
    } catch (error) {
        console.error("Failed to fetch discount:", error);
        return { success: false, error: "Failed to fetch discount" };
    }
}

// Create discount
export async function createDiscount(input: CreateDiscountInput) {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const validated = createDiscountSchema.parse(input);

        const [discount] = await db
            .insert(discounts)
            .values({
                tenantId,
                name: validated.name,
                description: validated.description || null,
                kind: validated.kind,
                type: validated.type,
                value: validated.value.toString(),
                scope: validated.scope,
                applyOncePerOrder: validated.applyOncePerOrder,
                minOrderAmount: validated.minOrderAmount?.toString() || null,
                minQuantity: validated.minQuantity || null,
                minCheckoutItemsQuantity: validated.minCheckoutItemsQuantity || null,
                usageLimit: validated.usageLimit || null,
                applyOncePerCustomer: validated.applyOncePerCustomer,
                onlyForStaff: validated.onlyForStaff,
                singleUse: validated.singleUse,
                startsAt: validated.startsAt ? new Date(validated.startsAt) : null,
                endsAt: validated.endsAt ? new Date(validated.endsAt) : null,
                isActive: validated.isActive,
                applicableProductIds: validated.applicableProductIds || null,
                applicableCollectionIds: validated.applicableCollectionIds || null,
                applicableCategoryIds: validated.applicableCategoryIds || null,
                applicableVariantIds: validated.applicableVariantIds || null,
                countries: validated.countries || null,
            })
            .returning();

        revalidatePath("/dashboard/marketing/discounts");
        return { success: true, data: discount };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        console.error("Failed to create discount:", error);
        return { success: false, error: "Failed to create discount" };
    }
}

// Update discount
export async function updateDiscount(input: UpdateDiscountInput) {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const validated = updateDiscountSchema.parse(input);
        const { id, ...updates } = validated;

        const [existing] = await db
            .select()
            .from(discounts)
            .where(and(eq(discounts.id, id), eq(discounts.tenantId, tenantId)));

        if (!existing) {
            return { success: false, error: "Discount not found" };
        }

        const updateData: Record<string, unknown> = { updatedAt: new Date() };

        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.type !== undefined) updateData.type = updates.type;
        if (updates.value !== undefined) updateData.value = updates.value.toString();
        if (updates.scope !== undefined) updateData.scope = updates.scope;
        if (updates.applyOncePerOrder !== undefined) updateData.applyOncePerOrder = updates.applyOncePerOrder;
        if (updates.minOrderAmount !== undefined) updateData.minOrderAmount = updates.minOrderAmount?.toString() || null;
        if (updates.minQuantity !== undefined) updateData.minQuantity = updates.minQuantity;
        if (updates.minCheckoutItemsQuantity !== undefined) updateData.minCheckoutItemsQuantity = updates.minCheckoutItemsQuantity;
        if (updates.usageLimit !== undefined) updateData.usageLimit = updates.usageLimit;
        if (updates.applyOncePerCustomer !== undefined) updateData.applyOncePerCustomer = updates.applyOncePerCustomer;
        if (updates.onlyForStaff !== undefined) updateData.onlyForStaff = updates.onlyForStaff;
        if (updates.singleUse !== undefined) updateData.singleUse = updates.singleUse;
        if (updates.startsAt !== undefined) updateData.startsAt = updates.startsAt ? new Date(updates.startsAt) : null;
        if (updates.endsAt !== undefined) updateData.endsAt = updates.endsAt ? new Date(updates.endsAt) : null;
        if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
        if (updates.applicableProductIds !== undefined) updateData.applicableProductIds = updates.applicableProductIds;
        if (updates.applicableCollectionIds !== undefined) updateData.applicableCollectionIds = updates.applicableCollectionIds;
        if (updates.applicableCategoryIds !== undefined) updateData.applicableCategoryIds = updates.applicableCategoryIds;
        if (updates.applicableVariantIds !== undefined) updateData.applicableVariantIds = updates.applicableVariantIds;
        if (updates.countries !== undefined) updateData.countries = updates.countries;

        const [discount] = await db
            .update(discounts)
            .set(updateData)
            .where(and(eq(discounts.id, id), eq(discounts.tenantId, tenantId)))
            .returning();

        revalidatePath("/dashboard/marketing/discounts");
        return { success: true, data: discount };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        console.error("Failed to update discount:", error);
        return { success: false, error: "Failed to update discount" };
    }
}

// Delete discount
export async function deleteDiscount(id: string) {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const [deleted] = await db
            .delete(discounts)
            .where(and(eq(discounts.id, id), eq(discounts.tenantId, tenantId)))
            .returning();

        if (!deleted) {
            return { success: false, error: "Discount not found" };
        }

        revalidatePath("/dashboard/marketing/discounts");
        return { success: true, data: deleted };
    } catch (error) {
        console.error("Failed to delete discount:", error);
        return { success: false, error: "Failed to delete discount" };
    }
}

// Bulk delete discounts
export async function deleteDiscounts(ids: string[]) {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Not authenticated" };
    }

    if (ids.length === 0) {
        return { success: false, error: "No items to delete" };
    }

    try {
        const deleted = await db
            .delete(discounts)
            .where(
                and(
                    eq(discounts.tenantId, tenantId),
                    inArray(discounts.id, ids)
                )
            )
            .returning();

        revalidatePath("/dashboard/marketing/discounts");
        return { success: true, data: deleted };
    } catch (error) {
        console.error("Failed to delete discounts:", error);
        return { success: false, error: "Failed to delete discounts" };
    }
}

// Toggle discount status
export async function toggleDiscountStatus(id: string, isActive: boolean) {
    return updateDiscount({ id, isActive });
}

// ============================================================================
// VOUCHER CODE ACTIONS
// ============================================================================

// Add single voucher code
export async function addVoucherCode(input: CreateVoucherCodeInput) {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const validated = createVoucherCodeSchema.parse(input);

        // Check if code already exists
        const [existing] = await db
            .select()
            .from(voucherCodes)
            .where(and(eq(voucherCodes.tenantId, tenantId), eq(voucherCodes.code, validated.code)));

        if (existing) {
            return { success: false, error: "A code with this value already exists" };
        }

        const [code] = await db
            .insert(voucherCodes)
            .values({
                tenantId,
                discountId: validated.discountId,
                code: validated.code,
                usageLimit: validated.usageLimit || null,
                isManuallyCreated: validated.isManuallyCreated,
            })
            .returning();

        revalidatePath("/dashboard/marketing/discounts");
        return { success: true, data: code };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        console.error("Failed to add voucher code:", error);
        return { success: false, error: "Failed to add voucher code" };
    }
}

// Generate multiple voucher codes
export async function generateVoucherCodes(input: GenerateVoucherCodesInput) {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const validated = generateVoucherCodesSchema.parse(input);
        const { discountId, quantity, prefix } = validated;

        const codes: { code: string }[] = [];
        const existingCodes = new Set<string>();

        // Get existing codes to avoid duplicates
        const existing = await db
            .select({ code: voucherCodes.code })
            .from(voucherCodes)
            .where(eq(voucherCodes.tenantId, tenantId));

        existing.forEach((c) => existingCodes.add(c.code));

        // Generate unique codes
        while (codes.length < quantity) {
            const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
            const code = prefix ? `${prefix}-${randomPart}` : randomPart;

            if (!existingCodes.has(code)) {
                existingCodes.add(code);
                codes.push({ code });
            }
        }

        // Insert all codes
        const inserted = await db
            .insert(voucherCodes)
            .values(
                codes.map((c) => ({
                    tenantId,
                    discountId,
                    code: c.code,
                    isManuallyCreated: false,
                }))
            )
            .returning();

        revalidatePath("/dashboard/marketing/discounts");
        return { success: true, data: inserted };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        console.error("Failed to generate voucher codes:", error);
        return { success: false, error: "Failed to generate voucher codes" };
    }
}

// Delete voucher codes
export async function deleteVoucherCodes(ids: string[]) {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Not authenticated" };
    }

    if (ids.length === 0) {
        return { success: false, error: "No items to delete" };
    }

    try {
        const deleted = await db
            .delete(voucherCodes)
            .where(
                and(
                    eq(voucherCodes.tenantId, tenantId),
                    inArray(voucherCodes.id, ids)
                )
            )
            .returning();

        revalidatePath("/dashboard/marketing/discounts");
        return { success: true, data: deleted };
    } catch (error) {
        console.error("Failed to delete voucher codes:", error);
        return { success: false, error: "Failed to delete voucher codes" };
    }
}

// Get voucher codes for a discount
export async function getVoucherCodes(discountId: string) {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Not authenticated", data: [] };
    }

    try {
        const codes = await db
            .select()
            .from(voucherCodes)
            .where(and(eq(voucherCodes.discountId, discountId), eq(voucherCodes.tenantId, tenantId)))
            .orderBy(desc(voucherCodes.createdAt));

        return { success: true, data: codes };
    } catch (error) {
        console.error("Failed to fetch voucher codes:", error);
        return { success: false, error: "Failed to fetch voucher codes" };
    }
}

// ============================================================================
// CHECKOUT VALIDATION
// ============================================================================

// Validate voucher code at checkout
export async function validateVoucherCode(code: string, orderTotal: number, customerId?: string) {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { valid: false, error: "Not authenticated" };
    }
    
    const now = new Date();

    try {
        // Find the voucher code
        const [voucherCode] = await db
            .select()
            .from(voucherCodes)
            .where(and(eq(voucherCodes.tenantId, tenantId), eq(voucherCodes.code, code.toUpperCase())));

        if (!voucherCode) {
            return { valid: false, error: "Invalid voucher code" };
        }

        if (voucherCode.status !== "active") {
            return { valid: false, error: "This voucher code is no longer valid" };
        }

        // Get the discount
        const [discount] = await db
            .select()
            .from(discounts)
            .where(eq(discounts.id, voucherCode.discountId));

        if (!discount) {
            return { valid: false, error: "Discount not found" };
        }

        // Check if active
        if (!discount.isActive) {
            return { valid: false, error: "This discount is no longer active" };
        }

        // Check dates
        if (discount.startsAt && discount.startsAt > now) {
            return { valid: false, error: "This discount is not yet active" };
        }

        if (discount.endsAt && discount.endsAt < now) {
            return { valid: false, error: "This discount has expired" };
        }

        // Check usage limits
        if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
            return { valid: false, error: "This discount has reached its usage limit" };
        }

        // Check single use
        if (discount.singleUse && voucherCode.usedCount > 0) {
            return { valid: false, error: "This code has already been used" };
        }

        // Check per-code usage limit
        if (voucherCode.usageLimit && voucherCode.usedCount >= voucherCode.usageLimit) {
            return { valid: false, error: "This code has reached its usage limit" };
        }

        // Check minimum order amount
        if (discount.minOrderAmount && orderTotal < parseFloat(discount.minOrderAmount)) {
            return {
                valid: false,
                error: `Minimum order amount of $${discount.minOrderAmount} required`,
            };
        }

        // Check per-customer usage
        if (customerId && discount.applyOncePerCustomer) {
            const usageCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(discountUsages)
                .where(
                    and(
                        eq(discountUsages.discountId, discount.id),
                        eq(discountUsages.customerId, customerId)
                    )
                );

            if (usageCount[0].count > 0) {
                return { valid: false, error: "You have already used this discount" };
            }
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (discount.type === "percentage") {
            discountAmount = (orderTotal * parseFloat(discount.value)) / 100;
        } else if (discount.type === "fixed") {
            discountAmount = Math.min(parseFloat(discount.value), orderTotal);
        }

        return {
            valid: true,
            discount: {
                id: discount.id,
                voucherCodeId: voucherCode.id,
                code: voucherCode.code,
                type: discount.type,
                value: parseFloat(discount.value),
                discountAmount,
            },
        };
    } catch (error) {
        console.error("Failed to validate voucher code:", error);
        return { valid: false, error: "Failed to validate voucher code" };
    }
}

// Duplicate discount
export async function duplicateDiscount(id: string) {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const [original] = await db
            .select()
            .from(discounts)
            .where(and(eq(discounts.id, id), eq(discounts.tenantId, tenantId)));

        if (!original) {
            return { success: false, error: "Discount not found" };
        }

        const [duplicate] = await db
            .insert(discounts)
            .values({
                tenantId,
                name: `${original.name} (Copy)`,
                description: original.description,
                kind: original.kind,
                type: original.type,
                value: original.value,
                scope: original.scope,
                applyOncePerOrder: original.applyOncePerOrder,
                minOrderAmount: original.minOrderAmount,
                minQuantity: original.minQuantity,
                minCheckoutItemsQuantity: original.minCheckoutItemsQuantity,
                usageLimit: original.usageLimit,
                applyOncePerCustomer: original.applyOncePerCustomer,
                onlyForStaff: original.onlyForStaff,
                singleUse: original.singleUse,
                startsAt: original.startsAt,
                endsAt: original.endsAt,
                isActive: false, // Start as inactive
                applicableProductIds: original.applicableProductIds,
                applicableCollectionIds: original.applicableCollectionIds,
                applicableCategoryIds: original.applicableCategoryIds,
                applicableVariantIds: original.applicableVariantIds,
                countries: original.countries,
                metadata: original.metadata,
            })
            .returning();

        revalidatePath("/dashboard/marketing/discounts");
        return { success: true, data: duplicate };
    } catch (error) {
        console.error("Failed to duplicate discount:", error);
        return { success: false, error: "Failed to duplicate discount" };
    }
}

// Record discount usage
export async function recordDiscountUsage(
    discountId: string,
    orderId: string,
    discountAmount: number,
    voucherCodeId?: string,
    customerId?: string
) {
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        // Record usage
        await db.insert(discountUsages).values({
            tenantId,
            discountId,
            voucherCodeId: voucherCodeId || null,
            orderId,
            customerId: customerId || null,
            discountAmount: discountAmount.toString(),
        });

        // Increment discount usage count
        await db
            .update(discounts)
            .set({
                usedCount: sql`${discounts.usedCount} + 1`,
                updatedAt: new Date(),
            })
            .where(eq(discounts.id, discountId));

        // Increment voucher code usage count if applicable
        if (voucherCodeId) {
            await db
                .update(voucherCodes)
                .set({
                    usedCount: sql`${voucherCodes.usedCount} + 1`,
                    usedAt: new Date(),
                })
                .where(eq(voucherCodes.id, voucherCodeId));
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to record discount usage:", error);
        return { success: false, error: "Failed to record discount usage" };
    }
}
