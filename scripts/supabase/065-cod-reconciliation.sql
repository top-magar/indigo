-- 065-cod-reconciliation.sql
-- COD collection tracking and delivery attempt logging

-- Enums
DO $$ BEGIN
  CREATE TYPE cod_collection_status AS ENUM ('pending', 'collected', 'deposited', 'failed', 'returned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE delivery_attempt_status AS ENUM ('scheduled', 'out_for_delivery', 'delivered', 'failed', 'rescheduled', 'returned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- COD Collections
CREATE TABLE IF NOT EXISTS cod_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  expected_amount DECIMAL(12,2) NOT NULL,
  collected_amount DECIMAL(12,2),
  currency TEXT NOT NULL DEFAULT 'NPR',
  status cod_collection_status NOT NULL DEFAULT 'pending',
  collector_name TEXT,
  collected_at TIMESTAMPTZ,
  deposited_at TIMESTAMPTZ,
  failure_reason TEXT,
  tracking_id TEXT,
  delivery_partner TEXT DEFAULT 'pathao',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cod_tenant_status ON cod_collections(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cod_order ON cod_collections(order_id);

-- Delivery Attempts
CREATE TABLE IF NOT EXISTS delivery_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  cod_collection_id UUID REFERENCES cod_collections(id),
  attempt_number INTEGER NOT NULL DEFAULT 1,
  status delivery_attempt_status NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ,
  attempted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_attempts_tenant_order ON delivery_attempts(tenant_id, order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_attempts_cod ON delivery_attempts(cod_collection_id);

-- RLS
ALTER TABLE cod_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY cod_collections_tenant_isolation ON cod_collections
  USING (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY delivery_attempts_tenant_isolation ON delivery_attempts
  USING (tenant_id::text = current_setting('app.current_tenant', true));
