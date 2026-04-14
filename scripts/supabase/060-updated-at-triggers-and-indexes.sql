-- 060-updated-at-triggers-and-indexes.sql
-- Adds updatedAt auto-update triggers and fixes unscoped indexes

-- ============================================================
-- 1. updatedAt trigger function (reusable)
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables that have an updated_at column
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_set_updated_at ON %I; CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      tbl.table_name, tbl.table_name
    );
  END LOOP;
END;
$$;

-- ============================================================
-- 2. Fix unscoped indexes on orders (tenant_id composites)
-- ============================================================

-- Drop old unscoped indexes if they exist
DROP INDEX IF EXISTS idx_orders_payment_status;
DROP INDEX IF EXISTS idx_orders_fulfillment_status;

-- Create tenant-scoped composite indexes for COD reconciliation + dashboard queries
CREATE INDEX IF NOT EXISTS idx_orders_tenant_payment_status
  ON orders (tenant_id, payment_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_tenant_fulfillment_status
  ON orders (tenant_id, fulfillment_status, created_at DESC);

-- Composite for customer lookup (prevents duplicates per tenant)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_tenant_email
  ON customers (tenant_id, email);

-- ============================================================
-- 3. Composite indexes for common dashboard queries
-- ============================================================

-- Products by tenant + status (product listing page)
CREATE INDEX IF NOT EXISTS idx_products_tenant_status
  ON products (tenant_id, status, created_at DESC);

-- Revenue queries: orders by tenant + date range
CREATE INDEX IF NOT EXISTS idx_orders_tenant_created
  ON orders (tenant_id, created_at DESC);
