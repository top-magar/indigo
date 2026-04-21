ALTER TABLE editor_pages ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE editor_pages ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE editor_pages ADD COLUMN IF NOT EXISTS og_image TEXT;
ALTER TABLE editor_projects ADD COLUMN IF NOT EXISTS nav_config JSONB;
