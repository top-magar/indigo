# Supabase SQL Migrations

This folder contains SQL migration scripts to be run in the Supabase SQL Editor.

## Migration Structure

All migrations follow Supabase SQL best practices:
- Lowercase SQL keywords
- `public.` schema prefix on all tables
- Separate RLS policies per operation (select, insert, update, delete)
- `(select auth.uid())` for RLS performance caching
- Table comments for documentation
- Proper indexes on foreign keys and RLS columns

## Migration Files

### Core (Required)

| File | Description |
|------|-------------|
| `001-core-schema.sql` | Tenants, users, helper functions |
| `002-products-categories.sql` | Products and categories |
| `003-customers-addresses.sql` | Customers and addresses |
| `004-orders.sql` | Orders, fulfillments, transactions, invoices |
| `005-collections.sql` | Product collections |
| `006-carts.sql` | Shopping carts |
| `007-inventory.sql` | Stock movements and inventory tracking |
| `008-discounts.sql` | Sales, vouchers, discount codes |
| `009-media-library.sql` | Media assets and folders |
| `010-attributes.sql` | Product attributes system |
| `011-store-layouts.sql` | Visual editor page layouts |

### Optional

| File | Description |
|------|-------------|
| `012-marketing.sql` | Campaigns and customer segments |
| `013-advanced-commerce.sql` | Variants, shipping zones, returns, store credits |
| `014-events-history.sql` | Event persistence and audit history |

## Quick Setup

Run migrations in order for a new database:

```bash
# Core (required)
001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 011

# Optional features
012, 013, 014
```

## Notes

1. Run migrations in numerical order
2. All tables use `if not exists` for idempotency
3. RLS is enabled on all tables with tenant isolation
4. The `drizzle/` folder contains auto-generated migrations for local development

## SQL Style Guide

See `.kiro/steering/supabase-sql.md` for the complete SQL style guide.
