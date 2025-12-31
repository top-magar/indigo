-- ============================================================================
-- 005: Collections
-- Product collections for organizing and featuring products
-- ============================================================================

-- ============================================================================
-- COLLECTIONS TABLE
-- ============================================================================

create table if not exists public.collections (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    name varchar(200) not null,
    slug varchar(200) not null,
    description text,
    image_url text,
    image_alt text,
    meta_title text,
    meta_description text,
    is_active boolean default true,
    sort_order integer default 0,
    type varchar(20) default 'manual' check (type in ('manual', 'automatic')),
    conditions jsonb,
    metadata jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(tenant_id, slug)
);

comment on table public.collections is 'Product collections for organizing and featuring products.';

-- ============================================================================
-- COLLECTION PRODUCTS TABLE
-- ============================================================================

create table if not exists public.collection_products (
    id uuid primary key default gen_random_uuid(),
    collection_id uuid not null references public.collections(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    position integer default 0,
    created_at timestamptz default now(),
    unique(collection_id, product_id)
);

comment on table public.collection_products is 'Junction table linking products to collections.';

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_collections_tenant on public.collections(tenant_id);
create index if not exists idx_collections_slug on public.collections(tenant_id, slug);
create index if not exists idx_collections_is_active on public.collections(tenant_id, is_active);
create index if not exists idx_collections_sort_order on public.collections(tenant_id, sort_order);

create index if not exists idx_collection_products_collection on public.collection_products(collection_id);
create index if not exists idx_collection_products_product on public.collection_products(product_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

drop trigger if exists update_collections_updated_at on public.collections;
create trigger update_collections_updated_at 
    before update on public.collections 
    for each row execute function public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.collections enable row level security;
alter table public.collection_products enable row level security;

-- Collections policies
create policy "authenticated users can view their tenant collections"
on public.collections for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert collections to their tenant"
on public.collections for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant collections"
on public.collections for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant collections"
on public.collections for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "anon users can view active collections"
on public.collections for select to anon
using (is_active = true);

-- Collection products policies
create policy "authenticated users can view their tenant collection products"
on public.collection_products for select to authenticated
using (collection_id in (
    select id from public.collections where tenant_id in (
        select tenant_id from public.users where id = (select auth.uid())
    )
));

create policy "authenticated users can manage their tenant collection products"
on public.collection_products for all to authenticated
using (collection_id in (
    select id from public.collections where tenant_id in (
        select tenant_id from public.users where id = (select auth.uid())
    )
));

create policy "anon users can view collection products"
on public.collection_products for select to anon
using (true);
