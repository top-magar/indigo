-- ============================================================================
-- 015: Phase C Enhancements
-- Additional fields for Stripe Connect, payments, and checkout flow
-- Reference: IMPLEMENTATION-PLAN.md Phase C
-- ============================================================================

-- ============================================================================
-- ORDERS TABLE ENHANCEMENTS
-- Add missing Stripe fields for webhook processing
-- ============================================================================

-- Add stripe_charge_id for refund processing
alter table public.orders 
add column if not exists stripe_charge_id varchar(255);

comment on column public.orders.stripe_charge_id is 'Stripe Charge ID for refund processing';

-- Add index for stripe_payment_intent_id lookups (webhooks)
create index if not exists idx_orders_stripe_payment_intent 
on public.orders(stripe_payment_intent_id) 
where stripe_payment_intent_id is not null;

-- ============================================================================
-- CARTS TABLE ENHANCEMENTS
-- Add explicit customer info fields for checkout (alternative to JSONB)
-- ============================================================================

-- Customer contact fields
alter table public.carts 
add column if not exists customer_name varchar(255);

alter table public.carts 
add column if not exists customer_phone varchar(50);

comment on column public.carts.customer_name is 'Customer full name for checkout';
comment on column public.carts.customer_phone is 'Customer phone number for delivery contact';

-- ============================================================================
-- STORE CONFIGS TABLE (Alternative to store_layouts)
-- For visual editor with draft/publish workflow
-- ============================================================================

create table if not exists public.store_configs (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    page_type varchar(50) not null, -- home, product, category, checkout, cart, about, contact, faq
    layout jsonb default '{}'::jsonb,
    is_published boolean default false,
    published_at timestamptz,
    draft_layout jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(tenant_id, page_type)
);

comment on table public.store_configs is 'Page configurations for storefront visual editor with draft/publish workflow.';

-- Index for tenant + page type lookups
create index if not exists idx_store_configs_tenant_page 
on public.store_configs(tenant_id, page_type);

-- Trigger for updated_at
drop trigger if exists update_store_configs_updated_at on public.store_configs;
create trigger update_store_configs_updated_at 
    before update on public.store_configs 
    for each row execute function public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY FOR STORE_CONFIGS
-- ============================================================================

alter table public.store_configs enable row level security;

create policy "authenticated users can view their tenant store configs"
on public.store_configs for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert store configs to their tenant"
on public.store_configs for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant store configs"
on public.store_configs for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant store configs"
on public.store_configs for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- Anon users can view published configs (for storefront rendering)
create policy "anon users can view published store configs"
on public.store_configs for select to anon
using (is_published = true);

-- Grant permissions
grant select on public.store_configs to anon;
grant select, insert, update, delete on public.store_configs to authenticated;
