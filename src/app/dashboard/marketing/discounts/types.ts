// ============================================================================
// DISCOUNT TYPES
// ============================================================================

export type DiscountKind = "sale" | "voucher";
export type DiscountType = "percentage" | "fixed" | "free_shipping";
export type DiscountScope = "entire_order" | "specific_products";
export type VoucherCodeStatus = "active" | "used" | "expired" | "deactivated";

// ============================================================================
// DISCOUNT INTERFACES
// ============================================================================

export interface Discount {
    id: string;
    tenantId: string;
    name: string;
    description: string | null;
    kind: DiscountKind;
    type: DiscountType;
    value: string;
    scope: DiscountScope;
    applyOncePerOrder: boolean;
    minOrderAmount: string | null;
    minQuantity: number | null;
    minCheckoutItemsQuantity: number | null;
    usageLimit: number | null;
    usedCount: number;
    applyOncePerCustomer: boolean;
    onlyForStaff: boolean;
    singleUse: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
    isActive: boolean;
    applicableProductIds: string[] | null;
    applicableCollectionIds: string[] | null;
    applicableCategoryIds: string[] | null;
    applicableVariantIds: string[] | null;
    countries: string[] | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface VoucherCode {
    id: string;
    tenantId: string;
    discountId: string;
    code: string;
    status: VoucherCodeStatus;
    usedCount: number;
    usageLimit: number | null;
    isManuallyCreated: boolean;
    createdAt: Date;
    usedAt: Date | null;
}

export interface DiscountUsage {
    id: string;
    tenantId: string;
    discountId: string;
    voucherCodeId: string | null;
    customerId: string | null;
    orderId: string | null;
    discountAmount: string;
    usedAt: Date;
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export interface VoucherFormData {
    name: string;
    description: string;
    type: DiscountType;
    value: string;
    scope: DiscountScope;
    applyOncePerOrder: boolean;
    minOrderAmount: string;
    minCheckoutItemsQuantity: string;
    hasUsageLimit: boolean;
    usageLimit: string;
    applyOncePerCustomer: boolean;
    onlyForStaff: boolean;
    singleUse: boolean;
    hasStartDate: boolean;
    hasEndDate: boolean;
    startsAt: string;
    endsAt: string;
    isActive: boolean;
}

export interface SaleFormData {
    name: string;
    description: string;
    type: Exclude<DiscountType, "free_shipping">;
    value: string;
    hasStartDate: boolean;
    hasEndDate: boolean;
    startsAt: string;
    endsAt: string;
    isActive: boolean;
}

// ============================================================================
// LIST ITEM TYPES (for tables)
// ============================================================================

export interface VoucherListItem {
    id: string;
    name: string;
    type: DiscountType;
    value: number;
    scope: DiscountScope;
    usedCount: number;
    usageLimit: number | null;
    codesCount: number;
    startsAt: Date | null;
    endsAt: Date | null;
    isActive: boolean;
}

export interface SaleListItem {
    id: string;
    name: string;
    type: Exclude<DiscountType, "free_shipping">;
    value: number;
    productsCount: number;
    collectionsCount: number;
    categoriesCount: number;
    startsAt: Date | null;
    endsAt: Date | null;
    isActive: boolean;
}

// ============================================================================
// ASSIGNMENT TYPES
// ============================================================================

export interface AssignedProduct {
    id: string;
    name: string;
    thumbnail: string | null;
    productType: string;
    isAvailable: boolean;
}

export interface AssignedCollection {
    id: string;
    name: string;
    productsCount: number;
    isPublished: boolean;
}

export interface AssignedCategory {
    id: string;
    name: string;
    productsCount: number;
    parentName: string | null;
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface DiscountFilters {
    search?: string;
    kind?: DiscountKind | "all";
    status?: DiscountStatus | "all";
    type?: DiscountType | "all";
}

export type DiscountStatus = "active" | "inactive" | "expired" | "scheduled";

export interface PaginationParams {
    limit?: number;
    offset?: number;
}

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface VoucherValidationResult {
    valid: boolean;
    error?: string;
    discount?: {
        id: string;
        voucherCodeId: string;
        code: string;
        type: DiscountType;
        value: number;
        discountAmount: number;
    };
}

// ============================================================================
// ACTION RESULTS
// ============================================================================

export interface ActionResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}
