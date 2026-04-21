-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_editor_projects_tenant ON editor_projects(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_editor_projects_slug ON editor_projects(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_editor_pages_project_slug ON editor_pages(project_id, slug);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_editor_pages_project ON editor_pages(project_id);
CREATE INDEX IF NOT EXISTS idx_editor_projects_published ON editor_projects(published) WHERE published = true;
