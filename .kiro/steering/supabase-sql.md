---
inclusion: fileMatch
fileMatchPattern: "**/*.sql"
---

# Supabase SQL Best Practices

Follow these conventions when writing SQL for Supabase migrations.

## SQL Style

- Use **lowercase** for all SQL keywords (`create`, `select`, `insert`, not `CREATE`, `SELECT`)
- Use **snake_case** for tables and columns
- Use **plural** for table names (`users`, `orders`, `products`)
- Use **singular** for column names (`user_id`, `created_at`)
- Add **comments** on all tables explaining their purpose
- Use `if not exists` for idempotent migrations

## Table Creation

```sql
create table if not exists public.my_table (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    name text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table public.my_table is 'Description of what this table stores.';
```

## Row Level Security (RLS)

Always enable RLS and create separate policies per operation and role:

```sql
alter table public.my_table enable row level security;

-- SELECT policy for authenticated users
create policy "authenticated users can view their tenant data"
on public.my_table
for select
to authenticated
using (
    tenant_id in (
        select tenant_id from public.users where id = (select auth.uid())
    )
);

-- INSERT policy for authenticated users  
create policy "authenticated users can insert to their tenant"
on public.my_table
for insert
to authenticated
with check (
    tenant_id in (
        select tenant_id from public.users where id = (select auth.uid())
    )
);
```

## RLS Performance Tips

1. Use `(select auth.uid())` instead of `auth.uid()` for caching
2. Add indexes on columns used in RLS policies
3. Avoid joins - use `in` with subqueries instead
4. Always specify roles with `to authenticated` or `to anon`

## Indexes

Create indexes for:
- Foreign key columns
- Columns used in RLS policies
- Columns frequently used in WHERE clauses

```sql
create index if not exists idx_my_table_tenant on public.my_table(tenant_id);
```

## Database Functions

```sql
create or replace function public.my_function()
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
```

## Triggers

```sql
create trigger trigger_my_table_updated_at
    before update on public.my_table
    for each row
    execute function public.update_updated_at();
```
