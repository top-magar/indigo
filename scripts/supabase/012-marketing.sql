-- ============================================================================
-- 012: Marketing (Optional)
-- Campaigns and customer segments
-- ============================================================================

-- ============================================================================
-- CAMPAIGNS TABLE
-- ============================================================================

create table if not exists public.campaigns (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    name text not null,
    type text not null default 'email' check (type in ('email', 'sms', 'push')),
    status text not null default 'draft' check (status in ('draft', 'scheduled', 'sending', 'sent', 'paused', 'failed')),
    subject text,
    preview_text text,
    from_name text,
    from_email text,
    reply_to text,
    content text,
    content_json jsonb,
    template_id uuid,
    segment_id text,
    segment_name text,
    scheduled_at timestamptz,
    sent_at timestamptz,
    recipients_count integer not null default 0,
    delivered_count integer not null default 0,
    opened_count integer not null default 0,
    clicked_count integer not null default 0,
    bounced_count integer not null default 0,
    unsubscribed_count integer not null default 0,
    revenue_generated numeric(10, 2) not null default 0,
    metadata jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.campaigns is 'Marketing campaigns for email, SMS, and push notifications.';

-- ============================================================================
-- CAMPAIGN RECIPIENTS TABLE
-- ============================================================================

create table if not exists public.campaign_recipients (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    campaign_id uuid not null references public.campaigns(id) on delete cascade,
    customer_id uuid,
    email text not null,
    status text not null default 'pending' check (status in ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed')),
    sent_at timestamptz,
    delivered_at timestamptz,
    opened_at timestamptz,
    clicked_at timestamptz,
    bounced_at timestamptz,
    unsubscribed_at timestamptz,
    metadata jsonb
);

comment on table public.campaign_recipients is 'Individual recipients of marketing campaigns.';

-- ============================================================================
-- CUSTOMER SEGMENTS TABLE
-- ============================================================================

create table if not exists public.customer_segments (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    name text not null,
    description text,
    type text not null default 'dynamic' check (type in ('static', 'dynamic')),
    conditions jsonb,
    customer_count integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.customer_segments is 'Customer segments for targeted marketing.';

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_campaigns_tenant on public.campaigns(tenant_id);
create index if not exists idx_campaigns_status on public.campaigns(tenant_id, status);
create index if not exists idx_campaigns_scheduled on public.campaigns(scheduled_at);

create index if not exists idx_campaign_recipients_campaign on public.campaign_recipients(campaign_id);
create index if not exists idx_campaign_recipients_customer on public.campaign_recipients(customer_id);
create index if not exists idx_campaign_recipients_email on public.campaign_recipients(email);

create index if not exists idx_customer_segments_tenant on public.customer_segments(tenant_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

drop trigger if exists update_campaigns_updated_at on public.campaigns;
create trigger update_campaigns_updated_at 
    before update on public.campaigns 
    for each row execute function public.update_updated_at_column();

drop trigger if exists update_customer_segments_updated_at on public.customer_segments;
create trigger update_customer_segments_updated_at 
    before update on public.customer_segments 
    for each row execute function public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.campaigns enable row level security;
alter table public.campaign_recipients enable row level security;
alter table public.customer_segments enable row level security;

-- Campaigns policies
create policy "authenticated users can view their tenant campaigns"
on public.campaigns for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert campaigns to their tenant"
on public.campaigns for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant campaigns"
on public.campaigns for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant campaigns"
on public.campaigns for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- Campaign recipients policies
create policy "authenticated users can view their tenant campaign recipients"
on public.campaign_recipients for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can manage their tenant campaign recipients"
on public.campaign_recipients for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- Customer segments policies
create policy "authenticated users can view their tenant segments"
on public.customer_segments for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert segments to their tenant"
on public.customer_segments for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant segments"
on public.customer_segments for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant segments"
on public.customer_segments for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));
