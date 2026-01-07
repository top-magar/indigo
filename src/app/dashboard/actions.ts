"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { redirect } from "next/navigation";
import { startOfDay, endOfDay, subDays, startOfYear, format, eachDayOfInterval, startOfWeek, startOfMonth } from "date-fns";
import type {
    RevenueByPeriod,
    OrdersByStatusResponse,
    ConversionFunnelData,
    TopProductsResponse,
} from "@/features/analytics/repositories/analytics-types";

// ============================================================================
// Authentication Helper
// ============================================================================

async function getAuthenticatedUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/auth/login");
    }

    const { data: userData } = await supabase
        .from("users")
        .select("*, tenants(*)")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) {
        redirect("/auth/login");
    }

    return { 
        supabase, 
        user, 
        userData, 
        tenantId: userData.tenant_id, 
        tenant: userData.tenants,
        currency: userData.tenants?.currency || "USD",
    };
}

// ============================================================================
// Date Range Helpers
// ============================================================================

export type DashboardPeriod = "7d" | "30d" | "90d" | "1y";

function getDateRangeFromPeriod(period: DashboardPeriod): { from: Date; to: Date; previousFrom: Date; previousTo: Date } {
    const now = new Date();
    let from: Date;
    const to = endOfDay(now);
    
    switch (period) {
        case "7d":
            from = startOfDay(subDays(now, 6));
            break;
        case "30d":
            from = startOfDay(subDays(now, 29));
            break;
        case "90d":
            from = startOfDay(subDays(now, 89));
            break;
        case "1y":
            from = startOfYear(now);
            break;
        default:
            from = startOfDay(subDays(now, 29));
    }

    // Calculate previous period for comparison
    const duration = to.getTime() - from.getTime();
    const previousTo = new Date(from.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - duration);

    return { from, to, previousFrom, previousTo };
}

function getGranularity(period: DashboardPeriod): "day" | "week" | "month" {
    switch (period) {
        case "7d":
        case "30d":
            return "day";
        case "90d":
            return "week";
        case "1y":
            return "month";
        default:
            return "day";
    }
}

// ============================================================================
// Dashboard Stats
// ============================================================================

export interface DashboardStats {
    revenue: number;
    revenueChange: number;
    orders: number;
    ordersChange: number;
    customers: number;
    customersChange: number;
    avgOrderValue: number;
    avgOrderValueChange: number;
    currency: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const { supabase, tenantId, currency } = await getAuthenticatedUser();
    
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
        { data: currentOrders },
        { data: previousOrders },
        { count: totalCustomers },
        { count: newCustomers },
        { count: previousCustomers },
    ] = await Promise.all([
        supabase
            .from("orders")
            .select("id, total, payment_status")
            .eq("tenant_id", tenantId)
            .gte("created_at", currentMonthStart.toISOString()),
        supabase
            .from("orders")
            .select("id, total, payment_status")
            .eq("tenant_id", tenantId)
            .gte("created_at", previousMonthStart.toISOString())
            .lte("created_at", previousMonthEnd.toISOString()),
        supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .eq("tenant_id", tenantId),
        supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .eq("tenant_id", tenantId)
            .gte("created_at", currentMonthStart.toISOString()),
        supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .eq("tenant_id", tenantId)
            .gte("created_at", previousMonthStart.toISOString())
            .lte("created_at", previousMonthEnd.toISOString()),
    ]);

    // Calculate current metrics
    const paidOrders = (currentOrders || []).filter(o => o.payment_status === "paid");
    const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const orders = (currentOrders || []).length;
    const avgOrderValue = paidOrders.length > 0 ? revenue / paidOrders.length : 0;

    // Calculate previous metrics
    const prevPaidOrders = (previousOrders || []).filter(o => o.payment_status === "paid");
    const prevRevenue = prevPaidOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const prevOrders = (previousOrders || []).length;
    const prevAvgOrderValue = prevPaidOrders.length > 0 ? prevRevenue / prevPaidOrders.length : 0;

    // Calculate changes
    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    return {
        revenue,
        revenueChange: calculateChange(revenue, prevRevenue),
        orders,
        ordersChange: calculateChange(orders, prevOrders),
        customers: totalCustomers || 0,
        customersChange: calculateChange(newCustomers || 0, previousCustomers || 0),
        avgOrderValue,
        avgOrderValueChange: calculateChange(avgOrderValue, prevAvgOrderValue),
        currency,
    };
}

// ============================================================================
// Revenue Data
// ============================================================================

export async function getRevenueData(period: DashboardPeriod = "30d"): Promise<RevenueByPeriod> {
    const { supabase, tenantId } = await getAuthenticatedUser();
    const { from, to, previousFrom, previousTo } = getDateRangeFromPeriod(period);
    const granularity = getGranularity(period);

    // Fetch orders for current and previous periods
    const [{ data: currentOrders }, { data: previousOrders }] = await Promise.all([
        supabase
            .from("orders")
            .select("id, total, payment_status, created_at")
            .eq("tenant_id", tenantId)
            .eq("payment_status", "paid")
            .gte("created_at", from.toISOString())
            .lte("created_at", to.toISOString()),
        supabase
            .from("orders")
            .select("id, total, payment_status, created_at")
            .eq("tenant_id", tenantId)
            .eq("payment_status", "paid")
            .gte("created_at", previousFrom.toISOString())
            .lte("created_at", previousTo.toISOString()),
    ]);

    // Generate date intervals
    const days = eachDayOfInterval({ start: from, end: to });
    const dataMap = new Map<string, { revenue: number; orders: number }>();

    // Initialize all dates
    days.forEach(day => {
        let key: string;
        if (granularity === "month") {
            key = format(startOfMonth(day), "yyyy-MM");
        } else if (granularity === "week") {
            key = format(startOfWeek(day), "yyyy-MM-dd");
        } else {
            key = format(day, "yyyy-MM-dd");
        }
        if (!dataMap.has(key)) {
            dataMap.set(key, { revenue: 0, orders: 0 });
        }
    });

    // Aggregate current orders
    (currentOrders || []).forEach(order => {
        const orderDate = new Date(order.created_at);
        let key: string;
        if (granularity === "month") {
            key = format(startOfMonth(orderDate), "yyyy-MM");
        } else if (granularity === "week") {
            key = format(startOfWeek(orderDate), "yyyy-MM-dd");
        } else {
            key = format(orderDate, "yyyy-MM-dd");
        }
        
        const existing = dataMap.get(key) || { revenue: 0, orders: 0 };
        existing.revenue += Number(order.total);
        existing.orders += 1;
        dataMap.set(key, existing);
    });

    // Convert to array
    const data = Array.from(dataMap.entries())
        .map(([date, values]) => ({
            date,
            revenue: values.revenue,
            orders: values.orders,
            avgOrderValue: values.orders > 0 ? values.revenue / values.orders : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate totals
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate previous period totals
    const prevRevenue = (previousOrders || []).reduce((sum, o) => sum + Number(o.total), 0);
    const prevOrders = (previousOrders || []).length;

    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    return {
        data,
        totals: {
            revenue: totalRevenue,
            orders: totalOrders,
            avgOrderValue,
        },
        comparison: {
            revenue: prevRevenue,
            revenueChange: calculateChange(totalRevenue, prevRevenue),
            orders: prevOrders,
            ordersChange: calculateChange(totalOrders, prevOrders),
        },
    };
}

// ============================================================================
// Orders by Status
// ============================================================================

export async function getOrdersByStatus(): Promise<OrdersByStatusResponse> {
    const { supabase, tenantId } = await getAuthenticatedUser();
    
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    const { data: orders } = await supabase
        .from("orders")
        .select("id, status, total")
        .eq("tenant_id", tenantId)
        .gte("created_at", thirtyDaysAgo.toISOString());

    if (!orders || orders.length === 0) {
        return {
            statuses: [],
            totalOrders: 0,
            totalValue: 0,
        };
    }

    // Group by status
    const statusMap = new Map<string, { count: number; value: number }>();
    let totalValue = 0;

    orders.forEach(order => {
        const existing = statusMap.get(order.status) || { count: 0, value: 0 };
        existing.count += 1;
        existing.value += Number(order.total);
        statusMap.set(order.status, existing);
        totalValue += Number(order.total);
    });

    const totalOrders = orders.length;
    const statusOrder = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

    const statuses = statusOrder
        .filter(status => statusMap.has(status))
        .map(status => {
            const data = statusMap.get(status)!;
            return {
                status: status as any,
                count: data.count,
                percentage: (data.count / totalOrders) * 100,
                value: data.value,
            };
        });

    return {
        statuses,
        totalOrders,
        totalValue,
    };
}

// ============================================================================
// Conversion Funnel
// ============================================================================

export async function getConversionFunnel(): Promise<ConversionFunnelData> {
    const { supabase, tenantId } = await getAuthenticatedUser();
    
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // Get cart and order data
    const [{ count: cartCount }, { data: orders }] = await Promise.all([
        supabase
            .from("carts")
            .select("*", { count: "exact", head: true })
            .eq("tenant_id", tenantId)
            .gte("created_at", thirtyDaysAgo.toISOString()),
        supabase
            .from("orders")
            .select("id, total, payment_status")
            .eq("tenant_id", tenantId)
            .gte("created_at", thirtyDaysAgo.toISOString()),
    ]);

    // Estimate funnel stages (in a real app, you'd track these events)
    const totalCarts = cartCount || 0;
    const checkoutStarted = Math.floor(totalCarts * 0.6); // Estimate 60% start checkout
    const purchases = (orders || []).filter(o => o.payment_status === "paid").length;
    const purchaseValue = (orders || []).filter(o => o.payment_status === "paid")
        .reduce((sum, o) => sum + Number(o.total), 0);

    // Estimate visitors (in a real app, you'd use analytics)
    const estimatedVisitors = Math.max(totalCarts * 3, purchases * 10, 100);

    const stages = [
        {
            stage: "views" as const,
            label: "Visitors",
            count: estimatedVisitors,
            value: 0,
            conversionRate: 100,
            dropoffRate: 0,
        },
        {
            stage: "cart" as const,
            label: "Added to Cart",
            count: totalCarts,
            value: 0,
            conversionRate: estimatedVisitors > 0 ? (totalCarts / estimatedVisitors) * 100 : 0,
            dropoffRate: estimatedVisitors > 0 ? ((estimatedVisitors - totalCarts) / estimatedVisitors) * 100 : 0,
        },
        {
            stage: "checkout" as const,
            label: "Started Checkout",
            count: checkoutStarted,
            value: 0,
            conversionRate: totalCarts > 0 ? (checkoutStarted / totalCarts) * 100 : 0,
            dropoffRate: totalCarts > 0 ? ((totalCarts - checkoutStarted) / totalCarts) * 100 : 0,
        },
        {
            stage: "purchase" as const,
            label: "Completed Purchase",
            count: purchases,
            value: purchaseValue,
            conversionRate: checkoutStarted > 0 ? (purchases / checkoutStarted) * 100 : 0,
            dropoffRate: checkoutStarted > 0 ? ((checkoutStarted - purchases) / checkoutStarted) * 100 : 0,
        },
    ];

    return {
        stages,
        overallConversionRate: estimatedVisitors > 0 ? (purchases / estimatedVisitors) * 100 : 0,
        avgTimeToConvert: null, // Would need event tracking to calculate
    };
}

// ============================================================================
// Top Products
// ============================================================================

export async function getTopProducts(limit: number = 5): Promise<TopProductsResponse> {
    const { supabase, tenantId } = await getAuthenticatedUser();
    
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // Get order items with product info
    const { data: orderItems } = await supabase
        .from("order_items")
        .select(`
            product_id,
            product_name,
            quantity,
            unit_price,
            total_price,
            orders!inner(payment_status, created_at)
        `)
        .eq("tenant_id", tenantId)
        .gte("orders.created_at", thirtyDaysAgo.toISOString())
        .eq("orders.payment_status", "paid");

    if (!orderItems || orderItems.length === 0) {
        return {
            products: [],
            totalRevenue: 0,
            totalQuantity: 0,
        };
    }

    // Aggregate by product
    const productMap = new Map<string, {
        name: string;
        revenue: number;
        quantity: number;
        orders: Set<string>;
    }>();

    let totalRevenue = 0;
    let totalQuantity = 0;

    orderItems.forEach(item => {
        if (!item.product_id) return;
        
        const existing = productMap.get(item.product_id) || {
            name: item.product_name,
            revenue: 0,
            quantity: 0,
            orders: new Set(),
        };
        
        existing.revenue += Number(item.total_price);
        existing.quantity += item.quantity;
        productMap.set(item.product_id, existing);
        
        totalRevenue += Number(item.total_price);
        totalQuantity += item.quantity;
    });

    // Get product images
    const productIds = Array.from(productMap.keys());
    const { data: products } = await supabase
        .from("products")
        .select("id, images, sku")
        .in("id", productIds);

    const productLookup = new Map(products?.map(p => [p.id, p]) || []);

    // Convert to array and sort
    const sortedProducts = Array.from(productMap.entries())
        .map(([id, data]) => {
            const product = productLookup.get(id);
            const images = product?.images as Array<{ url: string }> | null;
            return {
                id,
                name: data.name,
                sku: product?.sku || null,
                imageUrl: images?.[0]?.url || null,
                revenue: data.revenue,
                quantity: data.quantity,
                orders: data.orders.size,
                avgPrice: data.quantity > 0 ? data.revenue / data.quantity : 0,
                revenueShare: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
            };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);

    return {
        products: sortedProducts,
        totalRevenue,
        totalQuantity,
    };
}

// ============================================================================
// Save Layout Preferences
// ============================================================================

import { dashboardLayoutsRepository } from "@/features/dashboard/repositories/dashboard-layouts";

export interface LayoutPreferences {
    widgets: Array<{
        id: string;
        type: string;
        position: { x: number; y: number; width: number; height: number };
        visible: boolean;
    }>;
    columns: number;
    rowHeight: number;
    gap: number;
}

export async function saveLayoutPreferences(preferences: LayoutPreferences): Promise<{ success: boolean; error?: string }> {
    const { tenantId, user } = await getAuthenticatedUser();
    
    try {
        // Transform preferences to match repository input format
        const layoutPreferences = {
            widgets: preferences.widgets.map(widget => ({
                id: widget.id,
                type: widget.type,
                position: widget.position,
                visible: widget.visible,
            })),
            columns: preferences.columns,
            rowHeight: preferences.rowHeight,
            gap: preferences.gap,
        };

        // Persist to database using the repository
        await dashboardLayoutsRepository.saveLayoutPreferences(
            tenantId,
            user.id,
            layoutPreferences
        );

        return { success: true };
    } catch (err) {
        console.error("Error saving layout preferences:", err);
        return { success: false, error: "Failed to save preferences" };
    }
}

export async function getLayoutPreferences(): Promise<LayoutPreferences | null> {
    const { tenantId, user } = await getAuthenticatedUser();
    
    try {
        // Get the default layout from the repository
        const layout = await dashboardLayoutsRepository.getDefaultForUser(tenantId, user.id);

        if (!layout || !layout.widgets) {
            return null;
        }

        return {
            widgets: (layout.widgets as Array<{
                id: string;
                type: string;
                position: { x: number; y: number; width: number; height: number };
                visible: boolean;
            }>),
            columns: layout.columns,
            rowHeight: layout.rowHeight,
            gap: layout.gap,
        };
    } catch {
        return null;
    }
}
