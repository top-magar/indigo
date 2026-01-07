-- ============================================================================
-- Multi-Currency Support Migration
-- ============================================================================
-- Adds display currency and tax settings to tenants table
-- 
-- @see SYSTEM-ARCHITECTURE.md Section 5.2.1
-- @see IMPLEMENTATION-PLAN.md
-- ============================================================================

-- Add display_currency column to tenants
-- This allows tenants to show prices in a different currency than their base currency
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS display_currency TEXT DEFAULT 'NPR';

-- Add price_includes_tax column to tenants
-- When true, displayed prices include tax
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS price_includes_tax BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN tenants.display_currency IS 'Currency used for displaying prices to customers (may differ from base currency)';
COMMENT ON COLUMN tenants.price_includes_tax IS 'Whether displayed prices include tax';

-- Create index for currency lookups (useful for analytics)
CREATE INDEX IF NOT EXISTS idx_tenants_currency ON tenants(currency);
CREATE INDEX IF NOT EXISTS idx_tenants_display_currency ON tenants(display_currency);

-- ============================================================================
-- Exchange Rates Table (Optional - for caching rates)
-- ============================================================================
-- This table can be used to cache exchange rates if you want to store them
-- in the database instead of using in-memory caching

CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency TEXT NOT NULL,
    target_currency TEXT NOT NULL,
    rate DECIMAL(20, 10) NOT NULL,
    source TEXT DEFAULT 'manual', -- 'api', 'manual', 'fallback'
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique rate per currency pair
    CONSTRAINT unique_currency_pair UNIQUE (base_currency, target_currency)
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_exchange_rates_base ON exchange_rates(base_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_target ON exchange_rates(target_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_fetched ON exchange_rates(fetched_at);

-- Add comments
COMMENT ON TABLE exchange_rates IS 'Cached exchange rates for currency conversion';
COMMENT ON COLUMN exchange_rates.base_currency IS 'Source currency code (ISO 4217)';
COMMENT ON COLUMN exchange_rates.target_currency IS 'Target currency code (ISO 4217)';
COMMENT ON COLUMN exchange_rates.rate IS 'Exchange rate (1 base = rate target)';
COMMENT ON COLUMN exchange_rates.source IS 'Source of the rate: api, manual, or fallback';

-- ============================================================================
-- RLS Policies for Exchange Rates
-- ============================================================================

-- Enable RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read exchange rates
CREATE POLICY "exchange_rates_select_policy" ON exchange_rates
    FOR SELECT
    TO authenticated
    USING (true);

-- Only service role can insert/update/delete rates
CREATE POLICY "exchange_rates_insert_policy" ON exchange_rates
    FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "exchange_rates_update_policy" ON exchange_rates
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "exchange_rates_delete_policy" ON exchange_rates
    FOR DELETE
    TO service_role
    USING (true);

-- ============================================================================
-- Function to get exchange rate
-- ============================================================================

CREATE OR REPLACE FUNCTION get_exchange_rate(
    p_base_currency TEXT,
    p_target_currency TEXT
)
RETURNS DECIMAL(20, 10)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rate DECIMAL(20, 10);
BEGIN
    -- Same currency, rate is 1
    IF p_base_currency = p_target_currency THEN
        RETURN 1.0;
    END IF;
    
    -- Try to get direct rate
    SELECT rate INTO v_rate
    FROM exchange_rates
    WHERE base_currency = p_base_currency
      AND target_currency = p_target_currency
      AND fetched_at > NOW() - INTERVAL '1 hour';
    
    IF v_rate IS NOT NULL THEN
        RETURN v_rate;
    END IF;
    
    -- Try inverse rate
    SELECT 1.0 / rate INTO v_rate
    FROM exchange_rates
    WHERE base_currency = p_target_currency
      AND target_currency = p_base_currency
      AND fetched_at > NOW() - INTERVAL '1 hour';
    
    IF v_rate IS NOT NULL THEN
        RETURN v_rate;
    END IF;
    
    -- No rate found, return NULL (caller should use fallback)
    RETURN NULL;
END;
$$;

-- ============================================================================
-- Function to convert price
-- ============================================================================

CREATE OR REPLACE FUNCTION convert_price(
    p_amount DECIMAL,
    p_from_currency TEXT,
    p_to_currency TEXT
)
RETURNS DECIMAL(20, 2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rate DECIMAL(20, 10);
BEGIN
    -- Same currency, no conversion needed
    IF p_from_currency = p_to_currency THEN
        RETURN p_amount;
    END IF;
    
    -- Get exchange rate
    v_rate := get_exchange_rate(p_from_currency, p_to_currency);
    
    IF v_rate IS NULL THEN
        -- No rate available, return original amount
        RETURN p_amount;
    END IF;
    
    -- Convert and round to 2 decimal places
    RETURN ROUND(p_amount * v_rate, 2);
END;
$$;

-- ============================================================================
-- Seed default exchange rates (fallback values)
-- ============================================================================
-- These are approximate rates relative to USD and should be updated regularly

INSERT INTO exchange_rates (base_currency, target_currency, rate, source)
VALUES
    ('USD', 'EUR', 0.92, 'fallback'),
    ('USD', 'GBP', 0.79, 'fallback'),
    ('USD', 'JPY', 149.50, 'fallback'),
    ('USD', 'CNY', 7.24, 'fallback'),
    ('USD', 'INR', 83.12, 'fallback'),
    ('USD', 'NPR', 133.50, 'fallback'),
    ('USD', 'AUD', 1.53, 'fallback'),
    ('USD', 'CAD', 1.36, 'fallback'),
    ('USD', 'BRL', 4.97, 'fallback'),
    ('EUR', 'USD', 1.087, 'fallback'),
    ('GBP', 'USD', 1.266, 'fallback'),
    ('NPR', 'USD', 0.0075, 'fallback'),
    ('INR', 'USD', 0.012, 'fallback')
ON CONFLICT (base_currency, target_currency) 
DO UPDATE SET 
    rate = EXCLUDED.rate,
    source = EXCLUDED.source,
    updated_at = NOW();

-- ============================================================================
-- Grant permissions
-- ============================================================================

GRANT SELECT ON exchange_rates TO authenticated;
GRANT ALL ON exchange_rates TO service_role;
GRANT EXECUTE ON FUNCTION get_exchange_rate TO authenticated;
GRANT EXECUTE ON FUNCTION convert_price TO authenticated;
