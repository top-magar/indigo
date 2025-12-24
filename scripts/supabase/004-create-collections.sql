-- Collections table for organizing products
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    type VARCHAR(20) DEFAULT 'manual' CHECK (type IN ('manual', 'automatic')),
    conditions JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

-- Collection products junction table
CREATE TABLE IF NOT EXISTS collection_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, product_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_collections_tenant_id ON collections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_collections_is_active ON collections(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_collections_sort_order ON collections(tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_collection_products_collection_id ON collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_product_id ON collection_products(product_id);

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collections
CREATE POLICY "Users can view their tenant's collections"
    ON collections FOR SELECT
    USING (tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert collections for their tenant"
    ON collections FOR INSERT
    WITH CHECK (tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update their tenant's collections"
    ON collections FOR UPDATE
    USING (tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can delete their tenant's collections"
    ON collections FOR DELETE
    USING (tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
    ));

-- RLS Policies for collection_products
CREATE POLICY "Users can view collection products for their tenant"
    ON collection_products FOR SELECT
    USING (collection_id IN (
        SELECT id FROM collections WHERE tenant_id IN (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can insert collection products for their tenant"
    ON collection_products FOR INSERT
    WITH CHECK (collection_id IN (
        SELECT id FROM collections WHERE tenant_id IN (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can update collection products for their tenant"
    ON collection_products FOR UPDATE
    USING (collection_id IN (
        SELECT id FROM collections WHERE tenant_id IN (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can delete collection products for their tenant"
    ON collection_products FOR DELETE
    USING (collection_id IN (
        SELECT id FROM collections WHERE tenant_id IN (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    ));

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_collections_updated_at();
