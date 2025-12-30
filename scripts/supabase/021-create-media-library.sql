-- ============================================================================
-- Migration: Media Library
-- Description: Centralized media asset management for images, videos, and files
-- Run this migration in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- MEDIA FOLDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS media_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    parent_folder_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique folder name within same parent
    UNIQUE(tenant_id, parent_folder_id, name)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_media_folders_tenant ON media_folders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_folders_parent ON media_folders(parent_folder_id);

-- ============================================================================
-- MEDIA ASSETS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES media_folders(id) ON DELETE SET NULL,
    
    -- File info
    filename VARCHAR(255) NOT NULL,           -- Display name (editable)
    original_filename VARCHAR(255) NOT NULL,  -- Original upload name
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    
    -- Image dimensions (null for non-images)
    width INTEGER,
    height INTEGER,
    
    -- Storage URLs
    blob_url TEXT NOT NULL,       -- Vercel Blob storage URL
    cdn_url TEXT NOT NULL,        -- Public CDN URL
    thumbnail_url TEXT,           -- Generated thumbnail
    
    -- Metadata
    alt_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ        -- Soft delete
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_media_assets_tenant ON media_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_folder ON media_assets(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_created ON media_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_mime_type ON media_assets(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_not_deleted ON media_assets(tenant_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- MEDIA ASSET USAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS media_asset_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,  -- 'product', 'block', 'category', 'store'
    entity_id UUID NOT NULL,
    field_name VARCHAR(100),           -- Which field uses this asset
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_media_usages_asset ON media_asset_usages(asset_id);
CREATE INDEX IF NOT EXISTS idx_media_usages_entity ON media_asset_usages(entity_type, entity_id);

-- ============================================================================
-- ROW LEVEL SECURITY - MEDIA FOLDERS
-- ============================================================================

ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Tenants can view own folders" ON media_folders;
DROP POLICY IF EXISTS "Tenants can insert own folders" ON media_folders;
DROP POLICY IF EXISTS "Tenants can update own folders" ON media_folders;
DROP POLICY IF EXISTS "Tenants can delete own folders" ON media_folders;

CREATE POLICY "Tenants can view own folders"
    ON media_folders FOR SELECT
    USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Tenants can insert own folders"
    ON media_folders FOR INSERT
    WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Tenants can update own folders"
    ON media_folders FOR UPDATE
    USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Tenants can delete own folders"
    ON media_folders FOR DELETE
    USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- ============================================================================
-- ROW LEVEL SECURITY - MEDIA ASSETS
-- ============================================================================

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Tenants can view own assets" ON media_assets;
DROP POLICY IF EXISTS "Tenants can insert own assets" ON media_assets;
DROP POLICY IF EXISTS "Tenants can update own assets" ON media_assets;
DROP POLICY IF EXISTS "Tenants can delete own assets" ON media_assets;
DROP POLICY IF EXISTS "Public can view assets for published stores" ON media_assets;

CREATE POLICY "Tenants can view own assets"
    ON media_assets FOR SELECT
    USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Tenants can insert own assets"
    ON media_assets FOR INSERT
    WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Tenants can update own assets"
    ON media_assets FOR UPDATE
    USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Tenants can delete own assets"
    ON media_assets FOR DELETE
    USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Public can view assets (for storefront rendering)
CREATE POLICY "Public can view assets for published stores"
    ON media_assets FOR SELECT
    USING (true);  -- Assets are public via CDN anyway

-- ============================================================================
-- ROW LEVEL SECURITY - MEDIA ASSET USAGES
-- ============================================================================

ALTER TABLE media_asset_usages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Tenants can view own asset usages" ON media_asset_usages;
DROP POLICY IF EXISTS "Tenants can insert own asset usages" ON media_asset_usages;
DROP POLICY IF EXISTS "Tenants can delete own asset usages" ON media_asset_usages;

CREATE POLICY "Tenants can view own asset usages"
    ON media_asset_usages FOR SELECT
    USING (
        asset_id IN (
            SELECT id FROM media_assets 
            WHERE tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Tenants can insert own asset usages"
    ON media_asset_usages FOR INSERT
    WITH CHECK (
        asset_id IN (
            SELECT id FROM media_assets 
            WHERE tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Tenants can delete own asset usages"
    ON media_asset_usages FOR DELETE
    USING (
        asset_id IN (
            SELECT id FROM media_assets 
            WHERE tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
        )
    );

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

-- Media folders trigger
DROP TRIGGER IF EXISTS media_folders_updated_at ON media_folders;

CREATE OR REPLACE FUNCTION update_media_folders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER media_folders_updated_at
    BEFORE UPDATE ON media_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_media_folders_updated_at();

-- Media assets trigger
DROP TRIGGER IF EXISTS media_assets_updated_at ON media_assets;

CREATE OR REPLACE FUNCTION update_media_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER media_assets_updated_at
    BEFORE UPDATE ON media_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_media_assets_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get storage usage for a tenant
CREATE OR REPLACE FUNCTION get_tenant_storage_usage(p_tenant_id UUID)
RETURNS BIGINT AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(size_bytes) 
         FROM media_assets 
         WHERE tenant_id = p_tenant_id AND deleted_at IS NULL),
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get asset count for a tenant
CREATE OR REPLACE FUNCTION get_tenant_asset_count(p_tenant_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM media_assets 
        WHERE tenant_id = p_tenant_id AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON media_folders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON media_folders TO authenticated;

GRANT SELECT ON media_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON media_assets TO authenticated;

GRANT SELECT ON media_asset_usages TO anon;
GRANT SELECT, INSERT, DELETE ON media_asset_usages TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION get_tenant_storage_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_tenant_asset_count(UUID) TO authenticated;
