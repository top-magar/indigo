-- ============================================================================
-- 006: Shopping Carts
-- Server-side cart system for storefront
-- ============================================================================

-- ============================================================================
-- CARTS TABLE
-- ============================================================================

create table if not exists public.carts (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    customer_id uuid references public.customers(id) on delete set null,
    email varchar(255),
    shipping_address jsonb,
    billing_address jsonb,
    subtotal decimal(10, 2) default 0,
    discount_total decimal(10, 2) default 0,
    shipping_total decimal(10, 2) default 0,
    tax_total decimal(10, 2) default 0,
    total decimal(10, 2) default 0,
    currency varchar(3) default 'USD',
    shipping_method_id uuid,
    discount_codes text[] default '{}',
    discount_id uuid,
    voucher_code_id uuid,
    voucher_code text,
    status varchar(20) default 'active' check (status in ('active', 'completed', 'abandoned')),
    completed_at timestamptz,
    metadata jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table public.carts is 'Shopping carts for storefront checkout.';

-- ============================================================================
-- CART ITEMS TABLE
-- ============================================================================

create table if not exists public.cart_items (
    id uuid primary key default gen_random_uuid(),
    cart_id uuid not null references public.carts(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    variant_id uuid,
    product_name varchar(255) not null,
    product_sku varchar(100),
    product_image text,
    unit_price decimal(10, 2) not null,
    compare_at_price decimal(10, 2),
    quantity integer not null default 1 check (quantity > 0),
    subtotal decimal(10, 2) generated always as (unit_price * quantity) stored,
    metadata jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(cart_id, product_id, variant_id)
);

comment on table public.cart_items is 'Individual items in a shopping cart.';

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_carts_tenant on public.carts(tenant_id);
create index if not exists idx_carts_customer on public.carts(customer_id);
create index if not exists idx_carts_status on public.carts(status);
create index if not exists idx_carts_created_at on public.carts(created_at);
create index if not exists idx_carts_discount on public.carts(discount_id);

create index if not exists idx_cart_items_cart on public.cart_items(cart_id);
create index if not exists idx_cart_items_product on public.cart_items(product_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

drop trigger if exists update_carts_updated_at on public.carts;
create trigger update_carts_updated_at 
    before update on public.carts 
    for each row execute function public.update_updated_at_column();

drop trigger if exists update_cart_items_updated_at on public.cart_items;
create trigger update_cart_items_updated_at 
    before update on public.cart_items 
    for each row execute function public.update_updated_at_column();

-- Function to recalculate cart totals
create or replace function public.recalculate_cart_totals()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    update public.carts
    set 
        subtotal = coalesce((
            select sum(subtotal) from public.cart_items where cart_id = coalesce(new.cart_id, old.cart_id)
        ), 0),
        total = coalesce((
            select sum(subtotal) from public.cart_items where cart_id = coalesce(new.cart_id, old.cart_id)
        ), 0) + coalesce(shipping_total, 0) - coalesce(discount_total, 0) + coalesce(tax_total, 0),
        updated_at = now()
    where id = coalesce(new.cart_id, old.cart_id);
    
    return coalesce(new, old);
end;
$$;

create trigger trigger_recalculate_cart_totals
    after insert or update or delete on public.cart_items
    for each row execute function public.recalculate_cart_totals();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

-- Carts policies (allow public access for storefront)
create policy "authenticated users can view their tenant carts"
on public.carts for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can manage their tenant carts"
on public.carts for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "anon users can manage carts"
on public.carts for all to anon
using (true);

-- Cart items policies
create policy "authenticated users can view their tenant cart items"
on public.cart_items for select to authenticated
using (cart_id in (
    select id from public.carts where tenant_id in (
        select tenant_id from public.users where id = (select auth.uid())
    )
));

create policy "authenticated users can manage their tenant cart items"
on public.cart_items for all to authenticated
using (cart_id in (
    select id from public.carts where tenant_id in (
        select tenant_id from public.users where id = (select auth.uid())
    )
));

create policy "anon users can manage cart items"
on public.cart_items for all to anon
using (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

create or replace function public.cleanup_abandoned_carts()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
    deleted_count integer;
begin
    with deleted as (
        delete from public.carts
        where status = 'active'
        and updated_at < now() - interval '7 days'
        returning id
    )
    select count(*) into deleted_count from deleted;
    
    return deleted_count;
end;
$$;
