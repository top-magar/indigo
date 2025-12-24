import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    PackageIcon,
    ShoppingCart01Icon,
    Money01Icon,
    UserMultipleIcon,
    ArrowUp01Icon,
    ArrowDown01Icon,
    ArrowRight01Icon,
    Clock01Icon,
    CheckmarkCircle02Icon,
    Alert02Icon,
    AnalyticsUpIcon,
    TruckDeliveryIcon,
    CreditCardIcon,
    Calendar01Icon,
    Target01Icon,
} from "@hugeicons/core-free-icons";
import { RevenueChart, ActivityFeed, QuickActions } from "@/components/dashboard";
import type { ActivityItem } from "@/components/dashboard";

export const metadata: Metadata = {
    title: "Dashboard | Indigo",
    description: "View your store analytics, orders, and performance metrics.",
};

// Get time-based greeting
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

// Helper to get date ranges
function getDateRanges() {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
        currentMonthStart: currentMonthStart.toISOString(),
        previousMonthStart: previousMonthStart.toISOString(),
        previousMonthEnd: previousMonthEnd.toISOString(),
        sevenDaysAgo: sevenDaysAgo.toISOString(),
        todayStart: todayStart.toISOString(),
        now: now.toISOString(),
    };
}

// Generate revenue chart data
function generateRevenueChartData(
    currentOrders: { created_at: string; total: number }[],
    previousOrders: { created_at: string; total: number }[]
) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const periodDays = Math.ceil(daysInMonth / 6);
    const chartData = [];
    
    for (let i = 0; i < 6; i++) {
        const startDay = i * periodDays + 1;
        const endDay = Math.min((i + 1) * periodDays, daysInMonth);
        
        const currentRevenue = currentOrders
            .filter(o => {
                const day = new Date(o.created_at).getDate();
                return day >= startDay && day <= endDay;
            })
            .reduce((sum, o) => sum + Number(o.total), 0);
        
        const previousRevenue = previousOrders
            .filter(o => {
                const day = new Date(o.created_at).getDate();
                return day >= startDay && day <= endDay;
            })
            .reduce((sum, o) => sum + Number(o.total), 0);
        
        chartData.push({
            date: `${String(startDay).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}`,
            current: currentRevenue,
            previous: previousRevenue,
        });
    }
    
    return chartData;
}

// Format currency with proper locale
function formatCurrency(value: number, currency = "INR") {
    const locale = currency === "INR" ? "en-IN" : currency === "EUR" ? "de-DE" : "en-US";
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}

// Calculate growth percentage safely
function calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}


export default async function DashboardPage() {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id, full_name")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

    const tenantId = userData.tenant_id;
    const dates = getDateRanges();

    // Parallel data fetching for maximum performance
    const [
        { data: tenant },
        { data: currentMonthOrders },
        { data: previousMonthOrders },
        { data: recentOrders },
        { data: todayOrders },
        { count: totalCustomers },
        { count: newCustomers },
        { count: previousMonthCustomers },
        { data: lowStockProducts },
        { count: totalProducts },
        { count: activeProducts },
        { data: orderItems },
        { data: recentCustomers },
    ] = await Promise.all([
        supabase
            .from("tenants")
            .select("name, currency, slug, stripe_onboarding_complete")
            .eq("id", tenantId)
            .single(),
        supabase
            .from("orders")
            .select("id, total, status, payment_status, created_at, customer_name")
            .eq("tenant_id", tenantId)
            .gte("created_at", dates.currentMonthStart),
        supabase
            .from("orders")
            .select("id, total, status, payment_status, created_at")
            .eq("tenant_id", tenantId)
            .gte("created_at", dates.previousMonthStart)
            .lte("created_at", dates.previousMonthEnd),
        supabase
            .from("orders")
            .select("id, order_number, total, status, payment_status, customer_name, customer_email, created_at")
            .eq("tenant_id", tenantId)
            .order("created_at", { ascending: false })
            .limit(5),
        supabase
            .from("orders")
            .select("id, total, status, payment_status")
            .eq("tenant_id", tenantId)
            .gte("created_at", dates.todayStart),
        supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .eq("tenant_id", tenantId),
        supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .eq("tenant_id", tenantId)
            .gte("created_at", dates.currentMonthStart),
        supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .eq("tenant_id", tenantId)
            .gte("created_at", dates.previousMonthStart)
            .lte("created_at", dates.previousMonthEnd),
        supabase
            .from("products")
            .select("id, name, quantity, price, images")
            .eq("tenant_id", tenantId)
            .eq("status", "active")
            .lte("quantity", 10)
            .order("quantity", { ascending: true })
            .limit(5),
        supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("tenant_id", tenantId),
        supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("tenant_id", tenantId)
            .eq("status", "active"),
        supabase
            .from("order_items")
            .select("product_id, quantity, product_name")
            .eq("tenant_id", tenantId),
        supabase
            .from("customers")
            .select("id, first_name, last_name, email, created_at")
            .eq("tenant_id", tenantId)
            .order("created_at", { ascending: false })
            .limit(3),
    ]);

    const currency = tenant?.currency || "INR";
    const currentOrders = currentMonthOrders || [];
    const previousOrders = previousMonthOrders || [];

    // Calculate key metrics
    const currentRevenue = currentOrders
        .filter(o => o.payment_status === "paid")
        .reduce((sum, o) => sum + Number(o.total), 0);
    
    const previousRevenue = previousOrders
        .filter(o => o.payment_status === "paid")
        .reduce((sum, o) => sum + Number(o.total), 0);

    const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);
    const currentOrderCount = currentOrders.length;
    const previousOrderCount = previousOrders.length;
    const orderGrowth = calculateGrowth(currentOrderCount, previousOrderCount);
    const customerGrowth = calculateGrowth(newCustomers || 0, previousMonthCustomers || 0);

    // Order status breakdown
    const pendingOrders = currentOrders.filter(o => o.status === "pending").length;
    const processingOrders = currentOrders.filter(o => o.status === "processing" || o.status === "confirmed").length;
    const shippedOrders = currentOrders.filter(o => o.status === "shipped").length;
    const completedOrders = currentOrders.filter(o => o.status === "delivered" || o.status === "completed").length;

    // Average order value
    const avgOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
    const previousAvgOrderValue = previousOrderCount > 0 
        ? previousOrders.filter(o => o.payment_status === "paid").reduce((sum, o) => sum + Number(o.total), 0) / previousOrderCount 
        : 0;
    const avgOrderGrowth = calculateGrowth(avgOrderValue, previousAvgOrderValue);

    // Today's metrics
    const todayRevenue = (todayOrders || [])
        .filter(o => o.payment_status === "paid")
        .reduce((sum, o) => sum + Number(o.total), 0);
    const todayOrderCount = (todayOrders || []).length;

    // Top selling products
    const productSales: Record<string, { count: number; name: string }> = {};
    (orderItems || []).forEach(item => {
        if (item.product_id) {
            if (!productSales[item.product_id]) {
                productSales[item.product_id] = { count: 0, name: item.product_name };
            }
            productSales[item.product_id].count += item.quantity;
        }
    });

    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);

    // Chart data
    const revenueData = generateRevenueChartData(
        currentOrders.filter(o => o.payment_status === "paid"),
        previousOrders.filter(o => o.payment_status === "paid")
    );

    // Fulfillment rate
    const fulfillmentRate = currentOrderCount > 0 ? Math.round((completedOrders / currentOrderCount) * 100) : 0;

    // Build activity feed from recent orders and customers
    const activities: ActivityItem[] = [];
    
    (recentOrders || []).forEach(order => {
        activities.push({
            id: `order-${order.id}`,
            type: order.status === "delivered" || order.status === "completed" 
                ? "order_completed" 
                : order.status === "cancelled" 
                ? "order_cancelled" 
                : "order_placed",
            title: `Order ${order.order_number}`,
            description: order.customer_name || order.customer_email || "Guest checkout",
            timestamp: order.created_at,
            metadata: {
                amount: Number(order.total),
                currency,
                orderNumber: order.order_number,
            },
        });
    });

    (recentCustomers || []).forEach(customer => {
        activities.push({
            id: `customer-${customer.id}`,
            type: "customer_joined",
            title: "New customer",
            description: customer.first_name 
                ? `${customer.first_name} ${customer.last_name || ""}`.trim()
                : customer.email,
            timestamp: customer.created_at,
        });
    });

    // Sort activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const userName = userData.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";
    const hasStripeConnected = tenant?.stripe_onboarding_complete || false;


    return (
        <div className="space-y-6">
            {/* Header with Today's Summary */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {getGreeting()}, {userName} 👋
                    </h1>
                    <p className="text-muted-foreground">
                        Here&apos;s what&apos;s happening with your store today.
                    </p>
                </div>
                
                {/* Today's Quick Stats */}
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                        <HugeiconsIcon icon={Calendar01Icon} className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Today:</span>
                        <span className="font-semibold">{formatCurrency(todayRevenue, currency)}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="font-semibold">{todayOrderCount} orders</span>
                    </div>
                </div>
            </div>

            {/* Stripe Connect Alert */}
            {!hasStripeConnected && (
                <Card className="border-chart-4/30 bg-chart-4/5">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                                    <HugeiconsIcon icon={CreditCardIcon} className="w-5 h-5 text-chart-4" />
                                </div>
                                <div>
                                    <p className="font-medium">Complete your payment setup</p>
                                    <p className="text-sm text-muted-foreground">Connect Stripe to start accepting payments from customers</p>
                                </div>
                            </div>
                            <Button asChild>
                                <Link href="/dashboard/settings/payments">
                                    Setup Payments
                                    <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Revenue */}
                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Revenue</p>
                                <p className="text-2xl font-bold">{formatCurrency(currentRevenue, currency)}</p>
                                <div className="flex items-center gap-1">
                                    {revenueGrowth !== 0 ? (
                                        <Badge 
                                            variant="secondary" 
                                            className={`text-xs px-1.5 py-0 gap-0.5 border-0 ${
                                                revenueGrowth >= 0 ? "bg-chart-2/10 text-chart-2" : "bg-destructive/10 text-destructive"
                                            }`}
                                        >
                                            <HugeiconsIcon 
                                                icon={revenueGrowth >= 0 ? ArrowUp01Icon : ArrowDown01Icon} 
                                                className="w-2.5 h-2.5" 
                                            />
                                            {Math.abs(revenueGrowth)}%
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-xs px-1.5 py-0 border-0 bg-muted text-muted-foreground">
                                            No change
                                        </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">vs last month</span>
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                                <HugeiconsIcon icon={Money01Icon} className="w-5 h-5 text-chart-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders */}
                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Orders</p>
                                <p className="text-2xl font-bold">{currentOrderCount}</p>
                                <div className="flex items-center gap-1">
                                    {orderGrowth !== 0 ? (
                                        <Badge 
                                            variant="secondary" 
                                            className={`text-xs px-1.5 py-0 gap-0.5 border-0 ${
                                                orderGrowth >= 0 ? "bg-chart-2/10 text-chart-2" : "bg-destructive/10 text-destructive"
                                            }`}
                                        >
                                            <HugeiconsIcon 
                                                icon={orderGrowth >= 0 ? ArrowUp01Icon : ArrowDown01Icon} 
                                                className="w-2.5 h-2.5" 
                                            />
                                            {Math.abs(orderGrowth)}%
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-xs px-1.5 py-0 border-0 bg-muted text-muted-foreground">
                                            No change
                                        </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">vs last month</span>
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                <HugeiconsIcon icon={ShoppingCart01Icon} className="w-5 h-5 text-chart-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Customers */}
                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customers</p>
                                <p className="text-2xl font-bold">{totalCustomers || 0}</p>
                                <div className="flex items-center gap-1">
                                    {customerGrowth !== 0 ? (
                                        <Badge 
                                            variant="secondary" 
                                            className={`text-xs px-1.5 py-0 gap-0.5 border-0 ${
                                                customerGrowth >= 0 ? "bg-chart-2/10 text-chart-2" : "bg-destructive/10 text-destructive"
                                            }`}
                                        >
                                            <HugeiconsIcon 
                                                icon={customerGrowth >= 0 ? ArrowUp01Icon : ArrowDown01Icon} 
                                                className="w-2.5 h-2.5" 
                                            />
                                            {Math.abs(customerGrowth)}%
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">+{newCustomers || 0} this month</span>
                                    )}
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                                <HugeiconsIcon icon={UserMultipleIcon} className="w-5 h-5 text-chart-4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Avg Order Value */}
                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg. Order</p>
                                <p className="text-2xl font-bold">{formatCurrency(avgOrderValue, currency)}</p>
                                <div className="flex items-center gap-1">
                                    {avgOrderGrowth !== 0 ? (
                                        <Badge 
                                            variant="secondary" 
                                            className={`text-xs px-1.5 py-0 gap-0.5 border-0 ${
                                                avgOrderGrowth >= 0 ? "bg-chart-2/10 text-chart-2" : "bg-destructive/10 text-destructive"
                                            }`}
                                        >
                                            <HugeiconsIcon 
                                                icon={avgOrderGrowth >= 0 ? ArrowUp01Icon : ArrowDown01Icon} 
                                                className="w-2.5 h-2.5" 
                                            />
                                            {Math.abs(avgOrderGrowth)}%
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Per transaction</span>
                                    )}
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-5/10 flex items-center justify-center">
                                <HugeiconsIcon icon={AnalyticsUpIcon} className="w-5 h-5 text-chart-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* Main Content Grid - Revenue Chart + Order Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart - Takes 2 columns */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Comparing current vs previous month
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/dashboard/analytics">
                                    View Details
                                    <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart data={revenueData} currency={currency} showControls />
                    </CardContent>
                </Card>

                {/* Order Pipeline */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Order Pipeline</CardTitle>
                            <Badge variant="secondary" className="text-xs">
                                {fulfillmentRate}% fulfilled
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Progress bar */}
                        <div className="space-y-2">
                            <Progress value={fulfillmentRate} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                {completedOrders} of {currentOrderCount} orders completed this month
                            </p>
                        </div>
                        
                        {/* Status breakdown */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-chart-4/5 border border-chart-4/20">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-md bg-chart-4/10 flex items-center justify-center">
                                        <HugeiconsIcon icon={Clock01Icon} className="w-3.5 h-3.5 text-chart-4" />
                                    </div>
                                    <span className="text-sm">Pending</span>
                                </div>
                                <Badge variant="secondary" className="bg-chart-4/10 text-chart-4 border-0 text-xs">
                                    {pendingOrders}
                                </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-chart-1/5 border border-chart-1/20">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-md bg-chart-1/10 flex items-center justify-center">
                                        <HugeiconsIcon icon={PackageIcon} className="w-3.5 h-3.5 text-chart-1" />
                                    </div>
                                    <span className="text-sm">Processing</span>
                                </div>
                                <Badge variant="secondary" className="bg-chart-1/10 text-chart-1 border-0 text-xs">
                                    {processingOrders}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-chart-5/5 border border-chart-5/20">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-md bg-chart-5/10 flex items-center justify-center">
                                        <HugeiconsIcon icon={TruckDeliveryIcon} className="w-3.5 h-3.5 text-chart-5" />
                                    </div>
                                    <span className="text-sm">Shipped</span>
                                </div>
                                <Badge variant="secondary" className="bg-chart-5/10 text-chart-5 border-0 text-xs">
                                    {shippedOrders}
                                </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-chart-2/5 border border-chart-2/20">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-md bg-chart-2/10 flex items-center justify-center">
                                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3.5 h-3.5 text-chart-2" />
                                    </div>
                                    <span className="text-sm">Completed</span>
                                </div>
                                <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-0 text-xs">
                                    {completedOrders}
                                </Badge>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full" size="sm" asChild>
                            <Link href="/dashboard/orders">
                                Manage Orders
                                <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>


            {/* Secondary Grid - Activity, Quick Actions, Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/orders">View all</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ActivityFeed activities={activities} maxItems={6} />
                    </CardContent>
                </Card>

                {/* Quick Actions + Alerts */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <QuickActions 
                                storeSlug={tenant?.slug} 
                                hasStripeConnected={hasStripeConnected}
                                layout="grid"
                            />
                        </CardContent>
                    </Card>

                    {/* Low Stock Alert */}
                    {(lowStockProducts?.length || 0) > 0 && (
                        <Card className="border-chart-4/30 bg-chart-4/5">
                            <CardHeader className="py-3">
                                <div className="flex items-center gap-2">
                                    <HugeiconsIcon icon={Alert02Icon} className="w-4 h-4 text-chart-4" />
                                    <CardTitle className="text-sm font-semibold text-chart-4">Low Stock Alert</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-2">
                                    {lowStockProducts?.slice(0, 3).map((product) => (
                                        <div key={product.id} className="flex items-center justify-between text-sm">
                                            <span className="truncate flex-1 mr-2">{product.name}</span>
                                            <Badge variant="secondary" className="bg-chart-4/10 text-chart-4 border-0 shrink-0">
                                                {product.quantity} left
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                                    <Link href="/dashboard/products?filter=low-stock">
                                        Manage Inventory
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>


            {/* Bottom Grid - Recent Orders + Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/orders">View all</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {(recentOrders?.length || 0) === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                                    <HugeiconsIcon icon={ShoppingCart01Icon} className="w-6 h-6 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm text-muted-foreground">No orders yet</p>
                                <p className="text-xs text-muted-foreground mt-1">Orders will appear here when customers make purchases</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentOrders?.map((order) => (
                                    <Link 
                                        key={order.id} 
                                        href={`/dashboard/orders/${order.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                                {order.customer_name?.charAt(0).toUpperCase() || order.customer_email?.charAt(0).toUpperCase() || "G"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium group-hover:text-primary transition-colors">{order.order_number}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.customer_name || order.customer_email || "Guest"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{formatCurrency(Number(order.total), currency)}</p>
                                            <Badge 
                                                variant="secondary" 
                                                className={`text-[10px] border-0 ${
                                                    order.status === "delivered" || order.status === "completed"
                                                        ? "bg-chart-2/10 text-chart-2"
                                                        : order.status === "pending"
                                                        ? "bg-chart-4/10 text-chart-4"
                                                        : order.status === "shipped"
                                                        ? "bg-chart-5/10 text-chart-5"
                                                        : "bg-chart-1/10 text-chart-1"
                                                }`}
                                            >
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-base font-semibold">Top Products</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/products">View all</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {topProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                                    <HugeiconsIcon icon={PackageIcon} className="w-6 h-6 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm text-muted-foreground">No sales data yet</p>
                                <Button variant="link" size="sm" asChild className="mt-1">
                                    <Link href="/dashboard/products/new">Add your first product</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {topProducts.map(([id, data], index) => (
                                    <div key={id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                            index === 0 ? "bg-chart-4/10 text-chart-4" :
                                            index === 1 ? "bg-chart-3/10 text-chart-3" :
                                            index === 2 ? "bg-chart-5/10 text-chart-5" :
                                            "bg-muted text-muted-foreground"
                                        }`}>
                                            #{index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{data.name}</p>
                                            <p className="text-xs text-muted-foreground">{data.count} units sold</p>
                                        </div>
                                        <div className="text-right">
                                            <HugeiconsIcon icon={Target01Icon} className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Store Stats Footer */}
            <Card className="bg-muted/30 border-dashed">
                <CardContent className="py-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold">{totalProducts || 0}</p>
                            <p className="text-xs text-muted-foreground">Total Products</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{activeProducts || 0}</p>
                            <p className="text-xs text-muted-foreground">Active Products</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{totalCustomers || 0}</p>
                            <p className="text-xs text-muted-foreground">Total Customers</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{currentOrderCount}</p>
                            <p className="text-xs text-muted-foreground">Orders This Month</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{fulfillmentRate}%</p>
                            <p className="text-xs text-muted-foreground">Fulfillment Rate</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
