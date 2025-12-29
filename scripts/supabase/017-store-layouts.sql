-- ============================================================================
-- Migration: Store Layouts
-- Description: Stores page layout configurations for each tenant's storefront
-- Run this migration in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STORE LAYOUTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS store_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Layout metadata
    name VARCHAR(255) NOT NULL DEFAULT 'Homepage',
    slug VARCHAR(255) NOT NULL DEFAULT '/',
    is_homepage BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    
    -- Template reference (if using a preset)
    template_id VARCHAR(50),
    
    -- Block configuration (JSON array of blocks)
    blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Theme overrides (optional per-layout customization)
    theme_overrides JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    
    -- Ensure unique slug per tenant
    UNIQUE(tenant_id, slug)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_store_layouts_tenant ON store_layouts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_layouts_homepage ON store_layouts(tenant_id, is_homepage) WHERE is_homepage = true;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE store_layouts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Tenants can view own layouts" ON store_layouts;
DROP POLICY IF EXISTS "Tenants can insert own layouts" ON store_layouts;
DROP POLICY IF EXISTS "Tenants can update own layouts" ON store_layouts;
DROP POLICY IF EXISTS "Tenants can delete own layouts" ON store_layouts;
DROP POLICY IF EXISTS "Public can view published layouts" ON store_layouts;

-- Tenants can only access their own layouts (via users table)
CREATE POLICY "Tenants can view own layouts"
    ON store_layouts FOR SELECT
    USING (
        tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
        OR status = 'published'
    );

CREATE POLICY "Tenants can insert own layouts"
    ON store_layouts FOR INSERT
    WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Tenants can update own layouts"
    ON store_layouts FOR UPDATE
    USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Tenants can delete own layouts"
    ON store_layouts FOR DELETE
    USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS store_layouts_updated_at ON store_layouts;

-- Create or replace the function
CREATE OR REPLACE FUNCTION update_store_layouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER store_layouts_updated_at
    BEFORE UPDATE ON store_layouts
    FOR EACH ROW
    EXECUTE FUNCTION update_store_layouts_updated_at();

-- ============================================================================
-- GRANT PERMISSIONS (for anon and authenticated users)
-- ============================================================================

GRANT SELECT ON store_layouts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON store_layouts TO authenticated;
