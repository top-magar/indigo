-- Enable Row Level Security for Multi-Tenant Isolation

-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Get current user's tenant_id
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT tenant_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TENANTS POLICIES
-- =====================================================
CREATE POLICY "Users can view own tenant" ON tenants
  FOR SELECT USING (id = get_user_tenant_id());

CREATE POLICY "Users can update own tenant" ON tenants
  FOR UPDATE USING (id = get_user_tenant_id());

CREATE POLICY "Allow tenant creation" ON tenants
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- USERS POLICIES
-- =====================================================
CREATE POLICY "Users can view tenant users" ON users
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Allow user creation" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- =====================================================
-- CATEGORIES POLICIES
-- =====================================================
CREATE POLICY "Users can view tenant categories" ON categories
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can insert tenant categories" ON categories
  FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update tenant categories" ON categories
  FOR UPDATE USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can delete tenant categories" ON categories
  FOR DELETE USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (true);

-- =====================================================
-- PRODUCTS POLICIES
-- =====================================================
CREATE POLICY "Users can view tenant products" ON products
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can insert tenant products" ON products
  FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update tenant products" ON products
  FOR UPDATE USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can delete tenant products" ON products
  FOR DELETE USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (status = 'active');

-- =====================================================
-- CUSTOMERS POLICIES
-- =====================================================
CREATE POLICY "Users can view tenant customers" ON customers
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can insert tenant customers" ON customers
  FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update tenant customers" ON customers
  FOR UPDATE USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Public can create customers" ON customers
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- ADDRESSES POLICIES
-- =====================================================
CREATE POLICY "Users can view tenant addresses" ON addresses
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can manage tenant addresses" ON addresses
  FOR ALL USING (tenant_id = get_user_tenant_id());

-- =====================================================
-- ORDERS POLICIES
-- =====================================================
CREATE POLICY "Users can view tenant orders" ON orders
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can insert tenant orders" ON orders
  FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update tenant orders" ON orders
  FOR UPDATE USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Public can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- ORDER ITEMS POLICIES
-- =====================================================
CREATE POLICY "Users can view tenant order items" ON order_items
  FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can manage tenant order items" ON order_items
  FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Public can create order items" ON order_items
  FOR INSERT WITH CHECK (true);
