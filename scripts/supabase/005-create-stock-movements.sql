-- Stock Movements Table for Inventory Tracking
-- This table tracks all stock changes for audit and history purposes

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL, -- Denormalized for history preservation
    type TEXT NOT NULL CHECK (type IN ('add', 'remove', 'set', 'sale', 'return', 'adjustment', 'transfer')),
    quantity_before INTEGER NOT NULL,
    quantity_change INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    reference TEXT, -- Order ID, PO number, etc.
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant ON stock_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type);

-- Enable RLS
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their tenant's stock movements"
    ON stock_movements FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert stock movements for their tenant"
    ON stock_movements FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    );

-- Note: Stock movements should not be updated or deleted (audit trail)
-- If corrections are needed, create a new adjustment movement

-- Grant permissions
GRANT SELECT, INSERT ON stock_movements TO authenticated;

-- Comment
COMMENT ON TABLE stock_movements IS 'Tracks all inventory stock changes for audit and history';
COMMENT ON COLUMN stock_movements.type IS 'Type of movement: add, remove, set, sale, return, adjustment, transfer';
COMMENT ON COLUMN stock_movements.quantity_change IS 'Positive for additions, negative for removals';
COMMENT ON COLUMN stock_movements.reference IS 'External reference like order ID or PO number';
