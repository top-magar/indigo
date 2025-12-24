-- Store Page Builder Schema
-- Enables merchants to customize their storefront pages with drag-and-drop blocks

-- =====================================================
-- STORE PAGES TABLE
-- =====================================================
CREATE TABLE store_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  page_type VARCHAR(50) DEFAULT 'custom' CHECK (page_type IN ('home', 'about', 'contact', 'custom', 'landing')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_homepage BOOLEAN DEFAULT false,
  meta_title VARCHAR(255),
  meta_description TEXT,
  blocks JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- =====================================================
-- STORE PAGE VERSIONS (for undo/redo and history)
-- =====================================================
CREATE TABLE store_page_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES store_pages(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  blocks JSONB NOT NULL,
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, version_number)
);

-- =====================================================
-- GLOBAL STORE THEME SETTINGS
-- =====================================================
CREATE TABLE store_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  theme_name VARCHAR(100) DEFAULT 'default',
  colors JSONB DEFAULT '{
    "primary": "#000000",
    "secondary": "#ffffff",
    "accent": "#3b82f6",
    "background": "#ffffff",
    "foreground": "#000000",
    "muted": "#f4f4f5",
    "mutedForeground": "#71717a"
  }',
  typography JSONB DEFAULT '{
    "headingFont": "Inter",
    "bodyFont": "Inter",
    "baseFontSize": 16
  }',
  layout JSONB DEFAULT '{
    "maxWidth": "1280px",
    "headerStyle": "default",
    "footerStyle": "default"
  }',
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REUSABLE BLOCK TEMPLATES (saved blocks for reuse)
-- =====================================================
CREATE TABLE store_block_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  block_type VARCHAR(100) NOT NULL,
  block_data JSONB NOT NULL,
  thumbnail_url TEXT,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_store_pages_tenant ON store_pages(tenant_id);
CREATE INDEX idx_store_pages_slug ON store_pages(tenant_id, slug);
CREATE INDEX idx_store_pages_status ON store_pages(tenant_id, status);
CREATE INDEX idx_store_pages_homepage ON store_pages(tenant_id, is_homepage) WHERE is_homepage = true;
CREATE INDEX idx_store_page_versions_page ON store_page_versions(page_id);
CREATE INDEX idx_store_block_templates_tenant ON store_block_templates(tenant_id);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_store_pages_updated_at 
  BEFORE UPDATE ON store_pages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_themes_updated_at 
  BEFORE UPDATE ON store_themes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_block_templates_updated_at 
  BEFORE UPDATE ON store_block_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENSURE ONLY ONE HOMEPAGE PER TENANT
-- =====================================================
CREATE OR REPLACE FUNCTION ensure_single_homepage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_homepage = true THEN
    UPDATE store_pages 
    SET is_homepage = false 
    WHERE tenant_id = NEW.tenant_id 
      AND id != NEW.id 
      AND is_homepage = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_homepage_trigger
  BEFORE INSERT OR UPDATE ON store_pages
  FOR EACH ROW
  WHEN (NEW.is_homepage = true)
  EXECUTE FUNCTION ensure_single_homepage();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE store_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_block_templates ENABLE ROW LEVEL SECURITY;

-- Policies for store_pages
CREATE POLICY "Users can view their tenant's pages"
  ON store_pages FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert pages for their tenant"
  ON store_pages FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their tenant's pages"
  ON store_pages FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their tenant's pages"
  ON store_pages FOR DELETE
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Public can view published pages
CREATE POLICY "Public can view published pages"
  ON store_pages FOR SELECT
  USING (status = 'published');

-- Policies for store_page_versions
CREATE POLICY "Users can manage their tenant's page versions"
  ON store_page_versions FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Policies for store_themes
CREATE POLICY "Users can manage their tenant's theme"
  ON store_themes FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Public can view themes"
  ON store_themes FOR SELECT
  USING (true);

-- Policies for store_block_templates
CREATE POLICY "Users can manage their tenant's block templates"
  ON store_block_templates FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- =====================================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- =====================================================
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  UNIQUE(tenant_id, email)
);

CREATE INDEX idx_newsletter_subscribers_tenant ON newsletter_subscribers(tenant_id);
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(tenant_id, email);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Public can subscribe to newsletters"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can manage their tenant's subscribers"
  ON newsletter_subscribers FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their tenant's subscribers"
  ON newsletter_subscribers FOR DELETE
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- =====================================================
-- CONTACT FORM SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived'))
);

CREATE INDEX idx_contact_submissions_tenant ON contact_submissions(tenant_id);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(tenant_id, status);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's submissions"
  ON contact_submissions FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Public can submit contact forms"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their tenant's submissions"
  ON contact_submissions FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their tenant's submissions"
  ON contact_submissions FOR DELETE
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));
