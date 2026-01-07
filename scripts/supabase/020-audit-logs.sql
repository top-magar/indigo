-- ============================================================================
-- 020: Audit Logs
-- Comprehensive audit logging system for tracking all tenant actions
-- Reference: SYSTEM-ARCHITECTURE.md Security & Compliance
-- ============================================================================

-- ============================================================================
-- AUDIT_LOGS TABLE
-- Central table for tracking all auditable actions across the platform
-- ============================================================================

create table if not exists public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    user_id uuid, -- nullable for anonymous/system actions
    
    -- Action identification
    action text not null, -- e.g., 'product.create', 'order.update', 'checkout.complete'
    entity_type text not null, -- e.g., 'product', 'order', 'customer'
    entity_id uuid, -- nullable for actions not tied to specific entity
    
    -- Change tracking
    old_values jsonb, -- previous state for updates/deletes
    new_values jsonb, -- new state for creates/updates
    
    -- Request context
    metadata jsonb default '{}'::jsonb, -- ip_address, user_agent, request_id, etc.
    
    -- Timestamp
    created_at timestamptz default now() not null
);

comment on table public.audit_logs is 'Comprehensive audit log for tracking all tenant actions including creates, updates, deletes, and custom events.';
comment on column public.audit_logs.tenant_id is 'Tenant this audit log belongs to (for RLS isolation)';
comment on column public.audit_logs.user_id is 'User who performed the action (null for anonymous/system actions)';
comment on column public.audit_logs.action is 'Action type in format entity.action (e.g., product.create, order.status_change)';
comment on column public.audit_logs.entity_type is 'Type of entity affected (e.g., product, order, customer)';
comment on column public.audit_logs.entity_id is 'ID of the affected entity (null for non-entity actions)';
comment on column public.audit_logs.old_values is 'Previous state of the entity (for updates and deletes)';
comment on column public.audit_logs.new_values is 'New state of the entity (for creates and updates)';
comment on column public.audit_logs.metadata is 'Additional context: ip_address, user_agent, request_id, session_id, etc.';

-- ============================================================================
-- INDEXES
-- Optimized for common query patterns
-- ============================================================================

-- Primary lookup: tenant + time range (most common query pattern)
create index if not exists idx_audit_logs_tenant_created 
on public.audit_logs(tenant_id, created_at desc);

-- Filter by action type
create index if not exists idx_audit_logs_action 
on public.audit_logs(action);

-- Lookup by entity (find all changes to a specific entity)
create index if not exists idx_audit_logs_entity 
on public.audit_logs(entity_type, entity_id) 
where entity_id is not null;

-- Filter by user (find all actions by a specific user)
create index if not exists idx_audit_logs_user 
on public.audit_logs(user_id) 
where user_id is not null;

-- ============================================================================
-- ROW LEVEL SECURITY
-- Tenant isolation for audit logs
-- ============================================================================

alter table public.audit_logs enable row level security;

-- SELECT policy: authenticated users can view their tenant's audit logs
create policy "authenticated users can view their tenant audit logs"
on public.audit_logs
for select
to authenticated
using (
    tenant_id in (
        select tenant_id from public.users where id = (select auth.uid())
    )
);

-- INSERT policy: authenticated users can insert audit logs for their tenant
create policy "authenticated users can insert audit logs to their tenant"
on public.audit_logs
for insert
to authenticated
with check (
    tenant_id in (
        select tenant_id from public.users where id = (select auth.uid())
    )
);

-- Service role policy: allow service role full access for system-level logging
-- Note: Service role bypasses RLS by default, but explicit policy for clarity
create policy "service role has full access to audit logs"
on public.audit_logs
for all
to service_role
using (true)
with check (true);

-- ============================================================================
-- GRANTS
-- ============================================================================

grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;

-- ============================================================================
-- HELPER FUNCTION: Log audit event
-- Can be called from triggers or application code
-- ============================================================================

create or replace function public.log_audit_event(
    p_tenant_id uuid,
    p_user_id uuid,
    p_action text,
    p_entity_type text,
    p_entity_id uuid default null,
    p_old_values jsonb default null,
    p_new_values jsonb default null,
    p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_audit_id uuid;
begin
    insert into public.audit_logs (
        tenant_id,
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        metadata
    ) values (
        p_tenant_id,
        p_user_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_old_values,
        p_new_values,
        p_metadata
    )
    returning id into v_audit_id;
    
    return v_audit_id;
end;
$$;

comment on function public.log_audit_event is 'Helper function to insert audit log entries. Can be called from triggers or application code.';
