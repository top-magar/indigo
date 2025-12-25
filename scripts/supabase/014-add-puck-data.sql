-- Add puck_data column to store_pages table for Puck editor data
-- This stores the native Puck JSON format separately from the legacy blocks format

ALTER TABLE store_pages 
ADD COLUMN IF NOT EXISTS puck_data JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN store_pages.puck_data IS 'Stores Puck editor JSON data format. When present, this takes precedence over the blocks column for rendering.';

-- Create index for faster queries on pages with puck data
CREATE INDEX IF NOT EXISTS idx_store_pages_has_puck_data 
ON store_pages(tenant_id) 
WHERE puck_data IS NOT NULL;
