"use server";

import { createLogger } from "@/lib/logger";
const log = createLogger("actions:analytics");


import { getAuthenticatedClient } from "@/lib/auth";
import { analyticsRepository } from "@/features/analytics/repositories";
import { startOfDay, endOfDay, subDays, startOfYear } from "date-fns";
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
    TopProduct,
    TopCategory,
    OrdersByStatus,
    CustomerSegment,
    AnalyticsData,
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
    };

    const topProducts: TopProduct[] = repoTopProducts.map(p => ({
        id: p.id,
        name: p.name,
        image: p.imageUrl,
        revenue: p.revenue,
        quantity: p.quantity,
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

const escapeCSV = (s: string) => `"${s.replace(/"/g, '""').replace(/^[=+\-@\t\r]/g, "'$&")}"`;

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
            "Name,Revenue,Quantity",
            ...data.topProducts.map(p => `${escapeCSV(p.name)},${p.revenue.toFixed(2)},${p.quantity}`),
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
