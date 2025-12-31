-- ============================================================================
-- 014: Events & History (Optional)
-- Event persistence, order history, and workflow tracking
-- ============================================================================

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================

create table if not exists public.events (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    type varchar(100) not null,
    payload jsonb not null default '{}',
    status varchar(20) not null default 'pending' check (status in ('pending', 'processed', 'failed')),
    error text,
    retry_count integer not null default 0,
    max_retries integer not null default 3,
    created_at timestamptz not null default now(),
    processed_at timestamptz,
    next_retry_at timestamptz
);

comment on table public.events is 'Persistent event log for audit trail and retry handling.';

-- ============================================================================
-- ORDER STATUS HISTORY TABLE
-- ============================================================================

create table if not exists public.order_status_history (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    order_id uuid not null references public.orders(id) on delete cascade,
    from_status varchar(50),
    to_status varchar(50) not null,
    note text,
    changed_by uuid references public.users(id),
    created_at timestamptz not null default now()
);

comment on table public.order_status_history is 'Tracks all order status changes for audit.';

-- ============================================================================
-- INVENTORY HISTORY TABLE
-- ============================================================================

create table if not exists public.inventory_history (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    variant_id uuid,
    action varchar(20) not null check (action in ('add', 'remove', 'set', 'reserve', 'release')),
    quantity_change integer not null,
    quantity_before integer not null,
    quantity_after integer not null,
    reason varchar(100),
    reference_type varchar(50),
    reference_id uuid,
    changed_by uuid references public.users(id),
    created_at timestamptz not null default now()
);

comment on table public.inventory_history is 'Tracks all inventory changes for audit.';

-- ============================================================================
-- WORKFLOW EXECUTIONS TABLE
-- ============================================================================

create table if not exists public.workflow_executions (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    workflow_id varchar(100) not null,
    status varchar(20) not null default 'running' check (status in ('running', 'completed', 'failed', 'compensated')),
    input jsonb not null default '{}',
    output jsonb,
    error text,
    steps_completed jsonb not null default '[]',
    started_at timestamptz not null default now(),
    completed_at timestamptz,
    duration_ms integer
);

comment on table public.workflow_executions is 'Tracks workflow executions for debugging and monitoring.';

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_events_tenant on public.events(tenant_id);
create index if not exists idx_events_type on public.events(type);
create index if not exists idx_events_status on public.events(status);
create index if not exists idx_events_created_at on public.events(created_at desc);
create index if not exists idx_events_next_retry on public.events(next_retry_at) where status = 'failed' and retry_count < max_retries;

create index if not exists idx_order_status_history_tenant on public.order_status_history(tenant_id);
create index if not exists idx_order_status_history_order on public.order_status_history(order_id);
create index if not exists idx_order_status_history_created on public.order_status_history(created_at desc);

create index if not exists idx_inventory_history_tenant on public.inventory_history(tenant_id);
create index if not exists idx_inventory_history_product on public.inventory_history(product_id);
create index if not exists idx_inventory_history_variant on public.inventory_history(variant_id);
create index if not exists idx_inventory_history_created on public.inventory_history(created_at desc);

create index if not exists idx_workflow_executions_tenant on public.workflow_executions(tenant_id);
create index if not exists idx_workflow_executions_workflow on public.workflow_executions(workflow_id);
create index if not exists idx_workflow_executions_status on public.workflow_executions(status);
create index if not exists idx_workflow_executions_started on public.workflow_executions(started_at desc);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.events enable row level security;
alter table public.order_status_history enable row level security;
alter table public.inventory_history enable row level security;
alter table public.workflow_executions enable row level security;

create policy "tenant isolation for events"
on public.events for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "tenant isolation for order_status_history"
on public.order_status_history for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "tenant isolation for inventory_history"
on public.inventory_history for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "tenant isolation for workflow_executions"
on public.workflow_executions for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

create or replace function public.get_events_for_retry(p_tenant_id uuid, p_limit integer default 100)
returns setof public.events
language plpgsql
security definer
set search_path = ''
as $$
begin
    return query
    select *
    from public.events
    where tenant_id = p_tenant_id
      and status = 'failed'
      and retry_count < max_retries
      and (next_retry_at is null or next_retry_at <= now())
    order by created_at asc
    limit p_limit;
end;
$$;

create or replace function public.mark_event_processed(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.events
    set status = 'processed',
        processed_at = now()
    where id = p_event_id;
end;
$$;

create or replace function public.mark_event_failed(p_event_id uuid, p_error text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_retry_count integer;
    v_max_retries integer;
begin
    select retry_count, max_retries into v_retry_count, v_max_retries
    from public.events where id = p_event_id;
    
    update public.events
    set status = 'failed',
        error = p_error,
        retry_count = v_retry_count + 1,
        next_retry_at = case 
            when v_retry_count + 1 < v_max_retries 
            then now() + (interval '1 minute' * power(2, v_retry_count + 1))
            else null
        end
    where id = p_event_id;
end;
$$;
