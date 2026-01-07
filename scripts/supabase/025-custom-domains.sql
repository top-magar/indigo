-- =============================================================================
-- Custom Domains for Multi-tenant Storefronts
-- Migration: 025-custom-domains.sql
-- 
-- This migration adds custom domain support for tenants, allowing them to
-- connect their own domains to their storefronts.
--
-- Note: The tenant_domains table may already exist from drizzle migrations.
-- This script uses IF NOT EXISTS for idempotency.
--
-- Requirements: 2.1, 2.2, 6.1
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Create tenant_domains table (if not exists)
-- -----------------------------------------------------------------------------

create table if not exists public.tenant_domains (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    domain text not null unique,
    verification_token text not null,
    verification_method text not null default 'cname',
    status text not null default 'pending',
    vercel_domain_id text,
    error_message text,
    created_at timestamptz default now() not null,
    verified_at timestamptz
);

comment on table public.tenant_domains is 
    'Custom domains configured by tenants for their storefronts. Supports DNS verification via CNAME or TXT records.';

comment on column public.tenant_domains.domain is 
    'The custom domain (e.g., store.example.com). Must be unique across all tenants.';

comment on column public.tenant_domains.verification_token is 
    'Cryptographically secure token for DNS TXT record verification.';

comment on column public.tenant_domains.verification_method is 
    'DNS verification method: cname (CNAME to vercel) or txt (TXT record with token).';

comment on column public.tenant_domains.status is 
    'Domain status: pending (awaiting verification), verified (DNS verified), active (SSL ready), failed (verification failed).';

comment on column public.tenant_domains.vercel_domain_id is 
    'Vercel domain identifier after successful addition to Vercel project.';

comment on column public.tenant_domains.error_message is 
    'Last error message if verification failed. Helps users troubleshoot DNS issues.';

-- -----------------------------------------------------------------------------
-- 2. Create indexes for performance
-- -----------------------------------------------------------------------------

-- Index on domain for fast lookups during request routing
create index if not exists idx_tenant_domains_domain 
    on public.tenant_domains(domain);

-- Index on tenant_id for listing domains by tenant
create index if not exists idx_tenant_domains_tenant 
    on public.tenant_domains(tenant_id);

-- Index on status for filtering active/verified domains
create index if not exists idx_tenant_domains_status 
    on public.tenant_domains(status);

-- Composite index for domain resolution (domain + status)
-- Used by middleware to quickly find verified domains
create index if not exists idx_tenant_domains_domain_status 
    on public.tenant_domains(domain, status) 
    where status in ('verified', 'active');

-- -----------------------------------------------------------------------------
-- 3. Enable Row Level Security
-- -----------------------------------------------------------------------------

alter table public.tenant_domains enable row level security;

-- Policy: Tenants can view their own domains
create policy "tenants can view own domains"
    on public.tenant_domains
    for select
    to authenticated
    using (
        tenant_id = (
            select tenant_id 
            from public.users 
            where id = (select auth.uid())
        )
    );

-- Policy: Tenants can insert domains for their tenant
create policy "tenants can insert own domains"
    on public.tenant_domains
    for insert
    to authenticated
    with check (
        tenant_id = (
            select tenant_id 
            from public.users 
            where id = (select auth.uid())
        )
    );

-- Policy: Tenants can update their own domains
create policy "tenants can update own domains"
    on public.tenant_domains
    for update
    to authenticated
    using (
        tenant_id = (
            select tenant_id 
            from public.users 
            where id = (select auth.uid())
        )
    )
    with check (
        tenant_id = (
            select tenant_id 
            from public.users 
            where id = (select auth.uid())
        )
    );

-- Policy: Tenants can delete their own domains
create policy "tenants can delete own domains"
    on public.tenant_domains
    for delete
    to authenticated
    using (
        tenant_id = (
            select tenant_id 
            from public.users 
            where id = (select auth.uid())
        )
    );

-- Policy: Service role can read all domains (for middleware resolution)
-- This allows the middleware to resolve domains without user context
create policy "service role can read all domains"
    on public.tenant_domains
    for select
    to service_role
    using (true);

-- -----------------------------------------------------------------------------
-- 4. Create function for domain resolution (used by middleware)
-- -----------------------------------------------------------------------------

create or replace function public.resolve_tenant_by_domain(p_domain text)
returns table (
    tenant_id uuid,
    tenant_slug text,
    tenant_name text,
    tenant_currency text,
    domain_status text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
    return query
    select 
        t.id as tenant_id,
        t.slug as tenant_slug,
        t.name as tenant_name,
        t.currency as tenant_currency,
        d.status as domain_status
    from public.tenant_domains d
    inner join public.tenants t on d.tenant_id = t.id
    where d.domain = lower(trim(p_domain))
      and d.status in ('verified', 'active')
    limit 1;
end;
$$;

comment on function public.resolve_tenant_by_domain is 
    'Resolves a custom domain to its tenant. Returns tenant info only if domain is verified or active.';

-- Grant execute to service role for middleware use
grant execute on function public.resolve_tenant_by_domain to service_role;

-- -----------------------------------------------------------------------------
-- 5. Create trigger for updated_at timestamp
-- -----------------------------------------------------------------------------

-- Create the update function if it doesn't exist
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

-- Note: tenant_domains doesn't have updated_at column in current schema
-- If you want to add it, uncomment the following:
-- 
-- alter table public.tenant_domains 
--     add column if not exists updated_at timestamptz default now();
-- 
-- create trigger trigger_tenant_domains_updated_at
--     before update on public.tenant_domains
--     for each row
--     execute function public.update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 6. Add audit logging for domain changes (optional)
-- -----------------------------------------------------------------------------

-- Create audit log entry when domain status changes
create or replace function public.log_domain_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    -- Only log if status actually changed
    if old.status is distinct from new.status then
        insert into public.audit_logs (
            tenant_id,
            user_id,
            action,
            entity_type,
            entity_id,
            old_values,
            new_values,
            created_at
        ) values (
            new.tenant_id,
            (select auth.uid()),
            'domain_status_changed',
            'tenant_domain',
            new.id,
            jsonb_build_object('status', old.status, 'domain', old.domain),
            jsonb_build_object('status', new.status, 'domain', new.domain),
            now()
        );
    end if;
    
    return new;
end;
$$;

-- Create trigger for audit logging (only if audit_logs table exists)
do $$
begin
    if exists (select 1 from information_schema.tables where table_name = 'audit_logs') then
        create trigger trigger_domain_status_audit
            after update on public.tenant_domains
            for each row
            execute function public.log_domain_status_change();
    end if;
exception
    when duplicate_object then
        null; -- Trigger already exists
end;
$$;

-- -----------------------------------------------------------------------------
-- 7. Verification helper function
-- -----------------------------------------------------------------------------

-- Function to mark a domain as verified (called by verification service)
create or replace function public.verify_domain(
    p_domain_id uuid,
    p_vercel_domain_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_updated boolean := false;
begin
    update public.tenant_domains
    set 
        status = 'verified',
        verified_at = now(),
        vercel_domain_id = coalesce(p_vercel_domain_id, vercel_domain_id),
        error_message = null
    where id = p_domain_id
      and status in ('pending', 'failed');
    
    get diagnostics v_updated = row_count;
    return v_updated > 0;
end;
$$;

comment on function public.verify_domain is 
    'Marks a domain as verified. Called by the verification service after DNS validation.';

-- Function to mark a domain as active (SSL ready)
create or replace function public.activate_domain(p_domain_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_updated boolean := false;
begin
    update public.tenant_domains
    set status = 'active'
    where id = p_domain_id
      and status = 'verified';
    
    get diagnostics v_updated = row_count;
    return v_updated > 0;
end;
$$;

comment on function public.activate_domain is 
    'Marks a verified domain as active (SSL provisioned). Called after Vercel confirms SSL.';

-- Grant execute to authenticated users (they can only affect their own domains due to RLS)
grant execute on function public.verify_domain to authenticated;
grant execute on function public.activate_domain to authenticated;

-- =============================================================================
-- Migration complete
-- =============================================================================
