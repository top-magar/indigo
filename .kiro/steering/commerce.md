# Commerce Conventions

Rules for products, orders, customers, checkout, payments.

## Products

- Schema: `src/db/schema/products.ts` — products, variants, images
- Features: `src/features/products/`
- Dashboard: `src/app/dashboard/products/`
- Prices stored as integers (cents). Display with `formatCurrency()`.
- Variants: separate rows linked to product. Each has own price, SKU, stock.
- Images: upload to Supabase Storage, store URL in DB.

## Orders

- Schema: `src/db/schema/orders.ts` — orders, order_items
- Features: `src/features/orders/`
- Statuses: pending → processing → shipped → delivered → completed
- Returns: pending_return → returned → refunded
- Always create order_items as separate rows, not JSONB.

## Customers

- Schema: `src/db/schema/customers.ts`
- Features: `src/features/customers/`
- Linked to tenant, not to auth users (customers are shoppers, not dashboard users).
- Customer groups for segmentation.

## Checkout Flow

```
Cart → Checkout page → Payment → Order created → Confirmation
  ↓
/store/{slug}/checkout → collects shipping + payment
  ↓
Payment provider (eSewa/Khalti/Stripe) → callback
  ↓
Create order + order_items → decrement inventory → send notification
```

## Payments

- Nepal: eSewa, Khalti (redirect-based)
- International: Stripe
- Config: `src/infrastructure/payments/`
- Settings: `src/app/dashboard/settings/payments/`
- Never store card numbers. Use provider tokens.

## Inventory

- `stock_quantity` on product/variant
- Decrement on order creation
- Increment on order cancellation/return
- Low stock alerts in dashboard

## Currency

- Nepal: NPR (Nepali Rupee)
- Store in cents, display with locale formatting
- Tenant can set display currency in settings
