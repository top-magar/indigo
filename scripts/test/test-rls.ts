/**
 * Comprehensive RLS (Row Level Security) Tests
 * Multitenant SaaS E-Commerce Platform
 * 
 * This test suite verifies tenant isolation across all tenant-scoped tables.
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 5.3
 * @see drizzle/migrations/0001_enable_rls.sql
 * 
 * Test Categories:
 * 1. No Context Access - Queries without tenant context return no rows
 * 2. Correct Context Access - Queries with correct tenant context return expected rows
 * 3. Cross-Tenant Isolation - Tenant A cannot see Tenant B's data
 * 4. withTenant() Wrapper - Validates the wrapper function behavior
 * 5. Insert/Update/Delete Operations - RLS enforced on all operations
 */

import { db, sudoDb, withTenant } from "../src/infrastructure/db";
import { 
    tenants, 
    products, 
    categories,
    orders, 
    orderItems,
    carts, 
    cartItems,
    storeConfigs,
    users,
    productVariants,
    inventoryLevels
} from "../src/db/schema";
import { eq } from "drizzle-orm";

// ============================================
// TEST CONFIGURATION
// ============================================

interface TestResult {
    name: string;
    passed: boolean;
    message: string;
    duration: number;
}

const testResults: TestResult[] = [];
let testTenantA: { id: string; slug: string } | null = null;
let testTenantB: { id: string; slug: string } | null = null;

// Test data IDs for cleanup
const testDataIds = {
    products: [] as string[],
    categories: [] as string[],
    orders: [] as string[],
    orderItems: [] as string[],
    carts: [] as string[],
    cartItems: [] as string[],
    storeConfigs: [] as string[],
    users: [] as string[],
    productVariants: [] as string[],
    inventoryLevels: [] as string[],
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateTestSlug(): string {
    return `rls-test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

async function runTest(
    name: string, 
    testFn: () => Promise<{ passed: boolean; message: string }>
): Promise<void> {
    const startTime = Date.now();
    try {
        const result = await testFn();
        testResults.push({
            name,
            passed: result.passed,
            message: result.message,
            duration: Date.now() - startTime,
        });
    } catch (error) {
        testResults.push({
            name,
            passed: false,
            message: `Exception: ${error instanceof Error ? error.message : String(error)}`,
            duration: Date.now() - startTime,
        });
    }
}

function printResults(): void {
    console.log("\n" + "=".repeat(60));
    console.log("RLS TEST RESULTS");
    console.log("=".repeat(60) + "\n");

    const passed = testResults.filter(r => r.passed).length;
    const failed = testResults.filter(r => !r.passed).length;
    const total = testResults.length;

    testResults.forEach((result, index) => {
        const status = result.passed ? "✅ PASS" : "❌ FAIL";
        console.log(`${index + 1}. ${status}: ${result.name}`);
        if (!result.passed) {
            console.log(`   └─ ${result.message}`);
        }
        console.log(`   └─ Duration: ${result.duration}ms`);
    });

    console.log("\n" + "-".repeat(60));
    console.log(`SUMMARY: ${passed}/${total} tests passed, ${failed} failed`);
    console.log("-".repeat(60) + "\n");
}

// ============================================
// SETUP & TEARDOWN
// ============================================

async function setup(): Promise<void> {
    console.log("🔧 Setting up test data using sudoDb (bypasses RLS)...\n");

    // Create test tenants using sudoDb (bypasses RLS)
    const slugA = generateTestSlug();
    const slugB = generateTestSlug();

    const [tenantAResult] = await sudoDb.insert(tenants).values({
        name: "RLS Test Tenant A",
        slug: slugA,
        currency: "USD",
    }).returning();
    testTenantA = { id: tenantAResult.id, slug: slugA };
    console.log(`   Created Tenant A: ${testTenantA.id}`);

    const [tenantBResult] = await sudoDb.insert(tenants).values({
        name: "RLS Test Tenant B",
        slug: slugB,
        currency: "EUR",
    }).returning();
    testTenantB = { id: tenantBResult.id, slug: slugB };
    console.log(`   Created Tenant B: ${testTenantB.id}`);

    // Create test data for Tenant A
    await createTestDataForTenant(testTenantA.id, "A");
    
    // Create test data for Tenant B
    await createTestDataForTenant(testTenantB.id, "B");

    console.log("\n✅ Setup complete\n");
}

async function createTestDataForTenant(tenantId: string, label: string): Promise<void> {
    // Create category
    const [category] = await sudoDb.insert(categories).values({
        tenantId,
        name: `Test Category ${label}`,
        slug: `test-category-${label.toLowerCase()}-${Date.now()}`,
    }).returning();
    testDataIds.categories.push(category.id);

    // Create products
    const [product1] = await sudoDb.insert(products).values({
        tenantId,
        categoryId: category.id,
        name: `Test Product ${label}-1`,
        slug: `test-product-${label.toLowerCase()}-1-${Date.now()}`,
        price: "99.99",
        status: "active",
    }).returning();
    testDataIds.products.push(product1.id);

    const [product2] = await sudoDb.insert(products).values({
        tenantId,
        categoryId: category.id,
        name: `Test Product ${label}-2`,
        slug: `test-product-${label.toLowerCase()}-2-${Date.now()}`,
        price: "149.99",
        status: "active",
    }).returning();
    testDataIds.products.push(product2.id);

    // Create product variant
    const [variant] = await sudoDb.insert(productVariants).values({
        tenantId,
        productId: product1.id,
        name: `Variant ${label}`,
        sku: `SKU-${label}-${Date.now()}`,
        price: "89.99",
    }).returning();
    testDataIds.productVariants.push(variant.id);

    // Create inventory level
    const [inventory] = await sudoDb.insert(inventoryLevels).values({
        tenantId,
        variantId: variant.id,
        quantity: 100,
        location: "warehouse-1",
    }).returning();
    testDataIds.inventoryLevels.push(inventory.id);

    // Create order
    const [order] = await sudoDb.insert(orders).values({
        tenantId,
        orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
        total: "199.98",
        status: "pending",
        customerEmail: `customer-${label.toLowerCase()}@test.com`,
        customerName: `Test Customer ${label}`,
    }).returning();
    testDataIds.orders.push(order.id);

    // Create order item
    const [orderItem] = await sudoDb.insert(orderItems).values({
        tenantId,
        orderId: order.id,
        variantId: variant.id,
        productName: `Test Product ${label}-1`,
        quantity: 2,
        unitPrice: "99.99",
        totalPrice: "199.98",
    }).returning();
    testDataIds.orderItems.push(orderItem.id);

    // Create cart
    const [cart] = await sudoDb.insert(carts).values({
        tenantId,
        status: "active",
        email: `cart-${label.toLowerCase()}@test.com`,
    }).returning();
    testDataIds.carts.push(cart.id);

    // Create cart item
    const [cartItem] = await sudoDb.insert(cartItems).values({
        cartId: cart.id,
        productId: product1.id,
        variantId: variant.id,
        productName: `Test Product ${label}-1`,
        quantity: 1,
        unitPrice: "99.99",
    }).returning();
    testDataIds.cartItems.push(cartItem.id);

    // Create store config
    const [storeConfig] = await sudoDb.insert(storeConfigs).values({
        tenantId,
        pageType: "home",
        layout: { sections: [], version: 1 },
    }).returning();
    testDataIds.storeConfigs.push(storeConfig.id);

    // Create user
    const [user] = await sudoDb.insert(users).values({
        tenantId,
        email: `user-${label.toLowerCase()}-${Date.now()}@test.com`,
        password: "hashed_password_placeholder",
        role: "owner",
    }).returning();
    testDataIds.users.push(user.id);

    console.log(`   Created test data for Tenant ${label}`);
}

async function cleanup(): Promise<void> {
    console.log("\n🧹 Cleaning up test data...");

    try {
        // Delete in reverse order of dependencies using sudoDb
        for (const id of testDataIds.cartItems) {
            await sudoDb.delete(cartItems).where(eq(cartItems.id, id));
        }
        for (const id of testDataIds.carts) {
            await sudoDb.delete(carts).where(eq(carts.id, id));
        }
        for (const id of testDataIds.orderItems) {
            await sudoDb.delete(orderItems).where(eq(orderItems.id, id));
        }
        for (const id of testDataIds.orders) {
            await sudoDb.delete(orders).where(eq(orders.id, id));
        }
        for (const id of testDataIds.inventoryLevels) {
            await sudoDb.delete(inventoryLevels).where(eq(inventoryLevels.id, id));
        }
        for (const id of testDataIds.productVariants) {
            await sudoDb.delete(productVariants).where(eq(productVariants.id, id));
        }
        for (const id of testDataIds.products) {
            await sudoDb.delete(products).where(eq(products.id, id));
        }
        for (const id of testDataIds.categories) {
            await sudoDb.delete(categories).where(eq(categories.id, id));
        }
        for (const id of testDataIds.storeConfigs) {
            await sudoDb.delete(storeConfigs).where(eq(storeConfigs.id, id));
        }
        for (const id of testDataIds.users) {
            await sudoDb.delete(users).where(eq(users.id, id));
        }

        // Delete test tenants
        if (testTenantA) {
            await sudoDb.delete(tenants).where(eq(tenants.id, testTenantA.id));
        }
        if (testTenantB) {
            await sudoDb.delete(tenants).where(eq(tenants.id, testTenantB.id));
        }

        console.log("✅ Cleanup complete\n");
    } catch (error) {
        console.error("⚠️  Cleanup error:", error);
    }
}

// ============================================
// TEST SUITE 1: NO CONTEXT ACCESS
// ============================================

async function testNoContextAccess(): Promise<void> {
    console.log("\n📋 TEST SUITE 1: No Context Access (RLS blocks without tenant context)\n");

    // Test products table
    await runTest("Products: No context returns empty results", async () => {
        // Query without setting tenant context - should return no rows
        const results = await db.select().from(products);
        return {
            passed: results.length === 0,
            message: results.length === 0 
                ? "No rows returned without context" 
                : `Expected 0 rows, got ${results.length}`,
        };
    });

    // Test orders table
    await runTest("Orders: No context returns empty results", async () => {
        const results = await db.select().from(orders);
        return {
            passed: results.length === 0,
            message: results.length === 0 
                ? "No rows returned without context" 
                : `Expected 0 rows, got ${results.length}`,
        };
    });

    // Test carts table
    await runTest("Carts: No context returns empty results", async () => {
        const results = await db.select().from(carts);
        return {
            passed: results.length === 0,
            message: results.length === 0 
                ? "No rows returned without context" 
                : `Expected 0 rows, got ${results.length}`,
        };
    });

    // Test categories table
    await runTest("Categories: No context returns empty results", async () => {
        const results = await db.select().from(categories);
        return {
            passed: results.length === 0,
            message: results.length === 0 
                ? "No rows returned without context" 
                : `Expected 0 rows, got ${results.length}`,
        };
    });

    // Test store_configs table
    await runTest("StoreConfigs: No context returns empty results", async () => {
        const results = await db.select().from(storeConfigs);
        return {
            passed: results.length === 0,
            message: results.length === 0 
                ? "No rows returned without context" 
                : `Expected 0 rows, got ${results.length}`,
        };
    });

    // Test users table
    await runTest("Users: No context returns empty results", async () => {
        const results = await db.select().from(users);
        return {
            passed: results.length === 0,
            message: results.length === 0 
                ? "No rows returned without context" 
                : `Expected 0 rows, got ${results.length}`,
        };
    });
}

// ============================================
// TEST SUITE 2: CORRECT CONTEXT ACCESS
// ============================================

async function testCorrectContextAccess(): Promise<void> {
    console.log("\n📋 TEST SUITE 2: Correct Context Access (withTenant returns expected rows)\n");

    if (!testTenantA) throw new Error("Test tenant A not initialized");

    // Test products with correct context
    await runTest("Products: Tenant A sees own products", async () => {
        const results = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(products);
        });
        const allBelongToTenant = results.every(p => p.tenantId === testTenantA!.id);
        return {
            passed: results.length === 2 && allBelongToTenant,
            message: results.length === 2 && allBelongToTenant
                ? `Found ${results.length} products for Tenant A`
                : `Expected 2 products for Tenant A, got ${results.length}`,
        };
    });

    // Test orders with correct context
    await runTest("Orders: Tenant A sees own orders", async () => {
        const results = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(orders);
        });
        const allBelongToTenant = results.every(o => o.tenantId === testTenantA!.id);
        return {
            passed: results.length === 1 && allBelongToTenant,
            message: results.length === 1 && allBelongToTenant
                ? `Found ${results.length} order for Tenant A`
                : `Expected 1 order for Tenant A, got ${results.length}`,
        };
    });

    // Test carts with correct context
    await runTest("Carts: Tenant A sees own carts", async () => {
        const results = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(carts);
        });
        const allBelongToTenant = results.every(c => c.tenantId === testTenantA!.id);
        return {
            passed: results.length === 1 && allBelongToTenant,
            message: results.length === 1 && allBelongToTenant
                ? `Found ${results.length} cart for Tenant A`
                : `Expected 1 cart for Tenant A, got ${results.length}`,
        };
    });

    // Test categories with correct context
    await runTest("Categories: Tenant A sees own categories", async () => {
        const results = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(categories);
        });
        const allBelongToTenant = results.every(c => c.tenantId === testTenantA!.id);
        return {
            passed: results.length === 1 && allBelongToTenant,
            message: results.length === 1 && allBelongToTenant
                ? `Found ${results.length} category for Tenant A`
                : `Expected 1 category for Tenant A, got ${results.length}`,
        };
    });

    // Test store configs with correct context
    await runTest("StoreConfigs: Tenant A sees own configs", async () => {
        const results = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(storeConfigs);
        });
        const allBelongToTenant = results.every(s => s.tenantId === testTenantA!.id);
        return {
            passed: results.length === 1 && allBelongToTenant,
            message: results.length === 1 && allBelongToTenant
                ? `Found ${results.length} store config for Tenant A`
                : `Expected 1 store config for Tenant A, got ${results.length}`,
        };
    });

    // Test users with correct context
    await runTest("Users: Tenant A sees own users", async () => {
        const results = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(users);
        });
        const allBelongToTenant = results.every(u => u.tenantId === testTenantA!.id);
        return {
            passed: results.length === 1 && allBelongToTenant,
            message: results.length === 1 && allBelongToTenant
                ? `Found ${results.length} user for Tenant A`
                : `Expected 1 user for Tenant A, got ${results.length}`,
        };
    });
}

// ============================================
// TEST SUITE 3: CROSS-TENANT ISOLATION
// ============================================

async function testCrossTenantIsolation(): Promise<void> {
    console.log("\n📋 TEST SUITE 3: Cross-Tenant Isolation (Tenant A cannot see Tenant B's data)\n");

    if (!testTenantA || !testTenantB) throw new Error("Test tenants not initialized");

    // Test products isolation
    await runTest("Products: Tenant A cannot see Tenant B products", async () => {
        const tenantAProducts = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(products);
        });
        const tenantBProducts = await withTenant(testTenantB!.id, async (tx) => {
            return tx.select().from(products);
        });
        
        const aSeesOnlyOwn = tenantAProducts.every(p => p.tenantId === testTenantA!.id);
        const bSeesOnlyOwn = tenantBProducts.every(p => p.tenantId === testTenantB!.id);
        const noOverlap = !tenantAProducts.some(a => 
            tenantBProducts.some(b => a.id === b.id)
        );

        return {
            passed: aSeesOnlyOwn && bSeesOnlyOwn && noOverlap,
            message: aSeesOnlyOwn && bSeesOnlyOwn && noOverlap
                ? `Tenant A: ${tenantAProducts.length} products, Tenant B: ${tenantBProducts.length} products - No overlap`
                : "Cross-tenant data leak detected!",
        };
    });

    // Test orders isolation
    await runTest("Orders: Tenant A cannot see Tenant B orders", async () => {
        const tenantAOrders = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(orders);
        });
        const tenantBOrders = await withTenant(testTenantB!.id, async (tx) => {
            return tx.select().from(orders);
        });
        
        const aSeesOnlyOwn = tenantAOrders.every(o => o.tenantId === testTenantA!.id);
        const bSeesOnlyOwn = tenantBOrders.every(o => o.tenantId === testTenantB!.id);
        const noOverlap = !tenantAOrders.some(a => 
            tenantBOrders.some(b => a.id === b.id)
        );

        return {
            passed: aSeesOnlyOwn && bSeesOnlyOwn && noOverlap,
            message: aSeesOnlyOwn && bSeesOnlyOwn && noOverlap
                ? `Tenant A: ${tenantAOrders.length} orders, Tenant B: ${tenantBOrders.length} orders - No overlap`
                : "Cross-tenant data leak detected!",
        };
    });

    // Test carts isolation
    await runTest("Carts: Tenant A cannot see Tenant B carts", async () => {
        const tenantACarts = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(carts);
        });
        const tenantBCarts = await withTenant(testTenantB!.id, async (tx) => {
            return tx.select().from(carts);
        });
        
        const aSeesOnlyOwn = tenantACarts.every(c => c.tenantId === testTenantA!.id);
        const bSeesOnlyOwn = tenantBCarts.every(c => c.tenantId === testTenantB!.id);

        return {
            passed: aSeesOnlyOwn && bSeesOnlyOwn,
            message: aSeesOnlyOwn && bSeesOnlyOwn
                ? `Tenant A: ${tenantACarts.length} carts, Tenant B: ${tenantBCarts.length} carts - No overlap`
                : "Cross-tenant data leak detected!",
        };
    });

    // Test users isolation
    await runTest("Users: Tenant A cannot see Tenant B users", async () => {
        const tenantAUsers = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(users);
        });
        const tenantBUsers = await withTenant(testTenantB!.id, async (tx) => {
            return tx.select().from(users);
        });
        
        const aSeesOnlyOwn = tenantAUsers.every(u => u.tenantId === testTenantA!.id);
        const bSeesOnlyOwn = tenantBUsers.every(u => u.tenantId === testTenantB!.id);

        return {
            passed: aSeesOnlyOwn && bSeesOnlyOwn,
            message: aSeesOnlyOwn && bSeesOnlyOwn
                ? `Tenant A: ${tenantAUsers.length} users, Tenant B: ${tenantBUsers.length} users - No overlap`
                : "Cross-tenant data leak detected!",
        };
    });

    // Test store configs isolation
    await runTest("StoreConfigs: Tenant A cannot see Tenant B configs", async () => {
        const tenantAConfigs = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(storeConfigs);
        });
        const tenantBConfigs = await withTenant(testTenantB!.id, async (tx) => {
            return tx.select().from(storeConfigs);
        });
        
        const aSeesOnlyOwn = tenantAConfigs.every(s => s.tenantId === testTenantA!.id);
        const bSeesOnlyOwn = tenantBConfigs.every(s => s.tenantId === testTenantB!.id);

        return {
            passed: aSeesOnlyOwn && bSeesOnlyOwn,
            message: aSeesOnlyOwn && bSeesOnlyOwn
                ? `Tenant A: ${tenantAConfigs.length} configs, Tenant B: ${tenantBConfigs.length} configs - No overlap`
                : "Cross-tenant data leak detected!",
        };
    });
}

// ============================================
// TEST SUITE 4: withTenant() WRAPPER FUNCTION
// ============================================

async function testWithTenantWrapper(): Promise<void> {
    console.log("\n📋 TEST SUITE 4: withTenant() Wrapper Function Validation\n");

    if (!testTenantA) throw new Error("Test tenant A not initialized");

    // Test invalid tenant ID format
    await runTest("withTenant: Rejects invalid UUID format", async () => {
        try {
            await withTenant("invalid-uuid", async (tx) => {
                return tx.select().from(products);
            });
            return {
                passed: false,
                message: "Should have thrown error for invalid UUID",
            };
        } catch (error) {
            const isExpectedError = error instanceof Error && 
                error.message.includes("Invalid tenant ID format");
            return {
                passed: isExpectedError,
                message: isExpectedError 
                    ? "Correctly rejected invalid UUID" 
                    : `Unexpected error: ${error}`,
            };
        }
    });

    // Test empty tenant ID
    await runTest("withTenant: Rejects empty tenant ID", async () => {
        try {
            await withTenant("", async (tx) => {
                return tx.select().from(products);
            });
            return {
                passed: false,
                message: "Should have thrown error for empty tenant ID",
            };
        } catch (error) {
            const isExpectedError = error instanceof Error && 
                error.message.includes("Invalid tenant ID format");
            return {
                passed: isExpectedError,
                message: isExpectedError 
                    ? "Correctly rejected empty tenant ID" 
                    : `Unexpected error: ${error}`,
            };
        }
    });

    // Test transaction isolation
    await runTest("withTenant: Transaction properly scopes queries", async () => {
        const results = await withTenant(testTenantA!.id, async (tx) => {
            // Multiple queries in same transaction should all be scoped
            const prods = await tx.select().from(products);
            const ords = await tx.select().from(orders);
            const cats = await tx.select().from(categories);
            return { prods, ords, cats };
        });

        const allProductsScoped = results.prods.every(p => p.tenantId === testTenantA!.id);
        const allOrdersScoped = results.ords.every(o => o.tenantId === testTenantA!.id);
        const allCategoriesScoped = results.cats.every(c => c.tenantId === testTenantA!.id);

        return {
            passed: allProductsScoped && allOrdersScoped && allCategoriesScoped,
            message: allProductsScoped && allOrdersScoped && allCategoriesScoped
                ? "All queries in transaction properly scoped"
                : "Transaction scope leak detected",
        };
    });

    // Test context doesn't persist after transaction
    await runTest("withTenant: Context cleared after transaction", async () => {
        // First, run a scoped query
        await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(products);
        });

        // Then query without context - should return nothing
        const results = await db.select().from(products);
        return {
            passed: results.length === 0,
            message: results.length === 0
                ? "Context properly cleared after transaction"
                : `Context leaked: found ${results.length} rows after transaction`,
        };
    });

    // Test return value passthrough
    await runTest("withTenant: Returns callback result correctly", async () => {
        const expectedValue = { test: "value", count: 42 };
        const result = await withTenant(testTenantA!.id, async () => {
            return expectedValue;
        });

        const passed = result.test === expectedValue.test && result.count === expectedValue.count;
        return {
            passed,
            message: passed
                ? "Return value passed through correctly"
                : "Return value mismatch",
        };
    });
}

// ============================================
// TEST SUITE 5: INSERT/UPDATE/DELETE OPERATIONS
// ============================================

async function testWriteOperations(): Promise<void> {
    console.log("\n📋 TEST SUITE 5: Write Operations (INSERT/UPDATE/DELETE with RLS)\n");

    if (!testTenantA || !testTenantB) throw new Error("Test tenants not initialized");

    // Test INSERT with correct tenant context
    await runTest("INSERT: Can create product with correct tenant context", async () => {
        const newProductId = await withTenant(testTenantA!.id, async (tx) => {
            const [product] = await tx.insert(products).values({
                tenantId: testTenantA!.id,
                name: "RLS Test Insert Product",
                slug: `rls-test-insert-${Date.now()}`,
                price: "29.99",
                status: "draft",
            }).returning();
            return product.id;
        });

        // Track for cleanup
        testDataIds.products.push(newProductId);

        // Verify it was created
        const verifyResult = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(products).where(eq(products.id, newProductId));
        });

        return {
            passed: verifyResult.length === 1,
            message: verifyResult.length === 1
                ? "Product created successfully with RLS"
                : "Failed to create product",
        };
    });

    // Test INSERT blocked for wrong tenant
    await runTest("INSERT: Cannot create product for different tenant", async () => {
        try {
            await withTenant(testTenantA!.id, async (tx) => {
                // Try to insert with Tenant B's ID while in Tenant A's context
                await tx.insert(products).values({
                    tenantId: testTenantB!.id, // Wrong tenant!
                    name: "Should Fail Product",
                    slug: `should-fail-${Date.now()}`,
                    price: "99.99",
                    status: "draft",
                }).returning();
            });
            return {
                passed: false,
                message: "Should have been blocked by RLS WITH CHECK",
            };
        } catch (error) {
            // RLS should block this with a policy violation
            return {
                passed: true,
                message: "Correctly blocked cross-tenant insert",
            };
        }
    });

    // Test UPDATE with correct tenant context
    await runTest("UPDATE: Can update own product", async () => {
        // Get a product to update
        const productsToUpdate = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(products).limit(1);
        });

        if (productsToUpdate.length === 0) {
            return { passed: false, message: "No products to update" };
        }

        const productId = productsToUpdate[0].id;
        const newName = `Updated Product ${Date.now()}`;

        await withTenant(testTenantA!.id, async (tx) => {
            await tx.update(products)
                .set({ name: newName })
                .where(eq(products.id, productId));
        });

        // Verify update
        const updated = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(products).where(eq(products.id, productId));
        });

        return {
            passed: updated.length === 1 && updated[0].name === newName,
            message: updated.length === 1 && updated[0].name === newName
                ? "Product updated successfully"
                : "Update failed or name mismatch",
        };
    });

    // Test UPDATE blocked for other tenant's data
    await runTest("UPDATE: Cannot update other tenant's product", async () => {
        // Get Tenant B's product ID using sudoDb
        const tenantBProducts = await sudoDb.select().from(products)
            .where(eq(products.tenantId, testTenantB!.id))
            .limit(1);

        if (tenantBProducts.length === 0) {
            return { passed: false, message: "No Tenant B products found" };
        }

        const tenantBProductId = tenantBProducts[0].id;
        const originalName = tenantBProducts[0].name;

        // Try to update Tenant B's product while in Tenant A's context
        await withTenant(testTenantA!.id, async (tx) => {
            await tx.update(products)
                .set({ name: "Hacked Name" })
                .where(eq(products.id, tenantBProductId));
        });

        // Verify no change using sudoDb
        const afterUpdate = await sudoDb.select().from(products)
            .where(eq(products.id, tenantBProductId));

        return {
            passed: afterUpdate[0].name === originalName,
            message: afterUpdate[0].name === originalName
                ? "Cross-tenant update correctly blocked (no rows affected)"
                : "SECURITY ISSUE: Cross-tenant update succeeded!",
        };
    });
}

// ============================================
// TEST SUITE 6: CART ITEMS (INDIRECT RLS)
// ============================================

async function testCartItemsIndirectRLS(): Promise<void> {
    console.log("\n📋 TEST SUITE 6: Cart Items Indirect RLS (via cart relationship)\n");

    if (!testTenantA || !testTenantB) throw new Error("Test tenants not initialized");

    // Test cart items visibility through cart relationship
    await runTest("CartItems: Tenant A sees only items from own carts", async () => {
        const tenantACartItems = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(cartItems);
        });

        // Verify all cart items belong to Tenant A's carts
        const tenantACarts = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(carts);
        });
        const tenantACartIds = new Set(tenantACarts.map(c => c.id));

        const allBelongToTenantACarts = tenantACartItems.every(
            item => tenantACartIds.has(item.cartId)
        );

        return {
            passed: allBelongToTenantACarts,
            message: allBelongToTenantACarts
                ? `Found ${tenantACartItems.length} cart items, all belong to Tenant A's carts`
                : "Cart items leak detected - items from other tenant's carts visible",
        };
    });

    // Test cart items isolation between tenants
    await runTest("CartItems: Tenant B cannot see Tenant A's cart items", async () => {
        const tenantBCartItems = await withTenant(testTenantB!.id, async (tx) => {
            return tx.select().from(cartItems);
        });

        // Get Tenant A's cart IDs using sudoDb
        const tenantACarts = await sudoDb.select().from(carts)
            .where(eq(carts.tenantId, testTenantA!.id));
        const tenantACartIds = new Set(tenantACarts.map(c => c.id));

        // Verify none of Tenant B's visible cart items belong to Tenant A's carts
        const noLeakFromTenantA = !tenantBCartItems.some(
            item => tenantACartIds.has(item.cartId)
        );

        return {
            passed: noLeakFromTenantA,
            message: noLeakFromTenantA
                ? `Tenant B sees ${tenantBCartItems.length} cart items, none from Tenant A`
                : "SECURITY ISSUE: Tenant B can see Tenant A's cart items!",
        };
    });
}

// ============================================
// TEST SUITE 7: TENANT SELF-ACCESS
// ============================================

async function testTenantSelfAccess(): Promise<void> {
    console.log("\n📋 TEST SUITE 7: Tenant Self-Access Policy\n");

    if (!testTenantA || !testTenantB) throw new Error("Test tenants not initialized");

    // Test tenant can see own record
    await runTest("Tenants: Can access own tenant record", async () => {
        const result = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(tenants).where(eq(tenants.id, testTenantA!.id));
        });

        return {
            passed: result.length === 1 && result[0].id === testTenantA!.id,
            message: result.length === 1
                ? "Tenant can access own record"
                : "Tenant cannot access own record",
        };
    });

    // Test tenant cannot see other tenant's record
    await runTest("Tenants: Cannot access other tenant's record", async () => {
        const result = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(tenants).where(eq(tenants.id, testTenantB!.id));
        });

        return {
            passed: result.length === 0,
            message: result.length === 0
                ? "Correctly blocked access to other tenant's record"
                : "SECURITY ISSUE: Can see other tenant's record!",
        };
    });

    // Test tenant list only shows self
    await runTest("Tenants: List only shows own tenant", async () => {
        const result = await withTenant(testTenantA!.id, async (tx) => {
            return tx.select().from(tenants);
        });

        const onlyShowsSelf = result.length === 1 && result[0].id === testTenantA!.id;

        return {
            passed: onlyShowsSelf,
            message: onlyShowsSelf
                ? "Tenant list correctly shows only self"
                : `Expected 1 tenant (self), got ${result.length}`,
        };
    });
}

// ============================================
// TEST SUITE 8: SUDO DB BYPASS
// ============================================

async function testSudoDbBypass(): Promise<void> {
    console.log("\n📋 TEST SUITE 8: sudoDb RLS Bypass (Admin Operations)\n");

    // Test sudoDb can see all tenants
    await runTest("sudoDb: Can see all tenants", async () => {
        const allTenants = await sudoDb.select().from(tenants);
        const hasTestTenantA = allTenants.some(t => t.id === testTenantA!.id);
        const hasTestTenantB = allTenants.some(t => t.id === testTenantB!.id);

        return {
            passed: hasTestTenantA && hasTestTenantB,
            message: hasTestTenantA && hasTestTenantB
                ? `sudoDb sees ${allTenants.length} tenants including both test tenants`
                : "sudoDb cannot see all tenants",
        };
    });

    // Test sudoDb can see all products across tenants
    await runTest("sudoDb: Can see products from all tenants", async () => {
        const allProducts = await sudoDb.select().from(products);
        const tenantAProducts = allProducts.filter(p => p.tenantId === testTenantA!.id);
        const tenantBProducts = allProducts.filter(p => p.tenantId === testTenantB!.id);

        const hasBothTenants = tenantAProducts.length > 0 && tenantBProducts.length > 0;

        return {
            passed: hasBothTenants,
            message: hasBothTenants
                ? `sudoDb sees products from both tenants (A: ${tenantAProducts.length}, B: ${tenantBProducts.length})`
                : "sudoDb cannot see products from all tenants",
        };
    });

    // Test sudoDb can perform cross-tenant operations
    await runTest("sudoDb: Can perform cross-tenant queries", async () => {
        const crossTenantOrders = await sudoDb.select().from(orders);
        const uniqueTenantIds = new Set(crossTenantOrders.map(o => o.tenantId));

        return {
            passed: uniqueTenantIds.size >= 2,
            message: uniqueTenantIds.size >= 2
                ? `sudoDb can query orders from ${uniqueTenantIds.size} different tenants`
                : "sudoDb cross-tenant query limited",
        };
    });
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main(): Promise<void> {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║     COMPREHENSIVE RLS (Row Level Security) TEST SUITE      ║");
    console.log("║     Multitenant SaaS E-Commerce Platform                   ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    const startTime = Date.now();

    try {
        // Verify database connections
        if (!db || !sudoDb) {
            console.error("❌ Database connections not available. Check DATABASE_URL and SUDO_DATABASE_URL.");
            process.exit(1);
        }

        // Setup test data
        await setup();

        // Run all test suites
        await testNoContextAccess();
        await testCorrectContextAccess();
        await testCrossTenantIsolation();
        await testWithTenantWrapper();
        await testWriteOperations();
        await testCartItemsIndirectRLS();
        await testTenantSelfAccess();
        await testSudoDbBypass();

        // Print results
        printResults();

        const totalDuration = Date.now() - startTime;
        console.log(`Total execution time: ${totalDuration}ms\n`);

        // Determine exit code
        const failedTests = testResults.filter(r => !r.passed).length;
        if (failedTests > 0) {
            console.log(`\n⚠️  ${failedTests} test(s) failed. Review RLS policies.\n`);
        } else {
            console.log("\n🎉 All RLS tests passed! Tenant isolation is working correctly.\n");
        }

    } catch (error) {
        console.error("\n❌ Test suite failed with error:", error);
    } finally {
        // Always cleanup
        await cleanup();
    }

    // Exit with appropriate code
    const failedTests = testResults.filter(r => !r.passed).length;
    process.exit(failedTests > 0 ? 1 : 0);
}

// Run the tests
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
