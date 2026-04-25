/**
 * Seed Platform Admin
 * 
 * Run once after first deploy to create the platform admin account.
 * Uses Supabase Admin API to create auth user + users table row.
 * 
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 * 
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@indigo.store";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me-immediately";

async function seedAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check if admin already exists
  const { data: existing } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("role", "platform_admin")
    .limit(1)
    .single();

  if (existing) {
    console.log(`✅ Platform admin already exists: ${existing.email}`);
    return;
  }

  // Create auth user via Admin API (no email verification needed)
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true, // Skip email verification
    user_metadata: { role: "platform_admin" },
  });

  if (authError) {
    // If user exists in auth but not in users table
    if (authError.message.includes("already been registered")) {
      const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
      const existingAuth = authUsers?.find(u => u.email === ADMIN_EMAIL);
      if (existingAuth) {
        // Just create the users table row
        const { error: insertError } = await supabase.from("users").upsert({
          id: existingAuth.id,
          email: ADMIN_EMAIL,
          full_name: "Platform Admin",
          role: "platform_admin",
          tenant_id: null, // No tenant — platform admin doesn't need one
        });
        if (insertError) {
          console.error("❌ Failed to create users row:", insertError.message);
          process.exit(1);
        }
        console.log(`✅ Platform admin created: ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log(`   ⚠️  Change the password immediately after first login!`);
        return;
      }
    }
    console.error("❌ Failed to create auth user:", authError.message);
    process.exit(1);
  }

  // Create users table row (no tenant_id — admin is platform-level)
  const { error: insertError } = await supabase.from("users").insert({
    id: authUser.user.id,
    email: ADMIN_EMAIL,
    full_name: "Platform Admin",
    role: "platform_admin",
    tenant_id: null,
  });

  if (insertError) {
    console.error("❌ Failed to create users row:", insertError.message);
    process.exit(1);
  }

  console.log(`✅ Platform admin created successfully!`);
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   URL: /login → auto-redirects to /admin`);
  console.log(`   ⚠️  Change the password immediately after first login!`);
}

seedAdmin().catch(console.error);
