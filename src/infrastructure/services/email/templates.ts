/**
 * Email Templates
 * 
 * HTML email templates for order confirmation and merchant notifications
 */

import type { OrderDetails, StoreInfo } from './types';

/**
 * Format currency amount
 */
function formatCurrency(amount: string, currency: string = 'USD'): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(num);
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

/**
 * Generate order items HTML table
 */
function generateOrderItemsHtml(items: OrderDetails['items'], currency: string): string {
  return items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${item.productImage ? `<img src="${item.productImage}" alt="${item.productName}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />` : ''}
          <div>
            <p style="margin: 0; font-weight: 500; color: #111827;">${item.productName}</p>
            ${item.variantTitle ? `<p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">${item.variantTitle}</p>` : ''}
            ${item.productSku ? `<p style="margin: 4px 0 0; font-size: 12px; color: #9ca3af;">SKU: ${item.productSku}</p>` : ''}
          </div>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827;">
        ${formatCurrency(item.totalPrice, currency)}
      </td>
    </tr>
  `).join('');
}

/**
 * Generate address HTML block
 */
function generateAddressHtml(address: OrderDetails['shippingAddress'], title: string): string {
  if (!address) return '';
  
  const parts = [
    address.street,
    address.city,
    address.area,
    address.postalCode,
    address.country,
  ].filter(Boolean);
  
  if (parts.length === 0) return '';
  
  return `
    <div style="margin-bottom: 16px;">
      <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #374151;">${title}</h4>
      <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
        ${parts.join('<br />')}
      </p>
    </div>
  `;
}

/**
 * Base email wrapper template
 */
function emailWrapper(content: string, storeName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email from ${storeName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          ${content}
        </table>
        <p style="text-align: center; margin-top: 24px; font-size: 12px; color: #9ca3af;">
          © ${new Date().getFullYear()} ${storeName}. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Order Confirmation Email Template (for customers)
 */
export function orderConfirmationTemplate(order: OrderDetails, store: StoreInfo): string {
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        ${store.logoUrl ? `<img src="${store.logoUrl}" alt="${store.name}" style="max-height: 48px; margin-bottom: 16px;" />` : ''}
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">Order Confirmed!</h1>
        <p style="margin: 8px 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">Thank you for your order</p>
      </td>
    </tr>
    
    <!-- Order Info -->
    <tr>
      <td style="padding: 24px 32px;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 16px; background-color: #f9fafb; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Order Number</p>
              <p style="margin: 4px 0 0; font-size: 18px; font-weight: 600; color: #111827;">#${order.orderNumber}</p>
            </td>
            <td style="width: 16px;"></td>
            <td style="padding: 12px 16px; background-color: #f9fafb; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Order Date</p>
              <p style="margin: 4px 0 0; font-size: 14px; font-weight: 500; color: #111827;">${formatDate(order.createdAt)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    ${order.customerName ? `
    <!-- Customer Greeting -->
    <tr>
      <td style="padding: 0 32px 16px;">
        <p style="margin: 0; font-size: 16px; color: #374151;">
          Hi <strong>${order.customerName}</strong>,
        </p>
        <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">
          We've received your order and it's being processed. You'll receive another email when your order ships.
        </p>
      </td>
    </tr>
    ` : ''}
    
    <!-- Order Items -->
    <tr>
      <td style="padding: 0 32px 24px;">
        <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">Order Summary</h3>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Item</th>
              <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Qty</th>
              <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${generateOrderItemsHtml(order.items, order.currency)}
          </tbody>
        </table>
      </td>
    </tr>
    
    <!-- Order Totals -->
    <tr>
      <td style="padding: 0 32px 24px;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px;">
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #6b7280;">Subtotal</td>
            <td style="padding: 12px 16px; text-align: right; font-size: 14px; color: #111827;">${formatCurrency(order.subtotal, order.currency)}</td>
          </tr>
          ${order.shippingTotal && parseFloat(order.shippingTotal) > 0 ? `
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #6b7280;">Shipping</td>
            <td style="padding: 12px 16px; text-align: right; font-size: 14px; color: #111827;">${formatCurrency(order.shippingTotal, order.currency)}</td>
          </tr>
          ` : ''}
          ${order.taxTotal && parseFloat(order.taxTotal) > 0 ? `
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #6b7280;">Tax</td>
            <td style="padding: 12px 16px; text-align: right; font-size: 14px; color: #111827;">${formatCurrency(order.taxTotal, order.currency)}</td>
          </tr>
          ` : ''}
          ${order.discountTotal && parseFloat(order.discountTotal) > 0 ? `
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #059669;">Discount</td>
            <td style="padding: 12px 16px; text-align: right; font-size: 14px; color: #059669;">-${formatCurrency(order.discountTotal, order.currency)}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 16px; font-size: 18px; font-weight: 700; color: #111827; border-top: 2px solid #e5e7eb;">Total</td>
            <td style="padding: 16px; text-align: right; font-size: 18px; font-weight: 700; color: #111827; border-top: 2px solid #e5e7eb;">${formatCurrency(order.total, order.currency)}</td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Shipping Address -->
    ${order.shippingAddress ? `
    <tr>
      <td style="padding: 0 32px 24px;">
        ${generateAddressHtml(order.shippingAddress, 'Shipping Address')}
      </td>
    </tr>
    ` : ''}
    
    <!-- Footer -->
    <tr>
      <td style="padding: 24px 32px; background-color: #f9fafb; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          Questions about your order? Contact us at <a href="mailto:support@${store.slug}.com" style="color: #667eea; text-decoration: none;">support@${store.slug}.com</a>
        </p>
      </td>
    </tr>
  `;
  
  return emailWrapper(content, store.name);
}

/**
 * Order Shipped Email Template (for customers)
 */
export function orderShippedTemplate(orderNumber: string, trackingNumber?: string, carrier?: string, storeUrl?: string): string {
  const content = `
    <tr>
      <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">Your Order Has Shipped!</h1>
        <p style="margin: 8px 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">Order #${orderNumber} is on its way</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 32px;">
        <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">Great news! Your order has been shipped and is on its way to you.</p>
        ${trackingNumber ? `
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px;">
          ${carrier ? `<tr><td style="padding: 12px 16px; font-size: 14px; color: #6b7280;">Carrier</td><td style="padding: 12px 16px; text-align: right; font-size: 14px; font-weight: 600; color: #111827;">${carrier}</td></tr>` : ''}
          <tr><td style="padding: 12px 16px; font-size: 14px; color: #6b7280;">Tracking Number</td><td style="padding: 12px 16px; text-align: right; font-size: 14px; font-weight: 600; color: #111827;">${trackingNumber}</td></tr>
        </table>
        ` : ''}
      </td>
    </tr>
    ${storeUrl ? `
    <tr>
      <td style="padding: 0 32px 32px; text-align: center;">
        <a href="${storeUrl}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #667eea; border-radius: 8px; text-decoration: none;">View Your Order</a>
      </td>
    </tr>
    ` : ''}
  `;
  return emailWrapper(content, 'Indigo');
}

/**
 * Order Delivered Email Template (for customers)
 */
export function orderDeliveredTemplate(orderNumber: string, storeName: string, reviewUrl?: string): string {
  const content = `
    <tr>
      <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(135deg, #059669 0%, #047857 100%);">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">Your Order Has Been Delivered!</h1>
        <p style="margin: 8px 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">Order #${orderNumber}</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 32px;">
        <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">Your order from <strong>${storeName}</strong> has been delivered. We hope you love it!</p>
      </td>
    </tr>
    ${reviewUrl ? `
    <tr>
      <td style="padding: 0 32px 32px; text-align: center;">
        <a href="${reviewUrl}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #059669; border-radius: 8px; text-decoration: none;">Leave a Review</a>
      </td>
    </tr>
    ` : ''}
  `;
  return emailWrapper(content, storeName);
}

/**
 * Order Notification Email Template (for merchants)
 */
export function orderNotificationTemplate(order: OrderDetails, store: StoreInfo): string {
  const content = `
    <!-- Header -->
    <tr>
      <td style="padding: 32px 32px 24px; background-color: #059669;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">🎉 New Order Received!</h1>
        <p style="margin: 8px 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">${store.name}</p>
      </td>
    </tr>
    
    <!-- Order Summary -->
    <tr>
      <td style="padding: 24px 32px;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 16px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #059669;">
              <p style="margin: 0; font-size: 14px; color: #065f46;">Order Total</p>
              <p style="margin: 4px 0 0; font-size: 28px; font-weight: 700; color: #059669;">${formatCurrency(order.total, order.currency)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Order Details -->
    <tr>
      <td style="padding: 0 32px 24px;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px;">
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #6b7280;">Order Number</td>
            <td style="padding: 12px 16px; text-align: right; font-size: 14px; font-weight: 600; color: #111827;">#${order.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #6b7280;">Date</td>
            <td style="padding: 12px 16px; text-align: right; font-size: 14px; color: #111827;">${formatDate(order.createdAt)}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #6b7280;">Customer</td>
            <td style="padding: 12px 16px; text-align: right; font-size: 14px; color: #111827;">${order.customerName || 'Guest'}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #6b7280;">Email</td>
            <td style="padding: 12px 16px; text-align: right; font-size: 14px; color: #111827;">${order.customerEmail || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #6b7280;">Items</td>
            <td style="padding: 12px 16px; text-align: right; font-size: 14px; color: #111827;">${order.items.length} item(s)</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 14px; color: #6b7280;">Payment Status</td>
            <td style="padding: 12px 16px; text-align: right;">
              <span style="display: inline-block; padding: 4px 12px; font-size: 12px; font-weight: 600; color: #065f46; background-color: #d1fae5; border-radius: 9999px;">
                ${order.paymentStatus?.toUpperCase() || 'PAID'}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Order Items -->
    <tr>
      <td style="padding: 0 32px 24px;">
        <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">Order Items</h3>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Item</th>
              <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Qty</th>
              <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${generateOrderItemsHtml(order.items, order.currency)}
          </tbody>
        </table>
      </td>
    </tr>
    
    <!-- Shipping Address -->
    ${order.shippingAddress ? `
    <tr>
      <td style="padding: 0 32px 24px;">
        ${generateAddressHtml(order.shippingAddress, 'Ship To')}
      </td>
    </tr>
    ` : ''}
    
    <!-- CTA -->
    <tr>
      <td style="padding: 0 32px 32px; text-align: center;">
        <a href="https://${store.slug}.example.com/dashboard/orders/${order.orderId}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #059669; border-radius: 8px; text-decoration: none;">
          View Order Details
        </a>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding: 24px 32px; background-color: #f9fafb; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
          This is an automated notification from your store dashboard.
        </p>
      </td>
    </tr>
  `;
  
  return emailWrapper(content, store.name);
}

/**
 * Abandoned Cart Recovery Email Template
 */
export function abandonedCartTemplate(
  storeName: string,
  cartUrl: string,
  items: { name: string; price: string }[]
): string {
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827;">${item.price}</td>
    </tr>`
    )
    .join('');

  const content = `
    <!-- Header -->
    <tr>
      <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">You left items in your cart</h1>
        <p style="margin: 8px 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">Complete your purchase at ${storeName}</p>
      </td>
    </tr>

    <!-- Items -->
    <tr>
      <td style="padding: 24px 32px;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Item</th>
              <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding: 0 32px 32px; text-align: center;">
        <a href="${cartUrl}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #667eea; border-radius: 8px; text-decoration: none;">
          Complete Your Purchase
        </a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 24px 32px; background-color: #f9fafb; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          If you have any questions, contact us at <a href="mailto:support@${storeName.toLowerCase().replace(/\s+/g, '')}.com" style="color: #667eea; text-decoration: none;">support</a>.
        </p>
      </td>
    </tr>
  `;

  return emailWrapper(content, storeName);
}