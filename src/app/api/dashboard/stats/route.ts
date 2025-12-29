import { NextResponse } from "next/server";
import { authorizedAction } from "@/lib/actions";
import { orders, products, productVariants, inventoryLevels } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const stats = await authorizedAction(async (tx) => {
            // Get orders
            const allOrders = await tx.select().from(orders);
            const pendingOrdersList = allOrders.filter((o) => o.status === "pending");
            const completedOrders = allOrders.filter((o) => o.status === "completed");
            const totalRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0);

            // Previous month revenue (mock for now)
            const previousRevenue = totalRevenue * 0.93;

            // Get all products
            const allProducts = await tx.select().from(products);

            // Get product variants with inventory
            const variantData = await tx
                .select({
                    id: productVariants.id,
                    productId: productVariants.productId,
                    price: productVariants.price,
                    stock: inventoryLevels.quantity,
                })
                .from(productVariants)
                .leftJoin(inventoryLevels, eq(inventoryLevels.variantId, productVariants.id));

            // Combine product data with variant stock info
            const productDataWithStock = allProducts.map((product) => {
                const variant = variantData.find((v) => v.productId === product.id);
                return {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    stock: variant?.stock ?? 0,
                    price: variant?.price ?? product.price ?? "0",
                };
            });

            const lowStockProducts = productDataWithStock.filter((p) => p.stock !== null && p.stock <= 10 && p.stock > 0);

            // Recent orders
            const recentOrders = await tx
                .select()
                .from(orders)
                .orderBy(desc(orders.createdAt))
                .limit(5);

            // Calculate conversion rate (mock)
            const conversionRate = 6.88;

            // Profit calculation (mock - 30% margin)
            const profit = totalRevenue * 0.30;

            return {
                totalOrders: allOrders.length,
                pendingOrders: pendingOrdersList.length,
                totalRevenue,
                previousRevenue,
                totalProducts: allProducts.length,
                lowStockProducts,
                lowStockCount: lowStockProducts.length,
                recentOrders,
                productList: productDataWithStock.slice(0, 5),
                conversionRate,
                profit,
            };
        });

        return NextResponse.json(stats, {
            headers: {
                // Short cache for dashboard - data should be relatively fresh
                "Cache-Control": "private, s-maxage=30, stale-while-revalidate=60",
            },
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard stats" },
            { status: 500 }
        );
    }
}
