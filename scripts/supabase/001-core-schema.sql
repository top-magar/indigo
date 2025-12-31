-- ============================================================================
-- 001: Core Schema - Tenants & Users
-- Multi-tenant e-commerce SaaS foundation
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- TENANTS TABLE (Stores/Organizations)
-- ============================================================================

create table if not exists public.tenants (
    id uuid primary key default gen_random_uuid(),
    name varchar(255) not null,
    slug varchar(100) unique not null,
    description text,
    logo_url text,
    primary_color varchar(7) default '#000000',
    secondary_color varchar(7) default '#ffffff',
    currency varchar(3) default 'USD',
    stripe_account_id varchar(255),
    stripe_onboarding_complete boolean default false,
    settings jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table public.tenants is 'Stores/organizations in the multi-tenant system.';

-- ============================================================================
-- USERS TABLE (Store Owners & Staff)
-- ============================================================================

create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    tenant_id uuid references public.tenants(id) on delete cascade,
    email varchar(255) not null,
    full_name varchar(255),
    avatar_url text,
    role varchar(50) default 'owner' check (role in ('owner', 'admin', 'staff')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table public.users is 'Store owners and staff members linked to auth.users.';

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_tenants_slug on public.tenants(slug);
create index if not exists idx_users_tenant on public.users(tenant_id);
create index if not exists idx_users_email on public.users(email);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

-- Apply triggers (drop first if exists)
drop trigger if exists update_tenants_updated_at on public.tenants;
create trigger update_tenants_updated_at 
    before update on public.tenants 
    for each row execute function public.update_updated_at_column();

drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at 
    before update on public.users 
    for each row execute function public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.tenants enable row level security;
alter table public.users enable row level security;

-- Helper function to get current user's tenant_id
create or replace function public.get_user_tenant_id()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
    return (select tenant_id from public.users where id = (select auth.uid()));
end;
$$;

-- Tenants policies
create policy "users can view own tenant"
on public.tenants for select to authenticated
using (id = public.get_user_tenant_id());

create policy "users can update own tenant"
on public.tenants for update to authenticated
using (id = public.get_user_tenant_id());

create policy "allow tenant creation"
on public.tenants for insert to authenticated
with check (true);

-- Users policies
create policy "users can view tenant users"
on public.users for select to authenticated
using (tenant_id = public.get_user_tenant_id());

create policy "users can update own profile"
on public.users for update to authenticated
using (id = (select auth.uid()));

create policy "allow user creation"
on public.users for insert to authenticated
with check (id = (select auth.uid()));
