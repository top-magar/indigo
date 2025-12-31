-- ============================================================================
-- 010: Product Attributes
-- Saleor-level product attributes for custom product properties
-- ============================================================================

-- ============================================================================
-- ATTRIBUTES TABLE
-- ============================================================================

create table if not exists public.attributes (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    name varchar(255) not null,
    slug varchar(255) not null,
    input_type varchar(50) not null default 'dropdown',
    entity_type varchar(50),
    unit varchar(20),
    value_required boolean default false,
    visible_in_storefront boolean default true,
    filterable_in_storefront boolean default false,
    filterable_in_dashboard boolean default true,
    used_in_product_types integer default 0,
    metadata jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(tenant_id, slug)
);

comment on table public.attributes is 'Product attributes like Size, Color, Material.';
comment on column public.attributes.input_type is 'Type: dropdown, multiselect, text, rich_text, numeric, boolean, date, datetime, file, swatch, reference.';
comment on column public.attributes.entity_type is 'For reference type: product, product_variant, category, collection, page.';
comment on column public.attributes.unit is 'For numeric type: g, kg, lb, cm, m, ml, l, etc.';

-- ============================================================================
-- ATTRIBUTE VALUES TABLE
-- ============================================================================

create table if not exists public.attribute_values (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    attribute_id uuid not null references public.attributes(id) on delete cascade,
    name varchar(255) not null,
    slug varchar(255) not null,
    value text,
    rich_text text,
    file_url text,
    swatch_color varchar(7),
    swatch_image text,
    sort_order integer default 0,
    created_at timestamptz default now(),
    unique(attribute_id, slug)
);

comment on table public.attribute_values is 'Predefined values for dropdown, multiselect, and swatch attributes.';
comment on column public.attribute_values.swatch_color is 'Hex color code for color swatches (e.g., #FF0000).';

-- ============================================================================
-- PRODUCT ATTRIBUTE VALUES TABLE
-- ============================================================================

create table if not exists public.product_attribute_values (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    attribute_id uuid not null references public.attributes(id) on delete cascade,
    attribute_value_id uuid references public.attribute_values(id) on delete cascade,
    text_value text,
    rich_text_value text,
    numeric_value decimal(15, 4),
    boolean_value boolean,
    date_value date,
    datetime_value timestamptz,
    file_url text,
    reference_id uuid,
    created_at timestamptz default now(),
    unique(product_id, attribute_id, attribute_value_id)
);

comment on table public.product_attribute_values is 'Links products to their attribute values.';

-- ============================================================================
-- VARIANT ATTRIBUTE VALUES TABLE
-- ============================================================================

create table if not exists public.variant_attribute_values (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    variant_id uuid not null,
    attribute_id uuid not null references public.attributes(id) on delete cascade,
    attribute_value_id uuid references public.attribute_values(id) on delete cascade,
    text_value text,
    numeric_value decimal(15, 4),
    boolean_value boolean,
    created_at timestamptz default now(),
    unique(variant_id, attribute_id, attribute_value_id)
);

comment on table public.variant_attribute_values is 'Links product variants to their attribute values.';

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_attributes_tenant on public.attributes(tenant_id);
create index if not exists idx_attributes_slug on public.attributes(tenant_id, slug);
create index if not exists idx_attributes_input_type on public.attributes(tenant_id, input_type);
create index if not exists idx_attributes_filterable on public.attributes(tenant_id, filterable_in_storefront) where filterable_in_storefront = true;

create index if not exists idx_attribute_values_attribute on public.attribute_values(attribute_id);
create index if not exists idx_attribute_values_tenant on public.attribute_values(tenant_id);
create index if not exists idx_attribute_values_sort on public.attribute_values(attribute_id, sort_order);

create index if not exists idx_product_attr_values_product on public.product_attribute_values(product_id);
create index if not exists idx_product_attr_values_attribute on public.product_attribute_values(attribute_id);
create index if not exists idx_product_attr_values_tenant on public.product_attribute_values(tenant_id);

create index if not exists idx_variant_attr_values_variant on public.variant_attribute_values(variant_id);
create index if not exists idx_variant_attr_values_attribute on public.variant_attribute_values(attribute_id);
create index if not exists idx_variant_attr_values_tenant on public.variant_attribute_values(tenant_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

drop trigger if exists update_attributes_updated_at on public.attributes;
create trigger update_attributes_updated_at 
    before update on public.attributes 
    for each row execute function public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.attributes enable row level security;
alter table public.attribute_values enable row level security;
alter table public.product_attribute_values enable row level security;
alter table public.variant_attribute_values enable row level security;

-- Attributes policies
create policy "authenticated users can view their tenant attributes"
on public.attributes for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert attributes to their tenant"
on public.attributes for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant attributes"
on public.attributes for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant attributes"
on public.attributes for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- Attribute values policies
create policy "authenticated users can view their tenant attribute values"
on public.attribute_values for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert attribute values to their tenant"
on public.attribute_values for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant attribute values"
on public.attribute_values for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant attribute values"
on public.attribute_values for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- Product attribute values policies
create policy "authenticated users can view their tenant product attribute values"
on public.product_attribute_values for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can manage their tenant product attribute values"
on public.product_attribute_values for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- Variant attribute values policies
create policy "authenticated users can view their tenant variant attribute values"
on public.variant_attribute_values for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can manage their tenant variant attribute values"
on public.variant_attribute_values for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));
