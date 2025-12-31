import { isPast, isFuture, format, formatDistanceToNow } from "date-fns";
import type {
    DiscountType,
    DiscountStatus,
    VoucherFormData,
    SaleFormData,
    Discount,
    VoucherCode,
    VoucherCodeStatus,
} from "./types";

// ============================================================================
// STATUS HELPERS
// ============================================================================

export function getDiscountStatus(discount: {
    isActive: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
}): DiscountStatus {
    if (!discount.isActive) return "inactive";
    if (discount.endsAt && isPast(discount.endsAt)) return "expired";
    if (discount.startsAt && isFuture(discount.startsAt)) return "scheduled";
    return "active";
}

export function getStatusBadgeVariant(status: DiscountStatus) {
    switch (status) {
        case "active":
            return "default" as const;
        case "inactive":
            return "secondary" as const;
        case "expired":
            return "destructive" as const;
        case "scheduled":
            return "outline" as const;
    }
}

export function getStatusLabel(status: DiscountStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

export function formatDiscountValue(type: DiscountType, value: number): string {
    switch (type) {
        case "percentage":
            return `${value}%`;
        case "fixed":
            return `$${value.toFixed(2)}`;
        case "free_shipping":
            return "Free shipping";
        default:
            return String(value);
    }
}

export function formatDiscountValueWithLabel(type: DiscountType, value: number): string {
    switch (type) {
        case "percentage":
            return `${value}% off`;
        case "fixed":
            return `$${value.toFixed(2)} off`;
        case "free_shipping":
            return "Free shipping";
        default:
            return String(value);
    }
}

export function formatDateRange(
    startsAt: Date | null,
    endsAt: Date | null
): string {
    if (!startsAt && !endsAt) return "No expiry";
    
    const parts: string[] = [];
    if (startsAt) parts.push(format(startsAt, "MMM d, yyyy"));
    if (startsAt && endsAt) parts.push(" - ");
    if (endsAt) parts.push(format(endsAt, "MMM d, yyyy"));
    
    return parts.join("");
}

export function formatUsage(usedCount: number, usageLimit: number | null): string {
    if (usageLimit) {
        return `${usedCount} / ${usageLimit}`;
    }
    return `${usedCount} used`;
}

export function formatRelativeDate(date: Date): string {
    return formatDistanceToNow(date, { addSuffix: true });
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateVoucherForm(data: VoucherFormData): string | null {
    if (!data.name.trim()) {
        return "Voucher name is required";
    }
    
    if (data.type !== "free_shipping") {
        const value = parseFloat(data.value);
        if (isNaN(value) || value <= 0) {
            return "Discount value must be greater than 0";
        }
        if (data.type === "percentage" && value > 100) {
            return "Percentage cannot exceed 100%";
        }
    }
    
    if (data.hasUsageLimit) {
        const limit = parseInt(data.usageLimit);
        if (isNaN(limit) || limit <= 0) {
            return "Usage limit must be greater than 0";
        }
    }
    
    if (data.minOrderAmount) {
        const amount = parseFloat(data.minOrderAmount);
        if (isNaN(amount) || amount < 0) {
            return "Minimum order amount must be 0 or greater";
        }
    }
    
    if (data.hasStartDate && data.hasEndDate && data.startsAt && data.endsAt) {
        if (new Date(data.startsAt) >= new Date(data.endsAt)) {
            return "End date must be after start date";
        }
    }
    
    return null;
}

export function validateSaleForm(data: SaleFormData): string | null {
    if (!data.name.trim()) {
        return "Sale name is required";
    }
    
    const value = parseFloat(data.value);
    if (isNaN(value) || value <= 0) {
        return "Discount value must be greater than 0";
    }
    if (data.type === "percentage" && value > 100) {
        return "Percentage cannot exceed 100%";
    }
    
    if (data.hasStartDate && data.hasEndDate && data.startsAt && data.endsAt) {
        if (new Date(data.startsAt) >= new Date(data.endsAt)) {
            return "End date must be after start date";
        }
    }
    
    return null;
}

// ============================================================================
// CODE GENERATION
// ============================================================================

export function generateVoucherCode(prefix?: string): string {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    return prefix ? `${prefix}-${randomPart}` : randomPart;
}

export function generateMultipleVoucherCodes(
    quantity: number,
    prefix?: string,
    existingCodes: Set<string> = new Set()
): string[] {
    const codes: string[] = [];
    const allCodes = new Set(existingCodes);
    
    while (codes.length < quantity) {
        const code = generateVoucherCode(prefix);
        if (!allCodes.has(code)) {
            allCodes.add(code);
            codes.push(code);
        }
    }
    
    return codes;
}

// ============================================================================
// DISCOUNT CALCULATION
// ============================================================================

export function calculateDiscountAmount(
    type: DiscountType,
    value: number,
    orderTotal: number
): number {
    switch (type) {
        case "percentage":
            return (orderTotal * value) / 100;
        case "fixed":
            return Math.min(value, orderTotal);
        case "free_shipping":
            return 0; // Shipping discount handled separately
        default:
            return 0;
    }
}

export function calculateDiscountedPrice(
    originalPrice: number,
    type: DiscountType,
    value: number
): number {
    const discount = calculateDiscountAmount(type, value, originalPrice);
    return Math.max(0, originalPrice - discount);
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

export function transformDiscountToFormData(discount: Discount): VoucherFormData {
    return {
        name: discount.name,
        description: discount.description || "",
        type: discount.type,
        value: discount.value,
        scope: discount.scope,
        applyOncePerOrder: discount.applyOncePerOrder,
        minOrderAmount: discount.minOrderAmount || "",
        minCheckoutItemsQuantity: discount.minCheckoutItemsQuantity?.toString() || "",
        hasUsageLimit: !!discount.usageLimit,
        usageLimit: discount.usageLimit?.toString() || "",
        applyOncePerCustomer: discount.applyOncePerCustomer,
        onlyForStaff: discount.onlyForStaff,
        singleUse: discount.singleUse,
        hasStartDate: !!discount.startsAt,
        hasEndDate: !!discount.endsAt,
        startsAt: discount.startsAt ? format(discount.startsAt, "yyyy-MM-dd'T'HH:mm") : "",
        endsAt: discount.endsAt ? format(discount.endsAt, "yyyy-MM-dd'T'HH:mm") : "",
        isActive: discount.isActive,
    };
}

export function transformFormDataToDiscount(
    data: VoucherFormData,
    kind: "voucher" | "sale" = "voucher"
): Partial<Discount> {
    return {
        name: data.name,
        description: data.description || null,
        kind,
        type: data.type,
        value: data.value,
        scope: data.scope,
        applyOncePerOrder: data.applyOncePerOrder,
        minOrderAmount: data.minOrderAmount || null,
        minCheckoutItemsQuantity: data.minCheckoutItemsQuantity 
            ? parseInt(data.minCheckoutItemsQuantity) 
            : null,
        usageLimit: data.hasUsageLimit && data.usageLimit 
            ? parseInt(data.usageLimit) 
            : null,
        applyOncePerCustomer: data.applyOncePerCustomer,
        onlyForStaff: data.onlyForStaff,
        singleUse: data.singleUse,
        startsAt: data.hasStartDate && data.startsAt 
            ? new Date(data.startsAt) 
            : null,
        endsAt: data.hasEndDate && data.endsAt 
            ? new Date(data.endsAt) 
            : null,
        isActive: data.isActive,
    };
}

// ============================================================================
// VOUCHER CODE HELPERS
// ============================================================================

export function getVoucherCodeStatus(code: VoucherCode): VoucherCodeStatus {
    if (code.status !== "active") return code.status;
    if (code.usageLimit && code.usedCount >= code.usageLimit) return "used";
    return "active";
}

export function canDeleteVoucherCode(code: VoucherCode): boolean {
    // Can't delete codes that have been used
    return code.usedCount === 0;
}

// ============================================================================
// FILTER HELPERS
// ============================================================================

export function filterDiscountsByStatus<T extends { isActive: boolean; startsAt: Date | null; endsAt: Date | null }>(
    discounts: T[],
    status: DiscountStatus | "all"
): T[] {
    if (status === "all") return discounts;
    
    return discounts.filter((d) => getDiscountStatus(d) === status);
}

export function searchDiscounts<T extends { name: string; description?: string | null }>(
    discounts: T[],
    query: string
): T[] {
    if (!query.trim()) return discounts;
    
    const lowerQuery = query.toLowerCase();
    return discounts.filter((d) => 
        d.name.toLowerCase().includes(lowerQuery) ||
        d.description?.toLowerCase().includes(lowerQuery)
    );
}

// ============================================================================
// EXPORT TYPE FOR VOUCHER CODE STATUS
// ============================================================================

export type { VoucherCodeStatus } from "./types";
