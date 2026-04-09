-- Unify RLS policies: replace current_setting('app.current_tenant') with get_tenant_id()
-- The current_setting pattern only works with Drizzle's withTenant() which uses superuser (bypasses RLS).
-- get_tenant_id() uses auth.uid() which works with Supabase client JWT tokens.

-- Drop and recreate policies for tables that used the old pattern
-- Only update tables that exist and have the old-style policies

DO $$ 
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'attributes', 'attribute_values', 'audit_logs', 'campaigns', 'campaign_recipients',
    'carts', 'collections', 'customer_segments', 'dashboard_layouts', 'discounts',
    'discount_rules', 'discount_usages', 'editor_sessions', 'fulfillments', 'fulfillment_lines',
    'inventory_levels', 'layouts', 'layout_versions', 'layout_operations',
    'notification_preferences', 'order_events', 'order_invoices', 'order_status_history',
    'order_transactions', 'page_templates', 'product_attribute_values', 'product_variants',
    'quiet_hours_settings', 'stock_movements', 'store_configs', 'tenant_domains',
    'variant_attribute_values', 'voucher_codes', 'media_assets', 'media_folders', 'reviews'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      -- Drop old policies
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_tenant_select', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_tenant_insert', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_tenant_update', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_tenant_delete', t);
      
      -- Create new policies using get_tenant_id()
      EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (tenant_id = public.get_tenant_id())', t || '_select', t);
      EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (tenant_id = public.get_tenant_id())', t || '_insert', t);
      EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE USING (tenant_id = public.get_tenant_id())', t || '_update', t);
      EXECUTE format('CREATE POLICY %I ON %I FOR DELETE USING (tenant_id = public.get_tenant_id())', t || '_delete', t);
    END IF;
  END LOOP;
END $$;
