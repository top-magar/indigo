-- Migration: Add categories table and product slugs
-- This migration adds proper category support and SEO-friendly slugs to products

-- ============================================================================
-- 1. Add missing columns to tenants table
-- ============================================================================
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'NPR',
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Make slug NOT NULL (update any null slugs first)
UPDATE tenants SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
ALTER TABLE tenants ALTER COLUMN slug SET NOT NULL;

-- ============================================================================
-- 2. Create categories table
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for categories
CREATE INDEX IF NOT EXISTS categories_tenant_slug_idx ON categories(tenant_id, slug);
CREATE INDEX IF NOT EXISTS categories_parent_idx ON categories(parent_id);

-- ============================================================================
-- 3. Add missing columns to products table
-- ============================================================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS compare_at_price TEXT,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Generate slugs for existing products
UPDATE products SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;

-- Create indexes for products
CREATE INDEX IF NOT EXISTS products_tenant_slug_idx ON products(tenant_id, slug);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);

-- ============================================================================
-- 4. Enable RLS on categories
-- ============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: Tenants can only see their own categories
CREATE POLICY categories_tenant_isolation ON categories
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant', true))
    WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true));

-- ============================================================================
-- 5. Create trigger for updated_at on categories
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Grant permissions to app_user
-- ============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO app_user;
