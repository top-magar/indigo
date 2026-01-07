-- Migration: Add payment fields to orders table
-- Reference: SYSTEM-ARCHITECTURE.md Section 9.2 (F007)
-- Purpose: Store Stripe payment information for order tracking and webhook processing

-- add stripe_payment_intent_id column for storing PaymentIntent ID from Stripe
alter table orders
add column if not exists stripe_payment_intent_id text;

-- add stripe_charge_id column for storing Charge ID from Stripe
alter table orders
add column if not exists stripe_charge_id text;

-- add payment_status column to track payment lifecycle
-- valid values: pending, paid, failed, refunded, partially_refunded
alter table orders
add column if not exists payment_status text default 'pending';

-- add comment explaining the payment_status values
comment on column orders.payment_status is 'Payment status: pending, paid, failed, refunded, partially_refunded';

-- create index on stripe_payment_intent_id for efficient webhook lookups
-- webhooks frequently query by payment_intent_id to find associated orders
create index if not exists idx_orders_stripe_payment_intent_id
on orders (stripe_payment_intent_id);

-- create index on payment_status for filtering orders by payment state
-- commonly used in dashboard queries and reporting
create index if not exists idx_orders_payment_status
on orders (payment_status);
