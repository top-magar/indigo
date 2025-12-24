-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'email' CHECK (type IN ('email', 'sms', 'push')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'failed')),
    subject TEXT,
    preview_text TEXT,
    from_name TEXT,
    from_email TEXT,
    reply_to TEXT,
    content TEXT,
    content_json JSONB,
    template_id UUID,
    segment_id TEXT,
    segment_name TEXT,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    recipients_count INTEGER NOT NULL DEFAULT 0,
    delivered_count INTEGER NOT NULL DEFAULT 0,
    opened_count INTEGER NOT NULL DEFAULT 0,
    clicked_count INTEGER NOT NULL DEFAULT 0,
    bounced_count INTEGER NOT NULL DEFAULT 0,
    unsubscribed_count INTEGER NOT NULL DEFAULT 0,
    revenue_generated NUMERIC(10, 2) NOT NULL DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS campaigns_tenant_idx ON campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS campaigns_status_idx ON campaigns(tenant_id, status);
CREATE INDEX IF NOT EXISTS campaigns_scheduled_idx ON campaigns(scheduled_at);

-- Create campaign recipients table for tracking
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    customer_id UUID,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS campaign_recipients_campaign_idx ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS campaign_recipients_customer_idx ON campaign_recipients(customer_id);
CREATE INDEX IF NOT EXISTS campaign_recipients_email_idx ON campaign_recipients(email);

-- Create customer segments table
CREATE TABLE IF NOT EXISTS customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'dynamic' CHECK (type IN ('static', 'dynamic')),
    conditions JSONB,
    customer_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customer_segments_tenant_idx ON customer_segments(tenant_id);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Users can view campaigns for their tenant" ON campaigns
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert campaigns for their tenant" ON campaigns
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can update campaigns for their tenant" ON campaigns
    FOR UPDATE USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can delete campaigns for their tenant" ON campaigns
    FOR DELETE USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

-- RLS Policies for campaign_recipients
CREATE POLICY "Users can view campaign recipients for their tenant" ON campaign_recipients
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert campaign recipients for their tenant" ON campaign_recipients
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can update campaign recipients for their tenant" ON campaign_recipients
    FOR UPDATE USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

-- RLS Policies for customer_segments
CREATE POLICY "Users can view segments for their tenant" ON customer_segments
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert segments for their tenant" ON customer_segments
    FOR INSERT WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can update segments for their tenant" ON customer_segments
    FOR UPDATE USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can delete segments for their tenant" ON customer_segments
    FOR DELETE USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS campaigns_updated_at ON campaigns;
CREATE TRIGGER campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_campaigns_updated_at();

DROP TRIGGER IF EXISTS customer_segments_updated_at ON customer_segments;
CREATE TRIGGER customer_segments_updated_at
    BEFORE UPDATE ON customer_segments
    FOR EACH ROW
    EXECUTE FUNCTION update_campaigns_updated_at();

-- Insert default segments
INSERT INTO customer_segments (tenant_id, name, description, type, conditions, customer_count)
SELECT 
    t.id,
    'All Customers',
    'All customers who have made at least one purchase',
    'dynamic',
    '[]'::jsonb,
    0
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM customer_segments cs 
    WHERE cs.tenant_id = t.id AND cs.name = 'All Customers'
);
