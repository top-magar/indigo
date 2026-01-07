-- Migration: Add Stripe Connect columns to tenants table
-- Purpose: Enable multi-tenant Stripe Connect integration for merchant payouts
-- Reference: SYSTEM-ARCHITECTURE.md Section 3.4.1 (Stripe Connect Integration)

-- Add stripe_account_id column to store the Stripe Connect account ID for each merchant
alter table tenants
add column if not exists stripe_account_id text;

-- Add stripe_onboarding_complete column to track whether the merchant has completed Stripe onboarding
alter table tenants
add column if not exists stripe_onboarding_complete boolean default false;

-- Add index on stripe_account_id for efficient lookups when processing webhooks and payouts
create index if not exists idx_tenants_stripe_account_id
on tenants (stripe_account_id);

-- Add comment to document the columns
comment on column tenants.stripe_account_id is 'Stripe Connect account ID for the merchant (e.g., acct_xxx)';
comment on column tenants.stripe_onboarding_complete is 'Whether the merchant has completed Stripe Connect onboarding';
