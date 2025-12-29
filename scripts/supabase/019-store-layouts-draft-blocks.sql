-- ============================================================================
-- Migration: Add draft_blocks column to store_layouts
-- Description: Enables draft/publish workflow for storefront editor
-- Run this migration in Supabase SQL Editor
-- ============================================================================

-- Add draft_blocks column for storing unpublished changes
ALTER TABLE store_layouts 
ADD COLUMN IF NOT EXISTS draft_blocks JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN store_layouts.draft_blocks IS 'Stores unpublished block changes. NULL when no draft exists.';

-- Update the index to include draft status for efficient queries
CREATE INDEX IF NOT EXISTS idx_store_layouts_draft 
ON store_layouts(tenant_id, is_homepage) 
WHERE draft_blocks IS NOT NULL;
