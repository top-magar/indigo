BEGIN;

ALTER TABLE editor_pages
  ADD COLUMN IF NOT EXISTS document_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS server_revision integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_saved_by uuid,
  ADD COLUMN IF NOT EXISTS visible boolean NOT NULL DEFAULT true;

ALTER TABLE editor_projects
  ADD COLUMN IF NOT EXISTS active_published_version_id uuid,
  ADD COLUMN IF NOT EXISTS publication_version integer NOT NULL DEFAULT 0;

ALTER TABLE editor_project_versions
  ADD COLUMN IF NOT EXISTS document_version integer NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS published_by uuid;

DO $$ BEGIN
  ALTER TABLE editor_projects
    ADD CONSTRAINT editor_projects_active_published_version_fk
    FOREIGN KEY (active_published_version_id) REFERENCES editor_project_versions(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE editor_pages
    ADD CONSTRAINT editor_pages_last_saved_by_fk
    FOREIGN KEY (last_saved_by) REFERENCES users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE editor_project_versions
    ADD CONSTRAINT editor_project_versions_published_by_fk
    FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS editor_project_versions_project_version_unique
  ON editor_project_versions(project_id, version);
CREATE INDEX IF NOT EXISTS editor_project_versions_tenant_id_idx
  ON editor_project_versions(tenant_id);

CREATE TABLE IF NOT EXISTS editor_reusable_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  data jsonb NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS editor_reusable_components_tenant_id_idx
  ON editor_reusable_components(tenant_id);

CREATE TABLE IF NOT EXISTS editor_page_leases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES editor_projects(id) ON DELETE CASCADE,
  page_id uuid NOT NULL REFERENCES editor_pages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  expires_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT editor_page_leases_page_unique UNIQUE (page_id)
);

CREATE INDEX IF NOT EXISTS editor_page_leases_tenant_expiry_idx
  ON editor_page_leases(tenant_id, expires_at);

ALTER TABLE editor_reusable_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_page_leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY editor_reusable_components_tenant_isolation
  ON editor_reusable_components
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

CREATE POLICY editor_page_leases_tenant_isolation
  ON editor_page_leases
  FOR ALL
  USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid);

COMMIT;
