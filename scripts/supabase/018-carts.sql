-- Migration: 018-carts.sql
-- Server-side cart system for storefront
-- Inspired by Medusa's cart architecture

-- Carts table
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    email VARCHAR(255),
    
    -- Addresses (JSONB for flexibility)
    shipping_address JSONB,
    billing_address JSONB,
    
    -- Totals (calculated)
    subtotal DECIMAL(10, 2) DEFAULT 0,
    discount_total DECIMAL(10, 2) DEFAULT 0,
    shipping_total DECIMAL(10, 2) DEFAULT 0,
    tax_total DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    
    -- Currency
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Shipping
    shipping_method_id UUID,
    
    -- Discounts applied
    discount_codes TEXT[] DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart line items
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    
    -- Product reference
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    
    -- Snapshot of product at time of add (for price consistency)
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    product_image TEXT,
    
    -- Pricing
    unit_price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    
    -- Calculated
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one product/variant per cart
    UNIQUE(cart_id, product_id, variant_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_carts_tenant_id ON carts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_carts_customer_id ON carts(customer_id);
CREATE INDEX IF NOT EXISTS idx_carts_status ON carts(status);
CREATE INDEX IF NOT EXISTS idx_carts_created_at ON carts(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Enable RLS
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carts (tenant-scoped)
CREATE POLICY "carts_tenant_isolation" ON carts
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant', true));

CREATE POLICY "cart_items_tenant_isolation" ON cart_items
    FOR ALL
    USING (
        cart_id IN (
            SELECT id FROM carts 
            WHERE tenant_id::text = current_setting('app.current_tenant', true)
        )
    );

-- Function to recalculate cart totals
CREATE OR REPLACE FUNCTION recalculate_cart_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE carts
    SET 
        subtotal = COALESCE((
            SELECT SUM(subtotal) FROM cart_items WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
        ), 0),
        total = COALESCE((
            SELECT SUM(subtotal) FROM cart_items WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
        ), 0) + COALESCE(shipping_total, 0) - COALESCE(discount_total, 0) + COALESCE(tax_total, 0),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update cart totals
DROP TRIGGER IF EXISTS trigger_recalculate_cart_totals ON cart_items;
CREATE TRIGGER trigger_recalculate_cart_totals
    AFTER INSERT OR UPDATE OR DELETE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_cart_totals();

-- Function to clean up abandoned carts (run via cron)
CREATE OR REPLACE FUNCTION cleanup_abandoned_carts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM carts
        WHERE status = 'active'
        AND updated_at < NOW() - INTERVAL '7 days'
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
