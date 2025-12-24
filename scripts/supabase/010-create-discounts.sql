-- Create discounts table
CREATE TABLE IF NOT EXISTS discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed', 'free_shipping', 'buy_x_get_y')),
    value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    scope TEXT NOT NULL DEFAULT 'all' CHECK (scope IN ('all', 'products', 'collections', 'customers')),
    min_order_amount NUMERIC(10, 2),
    min_quantity INTEGER,
    max_uses INTEGER,
    max_uses_per_customer INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    combines_with_other_discounts BOOLEAN NOT NULL DEFAULT false,
    first_time_purchase_only BOOLEAN NOT NULL DEFAULT false,
    applicable_product_ids JSONB,
    applicable_collection_ids JSONB,
    applicable_customer_ids JSONB,
    excluded_product_ids JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS discounts_tenant_idx ON discounts(tenant_id);
CREATE INDEX IF NOT EXISTS discounts_code_idx ON discounts(tenant_id, code);
CREATE INDEX IF NOT EXISTS discounts_active_idx ON discounts(tenant_id, is_active);

-- Create discount usages table for tracking
CREATE TABLE IF NOT EXISTS discount_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
    customer_id UUID,
    order_id UUID,
    discount_amount NUMERIC(10, 2) NOT NULL,
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS discount_usages_discount_idx ON discount_usages(discount_id);
CREATE INDEX IF NOT EXISTS discount_usages_customer_idx ON discount_usages(customer_id);

-- Enable RLS
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_usages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for discounts
CREATE POLICY "Users can view discounts for their tenant" ON discounts
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert discounts for their tenant" ON discounts
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update discounts for their tenant" ON discounts
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete discounts for their tenant" ON discounts
    FOR DELETE USING (
        tenant_id IN (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    );

-- RLS Policies for discount_usages
CREATE POLICY "Users can view discount usages for their tenant" ON discount_usages
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert discount usages for their tenant" ON discount_usages
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_discounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS discounts_updated_at ON discounts;
CREATE TRIGGER discounts_updated_at
    BEFORE UPDATE ON discounts
    FOR EACH ROW
    EXECUTE FUNCTION update_discounts_updated_at();

-- Function to increment discount usage count atomically
CREATE OR REPLACE FUNCTION increment_discount_usage(discount_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE discounts
    SET used_count = used_count + 1
    WHERE id = discount_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;