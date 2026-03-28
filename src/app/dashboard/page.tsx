import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/infrastructure/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/shared/utils";

// V2 Enhanced Dashboard Components
import { HeroSection } from "@/components/dashboard/hero-section";
import { EnhancedMetricCard, type EnhancedMetricData } from "@/components/dashboard/enhanced-metric-card";
import { EnhancedRevenueChart, type ChartDataPoint } from "@/components/dashboard/enhanced-revenue-chart";
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";

// Existing components
import { RecentOrdersTable, type OrderData } from "@/components/dashboard/recent-orders-table";
import { SetupWizard, SetupChecklist, createSetupSteps } from "@/components/dashboard";
import { StatCardGridSkeleton } from "@/components/dashboard/skeletons";
import { StaggerGroup, StaggerItem } from "@/components/ui/stagger";

export const metadata: Metadata = {
  title: "Dashboard",
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
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return {
    currentMonthStart: currentMonthStart.toISOString(),
    previousMonthStart: previousMonthStart.toISOString(),
    previousMonthEnd: previousMonthEnd.toISOString(),
    todayStart: todayStart.toISOString(),
    now: now.toISOString(),
  };
}

// Generate revenue chart data
function generateRevenueChartData(
  currentOrders: { created_at: string; total: number }[],
  previousOrders: { created_at: string; total: number }[]
): ChartDataPoint[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const periodDays = Math.ceil(daysInMonth / 6);
  const chartData: ChartDataPoint[] = [];

  for (let i = 0; i < 6; i++) {
    const startDay = i * periodDays + 1;
    const endDay = Math.min((i + 1) * periodDays, daysInMonth);

    const currentRevenue = currentOrders
      .filter((o) => {
        const day = new Date(o.created_at).getDate();
        return day >= startDay && day <= endDay;
      })
      .reduce((sum, o) => sum + Number(o.total), 0);

    const previousRevenue = previousOrders
      .filter((o) => {
        const day = new Date(o.created_at).getDate();
        return day >= startDay && day <= endDay;
      })
      .reduce((sum, o) => sum + Number(o.total), 0);

    chartData.push({
      date: `${String(startDay).padStart(2, "0")}/${String(currentMonth + 1).padStart(2, "0")}`,
      current: currentRevenue,
      previous: previousRevenue,
    });
  }

  return chartData;
}

// Generate sparkline data (last 7 days)
function generateSparkline(orders: any[], days: number = 7): number[] {
  const now = new Date();
  const sparkline: number[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const dayRevenue = orders
      .filter((o) => {
        const orderDate = new Date(o.created_at);
        return orderDate >= dayStart && orderDate <= dayEnd;
      })
      .reduce((sum, o) => sum + Number(o.total), 0);
    
    sparkline.push(dayRevenue);
  }
  
  return sparkline;
}

// Calculate growth percentage safely
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id, full_name")
    .eq("id", user.id)
    .single();

  if (!userData?.tenant_id) redirect("/login");

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
  ] = await Promise.all([
    supabase
      .from("tenants")
      .select("name, currency, slug, stripe_onboarding_complete, status")
      .eq("id", tenantId)
      .single(),
    supabase
      .from("orders")
      .select("id, total, status, payment_status, created_at")
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
      .select("id, order_number, total, status, customer_name, customer_email, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("orders")
      .select("id, total, payment_status")
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
      .limit(10),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
  ]);

  const currency = tenant?.currency || "INR";
  const currentOrders = currentMonthOrders || [];
  const previousOrders = previousMonthOrders || [];

  // Calculate key metrics
  const currentRevenue = currentOrders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const previousRevenue = previousOrders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);
  const currentOrderCount = currentOrders.length;
  const previousOrderCount = previousOrders.length;
  const orderGrowth = calculateGrowth(currentOrderCount, previousOrderCount);
  const customerGrowth = calculateGrowth(newCustomers || 0, previousMonthCustomers || 0);

  // Average order value
  const avgOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
  const previousAvgOrderValue =
    previousOrderCount > 0
      ? previousOrders
          .filter((o) => o.payment_status === "paid")
          .reduce((sum, o) => sum + Number(o.total), 0) / previousOrderCount
      : 0;
  const avgOrderGrowth = calculateGrowth(avgOrderValue, previousAvgOrderValue);

  // Today's metrics
  const todayRevenue = (todayOrders || [])
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const todayOrderCount = (todayOrders || []).length;

  // Chart data
  const revenueData = generateRevenueChartData(
    currentOrders.filter((o) => o.payment_status === "paid"),
    previousOrders.filter((o) => o.payment_status === "paid")
  );

  // Prepare enhanced metrics data with sparklines
  const enhancedMetrics: EnhancedMetricData[] = [
    {
      label: "Revenue",
      value: currentRevenue,
      change: revenueGrowth,
      changeLabel: "vs last month",
      icon: "DollarSign",
      iconColor: "success",
      href: "/dashboard/analytics",
      sparklineData: generateSparkline(currentOrders.filter((o) => o.payment_status === "paid")),
    },
    {
      label: "Orders",
      value: currentOrderCount,
      change: orderGrowth,
      changeLabel: "vs last month",
      icon: "ShoppingCart",
      iconColor: "info",
      href: "/dashboard/orders",
      sparklineData: generateSparkline(currentOrders),
      isCurrency: false,
    },
    {
      label: "Customers",
      value: totalCustomers || 0,
      change: customerGrowth,
      changeLabel: `+${newCustomers || 0} this month`,
      icon: "Users",
      iconColor: "warning",
      href: "/dashboard/customers",
      isCurrency: false,
      sparklineData: [0, 0, 0, 0, 0, 0, newCustomers || 0],
    },
    {
      label: "Avg. Order",
      value: avgOrderValue,
      change: avgOrderGrowth,
      changeLabel: "vs last month",
      icon: "TrendingUp",
      iconColor: "purple",
      sparklineData: generateSparkline(currentOrders.filter((o) => o.payment_status === "paid")),
    },
  ];

  // Prepare orders data
  const ordersData: OrderData[] =
    recentOrders?.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      total: Number(order.total),
      status: order.status,
      createdAt: order.created_at,
    })) || [];

  // Prepare activity feed data
  const activities: ActivityItem[] = [];

  // Add recent orders to activity feed
  recentOrders?.slice(0, 5).forEach((order) => {
    activities.push({
      id: `order-${order.id}`,
      type: "order",
      title: "New order received",
      description: `${order.customer_name || "Guest"} placed an order`,
      timestamp: order.created_at,
      href: `/dashboard/orders/${order.id}`,
      metadata: {
        orderNumber: order.order_number,
        amount: formatCurrency(Number(order.total), currency),
      },
    });
  });

  // Add low stock alerts to activity feed
  lowStockProducts?.slice(0, 3).forEach((product) => {
    if (product.quantity <= 5) {
      activities.push({
        id: `stock-${product.id}`,
        type: "alert",
        title: "Low stock alert",
        description: `${product.name} has only ${product.quantity} units left`,
        timestamp: new Date().toISOString(),
        href: `/dashboard/products/${product.id}`,
      });
    }
  });

  // Sort activities by timestamp (most recent first)
  activities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const userName = userData.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";
  const hasStripeConnected = tenant?.stripe_onboarding_complete || false;
  const isStoreLaunched = tenant?.status === "active";

  // Setup checklist data
  const setupSteps = createSetupSteps({
    hasProducts: (totalProducts || 0) > 0,
    hasPayments: hasStripeConnected,
    hasCustomizedStore: true,
    hasShipping: true,
    isLaunched: isStoreLaunched,
  });

  // Show setup checklist if not all steps are complete
  const showSetupChecklist = setupSteps.some((step) => !step.completed);
  const setupProgress = Math.round((setupSteps.filter(s => s.completed).length / setupSteps.length) * 100);

  return (
    <div className="space-y-6">
      <SetupWizard
        storeName={tenant?.name || "Your Store"}
        hasProducts={(totalProducts || 0) > 0}
        hasPayments={hasStripeConnected}
        storeSlug={tenant?.slug}
      />

      <HeroSection
        userName={userName}
        todayRevenue={todayRevenue}
        todayOrders={todayOrderCount}
        currency={currency}
        storeSlug={tenant?.slug}
        greeting={getGreeting()}
        setupProgress={setupProgress}
      />

      {!hasStripeConnected && !showSetupChecklist && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CreditCard className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Complete your payment setup</p>
                  <p className="text-xs text-muted-foreground">Connect Stripe to start accepting payments</p>
                </div>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/settings/payments">
                  Setup Payments <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showSetupChecklist && <SetupChecklist steps={setupSteps} storeName={tenant?.name || "your store"} />}

      {(totalProducts || 0) === 0 && <QuickActions />}

      {/* KPI Cards */}
      <Suspense fallback={<StatCardGridSkeleton count={4} />}>
        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {enhancedMetrics.map((metric, index) => (
            <StaggerItem key={index}>
              <EnhancedMetricCard metric={metric} currency={currency} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Suspense>

      {/* Revenue Chart + Activity Feed */}
      <StaggerGroup className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StaggerItem className="lg:col-span-2">
          <EnhancedRevenueChart
            data={revenueData}
            currency={currency}
            totalCurrent={currentRevenue}
            totalPrevious={previousRevenue}
          />
        </StaggerItem>
        <StaggerItem>
          <ActivityFeed activities={activities} maxItems={6} />
        </StaggerItem>
      </StaggerGroup>

      <RecentOrdersTable orders={ordersData} currency={currency} />
    </div>
  );
}
