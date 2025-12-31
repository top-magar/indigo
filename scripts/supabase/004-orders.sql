-- ============================================================================
-- 004: Orders & Order Items
-- Order management with fulfillment, transactions, and invoices
-- ============================================================================

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    customer_id uuid references public.customers(id) on delete set null,
    order_number varchar(50) not null,
    status varchar(50) default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status varchar(50) default 'pending' check (payment_status in ('pending', 'paid', 'partially_refunded', 'refunded', 'failed')),
    fulfillment_status varchar(50) default 'unfulfilled' check (fulfillment_status in ('unfulfilled', 'partially_fulfilled', 'fulfilled')),
    subtotal decimal(12, 2) not null default 0,
    discount_total decimal(12, 2) default 0,
    shipping_total decimal(12, 2) default 0,
    tax_total decimal(12, 2) default 0,
    total decimal(12, 2) not null default 0,
    currency varchar(3) default 'USD',
    items_count integer default 0,
    shipping_address jsonb,
    billing_address jsonb,
    customer_email varchar(255),
    customer_name varchar(255),
    customer_note text,
    internal_notes text,
    shipping_method text,
    shipping_carrier text,
    discount_id uuid,
    discount_code text,
    discount_name text,
    stripe_payment_intent_id varchar(255),
    metadata jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(tenant_id, order_number)
);

comment on table public.orders is 'Customer orders with payment and fulfillment tracking.';

-- ============================================================================
-- ORDER ITEMS TABLE
-- ============================================================================

create table if not exists public.order_items (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    order_id uuid not null references public.orders(id) on delete cascade,
    product_id uuid references public.products(id) on delete set null,
    variant_id uuid,
    product_name varchar(255) not null,
    product_sku varchar(100),
    product_image text,
    variant_title varchar(255),
    options jsonb default '[]',
    quantity integer not null default 1,
    unit_price decimal(12, 2) not null,
    total_price decimal(12, 2) not null,
    quantity_fulfilled integer default 0,
    tax_rate decimal(5, 2),
    tax_amount decimal(12, 2),
    discount_amount decimal(12, 2),
    metadata jsonb default '{}',
    created_at timestamptz default now()
);

comment on table public.order_items is 'Individual line items in an order.';

-- ============================================================================
-- FULFILLMENTS TABLE
-- ============================================================================

create table if not exists public.fulfillments (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    order_id uuid not null references public.orders(id) on delete cascade,
    status text not null default 'pending' check (status in ('pending', 'approved', 'shipped', 'delivered', 'cancelled')),
    tracking_number text,
    tracking_url text,
    shipping_carrier text,
    warehouse text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table public.fulfillments is 'Order fulfillments for tracking shipments.';

-- ============================================================================
-- FULFILLMENT LINES TABLE
-- ============================================================================

create table if not exists public.fulfillment_lines (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    fulfillment_id uuid not null references public.fulfillments(id) on delete cascade,
    order_line_id uuid not null references public.order_items(id) on delete cascade,
    quantity integer not null default 1,
    created_at timestamptz default now()
);

comment on table public.fulfillment_lines is 'Individual items in a fulfillment.';

-- ============================================================================
-- ORDER TRANSACTIONS TABLE
-- ============================================================================

create table if not exists public.order_transactions (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    order_id uuid not null references public.orders(id) on delete cascade,
    type text not null check (type in ('authorization', 'charge', 'refund', 'void', 'capture', 'chargeback')),
    status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'cancelled')),
    amount decimal(12, 2) not null,
    currency text not null default 'USD',
    payment_method text,
    payment_gateway text,
    gateway_transaction_id text,
    metadata jsonb default '{}',
    created_at timestamptz default now()
);

comment on table public.order_transactions is 'Payment transactions for orders.';

-- ============================================================================
-- ORDER INVOICES TABLE
-- ============================================================================

create table if not exists public.order_invoices (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    order_id uuid not null references public.orders(id) on delete cascade,
    invoice_number text not null,
    status text not null default 'draft' check (status in ('draft', 'pending', 'sent', 'paid', 'cancelled')),
    url text,
    sent_at timestamptz,
    created_at timestamptz default now()
);

comment on table public.order_invoices is 'Invoices generated for orders.';

-- ============================================================================
-- ORDER EVENTS TABLE
-- ============================================================================

create table if not exists public.order_events (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    order_id uuid not null references public.orders(id) on delete cascade,
    type text not null,
    message text not null,
    user_id uuid references public.users(id) on delete set null,
    user_name text,
    metadata jsonb default '{}',
    created_at timestamptz default now()
);

comment on table public.order_events is 'Order activity history/timeline.';


-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_orders_tenant on public.orders(tenant_id);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(tenant_id, status);
create index if not exists idx_orders_order_number on public.orders(order_number);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_fulfillment_status on public.orders(fulfillment_status);

create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_tenant on public.order_items(tenant_id);

create index if not exists idx_fulfillments_order on public.fulfillments(order_id);
create index if not exists idx_fulfillments_tenant on public.fulfillments(tenant_id);
create index if not exists idx_fulfillment_lines_fulfillment on public.fulfillment_lines(fulfillment_id);

create index if not exists idx_order_transactions_order on public.order_transactions(order_id);
create index if not exists idx_order_transactions_tenant on public.order_transactions(tenant_id);

create index if not exists idx_order_invoices_order on public.order_invoices(order_id);
create index if not exists idx_order_invoices_tenant on public.order_invoices(tenant_id);

create index if not exists idx_order_events_order on public.order_events(order_id);
create index if not exists idx_order_events_tenant on public.order_events(tenant_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

drop trigger if exists update_orders_updated_at on public.orders;
create trigger update_orders_updated_at 
    before update on public.orders 
    for each row execute function public.update_updated_at_column();

drop trigger if exists update_fulfillments_updated_at on public.fulfillments;
create trigger update_fulfillments_updated_at 
    before update on public.fulfillments 
    for each row execute function public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.fulfillments enable row level security;
alter table public.fulfillment_lines enable row level security;
alter table public.order_transactions enable row level security;
alter table public.order_invoices enable row level security;
alter table public.order_events enable row level security;

-- Orders policies
create policy "authenticated users can view their tenant orders"
on public.orders for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert orders to their tenant"
on public.orders for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant orders"
on public.orders for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "anon users can create orders"
on public.orders for insert to anon
with check (true);

-- Order items policies
create policy "authenticated users can view their tenant order items"
on public.order_items for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can manage their tenant order items"
on public.order_items for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "anon users can create order items"
on public.order_items for insert to anon
with check (true);

-- Fulfillments policies
create policy "authenticated users can view their tenant fulfillments"
on public.fulfillments for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert fulfillments to their tenant"
on public.fulfillments for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can update their tenant fulfillments"
on public.fulfillments for update to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can delete their tenant fulfillments"
on public.fulfillments for delete to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- Fulfillment lines policies
create policy "authenticated users can view their tenant fulfillment lines"
on public.fulfillment_lines for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can manage their tenant fulfillment lines"
on public.fulfillment_lines for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- Transactions policies
create policy "authenticated users can view their tenant transactions"
on public.order_transactions for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can manage their tenant transactions"
on public.order_transactions for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- Invoices policies
create policy "authenticated users can view their tenant invoices"
on public.order_invoices for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can manage their tenant invoices"
on public.order_invoices for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- Events policies
create policy "authenticated users can view their tenant order events"
on public.order_events for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can manage their tenant order events"
on public.order_events for all to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

create or replace function public.generate_order_number(p_tenant_id uuid)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_count integer;
begin
    select count(*) + 1 into v_count from public.orders where tenant_id = p_tenant_id;
    return 'ORD-' || lpad(v_count::text, 6, '0');
end;
$$;

create or replace function public.generate_invoice_number(p_tenant_id uuid)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_count integer;
begin
    select count(*) + 1 into v_count from public.order_invoices where tenant_id = p_tenant_id;
    return 'INV-' || to_char(now(), 'YYYYMM') || '-' || lpad(v_count::text, 4, '0');
end;
$$;
