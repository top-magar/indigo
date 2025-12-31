-- ============================================================================
-- 003: Customers & Addresses
-- End customers of stores with address management
-- ============================================================================

-- ============================================================================
-- CUSTOMERS TABLE
-- ============================================================================

create table if not exists public.customers (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    email varchar(255) not null,
    password_hash text,
    first_name varchar(255),
    last_name varchar(255),
    phone varchar(50),
    accepts_marketing boolean default false,
    is_active boolean default true,
    last_login timestamptz,
    country_code varchar(2),
    metadata jsonb default '{}',
    private_metadata jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(tenant_id, email)
);

comment on table public.customers is 'End customers who purchase from stores.';
comment on column public.customers.is_active is 'Whether the customer account is active.';
comment on column public.customers.private_metadata is 'Private metadata only visible to staff.';

-- ============================================================================
-- ADDRESSES TABLE
-- ============================================================================

create table if not exists public.addresses (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    customer_id uuid not null references public.customers(id) on delete cascade,
    type varchar(20) default 'shipping' check (type in ('shipping', 'billing')),
    first_name varchar(255),
    last_name varchar(255),
    company varchar(255),
    address_line1 varchar(255) not null,
    address_line2 varchar(255),
    city varchar(100) not null,
    state varchar(100),
    postal_code varchar(20),
    country varchar(2) not null,
    country_code varchar(10),
    phone varchar(50),
    is_default boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table public.addresses is 'Customer shipping and billing addresses.';
comment on column public.addresses.country_code is 'ISO 3166-1 alpha-2 country code.';

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_customers_tenant on public.customers(tenant_id);
create index if not exists idx_customers_email on public.customers(tenant_id, email);
create index if not exists idx_customers_is_active on public.customers(tenant_id, is_active);
create index if not exists idx_customers_last_login on public.customers(tenant_id, last_login);

create index if not exists idx_addresses_tenant on public.addresses(tenant_id);
create index if not exists idx_addresses_customer on public.addresses(customer_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

drop trigger if exists update_customers_updated_at on public.customers;
create trigger update_customers_updated_at 
    before update on public.customers 
    for each row execute function public.update_updated_at_column();

drop trigger if exists update_addresses_updated_at on public.addresses;
create trigger update_addresses_updated_at 
    before update on public.addresses 
    for each row execute function public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.customers enable row level security;
alter table public.addresses enable row level security;

-- Customers policies
create policy "authenticated users can view their tenant customers"
on public.customers for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert customers to their tenant"
on public.customers for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant customers"
on public.customers for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant customers"
on public.customers for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "anon users can create customers"
on public.customers for insert to anon
with check (true);

-- Addresses policies
create policy "authenticated users can view their tenant addresses"
on public.addresses for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert addresses to their tenant"
on public.addresses for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant addresses"
on public.addresses for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant addresses"
on public.addresses for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

create or replace function public.update_customer_last_login(p_customer_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.customers
    set last_login = now()
    where id = p_customer_id;
end;
$$;
