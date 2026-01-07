import "server-only";
import { orders, orderItems } from "@/db/schema/orders";
import { products, categories } from "@/db/schema/products";
import { customers } from "@/db/schema/customers";
import { eq, and, gte, lte, desc, count, sum, sql, isNotNull } from "drizzle-orm";
import { withTenant } from "@/infrastructure/db";
import type {
    AnalyticsGranularity,
    RevenueByPeriod,
    RevenueDataPoint as AdvancedRevenueDataPoint,
    TopProductsResponse,
    TopProductData,
    CustomerMetrics,
    CustomerSegmentData,
    CustomerSegmentType,
    ConversionFunnelData,
    FunnelStageData,
    SalesByCategoryResponse,
    CategorySalesData,
    OrdersByStatusResponse,
    OrdersByStatusData,
    OrderStatusType,
} from "./analytics-types";

/**
 * Analytics Overview - Summary metrics for dashboard
 */
export interface AnalyticsOverview {
    revenue: number;
    ordersCount: number;
    avgOrderValue: number;
    customersCount: number;
    revenueChange: number;
    ordersChange: number;
    avgOrderValueChange: number;
    customersChange: number;
}

/**
 * Revenue Data Point - For chart visualization (legacy interface)
 */
export interface RevenueDataPoint {
    date: string;
    revenue: number;
    orders: number;
}

/**
 * Top Product - Best selling products by revenue
 */
export interface TopProduct {
    id: string;
    name: string;
    sku: string | null;
    revenue: number;
    quantity: number;
    imageUrl: string | null;
}

/**
 * Top Category - Best performing categories by revenue
 */
export interface TopCategory {
    id: string;
    name: string;
    revenue: number;
    ordersCount: number;
    productCount: number;
}

/**
 * Orders By Status - Order distribution by status
 */
export interface OrdersByStatus {
    status: string;
    count: number;
    percentage: number;
}

/**
 * Customer Segment - Customer segmentation data
 */
export interface CustomerSegment {
    segment: "new" | "returning" | "vip";
    count: number;
    percentage: number;
    revenue: number;
}

/**
 * Recent Order - Simplified order for dashboard display
 */
export interface RecentOrder {
    id: string;
    orderNumber: string;
    customerName: string | null;
    customerEmail: string | null;
    total: string;
    status: string;
    createdAt: Date;
}

/**
 * Analytics Repository
 *
 * Provides analytics and reporting data for the dashboard.
 * All methods use withTenant() wrapper to ensure RLS context is set.
 *
 * @see IMPLEMENTATION-PLAN.md Section 4.1
 */
export class AnalyticsRepository {
    /**
     * Get overview metrics for the dashboard
     */
    async getOverview(
        tenantId: string,
        startDate: Date,
        endDate: Date
    ): Promise<AnalyticsOverview> {
        return withTenant(tenantId, async (tx) => {
            // Current period metrics
            const [currentMetrics] = await tx
                .select({
                    revenue: sum(orders.total),
                    ordersCount: count(orders.id),
                })
                .from(orders)
                .where(
                    and(
                        gte(orders.createdAt, startDate),
                        lte(orders.createdAt, endDate),
                        eq(orders.paymentStatus, "paid")
                    )
                );

            // Customer count for current period
            const [customerMetrics] = await tx
                .select({
                    customersCount: count(customers.id),
                })
                .from(customers)
                .where(
                    and(
                        gte(customers.createdAt, startDate),
                        lte(customers.createdAt, endDate)
                    )
                );

            // Calculate previous period for comparison
            const periodLength = endDate.getTime() - startDate.getTime();
            const prevStartDate = new Date(startDate.getTime() - periodLength);
            const prevEndDate = new Date(startDate.getTime() - 1);

            // Previous period metrics
            const [prevMetrics] = await tx
                .select({
                    revenue: sum(orders.total),
                    ordersCount: count(orders.id),
                })
                .from(orders)
                .where(
                    and(
                        gte(orders.createdAt, prevStartDate),
                        lte(orders.createdAt, prevEndDate),
                        eq(orders.paymentStatus, "paid")
                    )
                );

            const [prevCustomerMetrics] = await tx
                .select({
                    customersCount: count(customers.id),
                })
                .from(customers)
                .where(
                    and(
                        gte(customers.createdAt, prevStartDate),
                        lte(customers.createdAt, prevEndDate)
                    )
                );

            const revenue = Number(currentMetrics?.revenue || 0);
            const ordersCount = Number(currentMetrics?.ordersCount || 0);
            const customersCount = Number(customerMetrics?.customersCount || 0);
            const avgOrderValue = ordersCount > 0 ? revenue / ordersCount : 0;

            const prevRevenue = Number(prevMetrics?.revenue || 0);
            const prevOrdersCount = Number(prevMetrics?.ordersCount || 0);
            const prevCustomersCount = Number(prevCustomerMetrics?.customersCount || 0);
            const prevAvgOrderValue = prevOrdersCount > 0 ? prevRevenue / prevOrdersCount : 0;

            // Calculate percentage changes
            const calcChange = (current: number, previous: number): number => {
                if (previous === 0) return current > 0 ? 100 : 0;
                return ((current - previous) / previous) * 100;
            };

            return {
                revenue,
                ordersCount,
                avgOrderValue,
                customersCount,
                revenueChange: calcChange(revenue, prevRevenue),
                ordersChange: calcChange(ordersCount, prevOrdersCount),
                avgOrderValueChange: calcChange(avgOrderValue, prevAvgOrderValue),
                customersChange: calcChange(customersCount, prevCustomersCount),
            };
        });
    }

    /**
     * Get revenue chart data points
     */
    async getRevenueChart(
        tenantId: string,
        startDate: Date,
        endDate: Date
    ): Promise<RevenueDataPoint[]> {
        return withTenant(tenantId, async (tx) => {
            const result = await tx
                .select({
                    date: sql<string>`DATE(${orders.createdAt})`,
                    revenue: sum(orders.total),
                    orders: count(orders.id),
                })
                .from(orders)
                .where(
                    and(
                        gte(orders.createdAt, startDate),
                        lte(orders.createdAt, endDate),
                        eq(orders.paymentStatus, "paid")
                    )
                )
                .groupBy(sql`DATE(${orders.createdAt})`)
                .orderBy(sql`DATE(${orders.createdAt})`);

            return result.map((row) => ({
                date: String(row.date),
                revenue: Number(row.revenue || 0),
                orders: Number(row.orders || 0),
            }));
        });
    }

    /**
     * Get top selling products by revenue
     */
    async getTopProducts(
        tenantId: string,
        startDate: Date,
        endDate: Date,
        limit: number = 10
    ): Promise<TopProduct[]> {
        return withTenant(tenantId, async (tx) => {
            const result = await tx
                .select({
                    id: products.id,
                    name: products.name,
                    sku: products.sku,
                    revenue: sum(orderItems.totalPrice),
                    quantity: sum(orderItems.quantity),
                    images: products.images,
                })
                .from(orderItems)
                .innerJoin(orders, eq(orderItems.orderId, orders.id))
                .innerJoin(products, eq(orderItems.productId, products.id))
                .where(
                    and(
                        gte(orders.createdAt, startDate),
                        lte(orders.createdAt, endDate),
                        eq(orders.paymentStatus, "paid")
                    )
                )
                .groupBy(products.id, products.name, products.sku, products.images)
                .orderBy(desc(sum(orderItems.totalPrice)))
                .limit(limit);

            return result.map((row) => ({
                id: row.id,
                name: row.name,
                sku: row.sku,
                revenue: Number(row.revenue || 0),
                quantity: Number(row.quantity || 0),
                imageUrl: (row.images as { url: string }[])?.[0]?.url || null,
            }));
        });
    }

    /**
     * Get top categories by revenue
     */
    async getTopCategories(
        tenantId: string,
        startDate: Date,
        endDate: Date,
        limit: number = 10
    ): Promise<TopCategory[]> {
        return withTenant(tenantId, async (tx) => {
            const result = await tx
                .select({
                    id: categories.id,
                    name: categories.name,
                    revenue: sum(orderItems.totalPrice),
                    ordersCount: count(sql`DISTINCT ${orders.id}`),
                })
                .from(orderItems)
                .innerJoin(orders, eq(orderItems.orderId, orders.id))
                .innerJoin(products, eq(orderItems.productId, products.id))
                .innerJoin(categories, eq(products.categoryId, categories.id))
                .where(
                    and(
                        gte(orders.createdAt, startDate),
                        lte(orders.createdAt, endDate),
                        eq(orders.paymentStatus, "paid")
                    )
                )
                .groupBy(categories.id, categories.name)
                .orderBy(desc(sum(orderItems.totalPrice)))
                .limit(limit);

            // Get product counts per category
            const productCounts = await tx
                .select({
                    categoryId: products.categoryId,
                    count: count(products.id),
                })
                .from(products)
                .groupBy(products.categoryId);

            const productCountMap = new Map(
                productCounts.map((pc) => [pc.categoryId, Number(pc.count)])
            );

            return result.map((row) => ({
                id: row.id,
                name: row.name,
                revenue: Number(row.revenue || 0),
                ordersCount: Number(row.ordersCount || 0),
                productCount: productCountMap.get(row.id) || 0,
            }));
        });
    }

    /**
     * Get orders grouped by status
     */
    async getOrdersByStatus(
        tenantId: string,
        startDate: Date,
        endDate: Date
    ): Promise<OrdersByStatus[]> {
        return withTenant(tenantId, async (tx) => {
            const result = await tx
                .select({
                    status: orders.status,
                    count: count(orders.id),
                })
                .from(orders)
                .where(
                    and(
                        gte(orders.createdAt, startDate),
                        lte(orders.createdAt, endDate)
                    )
                )
                .groupBy(orders.status);

            const total = result.reduce((sum, row) => sum + Number(row.count), 0);

            return result.map((row) => ({
                status: row.status,
                count: Number(row.count),
                percentage: total > 0 ? (Number(row.count) / total) * 100 : 0,
            }));
        });
    }

    /**
     * Get customer segments (new, returning, VIP)
     */
    async getCustomerSegments(tenantId: string): Promise<CustomerSegment[]> {
        return withTenant(tenantId, async (tx) => {
            // Get all customers with their order stats
            const customerStats = await tx
                .select({
                    customerId: orders.customerId,
                    orderCount: count(orders.id),
                    totalSpent: sum(orders.total),
                })
                .from(orders)
                .where(eq(orders.paymentStatus, "paid"))
                .groupBy(orders.customerId);

            // Get total customer count
            const [totalCustomers] = await tx
                .select({ count: count(customers.id) })
                .from(customers);

            const total = Number(totalCustomers?.count || 0);

            // Segment customers
            let newCount = 0;
            let newRevenue = 0;
            let returningCount = 0;
            let returningRevenue = 0;
            let vipCount = 0;
            let vipRevenue = 0;

            // VIP threshold: customers with > $1000 total spend or > 5 orders
            const VIP_SPEND_THRESHOLD = 1000;
            const VIP_ORDER_THRESHOLD = 5;

            for (const stat of customerStats) {
                const orderCount = Number(stat.orderCount);
                const totalSpent = Number(stat.totalSpent || 0);

                if (totalSpent >= VIP_SPEND_THRESHOLD || orderCount >= VIP_ORDER_THRESHOLD) {
                    vipCount++;
                    vipRevenue += totalSpent;
                } else if (orderCount > 1) {
                    returningCount++;
                    returningRevenue += totalSpent;
                } else {
                    newCount++;
                    newRevenue += totalSpent;
                }
            }

            // Customers without orders are considered "new"
            const customersWithoutOrders = total - customerStats.length;
            newCount += customersWithoutOrders;

            const segments: CustomerSegment[] = [
                {
                    segment: "new",
                    count: newCount,
                    percentage: total > 0 ? (newCount / total) * 100 : 0,
                    revenue: newRevenue,
                },
                {
                    segment: "returning",
                    count: returningCount,
                    percentage: total > 0 ? (returningCount / total) * 100 : 0,
                    revenue: returningRevenue,
                },
                {
                    segment: "vip",
                    count: vipCount,
                    percentage: total > 0 ? (vipCount / total) * 100 : 0,
                    revenue: vipRevenue,
                },
            ];

            return segments;
        });
    }

    /**
     * Get recent orders for dashboard
     */
    async getRecentOrders(
        tenantId: string,
        limit: number = 10
    ): Promise<RecentOrder[]> {
        return withTenant(tenantId, async (tx) => {
            const result = await tx
                .select({
                    id: orders.id,
                    orderNumber: orders.orderNumber,
                    customerName: orders.customerName,
                    customerEmail: orders.customerEmail,
                    total: orders.total,
                    status: orders.status,
                    createdAt: orders.createdAt,
                })
                .from(orders)
                .orderBy(desc(orders.createdAt))
                .limit(limit);

            return result.map((row) => ({
                id: row.id,
                orderNumber: row.orderNumber,
                customerName: row.customerName,
                customerEmail: row.customerEmail,
                total: row.total,
                status: row.status,
                createdAt: row.createdAt,
            }));
        });
    }

    // ========================================================================
    // NEW ADVANCED ANALYTICS METHODS
    // ========================================================================

    /**
     * Get revenue by period with configurable granularity
     * 
     * @param tenantId - Tenant ID
     * @param startDate - Start date of the period
     * @param endDate - End date of the period
     * @param granularity - Time granularity (hour, day, week, month)
     */
    async getRevenueByPeriod(
        tenantId: string,
        startDate: Date,
        endDate: Date,
        granularity: AnalyticsGranularity = 'day'
    ): Promise<RevenueByPeriod> {
        return withTenant(tenantId, async (tx) => {
            // Build date truncation based on granularity
            const dateTrunc = granularity === 'hour' 
                ? sql<string>`DATE_TRUNC('hour', ${orders.createdAt})`
                : granularity === 'week'
                ? sql<string>`DATE_TRUNC('week', ${orders.createdAt})`
                : granularity === 'month'
                ? sql<string>`DATE_TRUNC('month', ${orders.createdAt})`
                : sql<string>`DATE(${orders.createdAt})`;

            const result = await tx
                .select({
                    date: dateTrunc,
                    revenue: sum(orders.total),
                    orders: count(orders.id),
                })
                .from(orders)
                .where(
                    and(
                        gte(orders.createdAt, startDate),
                        lte(orders.createdAt, endDate),
                        eq(orders.paymentStatus, "paid")
                    )
                )
                .groupBy(dateTrunc)
                .orderBy(dateTrunc);

            const data: AdvancedRevenueDataPoint[] = result.map((row) => {
                const revenue = Number(row.revenue || 0);
                const orderCount = Number(row.orders || 0);
                return {
                    date: String(row.date),
                    revenue,
                    orders: orderCount,
                    avgOrderValue: orderCount > 0 ? revenue / orderCount : 0,
                };
            });

            // Calculate totals
            const totals = data.reduce(
                (acc, point) => ({
                    revenue: acc.revenue + point.revenue,
                    orders: acc.orders + point.orders,
                    avgOrderValue: 0,
                }),
                { revenue: 0, orders: 0, avgOrderValue: 0 }
            );
            totals.avgOrderValue = totals.orders > 0 ? totals.revenue / totals.orders : 0;

            // Calculate comparison with previous period
            const periodLength = endDate.getTime() - startDate.getTime();
            const prevStartDate = new Date(startDate.getTime() - periodLength);
            const prevEndDate = new Date(startDate.getTime() - 1);

            const [prevMetrics] = await tx
                .select({
                    revenue: sum(orders.total),
                    orders: count(orders.id),
                })
                .from(orders)
                .where(
                    and(
                        gte(orders.createdAt, prevStartDate),
                        lte(orders.createdAt, prevEndDate),
                        eq(orders.paymentStatus, "paid")
                    )
                );

            const prevRevenue = Number(prevMetrics?.revenue || 0);
            const prevOrders = Number(prevMetrics?.orders || 0);

            const calcChange = (current: number, previous: number): number => {
                if (previous === 0) return current > 0 ? 100 : 0;
                return ((current - previous) / previous) * 100;
            };

            return {
                data,
                totals,
                comparison: {
                    revenue: prevRevenue,
                    revenueChange: calcChange(totals.revenue, prevRevenue),
                    orders: prevOrders,
                    ordersChange: calcChange(totals.orders, prevOrders),
                },
            };
        });
    }

    /**
     * Get top products with detailed metrics
     * 
     * @param tenantId - Tenant ID
     * @param limit - Number of products to return
     * @param startDate - Start date of the period
     * @param endDate - End date of the period
     */
    async getTopProductsDetailed(
        tenantId: string,
        limit: number = 10,
        startDate: Date,
        endDate: Date
    ): Promise<TopProductsResponse> {
        return withTenant(tenantId, async (tx) => {
            const result = await tx
                .select({
                    id: products.id,
                    name: products.name,
                    sku: products.sku,
                    images: products.images,
                    revenue: sum(orderItems.totalPrice),
                    quantity: sum(orderItems.quantity),
                    orders: count(sql`DISTINCT ${orders.id}`),
                })
                .from(orderItems)
                .innerJoin(orders, eq(orderItems.orderId, orders.id))
                .innerJoin(products, eq(orderItems.productId, products.id))
                .where(
                    and(
                        gte(orders.createdAt, startDate),
                        lte(orders.createdAt, endDate),
                        eq(orders.paymentStatus, "paid")
                    )
                )
                .groupBy(products.id, products.name, products.sku, products.images)
                .orderBy(desc(sum(orderItems.totalPrice)))
                .limit(limit);

            const totalRevenue = result.reduce((sum, row) => sum + Number(row.revenue || 0), 0);
            const totalQuantity = result.reduce((sum, row) => sum + Number(row.quantity || 0), 0);

            const productsList: TopProductData[] = result.map((row) => {
                const revenue = Number(row.revenue || 0);
                const quantity = Number(row.quantity || 0);
                const orderCount = Number(row.orders || 0);
                return {
                    id: row.id,
                    name: row.name,
                    sku: row.sku,
                    imageUrl: (row.images as { url: string }[])?.[0]?.url || null,
                    revenue,
                    quantity,
                    orders: orderCount,
                    avgPrice: quantity > 0 ? revenue / quantity : 0,
                    revenueShare: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
                };
            });

            return {
                products: productsList,
                totalRevenue,
                totalQuantity,
            };
        });
    }

    /**
     * Get customer metrics including LTV and segmentation
     * 
     * @param tenantId - Tenant ID
     * @param startDate - Start date of the period
     * @param endDate - End date of the period
     */
    async getCustomerMetrics(
        tenantId: string,
        startDate: Date,
        endDate: Date
    ): Promise<CustomerMetrics> {
        return withTenant(tenantId, async (tx) => {
            // Get total customers
            const [totalCustomersResult] = await tx
                .select({ count: count(customers.id) })
                .from(customers);
            const totalCustomers = Number(totalCustomersResult?.count || 0);

            // Get new customers in period
            const [newCustomersResult] = await tx
                .select({ count: count(customers.id) })
                .from(customers)
                .where(
                    and(
                        gte(customers.createdAt, startDate),
                        lte(customers.createdAt, endDate)
                    )
                );
            const newCustomers = Number(newCustomersResult?.count || 0);

            // Get customer order stats
            const customerStats = await tx
                .select({
                    customerId: orders.customerId,
                    orderCount: count(orders.id),
                    totalSpent: sum(orders.total),
                    firstOrder: sql<Date>`MIN(${orders.createdAt})`,
                })
                .from(orders)
                .where(
                    and(
                        eq(orders.paymentStatus, "paid"),
                        isNotNull(orders.customerId)
                    )
                )
                .groupBy(orders.customerId);

            // Calculate metrics
            let returningCustomers = 0;
            let totalLTV = 0;
            let totalOrders = 0;

            // Segment thresholds
            const VIP_SPEND = 1000;
            const VIP_ORDERS = 10;
            const LOYAL_ORDERS = 5;
            const AT_RISK_DAYS = 90;

            const segments: Map<CustomerSegmentType, { count: number; revenue: number; orders: number }> = new Map([
                ['new', { count: 0, revenue: 0, orders: 0 }],
                ['returning', { count: 0, revenue: 0, orders: 0 }],
                ['loyal', { count: 0, revenue: 0, orders: 0 }],
                ['vip', { count: 0, revenue: 0, orders: 0 }],
                ['at_risk', { count: 0, revenue: 0, orders: 0 }],
                ['churned', { count: 0, revenue: 0, orders: 0 }],
            ]);

            const now = new Date();

            for (const stat of customerStats) {
                const orderCount = Number(stat.orderCount);
                const totalSpent = Number(stat.totalSpent || 0);
                const firstOrder = stat.firstOrder;

                totalLTV += totalSpent;
                totalOrders += orderCount;

                if (orderCount > 1) {
                    returningCustomers++;
                }

                // Determine segment
                let segment: CustomerSegmentType;
                if (totalSpent >= VIP_SPEND || orderCount >= VIP_ORDERS) {
                    segment = 'vip';
                } else if (orderCount >= LOYAL_ORDERS) {
                    segment = 'loyal';
                } else if (orderCount > 1) {
                    segment = 'returning';
                } else if (firstOrder && (now.getTime() - new Date(firstOrder).getTime()) < 30 * 24 * 60 * 60 * 1000) {
                    segment = 'new';
                } else {
                    segment = 'at_risk';
                }

                const segmentData = segments.get(segment)!;
                segmentData.count++;
                segmentData.revenue += totalSpent;
                segmentData.orders += orderCount;
            }

            // Add customers without orders as "new"
            const customersWithoutOrders = totalCustomers - customerStats.length;
            const newSegment = segments.get('new')!;
            newSegment.count += customersWithoutOrders;

            const avgLifetimeValue = customerStats.length > 0 ? totalLTV / customerStats.length : 0;
            const avgOrdersPerCustomer = customerStats.length > 0 ? totalOrders / customerStats.length : 0;
            const repeatPurchaseRate = customerStats.length > 0 ? (returningCustomers / customerStats.length) * 100 : 0;

            // Build segment data array
            const segmentLabels: Record<CustomerSegmentType, string> = {
                new: 'New',
                returning: 'Returning',
                loyal: 'Loyal',
                vip: 'VIP',
                at_risk: 'At Risk',
                churned: 'Churned',
            };

            const segmentData: CustomerSegmentData[] = Array.from(segments.entries())
                .filter(([, data]) => data.count > 0)
                .map(([segment, data]) => ({
                    segment,
                    label: segmentLabels[segment],
                    count: data.count,
                    percentage: totalCustomers > 0 ? (data.count / totalCustomers) * 100 : 0,
                    revenue: data.revenue,
                    avgOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
                }));

            // Calculate comparison with previous period
            const periodLength = endDate.getTime() - startDate.getTime();
            const prevStartDate = new Date(startDate.getTime() - periodLength);
            const prevEndDate = new Date(startDate.getTime() - 1);

            const [prevNewCustomers] = await tx
                .select({ count: count(customers.id) })
                .from(customers)
                .where(
                    and(
                        gte(customers.createdAt, prevStartDate),
                        lte(customers.createdAt, prevEndDate)
                    )
                );

            const calcChange = (current: number, previous: number): number => {
                if (previous === 0) return current > 0 ? 100 : 0;
                return ((current - previous) / previous) * 100;
            };

            return {
                totalCustomers,
                newCustomers,
                returningCustomers,
                avgLifetimeValue,
                avgOrdersPerCustomer,
                repeatPurchaseRate,
                segments: segmentData,
                comparison: {
                    newCustomersChange: calcChange(newCustomers, Number(prevNewCustomers?.count || 0)),
                    returningCustomersChange: 0, // Would need more complex calculation
                    ltvChange: 0, // Would need historical LTV data
                },
            };
        });
    }

    /**
     * Get conversion funnel data
     * 
     * Note: This is a simplified funnel based on order data.
     * For full funnel tracking, you'd need event tracking (views, cart adds, etc.)
     * 
     * @param tenantId - Tenant ID
     * @param startDate - Start date of the period
     * @param endDate - End date of the period
     */
    async getConversionFunnel(
        tenantId: string,
        startDate: Date,
        endDate: Date
    ): Promise<ConversionFunnelData> {
        return withTenant(tenantId, async (tx) => {
            // Get order counts by status to build funnel
            // This is a simplified funnel - real implementation would need event tracking
            
            // Total orders created (represents checkout initiated)
            const [totalOrders] = await tx
                .select({ count: count(orders.id), value: sum(orders.total) })
                .from(orders)
                .where(
                    and(
                        gte(orders.createdAt, startDate),
                        lte(orders.createdAt, endDate)
                    )
                );

            // Paid orders (represents completed purchases)
            const [paidOrders] = await tx
                .select({ count: count(orders.id), value: sum(orders.total) })
                .from(orders)
                .where(
                    and(
                        gte(orders.createdAt, startDate),
                        lte(orders.createdAt, endDate),
                        eq(orders.paymentStatus, "paid")
                    )
                );

            // Cancelled/failed orders
            const [cancelledOrders] = await tx
                .select({ count: count(orders.id) })
                .from(orders)
                .where(
                    and(
                        gte(orders.createdAt, startDate),
                        lte(orders.createdAt, endDate),
                        eq(orders.status, "cancelled")
                    )
                );

            const totalOrderCount = Number(totalOrders?.count || 0);
            const paidOrderCount = Number(paidOrders?.count || 0);
            const cancelledCount = Number(cancelledOrders?.count || 0);
            const totalValue = Number(totalOrders?.value || 0);
            const paidValue = Number(paidOrders?.value || 0);

            // Estimate funnel stages (simplified without actual event tracking)
            // In a real implementation, you'd track: page views → product views → add to cart → checkout → purchase
            const estimatedViews = totalOrderCount * 50; // Rough estimate
            const estimatedCartAdds = totalOrderCount * 3; // Rough estimate
            const checkoutStarts = totalOrderCount;
            const purchases = paidOrderCount;

            const stages: FunnelStageData[] = [
                {
                    stage: 'views',
                    label: 'Product Views',
                    count: estimatedViews,
                    value: 0,
                    conversionRate: 100,
                    dropoffRate: 0,
                },
                {
                    stage: 'cart',
                    label: 'Added to Cart',
                    count: estimatedCartAdds,
                    value: 0,
                    conversionRate: estimatedViews > 0 ? (estimatedCartAdds / estimatedViews) * 100 : 0,
                    dropoffRate: estimatedViews > 0 ? ((estimatedViews - estimatedCartAdds) / estimatedViews) * 100 : 0,
                },
                {
                    stage: 'checkout',
                    label: 'Checkout Started',
                    count: checkoutStarts,
                    value: totalValue,
                    conversionRate: estimatedCartAdds > 0 ? (checkoutStarts / estimatedCartAdds) * 100 : 0,
                    dropoffRate: estimatedCartAdds > 0 ? ((estimatedCartAdds - checkoutStarts) / estimatedCartAdds) * 100 : 0,
                },
                {
                    stage: 'purchase',
                    label: 'Completed Purchase',
                    count: purchases,
                    value: paidValue,
                    conversionRate: checkoutStarts > 0 ? (purchases / checkoutStarts) * 100 : 0,
                    dropoffRate: checkoutStarts > 0 ? ((checkoutStarts - purchases) / checkoutStarts) * 100 : 0,
                },
            ];

            const overallConversionRate = estimatedViews > 0 ? (purchases / estimatedViews) * 100 : 0;

            return {
                stages,
                overallConversionRate,
                avgTimeToConvert: null, // Would need timestamp tracking
            };
        });
    }

    /**
     * Get sales breakdown by category
     * 
     * @param tenantId - Tenant ID
     * @param startDate - Start date of the period
     * @param endDate - End date of the period
     */
    async getSalesByCategory(
        tenantId: string,
        startDate: Date,
        endDate: Date
    ): Promise<SalesByCategoryResponse> {
        return withTenant(tenantId, async (tx) => {
            // Get sales by category
            const result = await tx
                .select({
                    id: categories.id,
                    name: categories.name,
                    revenue: sum(orderItems.totalPrice),
                    orders: count(sql`DISTINCT ${orders.id}`),
                    quantity: sum(orderItems.quantity),
                })
                .from(orderItems)
                .innerJoin(orders, eq(orderItems.orderId, orders.id))
                .innerJoin(products, eq(orderItems.productId, products.id))
                .innerJoin(categories, eq(products.categoryId, categories.id))
                .where(
                    and(
                        gte(orders.createdAt, startDate),
                        lte(orders.createdAt, endDate),
                        eq(orders.paymentStatus, "paid")
                    )
                )
                .groupBy(categories.id, categories.name)
                .orderBy(desc(sum(orderItems.totalPrice)));

            // Get product counts per category
            const productCounts = await tx
                .select({
                    categoryId: products.categoryId,
                    count: count(products.id),
                })
                .from(products)
                .where(isNotNull(products.categoryId))
                .groupBy(products.categoryId);

            const productCountMap = new Map(
                productCounts.map((pc) => [pc.categoryId, Number(pc.count)])
            );

            // Get uncategorized revenue
            const [uncategorized] = await tx
                .select({
                    revenue: sum(orderItems.totalPrice),
                })
                .from(orderItems)
                .innerJoin(orders, eq(orderItems.orderId, orders.id))
                .innerJoin(products, eq(orderItems.productId, products.id))
                .where(
                    and(
                        gte(orders.createdAt, startDate),
                        lte(orders.createdAt, endDate),
                        eq(orders.paymentStatus, "paid"),
                        sql`${products.categoryId} IS NULL`
                    )
                );

            const totalRevenue = result.reduce((sum, row) => sum + Number(row.revenue || 0), 0);
            const uncategorizedRevenue = Number(uncategorized?.revenue || 0);

            const categoriesList: CategorySalesData[] = result.map((row) => {
                const revenue = Number(row.revenue || 0);
                const orderCount = Number(row.orders || 0);
                return {
                    id: row.id,
                    name: row.name,
                    revenue,
                    orders: orderCount,
                    quantity: Number(row.quantity || 0),
                    percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
                    avgOrderValue: orderCount > 0 ? revenue / orderCount : 0,
                    productCount: productCountMap.get(row.id) || 0,
                };
            });

            return {
                categories: categoriesList,
                totalRevenue: totalRevenue + uncategorizedRevenue,
                uncategorizedRevenue,
            };
        });
    }

    /**
     * Get orders by status with value breakdown
     * 
     * @param tenantId - Tenant ID
     * @param startDate - Start date of the period
     * @param endDate - End date of the period
     */
    async getOrdersByStatusDetailed(
        tenantId: string,
        startDate: Date,
        endDate: Date
    ): Promise<OrdersByStatusResponse> {
        return withTenant(tenantId, async (tx) => {
            const result = await tx
                .select({
                    status: orders.status,
                    count: count(orders.id),
                    value: sum(orders.total),
                })
                .from(orders)
                .where(
                    and(
                        gte(orders.createdAt, startDate),
                        lte(orders.createdAt, endDate)
                    )
                )
                .groupBy(orders.status);

            const totalOrders = result.reduce((sum, row) => sum + Number(row.count), 0);
            const totalValue = result.reduce((sum, row) => sum + Number(row.value || 0), 0);

            const statuses: OrdersByStatusData[] = result.map((row) => ({
                status: row.status as OrderStatusType,
                count: Number(row.count),
                percentage: totalOrders > 0 ? (Number(row.count) / totalOrders) * 100 : 0,
                value: Number(row.value || 0),
            }));

            // Sort by a logical order
            const statusOrder: OrderStatusType[] = [
                'pending', 'confirmed', 'processing', 'shipped', 
                'delivered', 'cancelled', 'returned', 'refunded'
            ];
            statuses.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

            return {
                statuses,
                totalOrders,
                totalValue,
            };
        });
    }
}

// Singleton instance
export const analyticsRepository = new AnalyticsRepository();
