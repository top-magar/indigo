-- Add RLS to core commerce tables that were missing
-- These tables contain tenant-scoped data and MUST have row-level security

-- Helper: get tenant_id from the authenticated user
CREATE OR REPLACE FUNCTION public.get_tenant_id() RETURNS uuid AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PRODUCTS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    CREATE POLICY products_select ON products FOR SELECT
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    CREATE POLICY products_insert ON products FOR INSERT
  WITH CHECK (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    CREATE POLICY products_update ON products FOR UPDATE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    CREATE POLICY products_delete ON products FOR DELETE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;

-- ============================================================
-- ORDERS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    CREATE POLICY orders_select ON orders FOR SELECT
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    CREATE POLICY orders_insert ON orders FOR INSERT
  WITH CHECK (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    CREATE POLICY orders_update ON orders FOR UPDATE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    CREATE POLICY orders_delete ON orders FOR DELETE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;

-- ============================================================
-- ORDER_ITEMS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
    ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
    CREATE POLICY order_items_select ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE tenant_id = public.get_tenant_id()));
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
    CREATE POLICY order_items_insert ON order_items FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM orders WHERE tenant_id = public.get_tenant_id()));
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
    CREATE POLICY order_items_update ON order_items FOR UPDATE
  USING (order_id IN (SELECT id FROM orders WHERE tenant_id = public.get_tenant_id()));
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
    CREATE POLICY order_items_delete ON order_items FOR DELETE
  USING (order_id IN (SELECT id FROM orders WHERE tenant_id = public.get_tenant_id()));
  END IF;
END $$;

-- ============================================================
-- CUSTOMERS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    CREATE POLICY customers_select ON customers FOR SELECT
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    CREATE POLICY customers_insert ON customers FOR INSERT
  WITH CHECK (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    CREATE POLICY customers_update ON customers FOR UPDATE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    CREATE POLICY customers_delete ON customers FOR DELETE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;

-- ============================================================
-- CATEGORIES
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
    ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
    CREATE POLICY categories_select ON categories FOR SELECT
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
    CREATE POLICY categories_insert ON categories FOR INSERT
  WITH CHECK (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
    CREATE POLICY categories_update ON categories FOR UPDATE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
    CREATE POLICY categories_delete ON categories FOR DELETE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;

-- ============================================================
-- PAGES
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages') THEN
    ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages') THEN
    CREATE POLICY pages_select ON pages FOR SELECT
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages') THEN
    CREATE POLICY pages_insert ON pages FOR INSERT
  WITH CHECK (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages') THEN
    CREATE POLICY pages_update ON pages FOR UPDATE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages') THEN
    CREATE POLICY pages_delete ON pages FOR DELETE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;

-- ============================================================
-- ADDRESSES
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'addresses') THEN
    ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'addresses') THEN
    CREATE POLICY addresses_select ON addresses FOR SELECT
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'addresses') THEN
    CREATE POLICY addresses_insert ON addresses FOR INSERT
  WITH CHECK (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'addresses') THEN
    CREATE POLICY addresses_update ON addresses FOR UPDATE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'addresses') THEN
    CREATE POLICY addresses_delete ON addresses FOR DELETE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;

-- ============================================================
-- GIFT_CARDS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gift_cards') THEN
    ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gift_cards') THEN
    CREATE POLICY gift_cards_select ON gift_cards FOR SELECT
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gift_cards') THEN
    CREATE POLICY gift_cards_insert ON gift_cards FOR INSERT
  WITH CHECK (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gift_cards') THEN
    CREATE POLICY gift_cards_update ON gift_cards FOR UPDATE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gift_cards') THEN
    CREATE POLICY gift_cards_delete ON gift_cards FOR DELETE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;

-- ============================================================
-- CUSTOMER_GROUPS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_groups') THEN
    ALTER TABLE customer_groups ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_groups') THEN
    CREATE POLICY customer_groups_select ON customer_groups FOR SELECT
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_groups') THEN
    CREATE POLICY customer_groups_insert ON customer_groups FOR INSERT
  WITH CHECK (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_groups') THEN
    CREATE POLICY customer_groups_update ON customer_groups FOR UPDATE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_groups') THEN
    CREATE POLICY customer_groups_delete ON customer_groups FOR DELETE
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;

-- ============================================================
-- CONTACT_SUBMISSIONS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_submissions') THEN
    ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Contact submissions are public-write (storefront), tenant-read (dashboard)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_submissions') THEN
    CREATE POLICY contact_submissions_select ON contact_submissions FOR SELECT
  USING (tenant_id = public.get_tenant_id());
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_submissions') THEN
    CREATE POLICY contact_submissions_insert ON contact_submissions FOR INSERT
  WITH CHECK (true);
  END IF;
END $$;
