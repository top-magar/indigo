'use client';

import { format } from 'date-fns';
import { formatCurrency } from '@/shared/utils';
import type { Order } from '../order-detail-client';

interface InvoiceProps {
  order: Order;
  storeName: string;
  taxRegistration?: string;
}

export function Invoice({ order, storeName, taxRegistration }: InvoiceProps) {
  const customerName =
    [order.customer.firstName, order.customer.lastName].filter(Boolean).join(' ') || 'Guest';
  const addr = order.shippingAddress;
  const fc = (v: number) => formatCurrency(v, order.currency);

  return (
    <div className="hidden print:block p-8 text-black text-sm" style={{ fontFamily: 'serif' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-2xl font-semibold">{storeName}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tracking-wide">INVOICE</p>
          <p className="mt-1">#{order.orderNumber}</p>
          <p>{format(new Date(order.createdAt), 'MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* Bill To / Ship To */}
      <div className="flex gap-16 mb-8">
        <div>
          <p className="font-semibold mb-1">Bill To</p>
          <p>{customerName}</p>
          <p>{order.customer.email}</p>
          {order.customer.phone && <p>{order.customer.phone}</p>}
        </div>
        {addr && (
          <div>
            <p className="font-semibold mb-1">Ship To</p>
            {addr.addressLine1 && <p>{addr.addressLine1}</p>}
            {addr.addressLine2 && <p>{addr.addressLine2}</p>}
            <p>
              {[addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}
            </p>
            <p>{addr.country}</p>
            {addr.phone && <p>{addr.phone}</p>}
          </div>
        )}
      </div>

      {/* Line Items */}
      <table className="w-full mb-8" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid black' }}>
            <th className="text-left py-2">Item</th>
            <th className="text-right py-2">Qty</th>
            <th className="text-right py-2">Unit Price</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((line) => (
            <tr key={line.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td className="py-2">
                {line.productName}
                {line.productSku && (
                  <span className="text-xs ml-2">SKU: {line.productSku}</span>
                )}
              </td>
              <td className="text-right py-2">{line.quantity}</td>
              <td className="text-right py-2">{fc(line.unitPrice)}</td>
              <td className="text-right py-2">{fc(line.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-1">
            <span>Subtotal</span>
            <span>{fc(order.subtotal)}</span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between py-1">
              <span>Discount</span>
              <span>-{fc(order.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between py-1">
            <span>Shipping</span>
            <span>{order.shippingTotal > 0 ? fc(order.shippingTotal) : 'Free'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Tax</span>
            <span>{fc(order.taxTotal)}</span>
          </div>
          <div
            className="flex justify-between py-2 font-semibold text-base mt-1"
            style={{ borderTop: '2px solid black' }}
          >
            <span>Total</span>
            <span>{fc(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-8">
        <p>
          <span className="font-bold">Payment:</span>{' '}
          {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs mt-16" style={{ borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
        <p>Thank you for your order</p>
        {taxRegistration && <p className="mt-1">VAT Registration: {taxRegistration}</p>}
      </div>
    </div>
  );
}
