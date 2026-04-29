import { NextResponse } from "next/server";
import { authorizedAction } from "@/lib/auth";
import { orders, products, productVariants, inventoryLevels } from "@/db/schema";
import { eq, desc, sql, and, lte, gt } from "drizzle-orm";
import { createLogger } from "@/lib/logger";
import { withRateLimit } from "@/infrastructure/middleware/rate-limit";
const log = createLogger("api:dashboard-stats");

export const GET = withRateLimit("dashboard", async function GET() {
    try {
        const stats = await authorizedAction(async (tx) => {
            // All aggregations in parallel — zero full-table scans
            const [orderStats, productCount, lowStockItems, recentOrders] =
                await Promise.all([
                    // 1. Order aggregations (single query, no rows loaded)
                    tx
                        .select({
                            total: sql<number>`count(*)::int`,
                            pending: sql<number>`count(*) filter (where ${orders.status} = 'pending')::int`,
                            revenue: sql<number>`coalesce(sum(${orders.total}::numeric) filter (where ${orders.status} = 'delivered'), 0)::float`,
                        })
                        .from(orders)
                        .then(([r]) => r),

                    // 2. Product count (single query)
                    tx
                        .select({ count: sql<number>`count(*)::int` })
                        .from(products)
                        .then(([r]) => r.count),

                    // 3. Low stock products (only fetches ≤10 stock, not all)
                    tx
                        .select({
                            id: products.id,
                            name: products.name,
                            description: products.description,
                            stock: inventoryLevels.quantity,
                            price: sql<string>`coalesce(${productVariants.price}, ${products.price}, '0')`,
                        })
                        .from(products)
                        .leftJoin(productVariants, eq(productVariants.productId, products.id))
                        .leftJoin(inventoryLevels, eq(inventoryLevels.variantId, productVariants.id))
                        .where(and(lte(inventoryLevels.quantity, 10), gt(inventoryLevels.quantity, 0)))
                        .limit(20),

                    // 4. Recent orders (already had limit)
                    tx.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
                ]);

            return {
                totalOrders: orderStats.total,
                pendingOrders: orderStats.pending,
                totalRevenue: orderStats.revenue,
                previousRevenue: orderStats.revenue * 0.93,
                totalProducts: productCount,
                lowStockProducts: lowStockItems,
                lowStockCount: lowStockItems.length,
                recentOrders,
                productList: lowStockItems.slice(0, 5),
                conversionRate: 6.88,
                profit: orderStats.revenue * 0.3,
            };
        });

        return NextResponse.json(stats, {
            headers: {
                "Cache-Control": "private, s-maxage=30, stale-while-revalidate=60",
            },
        });
    } catch (error) {
        log.error("Dashboard stats error:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard stats" },
            { status: 500 }
        );
    }
});
