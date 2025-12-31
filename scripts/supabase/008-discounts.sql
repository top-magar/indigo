-- ============================================================================
-- 008: Discounts System
-- Sales, vouchers, and discount codes
-- ============================================================================

-- ============================================================================
-- DISCOUNTS TABLE
-- ============================================================================

create table if not exists public.discounts (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    name text not null,
    description text,
    kind text not null default 'voucher' check (kind in ('sale', 'voucher')),
    type text not null default 'percentage' check (type in ('percentage', 'fixed')),
    value numeric(10, 2) not null default 0,
    scope text not null default 'entire_order' check (scope in ('entire_order', 'specific_products', 'shipping')),
    apply_once_per_order boolean not null default false,
    min_order_amount numeric(10, 2),
    min_quantity integer,
    min_checkout_items_quantity integer,
    usage_limit integer,
    used_count integer not null default 0,
    apply_once_per_customer boolean not null default false,
    only_for_staff boolean not null default false,
    single_use boolean not null default false,
    starts_at timestamptz,
    ends_at timestamptz,
    is_active boolean not null default true,
    applicable_product_ids jsonb,
    applicable_collection_ids jsonb,
    applicable_category_ids jsonb,
    applicable_variant_ids jsonb,
    countries jsonb,
    metadata jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.discounts is 'Sales and voucher discounts for orders and products.';

-- ============================================================================
-- VOUCHER CODES TABLE
-- ============================================================================

create table if not exists public.voucher_codes (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    discount_id uuid not null references public.discounts(id) on delete cascade,
    code text not null,
    status text not null default 'active' check (status in ('active', 'used', 'expired', 'disabled')),
    used_count integer not null default 0,
    usage_limit integer,
    is_manually_created boolean not null default false,
    created_at timestamptz not null default now(),
    used_at timestamptz
);

comment on table public.voucher_codes is 'Individual voucher codes linked to discount vouchers.';

-- ============================================================================
-- DISCOUNT USAGES TABLE
-- ============================================================================

create table if not exists public.discount_usages (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    discount_id uuid not null references public.discounts(id) on delete cascade,
    voucher_code_id uuid references public.voucher_codes(id) on delete set null,
    customer_id uuid,
    order_id uuid,
    discount_amount numeric(10, 2) not null,
    used_at timestamptz not null default now()
);

comment on table public.discount_usages is 'Tracks usage of discounts by customers and orders.';

-- ============================================================================
-- DISCOUNT RULES TABLE
-- ============================================================================

create table if not exists public.discount_rules (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    discount_id uuid not null references public.discounts(id) on delete cascade,
    name text,
    description text,
    reward_type text not null default 'subtotal_discount',
    reward_value_type text not null default 'percentage',
    reward_value numeric(10, 2) not null default 0,
    gift_product_ids jsonb,
    conditions jsonb,
    channel_ids jsonb,
    order_index integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.discount_rules is 'Advanced discount rules with conditions and rewards.';


-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_discounts_tenant on public.discounts(tenant_id);
create index if not exists idx_discounts_kind on public.discounts(tenant_id, kind);
create index if not exists idx_discounts_active on public.discounts(tenant_id, is_active);

create index if not exists idx_voucher_codes_discount on public.voucher_codes(discount_id);
create index if not exists idx_voucher_codes_code on public.voucher_codes(tenant_id, code);
create index if not exists idx_voucher_codes_status on public.voucher_codes(discount_id, status);

create index if not exists idx_discount_usages_discount on public.discount_usages(discount_id);
create index if not exists idx_discount_usages_customer on public.discount_usages(customer_id);
create index if not exists idx_discount_usages_code on public.discount_usages(voucher_code_id);

create index if not exists idx_discount_rules_discount on public.discount_rules(discount_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

drop trigger if exists update_discounts_updated_at on public.discounts;
create trigger update_discounts_updated_at 
    before update on public.discounts 
    for each row execute function public.update_updated_at_column();

drop trigger if exists update_discount_rules_updated_at on public.discount_rules;
create trigger update_discount_rules_updated_at 
    before update on public.discount_rules 
    for each row execute function public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.discounts enable row level security;
alter table public.voucher_codes enable row level security;
alter table public.discount_usages enable row level security;
alter table public.discount_rules enable row level security;

-- Discounts policies
create policy "authenticated users can view their tenant discounts"
on public.discounts for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert discounts to their tenant"
on public.discounts for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant discounts"
on public.discounts for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant discounts"
on public.discounts for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- Voucher codes policies
create policy "authenticated users can view their tenant voucher codes"
on public.voucher_codes for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert voucher codes to their tenant"
on public.voucher_codes for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant voucher codes"
on public.voucher_codes for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant voucher codes"
on public.voucher_codes for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- Discount usages policies
create policy "authenticated users can view their tenant discount usages"
on public.discount_usages for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert discount usages to their tenant"
on public.discount_usages for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- Discount rules policies
create policy "authenticated users can view their tenant discount rules"
on public.discount_rules for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can manage their tenant discount rules"
on public.discount_rules for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

create or replace function public.increment_discount_usage(p_discount_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.discounts 
    set used_count = used_count + 1, updated_at = now()
    where id = p_discount_id;
end;
$$;

create or replace function public.increment_voucher_code_usage(p_code_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.voucher_codes 
    set used_count = used_count + 1, used_at = now()
    where id = p_code_id;
end;
$$;

-- Grant permissions
grant all on public.discounts to authenticated, service_role;
grant all on public.voucher_codes to authenticated, service_role;
grant all on public.discount_usages to authenticated, service_role;
grant all on public.discount_rules to authenticated, service_role;
grant execute on function public.increment_discount_usage(uuid) to authenticated, service_role;
grant execute on function public.increment_voucher_code_usage(uuid) to authenticated, service_role;
