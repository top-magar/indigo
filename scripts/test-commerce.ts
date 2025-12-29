import { db as mainDb } from "../src/lib/db";
import { tenants, products, orders, orderItems } from "../src/db/schema";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/db/schema";

async function main() {
    console.log("Starting Commerce RLS Test...");

    // 1. Create Tenant A & B
    const [tenantA] = await mainDb.insert(tenants).values({ name: "Tenant A (Commerce)" }).returning();
    const [tenantB] = await mainDb.insert(tenants).values({ name: "Tenant B (Commerce)" }).returning();

    // Setup Restricted Connection
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

    // 2. Create Order for Tenant A
    await withTenant(tenantA.id, async (tx) => {
        const [order] = await tx.insert(orders).values({
            tenantId: tenantA.id,
            totalAmount: "50.00",
            status: "pending"
        }).returning();
        console.log(`Created Order A: ${order.id}`);
    });

    // 3. Create Order for Tenant B
    await withTenant(tenantB.id, async (tx) => {
        const [order] = await tx.insert(orders).values({
            tenantId: tenantB.id,
            totalAmount: "100.00",
            status: "pending"
        }).returning();
        console.log(`Created Order B: ${order.id}`);
    });

    // 4. Verify Visibility
    console.log("\n--- Checking Tenant A Order Visibility ---");
    await withTenant(tenantA.id, async (tx) => {
        const results = await tx.select().from(orders);
        console.log(`Found ${results.length} orders.`);
        if (results.length === 1 && results[0].tenantId === tenantA.id) {
            console.log("✅ PASS: Tenant A sees only their orders.");
        } else {
            console.error(`❌ FAIL: Expected 1 order, found ${results.length}`);
        }
    });

    console.log("\n--- Checking Tenant B Order Visibility ---");
    await withTenant(tenantB.id, async (tx) => {
        const results = await tx.select().from(orders);
        console.log(`Found ${results.length} orders.`);
        if (results.length === 1 && results[0].tenantId === tenantB.id) {
            console.log("✅ PASS: Tenant B sees only their orders.");
        } else {
            console.error(`❌ FAIL: Expected 1 order, found ${results.length}`);
        }
    });

    process.exit(0);
}

main().catch(console.error);
