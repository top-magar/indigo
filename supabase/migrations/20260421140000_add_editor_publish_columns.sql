ALTER TABLE editor_projects ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE editor_projects ADD COLUMN IF NOT EXISTS published_html TEXT;
ALTER TABLE editor_projects ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;
