-- ============================================================================
-- 050: Layout Version History
-- Snapshots of store_layouts for rollback
-- ============================================================================

create table if not exists public.layout_versions (
    id uuid primary key default gen_random_uuid(),
    layout_id uuid not null references public.store_layouts(id) on delete cascade,
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    blocks jsonb not null,
    label varchar(255),
    created_at timestamptz not null default now()
);

create index if not exists idx_layout_versions_layout on public.layout_versions(layout_id, created_at desc);

-- Keep max 20 versions per layout (cleanup via app logic)

-- RLS
alter table public.layout_versions enable row level security;

create policy "users can view their tenant versions"
on public.layout_versions for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "users can insert versions for their tenant"
on public.layout_versions for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "users can delete their tenant versions"
on public.layout_versions for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

grant select, insert, delete on public.layout_versions to authenticated;
