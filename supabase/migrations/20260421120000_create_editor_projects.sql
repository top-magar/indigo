-- Create editor_projects if not exists, or add missing columns
CREATE TABLE IF NOT EXISTS editor_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL DEFAULT 'Untitled',
  data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns if they don't exist (for existing tables)
DO $$ BEGIN
  ALTER TABLE editor_projects ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT 'default';
  ALTER TABLE editor_projects ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Untitled';
  ALTER TABLE editor_projects ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '[]'::jsonb;
  ALTER TABLE editor_projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
