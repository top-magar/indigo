-- ============================================================================
-- Tenant Isolation — Add tenant_id to tables missing it + RLS policies
-- 
-- Tables: collection_products, cart_items, media_asset_usages
--
-- Note: layout_versions, layout_operations, block_locks, editor_sessions
-- are not yet created in the remote DB. They will get tenant_id when created.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. collection_products
-- ============================================================================

ALTER TABLE collection_products ADD COLUMN IF NOT EXISTS tenant_id uuid;

UPDATE collection_products cp
  SET tenant_id = c.tenant_id
  FROM collections c WHERE c.id = cp.collection_id
  AND cp.tenant_id IS NULL;

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
  AND ci.tenant_id IS NULL;

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
  AND mau.tenant_id IS NULL;

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

COMMIT;
