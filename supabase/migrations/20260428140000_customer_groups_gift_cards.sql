-- Create customer_groups, customer_group_members, and gift_cards tables

CREATE TABLE IF NOT EXISTS customer_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  conditions JSONB DEFAULT '[]'::jsonb,
  is_dynamic BOOLEAN DEFAULT false,
  customer_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES customer_groups(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, customer_id)
);

CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  initial_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'NPR',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'depleted')),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customer_groups_tenant ON customer_groups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customer_group_members_group ON customer_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_customer_group_members_customer ON customer_group_members(customer_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_tenant ON gift_cards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(tenant_id, code);

-- RLS
ALTER TABLE customer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
