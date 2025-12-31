//
// Customer Types - Saleor-level customer management types
//

// ============================================================================
// CUSTOMER STATUS TYPES
// ============================================================================

export type CustomerStatus = "active" | "inactive";

// ============================================================================
// ADDRESS TYPES
// ============================================================================

export interface CustomerAddress {
    id: string;
    customerId: string;
    type: "shipping" | "billing";
    firstName: string | null;
    lastName: string | null;
    company: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string | null;
    postalCode: string | null;
    country: string;
    countryCode: string;
    phone: string | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AddressInput {
    type: "shipping" | "billing";
    firstName?: string;
    lastName?: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
    countryCode?: string;
    phone?: string;
    isDefault?: boolean;
}

// ============================================================================
// NOTE TYPES
// ============================================================================

export interface CustomerNote {
    id: string;
    text: string;
    createdAt: string;
    createdBy?: string;
    isPrivate: boolean;
}

// ============================================================================
// ORDER SUMMARY TYPES
// ============================================================================

export interface CustomerOrderSummary {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    currency: string;
    itemsCount: number;
    createdAt: string;
}

// ============================================================================
// STATS TYPES
// ============================================================================

export interface CustomerStats {
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    lastOrderDate: string | null;
    firstOrderDate: string | null;
    returningCustomer: boolean;
}

export interface CustomerListStats {
    totalCustomers: number;
    newThisMonth: number;
    returningCustomers: number;
    subscribedCount: number;
    totalRevenue: number;
    avgCustomerValue: number;
}

// ============================================================================
// MAIN CUSTOMER TYPE
// ============================================================================

export interface Customer {
    id: string;
    tenantId: string;
    
    // Basic Info
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    
    // Status
    isActive: boolean;
    
    // Marketing
    acceptsMarketing: boolean;
    
    // Dates
    dateJoined: string;
    lastLogin: string | null;
    updatedAt: string;
    
    // Notes (stored in metadata)
    note: string | null;
    notes: CustomerNote[];
    
    // Metadata
    metadata: Record<string, unknown>;
    privateMetadata: Record<string, unknown>;
    
    // Relations (loaded separately)
    defaultBillingAddress: CustomerAddress | null;
    defaultShippingAddress: CustomerAddress | null;
    addresses: CustomerAddress[];
    
    // Stats (calculated)
    stats: CustomerStats;
    
    // Recent orders
    recentOrders: CustomerOrderSummary[];
}

// ============================================================================
// LIST ITEM TYPE
// ============================================================================

export interface CustomerListItem {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    isActive: boolean;
    acceptsMarketing: boolean;
    dateJoined: string;
    ordersCount: number;
    totalSpent: number;
    lastOrderDate: string | null;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

export interface CreateCustomerInput {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    isActive?: boolean;
    acceptsMarketing?: boolean;
    note?: string;
    defaultBillingAddress?: AddressInput;
    defaultShippingAddress?: AddressInput;
}

export interface UpdateCustomerInput {
    firstName?: string;
    lastName?: string;
    phone?: string;
    isActive?: boolean;
    acceptsMarketing?: boolean;
    note?: string;
    metadata?: Record<string, unknown>;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface CustomerFilters {
    search?: string;
    status?: "active" | "inactive" | "all";
    marketing?: "subscribed" | "unsubscribed" | "all";
    hasOrders?: boolean;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: "email" | "created_at" | "orders_count" | "total_spent";
    sortOrder?: "asc" | "desc";
}

// ============================================================================
// GIFT CARD TYPES (for future integration)
// ============================================================================

export interface CustomerGiftCard {
    id: string;
    code: string;
    initialBalance: number;
    currentBalance: number;
    currency: string;
    isActive: boolean;
    expiresAt: string | null;
    createdAt: string;
}

// ============================================================================
// STORE CREDIT TYPES
// ============================================================================

export interface CustomerStoreCredit {
    id: string;
    amount: number;
    balance: number;
    currency: string;
    reason: string | null;
    expiresAt: string | null;
    createdAt: string;
}

// ============================================================================
// TIMELINE EVENT TYPES
// ============================================================================

export type TimelineEventType = 
    | "customer_created"
    | "customer_updated"
    | "order_placed"
    | "order_fulfilled"
    | "order_cancelled"
    | "note_added"
    | "address_added"
    | "address_updated"
    | "marketing_subscribed"
    | "marketing_unsubscribed"
    | "account_activated"
    | "account_deactivated";

export interface TimelineEvent {
    id: string;
    type: TimelineEventType;
    message: string;
    date: string;
    user?: string;
    metadata?: Record<string, unknown>;
}
