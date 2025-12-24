-- Add craft_data column to store_pages table
-- This stores the serialized Craft.js editor state

ALTER TABLE store_pages
ADD COLUMN IF NOT EXISTS craft_data TEXT;

-- Add comment for documentation
COMMENT ON COLUMN store_pages.craft_data IS 'Serialized Craft.js editor state JSON';
