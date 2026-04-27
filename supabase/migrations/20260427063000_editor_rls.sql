-- Add RLS policies to editor tables for defense-in-depth
-- Application code already filters by tenant_id, but RLS prevents any bypass

-- editor_projects
ALTER TABLE editor_projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'editor_projects' AND policyname = 'editor_projects_tenant_isolation') THEN
    CREATE POLICY editor_projects_tenant_isolation ON editor_projects
      USING (tenant_id = COALESCE(current_setting('app.current_tenant', true), '')::uuid);
  END IF;
END $$;

-- editor_pages (join through editor_projects for tenant check)
ALTER TABLE editor_pages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'editor_pages' AND policyname = 'editor_pages_tenant_isolation') THEN
    CREATE POLICY editor_pages_tenant_isolation ON editor_pages
      USING (project_id IN (
        SELECT id FROM editor_projects
        WHERE tenant_id = COALESCE(current_setting('app.current_tenant', true), '')::uuid
      ));
  END IF;
END $$;

-- Service role bypasses RLS by default in Supabase, so admin/migration scripts still work
