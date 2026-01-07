-- Migration: Add customer and address fields to carts table
-- Reference: IMPLEMENTATION-PLAN.md Section 3.2
-- Purpose: Store customer information and shipping/billing addresses for checkout flow

-- Customer information fields
-- These capture the customer's contact details during checkout
alter table carts add column if not exists customer_name text;
alter table carts add column if not exists customer_phone text;

-- Shipping address fields
-- Complete shipping address for order fulfillment
alter table carts add column if not exists shipping_address text;
alter table carts add column if not exists shipping_city text;
alter table carts add column if not exists shipping_area text;
alter table carts add column if not exists shipping_postal_code text;
alter table carts add column if not exists shipping_country text;

-- Billing address field
-- Simplified billing address (can be same as shipping or different)
alter table carts add column if not exists billing_address text;

-- Add comment to document the purpose of these fields
comment on column carts.customer_name is 'Customer full name for checkout';
comment on column carts.customer_phone is 'Customer phone number for delivery contact';
comment on column carts.shipping_address is 'Street address for shipping';
comment on column carts.shipping_city is 'City for shipping';
comment on column carts.shipping_area is 'State/Province/Area for shipping';
comment on column carts.shipping_postal_code is 'Postal/ZIP code for shipping';
comment on column carts.shipping_country is 'Country for shipping';
comment on column carts.billing_address is 'Billing address (full address as text)';
