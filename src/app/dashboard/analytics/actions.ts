"use server";

import { createLogger } from "@/lib/logger";
const log = createLogger("actions:analytics");

import { createClient } from "@/infrastructure/supabase/server";
import { getAuthenticatedClient } from "@/lib/auth";
import { analyticsRepository } from "@/features/analytics/repositories";
import { redirect } from "next/navigation";
import { startOfDay, endOfDay, subDays, format, eachDayOfInterval, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import type {
    AnalyticsGranularity,
    RevenueByPeriod,
    TopProductsResponse,
    CustomerMetrics,
    ConversionFunnelData,
    SalesByCategoryResponse,
    OrdersByStatusResponse,
} from "@/features/analytics/repositories/analytics-types";

import { z } from "zod";
import type {
    DateRange,
    AnalyticsOverview,
    RevenueDataPoint,
    TopProduct,
    TopCategory,
    OrdersByStatus,
    CustomerSegment,
    AnalyticsData,
    OrderRow,
    OrderItemRow,
    ProductRow,
    CategoryRow,
    CustomerRow,
} from "./types";

const dateRangeSchema = z.enum(["today", "7d", "30d", "90d", "12m", "year", "custom"]);
const optionalDateString = z.string().datetime({ offset: true }).or(z.string().date()).optional();

async function getAuthenticatedUser() {
    const { user, supabase } = await getAuthenticatedClient();
    return { supabase, user, tenantId: user.tenantId };
}

function getDateRange(range: DateRange, customFrom?: string, customTo?: string): { from: Date; to: Date; previousFrom: Date; previousTo: Date } {
    const now = new Date();
    let from: Date;
    let to = endOfDay(now);
    
    switch (range) {
        case "7d":
            from = startOfDay(subDays(now, 6));
            break;
        case "30d":
            from = startOfDay(subDays(now, 29));
            break;
        case "90d":
            from = startOfDay(subDays(now, 89));
            break;
        case "12m":
            from = startOfDay(subDays(now, 364));
            break;
        case "custom":
            from = customFrom ? startOfDay(new Date(customFrom)) : startOfDay(subDays(now, 29));
            to = customTo ? endOfDay(new Date(customTo)) : endOfDay(now);
            break;
        default:
            from = startOfDay(subDays(now, 29));
    }

    const duration = to.getTime() - from.getTime();
    const previousTo = new Date(from.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - duration);

    return { from, to, previousFrom, previousTo };
}

export async function getAnalyticsData(
    range: DateRange = "30d",
    customFrom?: string,
    customTo?: string
): Promise<AnalyticsData> {
    const validRange = dateRangeSchema.parse(range);
    const validFrom = optionalDateString.parse(customFrom);
    const validTo = optionalDateString.parse(customTo);
    const { supabase, tenantId } = await getAuthenticatedUser();
    const { from, to, previousFrom, previousTo } = getDateRange(validRange, validFrom, validTo);

    // Use repository methods for analytics data
    const [
        repoOverview,
        repoRevenueChart,
        repoTopProducts,
        repoTopCategories,
        repoOrdersByStatus,
        repoCustomerSegments,
        repoRecentOrders,
    ] = await Promise.all([
        analyticsRepository.getOverview(tenantId, from, to),
        analyticsRepository.getRevenueChart(tenantId, from, to),
        analyticsRepository.getTopProducts(tenantId, from, to, 5),
        analyticsRepository.getTopCategories(tenantId, from, to, 5),
        analyticsRepository.getOrdersByStatus(tenantId, from, to),
        analyticsRepository.getCustomerSegments(tenantId),
        analyticsRepository.getRecentOrders(tenantId, 5),
    ]);

    // Transform repository data to match expected interface
    const overview: AnalyticsOverview = {
        revenue: repoOverview.revenue,
        revenueChange: repoOverview.revenueChange,
        orders: repoOverview.ordersCount,
        ordersChange: repoOverview.ordersChange,
        avgOrderValue: repoOverview.avgOrderValue,
        avgOrderValueChange: repoOverview.avgOrderValueChange,
        customers: repoOverview.customersCount,
        customersChange: repoOverview.customersChange,
        conversionRate: 0, // Not calculated in repository
        conversionRateChange: 0,
        itemsPerOrder: 0, // Not calculated in repository
    };

    const topProducts: TopProduct[] = repoTopProducts.map(p => ({
        id: p.id,
        name: p.name,
        image: p.imageUrl,
        revenue: p.revenue,
        quantity: p.quantity,
        orders: 0, // Not tracked in repository
    }));

    const topCategories: TopCategory[] = repoTopCategories.map(c => ({
        id: c.id,
        name: c.name,
        revenue: c.revenue,
        orders: c.ordersCount,
        percentage: 0, // Calculate if needed
    }));

    // Calculate percentage for categories
    const totalCategoryRevenue = topCategories.reduce((sum, c) => sum + c.revenue, 0);
    topCategories.forEach(c => {
        c.percentage = totalCategoryRevenue > 0 ? (c.revenue / totalCategoryRevenue) * 100 : 0;
    });

    const customerSegments: CustomerSegment[] = repoCustomerSegments.map(s => ({
        segment: s.segment.charAt(0).toUpperCase() + s.segment.slice(1),
        count: s.count,
        revenue: s.revenue,
        percentage: s.percentage,
    }));

    const recentOrders = repoRecentOrders.map(o => ({
        id: o.id,
        order_number: o.orderNumber,
        total: parseFloat(o.total),
        status: o.status,
        created_at: o.createdAt.toISOString(),
        customer_name: o.customerName,
    }));

    return {
        overview,
        revenueChart: repoRevenueChart,
        topProducts,
        topCategories,
        ordersByStatus: repoOrdersByStatus,
        customerSegments,
        recentOrders,
    };
}


function calculateOverview(
    currentOrders: OrderRow[],
    previousOrders: OrderRow[],
    currentCustomers: CustomerRow[],
    previousCustomers: CustomerRow[],
    orderItems: OrderItemRow[]
): AnalyticsOverview {
    // Current period metrics
    const paidOrders = currentOrders.filter(o => o.payment_status === "paid");
    const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const orders = currentOrders.length;
    const avgOrderValue = orders > 0 ? revenue / paidOrders.length : 0;
    const customers = currentCustomers.length;
    const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const itemsPerOrder = orders > 0 ? totalItems / orders : 0;

    // Previous period metrics
    const prevPaidOrders = previousOrders.filter(o => o.payment_status === "paid");
    const prevRevenue = prevPaidOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const prevOrders = previousOrders.length;
    const prevAvgOrderValue = prevOrders > 0 ? prevRevenue / prevPaidOrders.length : 0;
    const prevCustomers = previousCustomers.length;

    // Calculate changes
    const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersChange = prevOrders > 0 ? ((orders - prevOrders) / prevOrders) * 100 : 0;
    const avgOrderValueChange = prevAvgOrderValue > 0 ? ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100 : 0;
    const customersChange = prevCustomers > 0 ? ((customers - prevCustomers) / prevCustomers) * 100 : 0;

    // Conversion rate (orders / unique customers who ordered)
    const uniqueCustomers = new Set(currentOrders.map(o => o.customer_id).filter(Boolean)).size;
    const conversionRate = customers > 0 ? (uniqueCustomers / customers) * 100 : 0;
    const prevUniqueCustomers = new Set(previousOrders.map(o => o.customer_id).filter(Boolean)).size;
    const prevConversionRate = prevCustomers > 0 ? (prevUniqueCustomers / prevCustomers) * 100 : 0;
    const conversionRateChange = prevConversionRate > 0 ? ((conversionRate - prevConversionRate) / prevConversionRate) * 100 : 0;

    return {
        revenue,
        revenueChange,
        orders,
        ordersChange,
        avgOrderValue,
        avgOrderValueChange,
        customers,
        customersChange,
        conversionRate,
        conversionRateChange,
        itemsPerOrder,
    };
}

function generateRevenueChart(
    orders: OrderRow[],
    from: Date,
    to: Date,
    range: DateRange
): RevenueDataPoint[] {
    const paidOrders = orders.filter(o => o.payment_status === "paid");
    
    // Determine grouping based on range
    let interval: "day" | "week" | "month" = "day";
    if (range === "90d" || range === "12m") {
        interval = range === "12m" ? "month" : "week";
    }

    const days = eachDayOfInterval({ start: from, end: to });
    const dataMap = new Map<string, { revenue: number; orders: number }>();

    // Initialize all dates
    days.forEach(day => {
        let key: string;
        if (interval === "month") {
            key = format(startOfMonth(day), "yyyy-MM");
        } else if (interval === "week") {
            key = format(startOfWeek(day), "yyyy-MM-dd");
        } else {
            key = format(day, "yyyy-MM-dd");
        }
        if (!dataMap.has(key)) {
            dataMap.set(key, { revenue: 0, orders: 0 });
        }
    });

    // Aggregate orders
    paidOrders.forEach(order => {
        const orderDate = new Date(order.created_at);
        let key: string;
        if (interval === "month") {
            key = format(startOfMonth(orderDate), "yyyy-MM");
        } else if (interval === "week") {
            key = format(startOfWeek(orderDate), "yyyy-MM-dd");
        } else {
            key = format(orderDate, "yyyy-MM-dd");
        }
        
        const existing = dataMap.get(key) || { revenue: 0, orders: 0 };
        existing.revenue += Number(order.total);
        existing.orders += 1;
        dataMap.set(key, existing);
    });

    // Convert to array and sort
    return Array.from(dataMap.entries())
        .map(([date, data]) => ({
            date,
            revenue: data.revenue,
            orders: data.orders,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateTopProducts(orderItems: OrderItemRow[], products: ProductRow[]): TopProduct[] {
    const productMap = new Map<string, { revenue: number; quantity: number; orders: Set<string> }>();

    orderItems.forEach(item => {
        if (!item.product_id) return;
        const existing = productMap.get(item.product_id) || { revenue: 0, quantity: 0, orders: new Set() };
        existing.revenue += Number(item.total_price);
        existing.quantity += item.quantity;
        existing.orders.add(item.order_id);
        productMap.set(item.product_id, existing);
    });

    const productLookup = new Map(products.map(p => [p.id, p]));

    return Array.from(productMap.entries())
        .map(([productId, data]) => {
            const product = productLookup.get(productId);
            const images = product?.images as Array<{ url: string }> | null;
            return {
                id: productId,
                name: product?.name || "Unknown Product",
                image: images?.[0]?.url || null,
                revenue: data.revenue,
                quantity: data.quantity,
                orders: data.orders.size,
            };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
}

function calculateTopCategories(orderItems: OrderItemRow[], products: ProductRow[], categories: CategoryRow[]): TopCategory[] {
    const categoryMap = new Map<string, { revenue: number; orders: Set<string> }>();
    const productCategoryMap = new Map(products.map(p => [p.id, p.category_id]));
    const categoryLookup = new Map(categories.map(c => [c.id, c.name]));

    let totalRevenue = 0;

    orderItems.forEach(item => {
        if (!item.product_id) return;
        const categoryId = productCategoryMap.get(item.product_id);
        if (!categoryId) return;

        const existing = categoryMap.get(categoryId) || { revenue: 0, orders: new Set() };
        existing.revenue += Number(item.total_price);
        existing.orders.add(item.order_id);
        categoryMap.set(categoryId, existing);
        totalRevenue += Number(item.total_price);
    });

    return Array.from(categoryMap.entries())
        .map(([categoryId, data]) => ({
            id: categoryId,
            name: categoryLookup.get(categoryId) || "Uncategorized",
            revenue: data.revenue,
            orders: data.orders.size,
            percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
}

function calculateOrdersByStatus(orders: OrderRow[]): OrdersByStatus[] {
    const statusMap = new Map<string, number>();
    const total = orders.length;

    orders.forEach(order => {
        statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1);
    });

    const statusOrder = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

    return statusOrder
        .filter(status => statusMap.has(status))
        .map(status => ({
            status,
            count: statusMap.get(status) || 0,
            percentage: total > 0 ? ((statusMap.get(status) || 0) / total) * 100 : 0,
        }));
}

async function calculateCustomerSegments(
    supabase: Awaited<ReturnType<typeof createClient>>,
    tenantId: string,
    from: Date,
    to: Date
): Promise<CustomerSegment[]> {
    // Get all orders with customer info
    const { data: allOrders } = await supabase
        .from("orders")
        .select("customer_id, total, payment_status")
        .eq("tenant_id", tenantId)
        .eq("payment_status", "paid");

    // Group by customer
    const customerOrders = new Map<string, { count: number; total: number }>();
    
    allOrders?.forEach(order => {
        if (!order.customer_id) return;
        const existing = customerOrders.get(order.customer_id) || { count: 0, total: 0 };
        existing.count += 1;
        existing.total += Number(order.total);
        customerOrders.set(order.customer_id, existing);
    });

    // Segment customers
    let newCustomers = 0, returning = 0, loyal = 0, vip = 0;
    let newRevenue = 0, returningRevenue = 0, loyalRevenue = 0, vipRevenue = 0;

    customerOrders.forEach(data => {
        if (data.count === 1) {
            newCustomers++;
            newRevenue += data.total;
        } else if (data.count <= 3) {
            returning++;
            returningRevenue += data.total;
        } else if (data.count <= 10) {
            loyal++;
            loyalRevenue += data.total;
        } else {
            vip++;
            vipRevenue += data.total;
        }
    });

    const total = newCustomers + returning + loyal + vip;

    return [
        { segment: "New", count: newCustomers, revenue: newRevenue, percentage: total > 0 ? (newCustomers / total) * 100 : 0 },
        { segment: "Returning", count: returning, revenue: returningRevenue, percentage: total > 0 ? (returning / total) * 100 : 0 },
        { segment: "Loyal", count: loyal, revenue: loyalRevenue, percentage: total > 0 ? (loyal / total) * 100 : 0 },
        { segment: "VIP", count: vip, revenue: vipRevenue, percentage: total > 0 ? (vip / total) * 100 : 0 },
    ].filter(s => s.count > 0);
}

export async function exportAnalyticsReport(
    range: DateRange = "30d",
    customFrom?: string,
    customTo?: string
): Promise<{ csv?: string; error?: string }> {
    try {
        const validRange = dateRangeSchema.parse(range);
        const validFrom = optionalDateString.parse(customFrom);
        const validTo = optionalDateString.parse(customTo);
        const data = await getAnalyticsData(validRange, validFrom, validTo);
        
        const lines = [
            "Analytics Report",
            `Period: ${range}`,
            "",
            "Overview",
            `Revenue,${data.overview.revenue.toFixed(2)}`,
            `Orders,${data.overview.orders}`,
            `Average Order Value,${data.overview.avgOrderValue.toFixed(2)}`,
            `Customers,${data.overview.customers}`,
            "",
            "Top Products",
            "Name,Revenue,Quantity,Orders",
            ...data.topProducts.map(p => `"${p.name}",${p.revenue.toFixed(2)},${p.quantity},${p.orders}`),
            "",
            "Revenue by Date",
            "Date,Revenue,Orders",
            ...data.revenueChart.map(d => `${d.date},${d.revenue.toFixed(2)},${d.orders}`),
        ];

        return { csv: lines.join("\n") };
    } catch (err) {
        log.error("Export analytics error:", err);
        return { error: err instanceof Error ? err.message : "Failed to export report" };
    }
}

// ============================================================================
// NEW ADVANCED ANALYTICS SERVER ACTIONS
// ============================================================================

/**
 * Get date range from period string
 */
function getDateRangeFromPeriod(
    range: DateRange,
    customFrom?: string,
    customTo?: string
): { from: Date; to: Date } {
    const now = new Date();
    let from: Date;
    let to = endOfDay(now);
    
    switch (range) {
        case "today":
            from = startOfDay(now);
            break;
        case "7d":
            from = startOfDay(subDays(now, 6));
            break;
        case "30d":
            from = startOfDay(subDays(now, 29));
            break;
        case "90d":
            from = startOfDay(subDays(now, 89));
            break;
        case "12m":
        case "year":
            from = startOfYear(now);
            break;
        case "custom":
            from = customFrom ? startOfDay(new Date(customFrom)) : startOfDay(subDays(now, 29));
            to = customTo ? endOfDay(new Date(customTo)) : endOfDay(now);
            break;
        default:
            from = startOfDay(subDays(now, 29));
    }

    return { from, to };
}

/**
 * Get granularity based on date range
 */
function getGranularityFromRange(range: DateRange): AnalyticsGranularity {
    switch (range) {
        case "today":
            return "hour";
        case "7d":
        case "30d":
            return "day";
        case "90d":
            return "week";
        case "12m":
        case "year":
            return "month";
        default:
            return "day";
    }
}

/**
 * Get revenue by period with configurable granularity
 */
export async function getRevenueByPeriod(
    range: DateRange = "30d",
    customFrom?: string,
    customTo?: string,
    granularity?: AnalyticsGranularity
): Promise<RevenueByPeriod> {
    const validRange = dateRangeSchema.parse(range);
    const validFrom = optionalDateString.parse(customFrom);
    const validTo = optionalDateString.parse(customTo);
    const { tenantId } = await getAuthenticatedUser();
    const { from, to } = getDateRangeFromPeriod(validRange, validFrom, validTo);
    const resolvedGranularity = granularity || getGranularityFromRange(range);
    
    return analyticsRepository.getRevenueByPeriod(tenantId, from, to, resolvedGranularity);
}

/**
 * Get top products with detailed metrics
 */
export async function getTopProducts(
    range: DateRange = "30d",
    limit: number = 10,
    customFrom?: string,
    customTo?: string
): Promise<TopProductsResponse> {
    const validRange = dateRangeSchema.parse(range);
    const validLimit = z.number().int().min(1).max(100).parse(limit);
    const validFrom = optionalDateString.parse(customFrom);
    const validTo = optionalDateString.parse(customTo);
    const { tenantId } = await getAuthenticatedUser();
    const { from, to } = getDateRangeFromPeriod(validRange, validFrom, validTo);
    
    return analyticsRepository.getTopProductsDetailed(tenantId, validLimit, from, to);
}

/**
 * Get customer metrics including LTV and segmentation
 */
export async function getCustomerMetricsData(
    range: DateRange = "30d",
    customFrom?: string,
    customTo?: string
): Promise<CustomerMetrics> {
    const validRange = dateRangeSchema.parse(range);
    const validFrom = optionalDateString.parse(customFrom);
    const validTo = optionalDateString.parse(customTo);
    const { tenantId } = await getAuthenticatedUser();
    const { from, to } = getDateRangeFromPeriod(validRange, validFrom, validTo);
    
    return analyticsRepository.getCustomerMetrics(tenantId, from, to);
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnelData(
    range: DateRange = "30d",
    customFrom?: string,
    customTo?: string
): Promise<ConversionFunnelData> {
    const validRange = dateRangeSchema.parse(range);
    const validFrom = optionalDateString.parse(customFrom);
    const validTo = optionalDateString.parse(customTo);
    const { tenantId } = await getAuthenticatedUser();
    const { from, to } = getDateRangeFromPeriod(validRange, validFrom, validTo);
    
    return analyticsRepository.getConversionFunnel(tenantId, from, to);
}

/**
 * Get sales breakdown by category
 */
export async function getSalesByCategoryData(
    range: DateRange = "30d",
    customFrom?: string,
    customTo?: string
): Promise<SalesByCategoryResponse> {
    const validRange = dateRangeSchema.parse(range);
    const validFrom = optionalDateString.parse(customFrom);
    const validTo = optionalDateString.parse(customTo);
    const { tenantId } = await getAuthenticatedUser();
    const { from, to } = getDateRangeFromPeriod(validRange, validFrom, validTo);
    
    return analyticsRepository.getSalesByCategory(tenantId, from, to);
}

/**
 * Get orders by status with value breakdown
 */
export async function getOrdersByStatusData(
    range: DateRange = "30d",
    customFrom?: string,
    customTo?: string
): Promise<OrdersByStatusResponse> {
    const validRange = dateRangeSchema.parse(range);
    const validFrom = optionalDateString.parse(customFrom);
    const validTo = optionalDateString.parse(customTo);
    const { tenantId } = await getAuthenticatedUser();
    const { from, to } = getDateRangeFromPeriod(validRange, validFrom, validTo);
    
    return analyticsRepository.getOrdersByStatusDetailed(tenantId, from, to);
}

/**
 * Get all advanced analytics data in one call
 */
export async function getAdvancedAnalyticsData(
    range: DateRange = "30d",
    customFrom?: string,
    customTo?: string
): Promise<{
    revenueByPeriod: RevenueByPeriod;
    topProducts: TopProductsResponse;
    customerMetrics: CustomerMetrics;
    conversionFunnel: ConversionFunnelData;
    salesByCategory: SalesByCategoryResponse;
    ordersByStatus: OrdersByStatusResponse;
}> {
    const validRange = dateRangeSchema.parse(range);
    const validFrom = optionalDateString.parse(customFrom);
    const validTo = optionalDateString.parse(customTo);
    const { tenantId } = await getAuthenticatedUser();
    const { from, to } = getDateRangeFromPeriod(validRange, validFrom, validTo);
    const granularity = getGranularityFromRange(validRange);

    const [
        revenueByPeriod,
        topProducts,
        customerMetrics,
        conversionFunnel,
        salesByCategory,
        ordersByStatus,
    ] = await Promise.all([
        analyticsRepository.getRevenueByPeriod(tenantId, from, to, granularity),
        analyticsRepository.getTopProductsDetailed(tenantId, 10, from, to),
        analyticsRepository.getCustomerMetrics(tenantId, from, to),
        analyticsRepository.getConversionFunnel(tenantId, from, to),
        analyticsRepository.getSalesByCategory(tenantId, from, to),
        analyticsRepository.getOrdersByStatusDetailed(tenantId, from, to),
    ]);

    return {
        revenueByPeriod,
        topProducts,
        customerMetrics,
        conversionFunnel,
        salesByCategory,
        ordersByStatus,
    };
}
