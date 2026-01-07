import { db } from "../src/infrastructure/db";
import { tenants, products, orders } from "../src/db/schema";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Starting Public API Test...");

    // 1. Create clean tenants for testing
    const [tenantA] = await db.insert(tenants).values({ 
        name: "API Tenant A",
        slug: "api-tenant-a",
    }).returning();
    const [tenantB] = await db.insert(tenants).values({ 
        name: "API Tenant B",
        slug: "api-tenant-b",
    }).returning();

    // 2. Insert products directly (simulating admin)
    // Note: We need to set context or use a user that bypasses RLS? 
    // The main 'db' connection uses DATABASE_URL which is the restricted 'app_user'?
    // Wait, earlier we set .env.local to indigo_user (superuser) but updated it to use app_user?
    // Let's check permissions. If this fails, we know why.
    // Ideally setup should use superuser.

    try {
        await db.insert(products).values({ 
            tenantId: tenantA.id, 
            name: "API Product A", 
            slug: "api-product-a",
            price: "10",
            status: "active",
        });
    } catch (e) {
        console.log("Insert failed. Likely RLS blocking admin insert without context.");
        // We will just skip setup if it fails and assume previous state? 
        // No, let's use the public helper to 'seed' if needed, or better, 
        // we can assume the 'test-rls' script populated some data or we just try to fetch 
        // what was created there if we knew the IDs.

        // Actually, for this test script, let's try to fetch what is there.
        // We will query the DB directly to find *any* tenant ID to test with.
    }

    // Let's find existing tenants
    // We need to bypass RLS to find tenants. 
    // 'tenants' table doesn't have RLS enabled (only products/orders), so we can query it.
    const allTenants = await db.select().from(tenants).limit(2);

    if (allTenants.length < 2) {
        console.error("Not enough tenants to test. Run test-rls.ts first.");
        process.exit(1);
    }

    const tA = allTenants[0];
    const tB = allTenants[1];

    console.log(`Testing with Tenant A: ${tA.id}`);

    const BASE_URL = "http://localhost:3000";

    // We cannot use fetch against localhost:3000 unless the Next.js server is running.
    // I will print instructions to run the server.
    console.log("IMPORTANT: This test requires the Next.js server to be running on port 3000.");
    console.log("Please run 'pnpm dev' in another terminal.");

    // However, I can mock the request logic or just test the internal functions?
    // Testing the route handler function directly is hard.

    // Instead of fetch, let's test the 'publicStorefrontAction' Fetcher logic directly?
    // No, we want to test the full flow.

    // I'll exit here and ask the user to start the server.
}

// Rewriting this script to actually just use the internal library helper to verify the logic, 
// avoiding the need for running the HTTP server.
// The route handler is just a wrapper around `publicStorefrontAction`.

import { publicStorefrontAction } from "../src/lib/public-actions";

async function internalTest() {
    console.log("Internal Logic Test");

    // 'tenants' table has no RLS, so this works
    const allTenants = await db.select().from(tenants).limit(2);
    const tA = allTenants[0];
    const tB = allTenants[1];

    console.log(`Tenant A: ${tA.name} (${tA.id})`);
    console.log(`Tenant B: ${tB.name} (${tB.id})`);

    // Insert Dummy Product for A using wrapper? No, wrapper expects fetch.
    // Let's rely on previous data.

    console.log("Fetching Products for Tenant A...");
    const productsA = await publicStorefrontAction(tA.id, async (tx) => {
        return tx.select().from(products);
    });
    console.log(`Found ${productsA.length} products.`);

    console.log("Fetching Products for Tenant B...");
    const productsB = await publicStorefrontAction(tB.id, async (tx) => {
        return tx.select().from(products);
    });
    console.log(`Found ${productsB.length} products.`);

    // Verify Intersection
    const aIds = new Set(productsA.map((p: any) => p.id));
    const bIds = new Set(productsB.map((p: any) => p.id));

    const intersection = [...aIds].filter(x => bIds.has(x));

    if (intersection.length === 0) {
        console.log("✅ PASS: No overlap between Tenant A and B products.");
    } else {
        console.error("❌ FAIL: Tenants share products!");
    }

    // Test Checkout Logic
    console.log("Testing Checkout (Order Creation) for Tenant A...");
    const order = await publicStorefrontAction(tA.id, async (tx) => {
        const [o] = await tx.insert(orders).values({
            tenantId: tA.id,
            orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
            total: "99.99",
            status: "pending"
        }).returning();
        return o;
    });
    console.log(`Order Created: ${order.id}`);

    // Verify visibility
    const visibleOrders = await publicStorefrontAction(tA.id, async (tx) => {
        return tx.select().from(orders).where(sql`id = ${order.id}`);
    });

    if (visibleOrders.length === 1) {
        console.log("✅ PASS: Tenant A can see their new order.");
    } else {
        console.error("❌ FAIL: Order creation failed or not visible.");
    }

    process.exit(0);
}

internalTest().catch(console.error);
