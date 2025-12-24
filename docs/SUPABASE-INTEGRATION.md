# Supabase Integration Guide

This document describes the Supabase integration added to the Indigo multi-tenant platform.

## Features Overview

### Authentication
- Supabase Auth with email/password
- Signup with automatic tenant creation
- Email verification flow

### Dashboard
- Products management with search/filter
- Categories management
- Orders management with status updates
- Customers list
- Analytics dashboard
- Store settings (branding, currency)
- Stripe Connect payments

### Storefront
- Public store pages
- Product catalog with categories
- Product detail pages
- Shopping cart
- Checkout flow

## File Structure

### Supabase Client Setup
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client
- `lib/supabase/admin.ts` - Admin client (bypasses RLS)
- `lib/supabase/types.ts` - TypeScript types
- `lib/supabase/tenant-context.tsx` - Tenant context provider

### Authentication
- `app/auth/login/page.tsx` - Login page
- `app/auth/signup/page.tsx` - Signup page
- `app/auth/verify/page.tsx` - Email verification
- `app/auth/callback/route.ts` - Auth callback
- `app/auth/actions.ts` - Server actions

### Dashboard Pages
- `app/dashboard/analytics/page.tsx` - Analytics
- `app/dashboard/categories/page.tsx` - Categories list
- `app/dashboard/categories/new/page.tsx` - New category
- `app/dashboard/categories/[id]/page.tsx` - Edit category
- `app/dashboard/customers/page.tsx` - Customers list
- `app/dashboard/products-supabase/page.tsx` - Products with search/filter
- `app/dashboard/products-supabase/new/page.tsx` - New product
- `app/dashboard/products/[id]/page.tsx` - Edit product
- `app/dashboard/orders-supabase/page.tsx` - Orders with search/filter
- `app/dashboard/settings/page.tsx` - Store settings
- `app/dashboard/settings/payments/page.tsx` - Stripe Connect

### Dashboard Components
- `components/dashboard/supabase-sidebar.tsx` - Sidebar
- `components/dashboard/supabase-header.tsx` - Header
- `components/dashboard/supabase-overview.tsx` - Dashboard overview
- `components/dashboard/products-table.tsx` - Products table
- `components/dashboard/categories-table.tsx` - Categories table
- `components/dashboard/customers-table.tsx` - Customers table
- `components/dashboard/orders-table.tsx` - Orders table
- `components/dashboard/product-form.tsx` - Product form
- `components/dashboard/category-form.tsx` - Category form
- `components/dashboard/store-settings-form.tsx` - Settings form
- `components/dashboard/stripe-connect-card.tsx` - Stripe Connect
- `components/dashboard/search-filter.tsx` - Search/filter component

### Store Pages
- `app/store/[slug]/page.tsx` - Store homepage
- `app/store/[slug]/layout.tsx` - Store layout
- `app/store/[slug]/products/page.tsx` - All products
- `app/store/[slug]/products/[productSlug]/page.tsx` - Product detail
- `app/store/[slug]/category/[categorySlug]/page.tsx` - Category page
- `app/store/[slug]/checkout/page.tsx` - Checkout
- `app/store/[slug]/order-confirmation/page.tsx` - Order confirmation

### Store Components
- `components/store/product-card.tsx` - Product card
- `components/store/product-detail.tsx` - Product detail
- `components/store/store-header.tsx` - Store header
- `components/store/store-footer.tsx` - Store footer
- `components/store/cart-sheet.tsx` - Cart sheet

### API Routes
- `app/api/upload/route.ts` - File upload (Vercel Blob)
- `app/api/checkout/route.ts` - Order creation
- `app/api/stripe/connect/route.ts` - Stripe Connect onboarding
- `app/api/stripe/connect/status/route.ts` - Stripe status
- `app/api/stripe/connect/dashboard/route.ts` - Stripe dashboard link

### Stripe Connect
- `lib/stripe-connect.ts` - Stripe Connect utilities

### SQL Scripts
- `scripts/supabase/001-create-schema.sql` - Database schema
- `scripts/supabase/002-enable-rls.sql` - RLS policies
- `scripts/supabase/003-add-inventory-function.sql` - Inventory function

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx
```

## Database Setup

Run SQL scripts in Supabase SQL editor:
1. `scripts/supabase/001-create-schema.sql`
2. `scripts/supabase/002-enable-rls.sql`
3. `scripts/supabase/003-add-inventory-function.sql`

## Key Features

### Search & Filtering
Products and orders pages include search and status filtering:
- Search by name, SKU, order number, customer email
- Filter by status (active/draft/archived for products, order status for orders)

### Stripe Connect
Multi-tenant payment processing:
- Each tenant connects their own Stripe account
- Platform takes 5% fee on transactions
- Express dashboard access for tenants

### Store Settings
Tenants can customize:
- Store name and description
- Logo upload
- Primary/secondary colors
- Currency

### Analytics
Dashboard shows:
- Revenue (current vs previous period)
- Order count and trends
- Customer count
- Product statistics
