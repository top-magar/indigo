-- ============================================================================
-- 002: Products & Categories
-- Product catalog with hierarchical categories
-- ============================================================================

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================

create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    parent_id uuid references public.categories(id) on delete set null,
    name varchar(255) not null,
    slug varchar(255) not null,
    description text,
    image_url text,
    image_alt text,
    meta_title text,
    meta_description text,
    sort_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(tenant_id, slug)
);

comment on table public.categories is 'Hierarchical product categories.';

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================

create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    category_id uuid references public.categories(id) on delete set null,
    name varchar(255) not null,
    slug varchar(255) not null,
    description text,
    price decimal(10, 2) not null default 0,
    compare_at_price decimal(10, 2),
    cost_price decimal(10, 2),
    sku varchar(100),
    barcode varchar(100),
    quantity integer default 0,
    track_quantity boolean default true,
    allow_backorder boolean default false,
    weight decimal(10, 2),
    weight_unit varchar(10) default 'kg',
    status varchar(20) default 'draft' check (status in ('draft', 'active', 'archived')),
    has_variants boolean default false,
    vendor varchar(255),
    product_type varchar(100),
    images jsonb default '[]',
    metadata jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(tenant_id, slug)
);

comment on table public.products is 'Product catalog with pricing and inventory.';

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_categories_tenant on public.categories(tenant_id);
create index if not exists idx_categories_parent on public.categories(parent_id);
create index if not exists idx_categories_slug on public.categories(tenant_id, slug);

create index if not exists idx_products_tenant on public.products(tenant_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug on public.products(tenant_id, slug);
create index if not exists idx_products_status on public.products(tenant_id, status);
create index if not exists idx_products_sku on public.products(tenant_id, sku);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

drop trigger if exists update_categories_updated_at on public.categories;
create trigger update_categories_updated_at 
    before update on public.categories 
    for each row execute function public.update_updated_at_column();

drop trigger if exists update_products_updated_at on public.products;
create trigger update_products_updated_at 
    before update on public.products 
    for each row execute function public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;

-- Categories policies
create policy "authenticated users can view their tenant categories"
on public.categories for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert categories to their tenant"
on public.categories for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant categories"
on public.categories for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant categories"
on public.categories for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "anon users can view categories"
on public.categories for select to anon
using (true);

-- Products policies
create policy "authenticated users can view their tenant products"
on public.products for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert products to their tenant"
on public.products for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant products"
on public.products for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant products"
on public.products for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "anon users can view active products"
on public.products for select to anon
using (status = 'active');
