-- ============================================================================
-- 055: Tenant Isolation — Add tenant_id to 7 tables + RLS policies
-- 
-- Tables: collection_products, cart_items, media_asset_usages,
--         layout_versions, layout_operations, block_locks, editor_sessions
--
-- These tables were missing tenant_id, relying only on parent FK for isolation.
-- This migration adds direct tenant_id + RLS for defense-in-depth.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. collection_products
-- ============================================================================

ALTER TABLE collection_products ADD COLUMN IF NOT EXISTS tenant_id uuid;

UPDATE collection_products cp
  SET tenant_id = c.tenant_id
  FROM collections c WHERE c.id = cp.collection_id
  WHERE cp.tenant_id IS NULL;

ALTER TABLE collection_products ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE collection_products ADD CONSTRAINT collection_products_tenant_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS collection_products_tenant_idx ON collection_products(tenant_id);

ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY collection_products_select ON collection_products
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY collection_products_insert ON collection_products
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY collection_products_update ON collection_products
  FOR UPDATE
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY collection_products_delete ON collection_products
  FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 2. cart_items
-- ============================================================================

ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS tenant_id uuid;

UPDATE cart_items ci
  SET tenant_id = c.tenant_id
  FROM carts c WHERE c.id = ci.cart_id
  WHERE ci.tenant_id IS NULL;

ALTER TABLE cart_items ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_tenant_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS cart_items_tenant_idx ON cart_items(tenant_id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY cart_items_select ON cart_items
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY cart_items_insert ON cart_items
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY cart_items_update ON cart_items
  FOR UPDATE
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY cart_items_delete ON cart_items
  FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 3. media_asset_usages
-- ============================================================================

ALTER TABLE media_asset_usages ADD COLUMN IF NOT EXISTS tenant_id uuid;

UPDATE media_asset_usages mau
  SET tenant_id = ma.tenant_id
  FROM media_assets ma WHERE ma.id = mau.asset_id
  WHERE mau.tenant_id IS NULL;

ALTER TABLE media_asset_usages ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE media_asset_usages ADD CONSTRAINT media_asset_usages_tenant_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS media_usages_tenant_idx ON media_asset_usages(tenant_id);

ALTER TABLE media_asset_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY media_asset_usages_select ON media_asset_usages
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY media_asset_usages_insert ON media_asset_usages
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY media_asset_usages_update ON media_asset_usages
  FOR UPDATE
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY media_asset_usages_delete ON media_asset_usages
  FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 4. layout_versions
-- ============================================================================

ALTER TABLE layout_versions ADD COLUMN IF NOT EXISTS tenant_id uuid;

UPDATE layout_versions lv
  SET tenant_id = l.tenant_id
  FROM layouts l WHERE l.id = lv.layout_id
  WHERE lv.tenant_id IS NULL;

ALTER TABLE layout_versions ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE layout_versions ADD CONSTRAINT layout_versions_tenant_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS layout_versions_tenant_idx ON layout_versions(tenant_id);

ALTER TABLE layout_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY layout_versions_select ON layout_versions
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY layout_versions_insert ON layout_versions
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY layout_versions_delete ON layout_versions
  FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 5. layout_operations
-- ============================================================================

ALTER TABLE layout_operations ADD COLUMN IF NOT EXISTS tenant_id uuid;

UPDATE layout_operations lo
  SET tenant_id = l.tenant_id
  FROM layouts l WHERE l.id = lo.layout_id
  WHERE lo.tenant_id IS NULL;

ALTER TABLE layout_operations ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE layout_operations ADD CONSTRAINT layout_operations_tenant_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS layout_ops_tenant_idx ON layout_operations(tenant_id);

ALTER TABLE layout_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY layout_operations_select ON layout_operations
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY layout_operations_insert ON layout_operations
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 6. block_locks
-- ============================================================================

ALTER TABLE block_locks ADD COLUMN IF NOT EXISTS tenant_id uuid;

UPDATE block_locks bl
  SET tenant_id = l.tenant_id
  FROM layouts l WHERE l.id = bl.layout_id
  WHERE bl.tenant_id IS NULL;

ALTER TABLE block_locks ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE block_locks ADD CONSTRAINT block_locks_tenant_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS block_locks_tenant_idx ON block_locks(tenant_id);

ALTER TABLE block_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY block_locks_select ON block_locks
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY block_locks_insert ON block_locks
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY block_locks_update ON block_locks
  FOR UPDATE
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY block_locks_delete ON block_locks
  FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 7. editor_sessions
-- ============================================================================

ALTER TABLE editor_sessions ADD COLUMN IF NOT EXISTS tenant_id uuid;

UPDATE editor_sessions es
  SET tenant_id = l.tenant_id
  FROM layouts l WHERE l.id = es.layout_id
  WHERE es.tenant_id IS NULL;

ALTER TABLE editor_sessions ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE editor_sessions ADD CONSTRAINT editor_sessions_tenant_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS editor_sessions_tenant_idx ON editor_sessions(tenant_id);

ALTER TABLE editor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY editor_sessions_select ON editor_sessions
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY editor_sessions_insert ON editor_sessions
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY editor_sessions_update ON editor_sessions
  FOR UPDATE
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY editor_sessions_delete ON editor_sessions
  FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

COMMIT;
