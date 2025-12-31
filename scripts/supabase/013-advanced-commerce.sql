-- ============================================================================
-- 013: Advanced Commerce (Optional)
-- Product variants, shipping zones, returns, store credits
-- ============================================================================

-- ============================================================================
-- PRODUCT OPTIONS TABLE
-- ============================================================================

create table if not exists public.product_options (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    name varchar(100) not null,
    position integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(product_id, name)
);

comment on table public.product_options is 'Product options like Size, Color, Material.';

-- ============================================================================
-- PRODUCT OPTION VALUES TABLE
-- ============================================================================

create table if not exists public.product_option_values (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    option_id uuid not null references public.product_options(id) on delete cascade,
    value varchar(100) not null,
    position integer default 0,
    created_at timestamptz default now(),
    unique(option_id, value)
);

comment on table public.product_option_values is 'Values for product options (e.g., Small, Medium, Large).';

-- ============================================================================
-- PRODUCT VARIANTS TABLE
-- ============================================================================

create table if not exists public.product_variants (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    title varchar(255) not null,
    sku varchar(100),
    barcode varchar(100),
    price decimal(10, 2) not null,
    compare_at_price decimal(10, 2),
    cost_price decimal(10, 2),
    quantity integer default 0,
    weight decimal(10, 2),
    weight_unit varchar(10) default 'kg',
    requires_shipping boolean default true,
    is_default boolean default false,
    position integer default 0,
    image_url text,
    metadata jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(tenant_id, sku)
);

comment on table public.product_variants is 'Product variants with specific option combinations.';

-- ============================================================================
-- VARIANT OPTION VALUES TABLE
-- ============================================================================

create table if not exists public.variant_option_values (
    id uuid primary key default gen_random_uuid(),
    variant_id uuid not null references public.product_variants(id) on delete cascade,
    option_value_id uuid not null references public.product_option_values(id) on delete cascade,
    created_at timestamptz default now(),
    unique(variant_id, option_value_id)
);

comment on table public.variant_option_values is 'Links variants to their option values.';

-- ============================================================================
-- PRODUCT TAGS TABLE
-- ============================================================================

create table if not exists public.product_tags (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    name varchar(100) not null,
    slug varchar(100) not null,
    created_at timestamptz default now(),
    unique(tenant_id, slug)
);

comment on table public.product_tags is 'Tags for organizing and filtering products.';

-- ============================================================================
-- PRODUCT TAG ASSIGNMENTS TABLE
-- ============================================================================

create table if not exists public.product_tag_assignments (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products(id) on delete cascade,
    tag_id uuid not null references public.product_tags(id) on delete cascade,
    created_at timestamptz default now(),
    unique(product_id, tag_id)
);

comment on table public.product_tag_assignments is 'Links products to tags.';

-- ============================================================================
-- SHIPPING ZONES TABLE
-- ============================================================================

create table if not exists public.shipping_zones (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    name varchar(100) not null,
    description text,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table public.shipping_zones is 'Shipping zones for rate calculation.';

-- ============================================================================
-- SHIPPING ZONE COUNTRIES TABLE
-- ============================================================================

create table if not exists public.shipping_zone_countries (
    id uuid primary key default gen_random_uuid(),
    zone_id uuid not null references public.shipping_zones(id) on delete cascade,
    country_code varchar(2) not null,
    country_name varchar(100) not null,
    created_at timestamptz default now(),
    unique(zone_id, country_code)
);

comment on table public.shipping_zone_countries is 'Countries included in shipping zones.';

-- ============================================================================
-- SHIPPING RATES TABLE
-- ============================================================================

create table if not exists public.shipping_rates (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    zone_id uuid not null references public.shipping_zones(id) on delete cascade,
    name varchar(100) not null,
    description text,
    rate_type varchar(20) default 'flat' check (rate_type in ('flat', 'weight', 'price', 'item')),
    price decimal(10, 2) not null default 0,
    min_weight decimal(10, 2),
    max_weight decimal(10, 2),
    min_order_total decimal(10, 2),
    max_order_total decimal(10, 2),
    price_per_kg decimal(10, 2),
    price_per_item decimal(10, 2),
    free_shipping_threshold decimal(10, 2),
    estimated_days_min integer,
    estimated_days_max integer,
    is_active boolean default true,
    position integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table public.shipping_rates is 'Shipping rates for different zones and methods.';


-- ============================================================================
-- RETURNS TABLE
-- ============================================================================

create table if not exists public.returns (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    order_id uuid not null references public.orders(id) on delete cascade,
    customer_id uuid references public.customers(id) on delete set null,
    return_number varchar(50) not null,
    status varchar(50) default 'requested' check (status in (
        'requested', 'approved', 'rejected', 'received', 
        'processing', 'refunded', 'completed', 'cancelled'
    )),
    reason varchar(100),
    customer_notes text,
    admin_notes text,
    refund_amount decimal(10, 2),
    refund_method varchar(50) default 'original' check (refund_method in ('original', 'store_credit', 'manual')),
    shipping_paid_by varchar(20) default 'customer' check (shipping_paid_by in ('customer', 'store')),
    tracking_number varchar(100),
    received_at timestamptz,
    refunded_at timestamptz,
    metadata jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(tenant_id, return_number)
);

comment on table public.returns is 'Product returns and refund requests.';

-- ============================================================================
-- RETURN ITEMS TABLE
-- ============================================================================

create table if not exists public.return_items (
    id uuid primary key default gen_random_uuid(),
    return_id uuid not null references public.returns(id) on delete cascade,
    order_item_id uuid not null references public.order_items(id) on delete cascade,
    quantity integer not null default 1,
    reason varchar(100),
    condition varchar(50) default 'unopened' check (condition in ('unopened', 'opened', 'damaged', 'defective')),
    refund_amount decimal(10, 2),
    created_at timestamptz default now()
);

comment on table public.return_items is 'Individual items in a return request.';

-- ============================================================================
-- STORE CREDITS TABLE
-- ============================================================================

create table if not exists public.store_credits (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    customer_id uuid not null references public.customers(id) on delete cascade,
    amount decimal(10, 2) not null,
    balance decimal(10, 2) not null,
    currency_code varchar(3) default 'USD',
    reason varchar(100),
    source_type varchar(50),
    source_id uuid,
    expires_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table public.store_credits is 'Customer store credits for refunds and promotions.';

-- ============================================================================
-- STORE CREDIT TRANSACTIONS TABLE
-- ============================================================================

create table if not exists public.store_credit_transactions (
    id uuid primary key default gen_random_uuid(),
    store_credit_id uuid not null references public.store_credits(id) on delete cascade,
    type varchar(20) not null check (type in ('credit', 'debit')),
    amount decimal(10, 2) not null,
    balance_after decimal(10, 2) not null,
    order_id uuid references public.orders(id) on delete set null,
    notes text,
    created_at timestamptz default now()
);

comment on table public.store_credit_transactions is 'Store credit transaction history.';

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_product_options_product on public.product_options(product_id);
create index if not exists idx_product_option_values_option on public.product_option_values(option_id);
create index if not exists idx_product_variants_product on public.product_variants(product_id);
create index if not exists idx_product_variants_sku on public.product_variants(tenant_id, sku);
create index if not exists idx_variant_option_values_variant on public.variant_option_values(variant_id);
create index if not exists idx_product_tags_tenant on public.product_tags(tenant_id);
create index if not exists idx_product_tag_assignments_product on public.product_tag_assignments(product_id);
create index if not exists idx_shipping_zones_tenant on public.shipping_zones(tenant_id);
create index if not exists idx_shipping_zone_countries_zone on public.shipping_zone_countries(zone_id);
create index if not exists idx_shipping_rates_zone on public.shipping_rates(zone_id);
create index if not exists idx_returns_tenant on public.returns(tenant_id);
create index if not exists idx_returns_order on public.returns(order_id);
create index if not exists idx_returns_status on public.returns(tenant_id, status);
create index if not exists idx_return_items_return on public.return_items(return_id);
create index if not exists idx_store_credits_customer on public.store_credits(customer_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

drop trigger if exists update_product_options_updated_at on public.product_options;
create trigger update_product_options_updated_at 
    before update on public.product_options 
    for each row execute function public.update_updated_at_column();

drop trigger if exists update_product_variants_updated_at on public.product_variants;
create trigger update_product_variants_updated_at 
    before update on public.product_variants 
    for each row execute function public.update_updated_at_column();

drop trigger if exists update_shipping_zones_updated_at on public.shipping_zones;
create trigger update_shipping_zones_updated_at 
    before update on public.shipping_zones 
    for each row execute function public.update_updated_at_column();

drop trigger if exists update_shipping_rates_updated_at on public.shipping_rates;
create trigger update_shipping_rates_updated_at 
    before update on public.shipping_rates 
    for each row execute function public.update_updated_at_column();

drop trigger if exists update_returns_updated_at on public.returns;
create trigger update_returns_updated_at 
    before update on public.returns 
    for each row execute function public.update_updated_at_column();

drop trigger if exists update_store_credits_updated_at on public.store_credits;
create trigger update_store_credits_updated_at 
    before update on public.store_credits 
    for each row execute function public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.product_options enable row level security;
alter table public.product_option_values enable row level security;
alter table public.product_variants enable row level security;
alter table public.variant_option_values enable row level security;
alter table public.product_tags enable row level security;
alter table public.product_tag_assignments enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.shipping_zone_countries enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.returns enable row level security;
alter table public.return_items enable row level security;
alter table public.store_credits enable row level security;
alter table public.store_credit_transactions enable row level security;

-- Generic tenant isolation policy for all tables
create policy "tenant isolation for product_options"
on public.product_options for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "tenant isolation for product_option_values"
on public.product_option_values for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "tenant isolation for product_variants"
on public.product_variants for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "tenant isolation for variant_option_values"
on public.variant_option_values for all to authenticated
using (variant_id in (
    select id from public.product_variants where tenant_id in (
        select tenant_id from public.users where id = (select auth.uid())
    )
));

create policy "tenant isolation for product_tags"
on public.product_tags for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "tenant isolation for product_tag_assignments"
on public.product_tag_assignments for all to authenticated
using (product_id in (
    select id from public.products where tenant_id in (
        select tenant_id from public.users where id = (select auth.uid())
    )
));

create policy "tenant isolation for shipping_zones"
on public.shipping_zones for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "tenant isolation for shipping_zone_countries"
on public.shipping_zone_countries for all to authenticated
using (zone_id in (
    select id from public.shipping_zones where tenant_id in (
        select tenant_id from public.users where id = (select auth.uid())
    )
));

create policy "tenant isolation for shipping_rates"
on public.shipping_rates for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "tenant isolation for returns"
on public.returns for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "tenant isolation for return_items"
on public.return_items for all to authenticated
using (return_id in (
    select id from public.returns where tenant_id in (
        select tenant_id from public.users where id = (select auth.uid())
    )
));

create policy "tenant isolation for store_credits"
on public.store_credits for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "tenant isolation for store_credit_transactions"
on public.store_credit_transactions for all to authenticated
using (store_credit_id in (
    select id from public.store_credits where tenant_id in (
        select tenant_id from public.users where id = (select auth.uid())
    )
));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

create or replace function public.generate_return_number(p_tenant_id uuid)
returns varchar(50)
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_count integer;
begin
    select count(*) + 1 into v_count from public.returns where tenant_id = p_tenant_id;
    return 'RET-' || lpad(v_count::text, 6, '0');
end;
$$;
