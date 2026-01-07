-- ============================================================================
-- 040: Dashboard Layouts Row Level Security
-- RLS policies for tenant isolation on dashboard_layouts table
-- Reference: SYSTEM-ARCHITECTURE.md Section 5.3 - Security & Compliance
-- ============================================================================
--
-- This migration enables RLS on the dashboard_layouts table and creates
-- policies to ensure tenants can only access their own dashboard layouts.
--
-- CRITICAL: The application MUST use withTenant() wrapper which sets
-- app.current_tenant before any query.
--
-- Table Structure:
--   - id: uuid (primary key)
--   - tenant_id: uuid (foreign key to tenants)
--   - user_id: text (user identifier within tenant)
--   - layout_name: text
--   - widgets: jsonb
--   - columns, row_height, gap: integer
--   - is_default: boolean
--   - created_at, updated_at: timestamptz
-- ============================================================================

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on dashboard_layouts table
-- This ensures all queries are filtered through the defined policies
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TENANT ISOLATION POLICIES
-- ============================================================================
-- 
-- Pattern: tenant_id = current_setting('app.current_tenant', true)::uuid
-- The 'true' parameter makes it return NULL instead of error if not set.
-- This allows the policy to fail safely (return no rows) if context is missing.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- SELECT Policy: Tenant users can view their tenant's dashboard layouts
-- -----------------------------------------------------------------------------
-- Users can only read dashboard layouts belonging to their tenant.
-- This ensures complete data isolation between tenants.
CREATE POLICY dashboard_layouts_select_policy ON dashboard_layouts
  FOR SELECT
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

COMMENT ON POLICY dashboard_layouts_select_policy ON dashboard_layouts IS 
  'Allows users to view dashboard layouts belonging to their tenant only';

-- -----------------------------------------------------------------------------
-- INSERT Policy: Tenant users can create dashboard layouts for their tenant
-- -----------------------------------------------------------------------------
-- Users can only insert dashboard layouts with their tenant's ID.
-- The WITH CHECK clause ensures the tenant_id matches the current tenant context.
CREATE POLICY dashboard_layouts_insert_policy ON dashboard_layouts
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

COMMENT ON POLICY dashboard_layouts_insert_policy ON dashboard_layouts IS 
  'Allows users to create dashboard layouts for their tenant only';

-- -----------------------------------------------------------------------------
-- UPDATE Policy: Tenant users can update their tenant's dashboard layouts
-- -----------------------------------------------------------------------------
-- Users can only update dashboard layouts belonging to their tenant.
-- Both USING (for row selection) and WITH CHECK (for new values) ensure
-- the tenant_id remains consistent and matches the current tenant context.
CREATE POLICY dashboard_layouts_update_policy ON dashboard_layouts
  FOR UPDATE
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

COMMENT ON POLICY dashboard_layouts_update_policy ON dashboard_layouts IS 
  'Allows users to update dashboard layouts belonging to their tenant only';

-- -----------------------------------------------------------------------------
-- DELETE Policy: Tenant users can delete their tenant's dashboard layouts
-- -----------------------------------------------------------------------------
-- Users can only delete dashboard layouts belonging to their tenant.
-- This prevents accidental or malicious deletion of other tenants' data.
CREATE POLICY dashboard_layouts_delete_policy ON dashboard_layouts
  FOR DELETE
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

COMMENT ON POLICY dashboard_layouts_delete_policy ON dashboard_layouts IS 
  'Allows users to delete dashboard layouts belonging to their tenant only';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify RLS is properly configured:
--
-- Check RLS is enabled:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename = 'dashboard_layouts';
--
-- List all policies on the table:
-- SELECT policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE schemaname = 'public' AND tablename = 'dashboard_layouts';
-- ============================================================================
