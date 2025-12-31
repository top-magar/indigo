-- ============================================================================
-- 007: Inventory & Stock Movements
-- Inventory tracking and stock movement history
-- ============================================================================

-- ============================================================================
-- STOCK MOVEMENTS TABLE
-- ============================================================================

create table if not exists public.stock_movements (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    product_name text not null,
    type text not null check (type in ('add', 'remove', 'set', 'sale', 'return', 'adjustment', 'transfer')),
    quantity_before integer not null,
    quantity_change integer not null,
    quantity_after integer not null,
    reason text not null,
    notes text,
    reference text,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz default now()
);

comment on table public.stock_movements is 'Tracks all inventory stock changes for audit and history.';
comment on column public.stock_movements.type is 'Type of movement: add, remove, set, sale, return, adjustment, transfer.';
comment on column public.stock_movements.quantity_change is 'Positive for additions, negative for removals.';
comment on column public.stock_movements.reference is 'External reference like order ID or PO number.';

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_stock_movements_tenant on public.stock_movements(tenant_id);
create index if not exists idx_stock_movements_product on public.stock_movements(product_id);
create index if not exists idx_stock_movements_created_at on public.stock_movements(created_at desc);
create index if not exists idx_stock_movements_type on public.stock_movements(type);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.stock_movements enable row level security;

create policy "authenticated users can view their tenant stock movements"
on public.stock_movements for select to authenticated
using (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

create policy "authenticated users can insert stock movements to their tenant"
on public.stock_movements for insert to authenticated
with check (tenant_id in (select tenant_id from public.users where id = (select auth.uid())));

-- Note: Stock movements should not be updated or deleted (audit trail)

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

create or replace function public.decrement_product_quantity(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.products 
    set quantity = greatest(0, quantity - p_quantity)
    where id = p_product_id and track_quantity = true;
end;
$$;

create or replace function public.increment_product_quantity(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.products 
    set quantity = quantity + p_quantity
    where id = p_product_id and track_quantity = true;
end;
$$;

-- Grant permissions
grant select, insert on public.stock_movements to authenticated;
