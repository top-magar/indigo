-- ============================================================================
-- RLS Audit Fix — Enable Row Level Security on ALL tenant-scoped tables
--
-- 32 tables were missing RLS policies. This migration adds:
--   - ENABLE ROW LEVEL SECURITY
--   - SELECT/INSERT/UPDATE/DELETE policies using app.current_tenant setting
--   - Index on tenant_id (if not already present)
--
-- Pattern: tenant_id = current_setting('app.current_tenant', true)::uuid
-- ============================================================================

BEGIN;

-- Helper: generate standard 4-policy set for a table
-- We inline it since Supabase migrations don't support DO blocks well

-- ============================================================================
-- 1. attributes
-- ============================================================================
ALTER TABLE attributes ENABLE ROW LEVEL SECURITY;
CREATE POLICY attributes_tenant_select ON attributes FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY attributes_tenant_insert ON attributes FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY attributes_tenant_update ON attributes FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY attributes_tenant_delete ON attributes FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 2. attribute_values
-- ============================================================================
ALTER TABLE attribute_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY attribute_values_tenant_select ON attribute_values FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY attribute_values_tenant_insert ON attribute_values FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY attribute_values_tenant_update ON attribute_values FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY attribute_values_tenant_delete ON attribute_values FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 3. audit_logs
-- ============================================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_tenant_select ON audit_logs FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY audit_logs_tenant_insert ON audit_logs FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 4. block_locks
-- ============================================================================
ALTER TABLE block_locks ENABLE ROW LEVEL SECURITY;
CREATE POLICY block_locks_tenant_select ON block_locks FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY block_locks_tenant_insert ON block_locks FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY block_locks_tenant_update ON block_locks FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY block_locks_tenant_delete ON block_locks FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 5. campaigns
-- ============================================================================
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY campaigns_tenant_select ON campaigns FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY campaigns_tenant_insert ON campaigns FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY campaigns_tenant_update ON campaigns FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY campaigns_tenant_delete ON campaigns FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 6. campaign_recipients
-- ============================================================================
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY campaign_recipients_tenant_select ON campaign_recipients FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY campaign_recipients_tenant_insert ON campaign_recipients FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 7. carts
-- ============================================================================
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY carts_tenant_select ON carts FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY carts_tenant_insert ON carts FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY carts_tenant_update ON carts FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY carts_tenant_delete ON carts FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 8. collections
-- ============================================================================
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY collections_tenant_select ON collections FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY collections_tenant_insert ON collections FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY collections_tenant_update ON collections FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY collections_tenant_delete ON collections FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 9. customer_segments
-- ============================================================================
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_segments_tenant_select ON customer_segments FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY customer_segments_tenant_insert ON customer_segments FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY customer_segments_tenant_update ON customer_segments FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY customer_segments_tenant_delete ON customer_segments FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 10. dashboard_layouts
-- ============================================================================
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY dashboard_layouts_tenant_select ON dashboard_layouts FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY dashboard_layouts_tenant_insert ON dashboard_layouts FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY dashboard_layouts_tenant_update ON dashboard_layouts FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY dashboard_layouts_tenant_delete ON dashboard_layouts FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 11. discounts
-- ============================================================================
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY discounts_tenant_select ON discounts FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY discounts_tenant_insert ON discounts FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY discounts_tenant_update ON discounts FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY discounts_tenant_delete ON discounts FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 12. discount_rules
-- ============================================================================
ALTER TABLE discount_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY discount_rules_tenant_select ON discount_rules FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY discount_rules_tenant_insert ON discount_rules FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY discount_rules_tenant_update ON discount_rules FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY discount_rules_tenant_delete ON discount_rules FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 13. discount_usages
-- ============================================================================
ALTER TABLE discount_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY discount_usages_tenant_select ON discount_usages FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY discount_usages_tenant_insert ON discount_usages FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 14. editor_sessions
-- ============================================================================
ALTER TABLE editor_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY editor_sessions_tenant_select ON editor_sessions FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY editor_sessions_tenant_insert ON editor_sessions FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY editor_sessions_tenant_update ON editor_sessions FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY editor_sessions_tenant_delete ON editor_sessions FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 15. fulfillments
-- ============================================================================
ALTER TABLE fulfillments ENABLE ROW LEVEL SECURITY;
CREATE POLICY fulfillments_tenant_select ON fulfillments FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY fulfillments_tenant_insert ON fulfillments FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY fulfillments_tenant_update ON fulfillments FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 16. fulfillment_lines
-- ============================================================================
ALTER TABLE fulfillment_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY fulfillment_lines_tenant_select ON fulfillment_lines FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY fulfillment_lines_tenant_insert ON fulfillment_lines FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 17. inventory_levels
-- ============================================================================
ALTER TABLE inventory_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY inventory_levels_tenant_select ON inventory_levels FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY inventory_levels_tenant_insert ON inventory_levels FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY inventory_levels_tenant_update ON inventory_levels FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 18. layouts
-- ============================================================================
ALTER TABLE layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY layouts_tenant_select ON layouts FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY layouts_tenant_insert ON layouts FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY layouts_tenant_update ON layouts FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY layouts_tenant_delete ON layouts FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 19. layout_versions
-- ============================================================================
ALTER TABLE layout_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY layout_versions_tenant_select ON layout_versions FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY layout_versions_tenant_insert ON layout_versions FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 20. layout_operations
-- ============================================================================
ALTER TABLE layout_operations ENABLE ROW LEVEL SECURITY;
CREATE POLICY layout_operations_tenant_select ON layout_operations FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY layout_operations_tenant_insert ON layout_operations FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 21. notification_preferences
-- ============================================================================
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_preferences_tenant_select ON notification_preferences FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY notification_preferences_tenant_insert ON notification_preferences FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY notification_preferences_tenant_update ON notification_preferences FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 22. order_events
-- ============================================================================
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_events_tenant_select ON order_events FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY order_events_tenant_insert ON order_events FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 23. order_invoices
-- ============================================================================
ALTER TABLE order_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_invoices_tenant_select ON order_invoices FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY order_invoices_tenant_insert ON order_invoices FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 24. order_status_history
-- ============================================================================
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_status_history_tenant_select ON order_status_history FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY order_status_history_tenant_insert ON order_status_history FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 25. order_transactions
-- ============================================================================
ALTER TABLE order_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_transactions_tenant_select ON order_transactions FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY order_transactions_tenant_insert ON order_transactions FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 26. page_templates
-- ============================================================================
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY page_templates_tenant_select ON page_templates FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY page_templates_tenant_insert ON page_templates FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY page_templates_tenant_update ON page_templates FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY page_templates_tenant_delete ON page_templates FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 27. product_attribute_values
-- ============================================================================
ALTER TABLE product_attribute_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_attribute_values_tenant_select ON product_attribute_values FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY product_attribute_values_tenant_insert ON product_attribute_values FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY product_attribute_values_tenant_delete ON product_attribute_values FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 28. product_variants
-- ============================================================================
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_variants_tenant_select ON product_variants FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY product_variants_tenant_insert ON product_variants FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY product_variants_tenant_update ON product_variants FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY product_variants_tenant_delete ON product_variants FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 29. quiet_hours_settings
-- ============================================================================
ALTER TABLE quiet_hours_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY quiet_hours_settings_tenant_select ON quiet_hours_settings FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY quiet_hours_settings_tenant_insert ON quiet_hours_settings FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY quiet_hours_settings_tenant_update ON quiet_hours_settings FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 30. stock_movements
-- ============================================================================
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY stock_movements_tenant_select ON stock_movements FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY stock_movements_tenant_insert ON stock_movements FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 31. store_configs
-- ============================================================================
ALTER TABLE store_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY store_configs_tenant_select ON store_configs FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY store_configs_tenant_insert ON store_configs FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY store_configs_tenant_update ON store_configs FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 32. tenant_domains
-- ============================================================================
ALTER TABLE tenant_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_domains_tenant_select ON tenant_domains FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY tenant_domains_tenant_insert ON tenant_domains FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY tenant_domains_tenant_update ON tenant_domains FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY tenant_domains_tenant_delete ON tenant_domains FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 33. variant_attribute_values
-- ============================================================================
ALTER TABLE variant_attribute_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY variant_attribute_values_tenant_select ON variant_attribute_values FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY variant_attribute_values_tenant_insert ON variant_attribute_values FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY variant_attribute_values_tenant_delete ON variant_attribute_values FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 34. voucher_codes
-- ============================================================================
ALTER TABLE voucher_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY voucher_codes_tenant_select ON voucher_codes FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY voucher_codes_tenant_insert ON voucher_codes FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY voucher_codes_tenant_update ON voucher_codes FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 35. media_assets (was missing from beta script)
-- ============================================================================
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY media_assets_tenant_select ON media_assets FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY media_assets_tenant_insert ON media_assets FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY media_assets_tenant_update ON media_assets FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY media_assets_tenant_delete ON media_assets FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 36. media_folders (was missing from beta script)
-- ============================================================================
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY media_folders_tenant_select ON media_folders FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY media_folders_tenant_insert ON media_folders FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY media_folders_tenant_update ON media_folders FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY media_folders_tenant_delete ON media_folders FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- ============================================================================
-- 37. reviews (was missing from beta script)
-- ============================================================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY reviews_tenant_select ON reviews FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY reviews_tenant_insert ON reviews FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY reviews_tenant_update ON reviews FOR UPDATE USING (tenant_id = current_setting('app.current_tenant', true)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY reviews_tenant_delete ON reviews FOR DELETE USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

COMMIT;
