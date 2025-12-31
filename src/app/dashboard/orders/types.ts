//
// Order Types - Saleor-level order management types
//

// ============================================================================
// ORDER STATUS TYPES
// ============================================================================

export type OrderStatus =
    | "draft"
    | "unconfirmed"
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "completed"
    | "cancelled"
    | "refunded";

export type PaymentStatus =
    | "pending"
    | "authorized"
    | "paid"
    | "partially_paid"
    | "partially_refunded"
    | "refunded"
    | "failed"
    | "cancelled";

export type FulfillmentStatus =
    | "unfulfilled"
    | "partially_fulfilled"
    | "fulfilled"
    | "awaiting_approval"
    | "cancelled";

// ============================================================================
// FULFILLMENT TYPES
// ============================================================================

export interface FulfillmentLine {
    id: string;
    orderLineId: string;
    quantity: number;
    productName?: string;
    productSku?: string;
    productImage?: string;
}

export interface Fulfillment {
    id: string;
    orderId: string;
    status: "pending" | "approved" | "shipped" | "delivered" | "cancelled";
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    shippingCarrier?: string | null;
    warehouse?: string | null;
    lines: FulfillmentLine[];
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export type TransactionType =
    | "authorization"
    | "charge"
    | "refund"
    | "void"
    | "capture"
    | "chargeback";

export type TransactionStatus =
    | "pending"
    | "success"
    | "failed"
    | "cancelled";

export interface Transaction {
    id: string;
    orderId: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    currency: string;
    paymentMethod?: string | null;
    paymentGateway?: string | null;
    gatewayTransactionId?: string | null;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
}

// ============================================================================
// INVOICE TYPES
// ============================================================================

export type InvoiceStatus = "draft" | "pending" | "sent" | "paid" | "cancelled";

export interface Invoice {
    id: string;
    orderId: string;
    invoiceNumber: string;
    status: InvoiceStatus;
    url?: string | null;
    sentAt?: string | null;
    createdAt: string;
}

// ============================================================================
// ORDER EVENT TYPES
// ============================================================================

export type OrderEventType =
    | "order_created"
    | "order_confirmed"
    | "order_cancelled"
    | "order_updated"
    | "payment_authorized"
    | "payment_captured"
    | "payment_refunded"
    | "payment_voided"
    | "payment_failed"
    | "fulfillment_created"
    | "fulfillment_approved"
    | "fulfillment_shipped"
    | "fulfillment_delivered"
    | "fulfillment_cancelled"
    | "tracking_updated"
    | "invoice_generated"
    | "invoice_sent"
    | "note_added"
    | "email_sent"
    | "status_changed";

export interface OrderEvent {
    id: string;
    orderId: string;
    type: OrderEventType;
    message: string;
    userId?: string | null;
    userName?: string | null;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
}

// ============================================================================
// ORDER LINE TYPES
// ============================================================================

export interface OrderLine {
    id: string;
    orderId: string;
    variantId?: string | null;
    productId?: string | null;
    productName: string;
    productSku?: string | null;
    productImage?: string | null;
    quantity: number;
    quantityFulfilled: number;
    quantityToFulfill: number;
    unitPrice: number;
    totalPrice: number;
    taxRate?: number | null;
    taxAmount?: number | null;
    discountAmount?: number | null;
    metadata?: Record<string, unknown> | null;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export interface OrderAddress {
    firstName?: string;
    lastName?: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
    phone?: string;
}

export interface OrderCustomer {
    id?: string | null;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    isGuest: boolean;
}

export interface Order {
    id: string;
    tenantId: string;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    fulfillmentStatus: FulfillmentStatus;
    
    // Customer
    customer: OrderCustomer;
    
    // Addresses
    shippingAddress?: OrderAddress | null;
    billingAddress?: OrderAddress | null;
    
    // Totals
    subtotal: number;
    shippingTotal: number;
    taxTotal: number;
    discountTotal: number;
    total: number;
    currency: string;
    
    // Discount info
    discountId?: string | null;
    discountCode?: string | null;
    discountName?: string | null;
    
    // Shipping
    shippingMethod?: string | null;
    shippingCarrier?: string | null;
    
    // Lines
    lines: OrderLine[];
    itemsCount: number;
    
    // Related data
    fulfillments: Fulfillment[];
    transactions: Transaction[];
    invoices: Invoice[];
    events: OrderEvent[];
    
    // Notes
    customerNote?: string | null;
    internalNotes?: string | null;
    
    // Metadata
    metadata?: Record<string, unknown> | null;
    
    // Timestamps
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// DRAFT ORDER TYPES
// ============================================================================

export interface DraftOrder extends Omit<Order, "status" | "fulfillments" | "transactions" | "invoices"> {
    status: "draft";
    expiresAt?: string | null;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

export interface CreateFulfillmentInput {
    orderId: string;
    lines: { orderLineId: string; quantity: number }[];
    trackingNumber?: string;
    trackingUrl?: string;
    shippingCarrier?: string;
    notifyCustomer?: boolean;
}

export interface UpdateFulfillmentInput {
    fulfillmentId: string;
    trackingNumber?: string;
    trackingUrl?: string;
    shippingCarrier?: string;
}

export interface CreateRefundInput {
    orderId: string;
    amount: number;
    reason?: string;
    lines?: { orderLineId: string; quantity: number }[];
    notifyCustomer?: boolean;
}

export interface AddOrderNoteInput {
    orderId: string;
    message: string;
    isPublic?: boolean;
}

// ============================================================================
// LIST/FILTER TYPES
// ============================================================================

export interface OrderFilters {
    search?: string;
    status?: OrderStatus | "all";
    paymentStatus?: PaymentStatus | "all";
    fulfillmentStatus?: FulfillmentStatus | "all";
    dateFrom?: string;
    dateTo?: string;
    customerId?: string;
    minTotal?: number;
    maxTotal?: number;
}

export interface OrderListItem {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    fulfillmentStatus: FulfillmentStatus;
    customerName: string | null;
    customerEmail: string | null;
    total: number;
    currency: string;
    itemsCount: number;
    createdAt: string;
}

// ============================================================================
// STATS TYPES
// ============================================================================

export interface OrderStats {
    total: number;
    draft: number;
    pending: number;
    processing: number;
    shipped: number;
    completed: number;
    cancelled: number;
    revenue: number;
    unpaid: number;
}
