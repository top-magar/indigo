-- Migration: 0004_create_store_configs
-- Purpose: Create store_configs table for visual editor page layouts
-- Reference: SYSTEM-ARCHITECTURE.md Section 9.2 (F004)
-- 
-- This table stores page configurations for the storefront visual editor,
-- supporting draft/published workflow and tenant isolation via RLS.
--
-- Note: RLS policies are defined in 0001_enable_rls.sql

-- Create store_configs table
create table if not exists store_configs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  page_type text not null, -- Type of page: home, product, category, checkout, cart, about, contact, faq
  layout jsonb default '{}', -- Visual editor layout data (published version)
  is_published boolean default false,
  published_at timestamptz,
  draft_layout jsonb, -- Draft version for unpublished changes
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add table comment
comment on table store_configs is 'Stores page configurations for the storefront visual editor with draft/publish workflow';

-- Create index for efficient tenant + page type lookups
create index if not exists idx_store_configs_tenant_page_type 
  on store_configs(tenant_id, page_type);

-- Note: RLS is enabled and policies are created in 0001_enable_rls.sql
-- If running this migration standalone, uncomment the following:
-- alter table store_configs enable row level security;
-- create policy tenant_isolation_store_configs on store_configs
--   for all
--   using (tenant_id = current_setting('app.current_tenant', true)::uuid)
--   with check (tenant_id = current_setting('app.current_tenant', true)::uuid);
