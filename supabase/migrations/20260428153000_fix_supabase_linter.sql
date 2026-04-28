-- Fix Supabase linter issues

-- 1. ENABLE RLS
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS platform_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tenant_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS editor_project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES (each in own block so failures are independent)
DO $$ BEGIN CREATE POLICY subscriptions_tenant ON subscriptions FOR ALL USING (tenant_id::text = COALESCE(current_setting('app.current_tenant', true), '')); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY plans_read ON plans FOR SELECT USING (true); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY payments_tenant ON payments FOR ALL USING (tenant_id::text = COALESCE(current_setting('app.current_tenant', true), '')); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY platform_invites_auth ON platform_invites FOR ALL USING (auth.role() = 'authenticated'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY invoices_tenant ON invoices FOR ALL USING (tenant_id::text = COALESCE(current_setting('app.current_tenant', true), '')); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY tenant_kyc_tenant ON tenant_kyc FOR ALL USING (tenant_id::text = COALESCE(current_setting('app.current_tenant', true), '')); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY newsletter_tenant ON newsletter_subscribers FOR ALL USING (tenant_id::text = COALESCE(current_setting('app.current_tenant', true), '')); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY newsletter_anon_insert ON newsletter_subscribers FOR INSERT WITH CHECK (true); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY editor_versions_tenant ON editor_project_versions FOR ALL USING (project_id IN (SELECT id FROM editor_projects WHERE tenant_id::text = COALESCE(current_setting('app.current_tenant', true), ''))); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY reviews_tenant_rw ON reviews FOR ALL USING (tenant_id::text = COALESCE(current_setting('app.current_tenant', true), '')); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY reviews_anon_insert ON reviews FOR INSERT WITH CHECK (true); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY contact_submissions_tenant ON contact_submissions FOR ALL USING (tenant_id::text = COALESCE(current_setting('app.current_tenant', true), '')); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY contact_submissions_anon_insert ON contact_submissions FOR INSERT WITH CHECK (true); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY customer_groups_tenant ON customer_groups FOR ALL USING (tenant_id::text = COALESCE(current_setting('app.current_tenant', true), '')); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY customer_group_members_tenant ON customer_group_members FOR ALL USING (tenant_id::text = COALESCE(current_setting('app.current_tenant', true), '')); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY gift_cards_tenant ON gift_cards FOR ALL USING (tenant_id::text = COALESCE(current_setting('app.current_tenant', true), '')); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 3. REVOKE ANON EXECUTE ON SECURITY DEFINER FUNCTIONS
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION activate_domain(uuid) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION cleanup_abandoned_carts() FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION convert_price(numeric, text, text) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION decrement_product_quantity(uuid, integer) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION get_events_for_retry(uuid, integer) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION get_exchange_rate(text, text) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION get_tenant_asset_count(uuid) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION get_tenant_id() FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION get_tenant_storage_usage(uuid) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION get_user_tenant_id() FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION increment_discount_usage(uuid) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION increment_product_quantity(uuid, integer) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION increment_voucher_code_usage(uuid) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION log_audit_event(uuid, uuid, text, text, uuid, jsonb, jsonb, jsonb) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION log_domain_status_change() FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION mark_event_failed(uuid, text) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION mark_event_processed(uuid) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION resolve_tenant_by_domain(text) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION update_customer_last_login(uuid) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION verify_domain(uuid, text) FROM anon; EXCEPTION WHEN OTHERS THEN NULL; END $$;
-- Dangerous: also revoke from authenticated
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION cleanup_abandoned_carts() FROM authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION get_events_for_retry(uuid, integer) FROM authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION log_audit_event(uuid, uuid, text, text, uuid, jsonb, jsonb, jsonb) FROM authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION mark_event_failed(uuid, text) FROM authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION mark_event_processed(uuid) FROM authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION activate_domain(uuid) FROM authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN REVOKE EXECUTE ON FUNCTION verify_domain(uuid, text) FROM authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 4. SET search_path ON FUNCTIONS
DO $$ BEGIN ALTER FUNCTION decrement_stock SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION get_tenant_id() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION get_exchange_rate(text, text) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION convert_price(numeric, text, text) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
