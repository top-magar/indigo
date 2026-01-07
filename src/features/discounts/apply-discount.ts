"use server";

import { db } from "@/infrastructure/db";
import { discounts, voucherCodes, discountUsages } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

interface CartItem {
    productId: string;
    variantId: string;
    price: number;
    quantity: number;
    categoryIds?: string[];
    collectionIds?: string[];
}

interface ApplyDiscountResult {
    valid: boolean;
    error?: string;
    discountAmount: number;
    discountId?: string;
    voucherCodeId?: string;
    discountType?: string;
    discountValue?: number;
}

/**
 * Validate and apply a voucher code to a cart
 */
export async function applyVoucherCode(
    tenantId: string,
    code: string,
    cartItems: CartItem[],
    customerId?: string
): Promise<ApplyDiscountResult> {
    const now = new Date();
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    try {
        // Find the voucher code
        const [voucherCode] = await db
            .select()
            .from(voucherCodes)
            .where(and(
                eq(voucherCodes.tenantId, tenantId),
                eq(voucherCodes.code, code.toUpperCase())
            ));

        if (!voucherCode) {
            return { valid: false, error: "Invalid voucher code", discountAmount: 0 };
        }

        if (voucherCode.status !== "active") {
            return { valid: false, error: "This voucher code is no longer valid", discountAmount: 0 };
        }

        // Get the discount
        const [discount] = await db
            .select()
            .from(discounts)
            .where(eq(discounts.id, voucherCode.discountId));

        if (!discount) {
            return { valid: false, error: "Discount not found", discountAmount: 0 };
        }

        // Validate discount
        const validation = validateDiscount(discount, subtotal, totalQuantity, now, customerId);
        if (!validation.valid) {
            return { valid: false, error: validation.error, discountAmount: 0 };
        }

        // Check per-code usage limit
        if (voucherCode.usageLimit && voucherCode.usedCount >= voucherCode.usageLimit) {
            return { valid: false, error: "This code has reached its usage limit", discountAmount: 0 };
        }

        // Check per-customer usage
        if (customerId && discount.applyOncePerCustomer) {
            const usageCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(discountUsages)
                .where(and(
                    eq(discountUsages.discountId, discount.id),
                    eq(discountUsages.customerId, customerId)
                ));

            if (usageCount[0].count > 0) {
                return { valid: false, error: "You have already used this discount", discountAmount: 0 };
            }
        }

        // Calculate discount amount
        const discountAmount = calculateDiscountAmount(discount, cartItems, subtotal);

        return {
            valid: true,
            discountAmount,
            discountId: discount.id,
            voucherCodeId: voucherCode.id,
            discountType: discount.type,
            discountValue: parseFloat(discount.value),
        };
    } catch (error) {
        console.error("Failed to apply voucher code:", error);
        return { valid: false, error: "Failed to apply voucher code", discountAmount: 0 };
    }
}

/**
 * Get applicable sales for products (automatic discounts)
 */
export async function getApplicableSales(
    tenantId: string,
    productIds: string[],
    categoryIds: string[] = [],
    collectionIds: string[] = []
): Promise<Map<string, { saleId: string; type: string; value: number }>> {
    const now = new Date();
    const productDiscounts = new Map<string, { saleId: string; type: string; value: number }>();

    try {
        // Get all active sales
        const sales = await db
            .select()
            .from(discounts)
            .where(and(
                eq(discounts.tenantId, tenantId),
                eq(discounts.kind, "sale"),
                eq(discounts.isActive, true)
            ));

        for (const sale of sales) {
            // Check date range
            if (sale.startsAt && sale.startsAt > now) continue;
            if (sale.endsAt && sale.endsAt < now) continue;

            const applicableProductIds = sale.applicableProductIds || [];
            const applicableCategoryIds = sale.applicableCategoryIds || [];
            const applicableCollectionIds = sale.applicableCollectionIds || [];

            // Check if sale applies to any of the products
            for (const productId of productIds) {
                const applies = 
                    applicableProductIds.includes(productId) ||
                    categoryIds.some(id => applicableCategoryIds.includes(id)) ||
                    collectionIds.some(id => applicableCollectionIds.includes(id));

                if (applies) {
                    // Use the best discount if multiple apply
                    const existing = productDiscounts.get(productId);
                    const saleValue = parseFloat(sale.value);
                    
                    if (!existing || saleValue > existing.value) {
                        productDiscounts.set(productId, {
                            saleId: sale.id,
                            type: sale.type,
                            value: saleValue,
                        });
                    }
                }
            }
        }

        return productDiscounts;
    } catch (error) {
        console.error("Failed to get applicable sales:", error);
        return productDiscounts;
    }
}

/**
 * Calculate discounted price for a product
 */
export function calculateSalePrice(
    originalPrice: number,
    discountType: string,
    discountValue: number
): number {
    if (discountType === "percentage") {
        return originalPrice * (1 - discountValue / 100);
    } else if (discountType === "fixed") {
        return Math.max(0, originalPrice - discountValue);
    }
    return originalPrice;
}

/**
 * Record discount usage after order completion
 */
export async function recordDiscountUsage(
    tenantId: string,
    discountId: string,
    orderId: string,
    discountAmount: number,
    voucherCodeId?: string,
    customerId?: string
): Promise<boolean> {
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

        return true;
    } catch (error) {
        console.error("Failed to record discount usage:", error);
        return false;
    }
}

// Helper functions

function validateDiscount(
    discount: typeof discounts.$inferSelect,
    subtotal: number,
    totalQuantity: number,
    now: Date,
    customerId?: string
): { valid: boolean; error?: string } {
    if (!discount.isActive) {
        return { valid: false, error: "This discount is no longer active" };
    }

    if (discount.startsAt && discount.startsAt > now) {
        return { valid: false, error: "This discount is not yet active" };
    }

    if (discount.endsAt && discount.endsAt < now) {
        return { valid: false, error: "This discount has expired" };
    }

    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
        return { valid: false, error: "This discount has reached its usage limit" };
    }

    if (discount.minOrderAmount && subtotal < parseFloat(discount.minOrderAmount)) {
        return { 
            valid: false, 
            error: `Minimum order amount of $${discount.minOrderAmount} required` 
        };
    }

    if (discount.minCheckoutItemsQuantity && totalQuantity < discount.minCheckoutItemsQuantity) {
        return { 
            valid: false, 
            error: `Minimum ${discount.minCheckoutItemsQuantity} items required` 
        };
    }

    if (discount.onlyForStaff && !customerId) {
        return { valid: false, error: "This discount is only for staff members" };
    }

    return { valid: true };
}

function calculateDiscountAmount(
    discount: typeof discounts.$inferSelect,
    cartItems: CartItem[],
    subtotal: number
): number {
    const discountValue = parseFloat(discount.value);

    if (discount.type === "free_shipping") {
        // Free shipping - return 0 as discount amount (shipping handled separately)
        return 0;
    }

    if (discount.scope === "entire_order") {
        // Apply to entire order
        if (discount.type === "percentage") {
            return subtotal * (discountValue / 100);
        } else {
            return Math.min(discountValue, subtotal);
        }
    } else {
        // Apply to specific products only
        const applicableProductIds = discount.applicableProductIds || [];
        const applicableCategoryIds = discount.applicableCategoryIds || [];
        const applicableCollectionIds = discount.applicableCollectionIds || [];

        let eligibleItems = cartItems.filter(item => {
            return applicableProductIds.includes(item.productId) ||
                (item.categoryIds?.some(id => applicableCategoryIds.includes(id))) ||
                (item.collectionIds?.some(id => applicableCollectionIds.includes(id)));
        });

        if (eligibleItems.length === 0) {
            return 0;
        }

        // If applyOncePerOrder, only apply to cheapest eligible item
        if (discount.applyOncePerOrder) {
            eligibleItems = [eligibleItems.reduce((min, item) => 
                item.price < min.price ? item : min
            )];
        }

        const eligibleSubtotal = eligibleItems.reduce(
            (sum, item) => sum + item.price * item.quantity, 
            0
        );

        if (discount.type === "percentage") {
            return eligibleSubtotal * (discountValue / 100);
        } else {
            return Math.min(discountValue, eligibleSubtotal);
        }
    }
}
