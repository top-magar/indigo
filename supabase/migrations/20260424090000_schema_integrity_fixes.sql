-- Schema Integrity Fixes Migration
-- Idempotent: safe to run multiple times
-- Covers: column additions, type changes, indexes, unique constraints,
--         check constraints, and onDelete cascade for all FK references.

BEGIN;

-- ============================================================================
-- 1. EDITOR TABLES: Column additions & type changes
-- ============================================================================

-- 1a. editor_projects: Change tenant_id from TEXT to UUID + add FK
ALTER TABLE editor_projects
  ALTER COLUMN tenant_id TYPE uuid USING tenant_id::uuid;

-- Drop old FK if exists, then add with CASCADE
DO $$ BEGIN
  ALTER TABLE editor_projects
    DROP CONSTRAINT IF EXISTS editor_projects_tenant_id_tenants_id_fk;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE editor_projects
  ADD CONSTRAINT editor_projects_tenant_id_tenants_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- 1b. editor_pages: Add tenant_id column
ALTER TABLE editor_pages ADD COLUMN IF NOT EXISTS tenant_id uuid;

-- Backfill tenant_id from parent project
UPDATE editor_pages ep
  SET tenant_id = proj.tenant_id
  FROM editor_projects proj
  WHERE ep.project_id = proj.id
    AND ep.tenant_id IS NULL;

-- Now make it NOT NULL
ALTER TABLE editor_pages ALTER COLUMN tenant_id SET NOT NULL;

-- FK for editor_pages.tenant_id
DO $$ BEGIN
  ALTER TABLE editor_pages
    DROP CONSTRAINT IF EXISTS editor_pages_tenant_id_tenants_id_fk;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE editor_pages
  ADD CONSTRAINT editor_pages_tenant_id_tenants_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- FK for editor_pages.project_id (ensure CASCADE)
DO $$ BEGIN
  ALTER TABLE editor_pages
    DROP CONSTRAINT IF EXISTS editor_pages_project_id_fkey;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE editor_pages
    DROP CONSTRAINT IF EXISTS editor_pages_project_id_editor_projects_id_fk;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE editor_pages
  ADD CONSTRAINT editor_pages_project_id_editor_projects_id_fk
  FOREIGN KEY (project_id) REFERENCES editor_projects(id) ON DELETE CASCADE;

-- 1c. editor_project_versions: Create table if not exists, or add tenant_id
CREATE TABLE IF NOT EXISTS editor_project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  version INTEGER NOT NULL,
  label TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE editor_project_versions ADD COLUMN IF NOT EXISTS tenant_id uuid;

-- Backfill from parent project if needed
UPDATE editor_project_versions epv
  SET tenant_id = proj.tenant_id
  FROM editor_projects proj
  WHERE epv.project_id = proj.id
    AND epv.tenant_id IS NULL;

ALTER TABLE editor_project_versions ALTER COLUMN tenant_id SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE editor_project_versions
    DROP CONSTRAINT IF EXISTS editor_project_versions_tenant_id_tenants_id_fk;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE editor_project_versions
  ADD CONSTRAINT editor_project_versions_tenant_id_tenants_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

DO $$ BEGIN
  ALTER TABLE editor_project_versions
    DROP CONSTRAINT IF EXISTS editor_project_versions_project_id_editor_projects_id_fk;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE editor_project_versions
  ADD CONSTRAINT editor_project_versions_project_id_editor_projects_id_fk
  FOREIGN KEY (project_id) REFERENCES editor_projects(id) ON DELETE CASCADE;

-- ============================================================================
-- 2. INDEXES
-- ============================================================================

-- Editor indexes
CREATE INDEX IF NOT EXISTS editor_projects_tenant_id_idx ON editor_projects(tenant_id);
CREATE INDEX IF NOT EXISTS editor_pages_project_id_idx ON editor_pages(project_id);
CREATE INDEX IF NOT EXISTS editor_pages_tenant_id_idx ON editor_pages(tenant_id);
CREATE INDEX IF NOT EXISTS editor_project_versions_project_id_idx ON editor_project_versions(project_id);

-- Users
CREATE INDEX IF NOT EXISTS users_tenant_id_idx ON users(tenant_id);

-- Products (partial index on active)
CREATE INDEX IF NOT EXISTS products_active_idx ON products(tenant_id) WHERE status = 'active';

-- Carts (partial index on active)
CREATE INDEX IF NOT EXISTS carts_active_idx ON carts(tenant_id) WHERE status = 'active';

-- Media assets (partial index on non-deleted)
CREATE INDEX IF NOT EXISTS media_assets_active_idx ON media_assets(tenant_id) WHERE deleted_at IS NULL;

-- Campaign recipients (composite)
CREATE INDEX IF NOT EXISTS campaign_recipients_status_idx ON campaign_recipients(campaign_id, status);

-- ============================================================================
-- 3. UNIQUE CONSTRAINTS
-- ============================================================================

-- editor_pages: (project_id, slug)
DO $$ BEGIN
  ALTER TABLE editor_pages
    ADD CONSTRAINT editor_pages_project_id_slug_unique UNIQUE (project_id, slug);
EXCEPTION WHEN duplicate_table THEN NULL;
         WHEN duplicate_object THEN NULL;
END $$;

-- products: (tenant_id, slug)
DO $$ BEGIN
  ALTER TABLE products
    ADD CONSTRAINT products_tenant_slug UNIQUE (tenant_id, slug);
EXCEPTION WHEN duplicate_table THEN NULL;
         WHEN duplicate_object THEN NULL;
END $$;

-- categories: (tenant_id, slug)
DO $$ BEGIN
  ALTER TABLE categories
    ADD CONSTRAINT categories_tenant_slug UNIQUE (tenant_id, slug);
EXCEPTION WHEN duplicate_table THEN NULL;
         WHEN duplicate_object THEN NULL;
END $$;

-- collections: (tenant_id, slug)
DO $$ BEGIN
  ALTER TABLE collections
    ADD CONSTRAINT collections_tenant_slug UNIQUE (tenant_id, slug);
EXCEPTION WHEN duplicate_table THEN NULL;
         WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 4. CHECK CONSTRAINTS
-- ============================================================================

DO $$ BEGIN
  ALTER TABLE products ADD CONSTRAINT products_price_positive CHECK (price >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE reviews ADD CONSTRAINT reviews_rating_range CHECK (rating >= 1 AND rating <= 5);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE cart_items ADD CONSTRAINT cart_items_quantity_positive CHECK (quantity > 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_positive CHECK (quantity > 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 5. ON DELETE CASCADE — Drop + re-add FK constraints
--    (Only for FKs that previously lacked onDelete)
-- ============================================================================

-- Helper: drop-if-exists + add pattern for each FK

-- campaigns.tenant_id
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_tenant_id_tenants_id_fk;
ALTER TABLE campaigns
  ADD CONSTRAINT campaigns_tenant_id_tenants_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- campaign_recipients.tenant_id
ALTER TABLE campaign_recipients DROP CONSTRAINT IF EXISTS campaign_recipients_tenant_id_tenants_id_fk;
ALTER TABLE campaign_recipients
  ADD CONSTRAINT campaign_recipients_tenant_id_tenants_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- campaign_recipients.campaign_id
ALTER TABLE campaign_recipients DROP CONSTRAINT IF EXISTS campaign_recipients_campaign_id_campaigns_id_fk;
ALTER TABLE campaign_recipients
  ADD CONSTRAINT campaign_recipients_campaign_id_campaigns_id_fk
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;

-- customer_segments.tenant_id
ALTER TABLE customer_segments DROP CONSTRAINT IF EXISTS customer_segments_tenant_id_tenants_id_fk;
ALTER TABLE customer_segments
  ADD CONSTRAINT customer_segments_tenant_id_tenants_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- carts.tenant_id
ALTER TABLE carts DROP CONSTRAINT IF EXISTS carts_tenant_id_tenants_id_fk;
ALTER TABLE carts
  ADD CONSTRAINT carts_tenant_id_tenants_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- cart_items.tenant_id
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_tenant_id_tenants_id_fk;
ALTER TABLE cart_items
  ADD CONSTRAINT cart_items_tenant_id_tenants_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- cart_items.product_id → SET NULL
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_products_id_fk;
ALTER TABLE cart_items
  ADD CONSTRAINT cart_items_product_id_products_id_fk
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- cart_items.variant_id → SET NULL
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_variant_id_product_variants_id_fk;
ALTER TABLE cart_items
  ADD CONSTRAINT cart_items_variant_id_product_variants_id_fk
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;

-- Make cart_items.product_id nullable (required for SET NULL)
ALTER TABLE cart_items ALTER COLUMN product_id DROP NOT NULL;

-- delivery_attempts.cod_collection_id
ALTER TABLE delivery_attempts DROP CONSTRAINT IF EXISTS delivery_attempts_cod_collection_id_cod_collections_id_fk;
ALTER TABLE delivery_attempts
  ADD CONSTRAINT delivery_attempts_cod_collection_id_cod_collections_id_fk
  FOREIGN KEY (cod_collection_id) REFERENCES cod_collections(id) ON DELETE CASCADE;

-- dashboard_layouts.tenant_id
ALTER TABLE dashboard_layouts DROP CONSTRAINT IF EXISTS dashboard_layouts_tenant_id_tenants_id_fk;
ALTER TABLE dashboard_layouts
  ADD CONSTRAINT dashboard_layouts_tenant_id_tenants_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- discounts.tenant_id
ALTER TABLE discounts DROP CONSTRAINT IF EXISTS discounts_tenant_id_tenants_id_fk;
ALTER TABLE discounts
  ADD CONSTRAINT discounts_tenant_id_tenants_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- voucher_codes.tenant_id
ALTER TABLE voucher_codes DROP CONSTRAINT IF EXISTS voucher_codes_tenant_id_tenants_id_fk;
ALTER TABLE voucher_codes
  ADD CONSTRAINT voucher_codes_tenant_id_tenants_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- discount_usages.tenant_id
ALTER TABLE discount_usages DROP CONSTRAINT IF EXISTS discount_usages_tenant_id_tenants_id_fk;
ALTER TABLE discount_usages
  ADD CONSTRAINT discount_usages_tenant_id_tenants_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- discount_usages.discount_id
ALTER TABLE discount_usages DROP CONSTRAINT IF EXISTS discount_usages_discount_id_discounts_id_fk;
ALTER TABLE discount_usages
  ADD CONSTRAINT discount_usages_discount_id_discounts_id_fk
  FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE;

-- discount_usages.voucher_code_id
ALTER TABLE discount_usages DROP CONSTRAINT IF EXISTS discount_usages_voucher_code_id_voucher_codes_id_fk;
ALTER TABLE discount_usages
  ADD CONSTRAINT discount_usages_voucher_code_id_voucher_codes_id_fk
  FOREIGN KEY (voucher_code_id) REFERENCES voucher_codes(id) ON DELETE CASCADE;

-- discount_rules.tenant_id
ALTER TABLE discount_rules DROP CONSTRAINT IF EXISTS discount_rules_tenant_id_tenants_id_fk;
ALTER TABLE discount_rules
  ADD CONSTRAINT discount_rules_tenant_id_tenants_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- users.tenant_id
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tenant_id_tenants_id_fk;
ALTER TABLE users
  ADD CONSTRAINT users_tenant_id_tenants_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

COMMIT;
