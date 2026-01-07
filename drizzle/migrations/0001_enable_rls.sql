-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- Multitenant SaaS E-Commerce Platform
-- ============================================
-- 
-- @see SYSTEM-ARCHITECTURE.md Section 5.3
-- @see IMPLEMENTATION-PLAN.md Section 2.2
--
-- This migration enables RLS on all tenant-scoped tables
-- and creates isolation policies to ensure tenants can only
-- access their own data.
--
-- CRITICAL: The application MUST use withTenant() wrapper
-- which sets app.current_tenant before any query.
-- ============================================

-- ============================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================

-- Tenant-scoped tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STANDARD TENANT ISOLATION POLICIES
-- ============================================
-- 
-- Pattern: tenant_id = current_setting('app.current_tenant', true)::uuid
-- The 'true' parameter makes it return NULL instead of error if not set
-- This allows the policy to fail safely (return no rows) if context is missing

-- Users table
CREATE POLICY tenant_isolation_users ON users
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Products table
CREATE POLICY tenant_isolation_products ON products
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Product variants table
CREATE POLICY tenant_isolation_product_variants ON product_variants
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Inventory levels table
CREATE POLICY tenant_isolation_inventory_levels ON inventory_levels
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Categories table
CREATE POLICY tenant_isolation_categories ON categories
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Orders table
CREATE POLICY tenant_isolation_orders ON orders
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Order items table
CREATE POLICY tenant_isolation_order_items ON order_items
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Order status history table
CREATE POLICY tenant_isolation_order_status_history ON order_status_history
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Carts table
CREATE POLICY tenant_isolation_carts ON carts
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Cart items table (access controlled via cart relationship)
-- Note: cart_items may not have tenant_id directly, controlled via carts
CREATE POLICY tenant_isolation_cart_items ON cart_items
  FOR ALL
  USING (
    cart_id IN (
      SELECT id FROM carts 
      WHERE tenant_id = current_setting('app.current_tenant', true)::uuid
    )
  );

-- Store configs table
CREATE POLICY tenant_isolation_store_configs ON store_configs
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Discounts table
CREATE POLICY tenant_isolation_discounts ON discounts
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Voucher codes table
CREATE POLICY tenant_isolation_voucher_codes ON voucher_codes
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Domains table
CREATE POLICY tenant_isolation_domains ON domains
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Campaigns table
CREATE POLICY tenant_isolation_campaigns ON campaigns
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Media table
CREATE POLICY tenant_isolation_media ON media
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================
-- SPECIAL POLICIES
-- ============================================

-- Tenants table: Self-access only (or platform admin)
-- Note: tenants table doesn't have tenant_id on itself
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenants_self_access ON tenants
  FOR ALL
  USING (
    id = current_setting('app.current_tenant', true)::uuid
    OR current_setting('app.is_platform_admin', true)::boolean = true
  );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify RLS is enabled:
--
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' AND rowsecurity = true;
--
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
