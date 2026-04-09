/**
 * Check RLS status and policies in the database
 */
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL!);

async function check() {
    console.log("🔍 Checking RLS Status...\n");

    // Check if RLS is enabled
    const rlsStatus = await client`
        select tablename, rowsecurity 
        from pg_tables 
        where schemaname = 'public' 
        and tablename in ('products', 'orders', 'carts', 'tenants', 'categories')
    `;
    console.log("RLS Enabled Status:");
    rlsStatus.forEach(row => {
        console.log(`  ${row.tablename}: ${row.rowsecurity ? "✅ enabled" : "❌ disabled"}`);
    });

    // Check policies
    const policies = await client`
        select tablename, policyname, cmd, qual::text as using_clause
        from pg_policies 
        where schemaname = 'public'
        and tablename in ('products', 'orders', 'carts', 'categories')
        order by tablename, policyname
    `;
    console.log("\nRLS Policies:");
    if (policies.length === 0) {
        console.log("  ⚠️  No policies found!");
    } else {
        policies.forEach(row => {
            console.log(`  ${row.tablename}.${row.policyname} (${row.cmd})`);
            console.log(`    USING: ${row.using_clause?.substring(0, 100)}...`);
        });
    }

    // Check current user and privileges
    const user = await client`select current_user, session_user`;
    console.log("\nDatabase User:", user[0]);

    // Check if user has BYPASSRLS
    const bypassCheck = await client`
        select rolname, rolbypassrls 
        from pg_roles 
        where rolname = current_user
    `;
    console.log("BYPASSRLS:", bypassCheck[0]?.rolbypassrls ? "⚠️  YES (RLS bypassed!)" : "✅ NO");

    await client.end();
}

check().catch(console.error);
