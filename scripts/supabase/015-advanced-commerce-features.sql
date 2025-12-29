-- =====================================================
-- ADVANCED COMMERCE FEATURES MIGRATION
-- Adds: Product Variants, Shipping Zones, Multi-Currency,
--       Returns/Refunds, Product Tags, Customer Groups
-- =====================================================

-- =====================================================
-- 1. PRODUCT OPTIONS (Size, Color, Material, etc.)
-- =====================================================
CREATE TABLE product_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- e.g., "Size", "Color"
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, name)
);

-- =====================================================
-- 2. PRODUCT OPTION VALUES (S, M, L, Red, Blue, etc.)
-- =====================================================
CREATE TABLE product_option_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
  value VARCHAR(100) NOT NULL, -- e.g., "Small", "Red"
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(option_id, value)
);

-- =====================================================
-- 3. PRODUCT VARIANTS (Specific combinations)
-- =====================================================
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL, -- e.g., "Small / Red"
  sku VARCHAR(100),
  barcode VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2),
  quantity INTEGER DEFAULT 0,
  weight DECIMAL(10, 2),
  weight_unit VARCHAR(10) DEFAULT 'kg',
  requires_shipping BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, sku) -- SKU must be unique per tenant
);

-- =====================================================
-- 4. VARIANT OPTION VALUES (Links variants to options)
-- =====================================================
CREATE TABLE variant_option_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  option_value_id UUID NOT NULL REFERENCES product_option_values(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(variant_id, option_value_id)
);

-- =====================================================
-- 5. PRODUCT TAGS
-- =====================================================
CREATE TABLE product_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE TABLE product_tag_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES product_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, tag_id)
);

-- =====================================================
-- 6. CURRENCIES (Supported currencies per tenant)
-- =====================================================
CREATE TABLE currencies (
  code VARCHAR(3) PRIMARY KEY, -- ISO 4217 code
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  decimal_places INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true
);

-- Insert common currencies
INSERT INTO currencies (code, name, symbol, decimal_places) VALUES
  ('USD', 'US Dollar', '$', 2),
  ('EUR', 'Euro', '€', 2),
  ('GBP', 'British Pound', '£', 2),
  ('CAD', 'Canadian Dollar', 'CA$', 2),
  ('AUD', 'Australian Dollar', 'A$', 2),
  ('JPY', 'Japanese Yen', '¥', 0),
  ('CNY', 'Chinese Yuan', '¥', 2),
  ('INR', 'Indian Rupee', '₹', 2),
  ('BRL', 'Brazilian Real', 'R$', 2),
  ('MXN', 'Mexican Peso', 'MX$', 2),
  ('NPR', 'Nepalese Rupee', 'रू', 2)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 7. TENANT CURRENCIES (Multi-currency per store)
-- =====================================================
CREATE TABLE tenant_currencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  currency_code VARCHAR(3) NOT NULL REFERENCES currencies(code),
  exchange_rate DECIMAL(12, 6) DEFAULT 1.0, -- Rate relative to base currency
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, currency_code)
);

-- =====================================================
-- 8. PRODUCT PRICES (Multi-currency pricing)
-- =====================================================
CREATE TABLE product_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  currency_code VARCHAR(3) NOT NULL REFERENCES currencies(code),
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (product_id IS NOT NULL OR variant_id IS NOT NULL),
  UNIQUE(product_id, variant_id, currency_code)
);

-- =====================================================
-- 9. SHIPPING ZONES
-- =====================================================
CREATE TABLE shipping_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- e.g., "Domestic", "International"
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. SHIPPING ZONE COUNTRIES
-- =====================================================
CREATE TABLE shipping_zone_countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  country_code VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
  country_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(zone_id, country_code)
);

-- =====================================================
-- 11. SHIPPING RATES
-- =====================================================
CREATE TABLE shipping_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- e.g., "Standard Shipping", "Express"
  description TEXT,
  rate_type VARCHAR(20) DEFAULT 'flat' CHECK (rate_type IN ('flat', 'weight', 'price', 'item')),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Base price
  min_weight DECIMAL(10, 2), -- For weight-based
  max_weight DECIMAL(10, 2),
  min_order_total DECIMAL(10, 2), -- For price-based
  max_order_total DECIMAL(10, 2),
  price_per_kg DECIMAL(10, 2), -- Additional per kg
  price_per_item DECIMAL(10, 2), -- Additional per item
  free_shipping_threshold DECIMAL(10, 2), -- Free shipping above this
  estimated_days_min INTEGER,
  estimated_days_max INTEGER,
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 12. CUSTOMER GROUPS
-- =====================================================
CREATE TABLE customer_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5, 2) DEFAULT 0, -- Group discount
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

CREATE TABLE customer_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES customer_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, group_id)
);

-- =====================================================
-- 13. RETURNS & REFUNDS
-- =====================================================
CREATE TABLE returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  return_number VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'requested' CHECK (status IN (
    'requested', 'approved', 'rejected', 'received', 
    'processing', 'refunded', 'completed', 'cancelled'
  )),
  reason VARCHAR(100), -- e.g., "defective", "wrong_item", "not_as_described"
  customer_notes TEXT,
  admin_notes TEXT,
  refund_amount DECIMAL(10, 2),
  refund_method VARCHAR(50) DEFAULT 'original' CHECK (refund_method IN ('original', 'store_credit', 'manual')),
  shipping_paid_by VARCHAR(20) DEFAULT 'customer' CHECK (shipping_paid_by IN ('customer', 'store')),
  tracking_number VARCHAR(100),
  received_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, return_number)
);

CREATE TABLE return_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  reason VARCHAR(100),
  condition VARCHAR(50) DEFAULT 'unopened' CHECK (condition IN ('unopened', 'opened', 'damaged', 'defective')),
  refund_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 14. STORE CREDITS
-- =====================================================
CREATE TABLE store_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  balance DECIMAL(10, 2) NOT NULL,
  currency_code VARCHAR(3) DEFAULT 'USD',
  reason VARCHAR(100), -- e.g., "return_refund", "promotion", "manual"
  source_type VARCHAR(50), -- e.g., "return", "order", "manual"
  source_id UUID, -- Reference to return or order
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE store_credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_credit_id UUID NOT NULL REFERENCES store_credits(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit')),
  amount DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 15. UPDATE ORDER_ITEMS FOR VARIANTS
-- =====================================================
ALTER TABLE order_items 
  ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS variant_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]';

-- =====================================================
-- 16. ADD has_variants TO PRODUCTS
-- =====================================================
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS vendor VARCHAR(255),
  ADD COLUMN IF NOT EXISTS product_type VARCHAR(100);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_product_options_product ON product_options(product_id);
CREATE INDEX idx_product_option_values_option ON product_option_values(option_id);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(tenant_id, sku);
CREATE INDEX idx_variant_option_values_variant ON variant_option_values(variant_id);
CREATE INDEX idx_product_tags_tenant ON product_tags(tenant_id);
CREATE INDEX idx_product_tag_assignments_product ON product_tag_assignments(product_id);
CREATE INDEX idx_tenant_currencies_tenant ON tenant_currencies(tenant_id);
CREATE INDEX idx_product_prices_product ON product_prices(product_id);
CREATE INDEX idx_product_prices_variant ON product_prices(variant_id);
CREATE INDEX idx_shipping_zones_tenant ON shipping_zones(tenant_id);
CREATE INDEX idx_shipping_zone_countries_zone ON shipping_zone_countries(zone_id);
CREATE INDEX idx_shipping_rates_zone ON shipping_rates(zone_id);
CREATE INDEX idx_customer_groups_tenant ON customer_groups(tenant_id);
CREATE INDEX idx_customer_group_members_customer ON customer_group_members(customer_id);
CREATE INDEX idx_returns_tenant ON returns(tenant_id);
CREATE INDEX idx_returns_order ON returns(order_id);
CREATE INDEX idx_returns_status ON returns(tenant_id, status);
CREATE INDEX idx_return_items_return ON return_items(return_id);
CREATE INDEX idx_store_credits_customer ON store_credits(customer_id);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_product_options_updated_at BEFORE UPDATE ON product_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_currencies_updated_at BEFORE UPDATE ON tenant_currencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_prices_updated_at BEFORE UPDATE ON product_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipping_zones_updated_at BEFORE UPDATE ON shipping_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipping_rates_updated_at BEFORE UPDATE ON shipping_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_groups_updated_at BEFORE UPDATE ON customer_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_returns_updated_at BEFORE UPDATE ON returns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_credits_updated_at BEFORE UPDATE ON store_credits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTION: Generate Return Number
-- =====================================================
CREATE OR REPLACE FUNCTION generate_return_number(p_tenant_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
  v_count INTEGER;
  v_number VARCHAR(50);
BEGIN
  SELECT COUNT(*) + 1 INTO v_count FROM returns WHERE tenant_id = p_tenant_id;
  v_number := 'RET-' || LPAD(v_count::TEXT, 6, '0');
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- HELPER FUNCTION: Calculate Shipping Cost
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_shipping_cost(
  p_rate_id UUID,
  p_order_total DECIMAL,
  p_total_weight DECIMAL,
  p_item_count INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
  v_rate shipping_rates%ROWTYPE;
  v_cost DECIMAL := 0;
BEGIN
  SELECT * INTO v_rate FROM shipping_rates WHERE id = p_rate_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Check free shipping threshold
  IF v_rate.free_shipping_threshold IS NOT NULL AND p_order_total >= v_rate.free_shipping_threshold THEN
    RETURN 0;
  END IF;
  
  -- Base price
  v_cost := v_rate.price;
  
  -- Add weight-based cost
  IF v_rate.rate_type = 'weight' AND v_rate.price_per_kg IS NOT NULL THEN
    v_cost := v_cost + (p_total_weight * v_rate.price_per_kg);
  END IF;
  
  -- Add item-based cost
  IF v_rate.rate_type = 'item' AND v_rate.price_per_item IS NOT NULL THEN
    v_cost := v_cost + (p_item_count * v_rate.price_per_item);
  END IF;
  
  RETURN v_cost;
END;
$$ LANGUAGE plpgsql;
