-- ============================================================================
-- 030: Performance Indexes
-- Optimized indexes for common query patterns in the multitenant SaaS platform
-- Reference: SYSTEM-ARCHITECTURE.md Section 6.3 (Performance Optimization)
-- ============================================================================

-- ============================================================================
-- PRODUCTS TABLE INDEXES
-- Optimized for storefront queries, dashboard listings, and search
-- ============================================================================

-- Composite index for tenant + status queries (most common storefront pattern)
create index if not exists idx_products_tenant_status 
on public.products(tenant_id, status);

comment on index public.idx_products_tenant_status is 
'Optimizes queries filtering products by tenant and status (e.g., active products for storefront)';

-- Composite index for tenant + category + status (category page queries)
create index if not exists idx_products_tenant_category_status 
on public.products(tenant_id, category_id, status);

comment on index public.idx_products_tenant_category_status is 
'Optimizes category page queries filtering by tenant, category, and status';

-- Partial index for active products only (storefront optimization)
create index if not exists idx_products_active 
on public.products(tenant_id, created_at desc) 
where status = 'active';

comment on index public.idx_products_active is 
'Partial index for active products - optimizes storefront product listings';

-- Index for product slug lookups (product detail pages)
create index if not exists idx_products_tenant_slug 
on public.products(tenant_id, slug);

comment on index public.idx_products_tenant_slug is 
'Optimizes product detail page lookups by slug';

-- Index for low stock queries (inventory alerts)
create index if not exists idx_products_low_stock 
on public.products(tenant_id, quantity) 
where quantity <= 10 and quantity > 0;

comment on index public.idx_products_low_stock is 
'Partial index for low stock products - optimizes inventory alert queries';

-- Index for out of stock queries
create index if not exists idx_products_out_of_stock 
on public.products(tenant_id) 
where quantity = 0;

comment on index public.idx_products_out_of_stock is 
'Partial index for out of stock products';

-- Full-text search index for product search
create index if not exists idx_products_search 
on public.products using gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(sku, '')));

comment on index public.idx_products_search is 
'Full-text search index for product name, description, and SKU';

-- ============================================================================
-- CATEGORIES TABLE INDEXES
-- Optimized for category tree queries and navigation
-- ============================================================================

-- Composite index for tenant + parent (category tree queries)
create index if not exists idx_categories_tenant_parent 
on public.categories(tenant_id, parent_id);

comment on index public.idx_categories_tenant_parent is 
'Optimizes category tree queries and child category lookups';

-- Index for category slug lookups
create index if not exists idx_categories_tenant_slug 
on public.categories(tenant_id, slug);

comment on index public.idx_categories_tenant_slug is 
'Optimizes category page lookups by slug';

-- Index for root categories (navigation menus)
create index if not exists idx_categories_roots 
on public.categories(tenant_id, sort_order) 
where parent_id is null;

comment on index public.idx_categories_roots is 
'Partial index for root categories - optimizes navigation menu queries';

-- ============================================================================
-- ORDERS TABLE INDEXES
-- Optimized for order management and analytics
-- ============================================================================

-- Composite index for tenant + status (order management)
create index if not exists idx_orders_tenant_status 
on public.orders(tenant_id, status);

comment on index public.idx_orders_tenant_status is 
'Optimizes order listing queries filtered by status';

-- Composite index for tenant + created_at (recent orders)
create index if not exists idx_orders_tenant_created 
on public.orders(tenant_id, created_at desc);

comment on index public.idx_orders_tenant_created is 
'Optimizes recent orders queries and order history';

-- Index for customer order history
create index if not exists idx_orders_tenant_customer 
on public.orders(tenant_id, customer_id, created_at desc);

comment on index public.idx_orders_tenant_customer is 
'Optimizes customer order history lookups';

-- Partial index for pending orders (fulfillment queue)
create index if not exists idx_orders_pending 
on public.orders(tenant_id, created_at) 
where status in ('pending', 'processing');

comment on index public.idx_orders_pending is 
'Partial index for pending/processing orders - optimizes fulfillment queue';

-- Index for order number lookups
create index if not exists idx_orders_tenant_number 
on public.orders(tenant_id, order_number);

comment on index public.idx_orders_tenant_number is 
'Optimizes order lookup by order number';

-- ============================================================================
-- CUSTOMERS TABLE INDEXES
-- Optimized for customer management and lookups
-- ============================================================================

-- Index for customer email lookups
create index if not exists idx_customers_tenant_email 
on public.customers(tenant_id, email);

comment on index public.idx_customers_tenant_email is 
'Optimizes customer lookup by email address';

-- Composite index for tenant + created_at (customer listing)
create index if not exists idx_customers_tenant_created 
on public.customers(tenant_id, created_at desc);

comment on index public.idx_customers_tenant_created is 
'Optimizes customer listing queries';

-- ============================================================================
-- STORE_CONFIGS TABLE INDEXES
-- Optimized for layout retrieval
-- ============================================================================

-- Composite index for tenant + page_type (layout lookups)
create index if not exists idx_store_configs_tenant_page 
on public.store_configs(tenant_id, page_type);

comment on index public.idx_store_configs_tenant_page is 
'Optimizes store layout lookups by page type';

-- Partial index for published layouts (storefront rendering)
create index if not exists idx_store_configs_published 
on public.store_configs(tenant_id, page_type) 
where is_published = true;

comment on index public.idx_store_configs_published is 
'Partial index for published layouts - optimizes storefront rendering';

-- ============================================================================
-- CARTS TABLE INDEXES
-- Optimized for cart operations
-- ============================================================================

-- Index for customer cart lookups
create index if not exists idx_carts_tenant_customer 
on public.carts(tenant_id, customer_id) 
where customer_id is not null and status = 'active';

comment on index public.idx_carts_tenant_customer is 
'Optimizes active cart lookups by customer ID';

-- ============================================================================
-- AUDIT_LOGS TABLE INDEXES (if not already created)
-- Optimized for audit trail queries
-- ============================================================================

-- Note: These may already exist from 020-audit-logs.sql
-- Using if not exists for idempotency

-- Index for entity audit trail
create index if not exists idx_audit_logs_tenant_entity 
on public.audit_logs(tenant_id, entity_type, entity_id, created_at desc) 
where entity_id is not null;

comment on index public.idx_audit_logs_tenant_entity is 
'Optimizes audit trail queries for specific entities';

-- ============================================================================
-- COLLECTIONS TABLE INDEXES
-- Optimized for collection queries
-- ============================================================================

-- Index for collection slug lookups
create index if not exists idx_collections_tenant_slug 
on public.collections(tenant_id, slug);

comment on index public.idx_collections_tenant_slug is 
'Optimizes collection page lookups by slug';

-- Partial index for active collections
create index if not exists idx_collections_active 
on public.collections(tenant_id, sort_order) 
where is_active = true;

comment on index public.idx_collections_active is 
'Partial index for active collections - optimizes storefront queries';

-- ============================================================================
-- ANALYTICS HELPER INDEXES
-- Optimized for dashboard analytics queries
-- ============================================================================

-- Index for order analytics by date
create index if not exists idx_orders_analytics 
on public.orders(tenant_id, created_at, status, total);

comment on index public.idx_orders_analytics is 
'Optimizes analytics queries for order totals and counts by date';

-- ============================================================================
-- MAINTENANCE NOTES
-- ============================================================================

-- To analyze index usage, run:
-- select schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- from pg_stat_user_indexes
-- where schemaname = 'public'
-- order by idx_scan desc;

-- To find unused indexes:
-- select schemaname, tablename, indexname, idx_scan
-- from pg_stat_user_indexes
-- where schemaname = 'public' and idx_scan = 0
-- order by tablename, indexname;

-- To check index sizes:
-- select tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid)) as index_size
-- from pg_stat_user_indexes
-- where schemaname = 'public'
-- order by pg_relation_size(indexrelid) desc;
