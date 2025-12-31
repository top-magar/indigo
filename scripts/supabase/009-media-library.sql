-- ============================================================================
-- 009: Media Library
-- Centralized media asset management
-- ============================================================================

-- ============================================================================
-- MEDIA FOLDERS TABLE
-- ============================================================================

create table if not exists public.media_folders (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    name varchar(255) not null,
    parent_folder_id uuid references public.media_folders(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(tenant_id, parent_folder_id, name)
);

comment on table public.media_folders is 'Folders for organizing media assets in a hierarchical structure.';

-- ============================================================================
-- MEDIA ASSETS TABLE
-- ============================================================================

create table if not exists public.media_assets (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    folder_id uuid references public.media_folders(id) on delete set null,
    filename varchar(255) not null,
    original_filename varchar(255) not null,
    mime_type varchar(100) not null,
    size_bytes bigint not null,
    width integer,
    height integer,
    blob_url text not null,
    cdn_url text not null,
    thumbnail_url text,
    alt_text text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);

comment on table public.media_assets is 'Media assets including images, videos, and files.';

-- ============================================================================
-- MEDIA ASSET USAGES TABLE
-- ============================================================================

create table if not exists public.media_asset_usages (
    id uuid primary key default gen_random_uuid(),
    asset_id uuid not null references public.media_assets(id) on delete cascade,
    entity_type varchar(50) not null,
    entity_id uuid not null,
    field_name varchar(100),
    created_at timestamptz not null default now()
);

comment on table public.media_asset_usages is 'Tracks where media assets are used across entities.';

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_media_folders_tenant on public.media_folders(tenant_id);
create index if not exists idx_media_folders_parent on public.media_folders(parent_folder_id);

create index if not exists idx_media_assets_tenant on public.media_assets(tenant_id);
create index if not exists idx_media_assets_folder on public.media_assets(folder_id);
create index if not exists idx_media_assets_created on public.media_assets(created_at desc);
create index if not exists idx_media_assets_mime_type on public.media_assets(mime_type);
create index if not exists idx_media_assets_not_deleted on public.media_assets(tenant_id) where deleted_at is null;

create index if not exists idx_media_usages_asset on public.media_asset_usages(asset_id);
create index if not exists idx_media_usages_entity on public.media_asset_usages(entity_type, entity_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

drop trigger if exists update_media_folders_updated_at on public.media_folders;
create trigger update_media_folders_updated_at 
    before update on public.media_folders 
    for each row execute function public.update_updated_at_column();

drop trigger if exists update_media_assets_updated_at on public.media_assets;
create trigger update_media_assets_updated_at 
    before update on public.media_assets 
    for each row execute function public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.media_folders enable row level security;
alter table public.media_assets enable row level security;
alter table public.media_asset_usages enable row level security;

-- Media folders policies
create policy "authenticated users can view their tenant folders"
on public.media_folders for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert folders to their tenant"
on public.media_folders for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant folders"
on public.media_folders for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant folders"
on public.media_folders for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- Media assets policies
create policy "authenticated users can view their tenant assets"
on public.media_assets for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert assets to their tenant"
on public.media_assets for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant assets"
on public.media_assets for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant assets"
on public.media_assets for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "anon users can view assets"
on public.media_assets for select to anon
using (true);

-- Media asset usages policies
create policy "authenticated users can view their tenant asset usages"
on public.media_asset_usages for select to authenticated
using (asset_id in (
    select id from public.media_assets 
    where tenant_id in (select tenant_id from public.users where id = (select auth.uid()))
));

create policy "authenticated users can manage their tenant asset usages"
on public.media_asset_usages for all to authenticated
using (asset_id in (
    select id from public.media_assets 
    where tenant_id in (select tenant_id from public.users where id = (select auth.uid()))
));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

create or replace function public.get_tenant_storage_usage(p_tenant_id uuid)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
begin
    return coalesce(
        (select sum(size_bytes) from public.media_assets 
         where tenant_id = p_tenant_id and deleted_at is null),
        0
    );
end;
$$;

create or replace function public.get_tenant_asset_count(p_tenant_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
begin
    return (select count(*)::integer from public.media_assets 
            where tenant_id = p_tenant_id and deleted_at is null);
end;
$$;

-- Grant permissions
grant select on public.media_folders to anon;
grant select, insert, update, delete on public.media_folders to authenticated;
grant select on public.media_assets to anon;
grant select, insert, update, delete on public.media_assets to authenticated;
grant select on public.media_asset_usages to anon;
grant select, insert, delete on public.media_asset_usages to authenticated;
grant execute on function public.get_tenant_storage_usage(uuid) to authenticated;
grant execute on function public.get_tenant_asset_count(uuid) to authenticated;
