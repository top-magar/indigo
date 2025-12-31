-- ============================================================================
-- 011: Store Layouts
-- Page layout configurations for storefront visual editor
-- ============================================================================

-- ============================================================================
-- STORE LAYOUTS TABLE
-- ============================================================================

create table if not exists public.store_layouts (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    name varchar(255) not null default 'Homepage',
    slug varchar(255) not null default '/',
    is_homepage boolean not null default true,
    status varchar(20) not null default 'published' check (status in ('draft', 'published')),
    template_id varchar(50),
    blocks jsonb not null default '[]'::jsonb,
    draft_blocks jsonb default null,
    theme_overrides jsonb default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    published_at timestamptz,
    unique(tenant_id, slug)
);

comment on table public.store_layouts is 'Page layout configurations for storefront visual editor.';
comment on column public.store_layouts.draft_blocks is 'Stores unpublished block changes. NULL when no draft exists.';

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_store_layouts_tenant on public.store_layouts(tenant_id);
create index if not exists idx_store_layouts_homepage on public.store_layouts(tenant_id, is_homepage) where is_homepage = true;
create index if not exists idx_store_layouts_draft on public.store_layouts(tenant_id, is_homepage) where draft_blocks is not null;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

drop trigger if exists update_store_layouts_updated_at on public.store_layouts;
create trigger update_store_layouts_updated_at 
    before update on public.store_layouts 
    for each row execute function public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.store_layouts enable row level security;

create policy "authenticated users can view their tenant layouts"
on public.store_layouts for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert layouts to their tenant"
on public.store_layouts for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant layouts"
on public.store_layouts for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant layouts"
on public.store_layouts for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "anon users can view published layouts"
on public.store_layouts for select to anon
using (status = 'published');

-- Grant permissions
grant select on public.store_layouts to anon;
grant select, insert, update, delete on public.store_layouts to authenticated;
