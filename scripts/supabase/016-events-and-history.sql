-- ============================================================================
-- Migration: Events and History Tables
-- Description: Adds event persistence and order status history for audit trail
-- ============================================================================

-- ============================================================================
-- EVENTS TABLE (for event persistence and retry)
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
    error TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_tenant_id ON events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_next_retry ON events(next_retry_at) WHERE status = 'failed' AND retry_count < max_retries;

-- ============================================================================
-- ORDER STATUS HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    note TEXT,
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for order status history
CREATE INDEX IF NOT EXISTS idx_order_status_history_tenant ON order_status_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created ON order_status_history(created_at DESC);

-- ============================================================================
-- INVENTORY HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('add', 'remove', 'set', 'reserve', 'release')),
    quantity_change INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reason VARCHAR(100),
    reference_type VARCHAR(50),
    reference_id UUID,
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for inventory history
CREATE INDEX IF NOT EXISTS idx_inventory_history_tenant ON inventory_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_product ON inventory_history(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_variant ON inventory_history(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_created ON inventory_history(created_at DESC);

-- ============================================================================
-- WORKFLOW EXECUTIONS TABLE (for debugging and monitoring)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    workflow_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'compensated')),
    input JSONB NOT NULL DEFAULT '{}',
    output JSONB,
    error TEXT,
    steps_completed JSONB NOT NULL DEFAULT '[]',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER
);

-- Indexes for workflow executions
CREATE INDEX IF NOT EXISTS idx_workflow_executions_tenant ON workflow_executions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started ON workflow_executions(started_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Events RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for events" ON events
    FOR ALL USING (tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

-- Order Status History RLS
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for order_status_history" ON order_status_history
    FOR ALL USING (tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

-- Inventory History RLS
ALTER TABLE inventory_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for inventory_history" ON inventory_history
    FOR ALL USING (tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

-- Workflow Executions RLS
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for workflow_executions" ON workflow_executions
    FOR ALL USING (tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get failed events for retry
CREATE OR REPLACE FUNCTION get_events_for_retry(p_tenant_id UUID, p_limit INTEGER DEFAULT 100)
RETURNS SETOF events AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM events
    WHERE tenant_id = p_tenant_id
      AND status = 'failed'
      AND retry_count < max_retries
      AND (next_retry_at IS NULL OR next_retry_at <= NOW())
    ORDER BY created_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark event as processed
CREATE OR REPLACE FUNCTION mark_event_processed(p_event_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE events
    SET status = 'processed',
        processed_at = NOW()
    WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark event as failed with retry
CREATE OR REPLACE FUNCTION mark_event_failed(p_event_id UUID, p_error TEXT)
RETURNS VOID AS $$
DECLARE
    v_retry_count INTEGER;
    v_max_retries INTEGER;
BEGIN
    SELECT retry_count, max_retries INTO v_retry_count, v_max_retries
    FROM events WHERE id = p_event_id;
    
    UPDATE events
    SET status = 'failed',
        error = p_error,
        retry_count = v_retry_count + 1,
        next_retry_at = CASE 
            WHEN v_retry_count + 1 < v_max_retries 
            THEN NOW() + (INTERVAL '1 minute' * POWER(2, v_retry_count + 1))
            ELSE NULL
        END
    WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE events IS 'Persistent event log for audit trail and retry handling';
COMMENT ON TABLE order_status_history IS 'Tracks all order status changes for audit';
COMMENT ON TABLE inventory_history IS 'Tracks all inventory changes for audit';
COMMENT ON TABLE workflow_executions IS 'Tracks workflow executions for debugging and monitoring';
