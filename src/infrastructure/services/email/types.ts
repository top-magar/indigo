/**
 * Email Service Types
 * 
 * Type definitions for order confirmation and notification emails
 */

/**
 * Address information for orders
 */
export interface OrderAddress {
  street?: string;
  city?: string;
  area?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Order item details for email templates
 */
export interface OrderItemDetails {
  productName: string;
  productSku?: string;
  productImage?: string;
  variantTitle?: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

/**
 * Complete order details for email templates
 */
export interface OrderDetails {
  orderId: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  items: OrderItemDetails[];
  subtotal: string;
  shippingTotal?: string;
  taxTotal?: string;
  discountTotal?: string;
  total: string;
  currency: string;
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;
  shippingMethod?: string;
  paymentStatus?: string;
  createdAt: Date;
}

/**
 * Store/Tenant information for email branding
 */
export interface StoreInfo {
  name: string;
  slug: string;
  logoUrl?: string;
  currency?: string;
}

/**
 * Email send result
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
