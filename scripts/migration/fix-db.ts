
import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!, { ssl: { rejectUnauthorized: false } });

async function main() {
    try {
        console.log("Connecting to DB...");
        
        // 1. Check if tenants exist (connection check)
        const tenants = await sql`SELECT count(*) FROM tenants`;
        console.log("Tenants check:", tenants);

        // 2. Create store_configs
        console.log("Creating store_configs...");
        await sql`
             CREATE TABLE IF NOT EXISTS "store_configs" (
                "id" uuid PRIMARY KEY,
                "tenant_id" uuid NOT NULL,
                "page_type" text NOT NULL,
                "layout" jsonb DEFAULT '{}'::jsonb,
                "is_published" boolean DEFAULT false,
                "published_at" timestamp,
                "draft_layout" jsonb,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL
             )
        `;
        console.log("Created table store_configs");

        // 3. Create Index
        await sql`
             CREATE INDEX IF NOT EXISTS "store_configs_tenant_page_idx" ON "store_configs" ("tenant_id", "page_type")
        `;
        console.log("Created index");

        // 4. Verify
        const configs = await sql`SELECT count(*) FROM store_configs`;
        console.log("Store Configs count:", configs);
        
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await sql.end();
    }
}

main();
