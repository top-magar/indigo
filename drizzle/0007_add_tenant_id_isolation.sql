-- Migration: Add tenant_id to 7 tables + enable RLS
-- Tables: collection_products, cart_items, media_asset_usages,
--         layout_versions, layout_operations, block_locks, editor_sessions

-- ============================================================================
-- 1. ADD tenant_id COLUMNS
-- ============================================================================

-- Backfill strategy: populate from parent table before adding NOT NULL

-- collection_products ← collections.tenant_id
ALTER TABLE "collection_products" ADD COLUMN "tenant_id" uuid;
UPDATE "collection_products" cp
  SET tenant_id = c.tenant_id
  FROM "collections" c WHERE c.id = cp.collection_id;
ALTER TABLE "collection_products" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "collection_products" ADD CONSTRAINT "collection_products_tenant_id_tenants_id_fk"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;
CREATE INDEX "collection_products_tenant_idx" ON "collection_products" ("tenant_id");

-- cart_items ← carts.tenant_id
ALTER TABLE "cart_items" ADD COLUMN "tenant_id" uuid;
UPDATE "cart_items" ci
  SET tenant_id = c.tenant_id
  FROM "carts" c WHERE c.id = ci.cart_id;
ALTER TABLE "cart_items" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_tenant_id_tenants_id_fk"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");
CREATE INDEX "cart_items_tenant_idx" ON "cart_items" ("tenant_id");

-- media_asset_usages ← media_assets.tenant_id
ALTER TABLE "media_asset_usages" ADD COLUMN "tenant_id" uuid;
UPDATE "media_asset_usages" mau
  SET tenant_id = ma.tenant_id
  FROM "media_assets" ma WHERE ma.id = mau.asset_id;
ALTER TABLE "media_asset_usages" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "media_asset_usages" ADD CONSTRAINT "media_asset_usages_tenant_id_tenants_id_fk"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;
CREATE INDEX "media_usages_tenant_idx" ON "media_asset_usages" ("tenant_id");

-- layout_versions ← layouts.tenant_id
ALTER TABLE "layout_versions" ADD COLUMN "tenant_id" uuid;
UPDATE "layout_versions" lv
  SET tenant_id = l.tenant_id
  FROM "layouts" l WHERE l.id = lv.layout_id;
ALTER TABLE "layout_versions" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "layout_versions" ADD CONSTRAINT "layout_versions_tenant_id_tenants_id_fk"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");
CREATE INDEX "layout_versions_tenant_idx" ON "layout_versions" ("tenant_id");

-- layout_operations ← layouts.tenant_id
ALTER TABLE "layout_operations" ADD COLUMN "tenant_id" uuid;
UPDATE "layout_operations" lo
  SET tenant_id = l.tenant_id
  FROM "layouts" l WHERE l.id = lo.layout_id;
ALTER TABLE "layout_operations" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "layout_operations" ADD CONSTRAINT "layout_operations_tenant_id_tenants_id_fk"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");
CREATE INDEX "layout_ops_tenant_idx" ON "layout_operations" ("tenant_id");

-- block_locks ← layouts.tenant_id
ALTER TABLE "block_locks" ADD COLUMN "tenant_id" uuid;
UPDATE "block_locks" bl
  SET tenant_id = l.tenant_id
  FROM "layouts" l WHERE l.id = bl.layout_id;
ALTER TABLE "block_locks" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "block_locks" ADD CONSTRAINT "block_locks_tenant_id_tenants_id_fk"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");
CREATE INDEX "block_locks_tenant_idx" ON "block_locks" ("tenant_id");

-- editor_sessions ← layouts.tenant_id
ALTER TABLE "editor_sessions" ADD COLUMN "tenant_id" uuid;
UPDATE "editor_sessions" es
  SET tenant_id = l.tenant_id
  FROM "layouts" l WHERE l.id = es.layout_id;
ALTER TABLE "editor_sessions" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "editor_sessions" ADD CONSTRAINT "editor_sessions_tenant_id_tenants_id_fk"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");
CREATE INDEX "editor_sessions_tenant_idx" ON "editor_sessions" ("tenant_id");

-- ============================================================================
-- 2. ENABLE RLS + POLICIES
-- ============================================================================

-- Pattern: tenant_id = current_setting('app.current_tenant')::uuid
-- This matches the withTenant() pattern used in src/infrastructure/db.ts

ALTER TABLE "collection_products" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "collection_products"
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY "tenant_insert" ON "collection_products" FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

ALTER TABLE "cart_items" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "cart_items"
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY "tenant_insert" ON "cart_items" FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

ALTER TABLE "media_asset_usages" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "media_asset_usages"
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY "tenant_insert" ON "media_asset_usages" FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

ALTER TABLE "layout_versions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "layout_versions"
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY "tenant_insert" ON "layout_versions" FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

ALTER TABLE "layout_operations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "layout_operations"
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY "tenant_insert" ON "layout_operations" FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

ALTER TABLE "block_locks" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "block_locks"
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY "tenant_insert" ON "block_locks" FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

ALTER TABLE "editor_sessions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "editor_sessions"
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY "tenant_insert" ON "editor_sessions" FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
