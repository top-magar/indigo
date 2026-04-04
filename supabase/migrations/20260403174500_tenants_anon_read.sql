-- Allow anonymous users to read tenant info (needed for public storefront)
CREATE POLICY "anon can view tenants" ON tenants
  FOR SELECT TO anon
  USING (true);

-- Also allow authenticated users to read tenants
CREATE POLICY "authenticated can view tenants" ON tenants
  FOR SELECT TO authenticated
  USING (true);
