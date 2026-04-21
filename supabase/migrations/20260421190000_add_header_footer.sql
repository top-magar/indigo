ALTER TABLE editor_projects ADD COLUMN IF NOT EXISTS header_data JSONB;
ALTER TABLE editor_projects ADD COLUMN IF NOT EXISTS footer_data JSONB;
