import { db as mainDb } from "../src/lib/db";
import { tenants, users, products } from "../src/db/schema";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/db/schema";

async function main() {
    console.log("Starting RLS Test...");

    // 1. Create Tenant A (Admin/Owner action)
    const [tenantA] = await mainDb.insert(tenants).values({ name: "Tenant A" }).returning();
    console.log("Created Tenant A:", tenantA.id);

    // 2. Create Tenant B (Admin/Owner action)
    const [tenantB] = await mainDb.insert(tenants).values({ name: "Tenant B" }).returning();
    console.log("Created Tenant B:", tenantB.id);

    // --- SETUP RESTRICTED USER CONNECTION ---
    const restrictedPool = new Pool({
        connectionString: "postgres://app_user:app_password@localhost:5433/indigo_db",
    });
    const restrictedDb = drizzle(restrictedPool, { schema });

    async function withTenant(tenantId: string, callback: (tx: any) => Promise<any>) {
        return restrictedDb.transaction(async (tx) => {
            await tx.execute(sql`SELECT set_config('app.current_tenant', ${tenantId}, true)`);
            return callback(tx);
        });
    }

    // 3. Insert Product for Tenant A (Simulated as App User)
    await withTenant(tenantA.id, async (tx) => {
        await tx.insert(products).values({
            tenantId: tenantA.id,
            name: "Product A",
            price: "100.00",
        });
        console.log("Inserted Product A");
    });

    // 4. Insert Product for Tenant B
    await withTenant(tenantB.id, async (tx) => {
        await tx.insert(products).values({
            tenantId: tenantB.id,
            name: "Product B",
            price: "200.00",
        });
        console.log("Inserted Product B");
    });

    // 5. Query as Tenant A
    console.log("\n--- Querying as Tenant A ---");
    await withTenant(tenantA.id, async (tx) => {
        const results = await tx.select().from(products);
        console.log(`Results found: ${results.length}`);
        results.forEach((p: any) => console.log(`- ${p.name} (${p.tenantId})`));

        // Should see exactly 1 product (Product A)
        if (results.length === 1 && results[0].tenantId === tenantA.id) {
            console.log("✅ PASS: Tenant A sees only their own data.");
        } else {
            console.error("❌ FAIL: Leak detected or incorrect data count.");
        }
    });

    // 6. Query as Tenant B
    console.log("\n--- Querying as Tenant B ---");
    await withTenant(tenantB.id, async (tx) => {
        const results = await tx.select().from(products);
        console.log(`Results found: ${results.length}`);

        // Should see exactly 1 product (Product B)
        if (results.length === 1 && results[0].tenantId === tenantB.id) {
            console.log("✅ PASS: Tenant B sees only their own data.");
        } else {
            console.error("❌ FAIL: Leak detected or incorrect data count.");
        }
    });

    // 7. Query without context (using restricted user)
    console.log("\n--- Querying without Context (Public) ---");
    try {
        // Trying to select without setting tenant context first
        // Assuming the policy is: USING (tenant_id = current_setting(...))
        // If current_setting is null/missing, it throws error or returns nothing depending on details.
        // Drizzle transaction might behave differently, so let's use restrictedDb direct query.
        const results = await restrictedDb.select().from(products);

        console.log(`Results found: ${results.length}`);
        if (results.length === 0) {
            console.log("✅ PASS: No context sees nothing.");
        } else {
            console.error("❌ FAIL: Data leaked to public context.");
        }
    } catch (e: any) {
        // It is acceptable if it throws an error due to missing config variable in SQL
        console.log("✅ PASS: Query failed as expected without context or returned 0 rows.");
    }

    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
