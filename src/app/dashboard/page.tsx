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
import { PerformanceGrid, type PerformanceMetric } from "@/components/dashboard/performance-grid";
import { AWSServicesOverview } from "@/components/dashboard/aws-services-overview";
import { WellArchitectedWidget } from "@/components/dashboard/well-architected-widget";

// Existing components
import { RecentOrdersTable, type OrderData } from "@/components/dashboard/recent-orders-table";
import { SetupWizard, SetupChecklist, createSetupSteps } from "@/components/dashboard";
import { StatCardGridSkeleton } from "@/components/dashboard/skeletons";

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

// Get AWS services status
async function getAWSServicesStatus() {
  const storageProvider = process.env.STORAGE_PROVIDER || "local";
  const emailProvider = process.env.EMAIL_PROVIDER || "local";
  const aiProvider = process.env.AI_PROVIDER || "local";
  const searchProvider = process.env.SEARCH_PROVIDER || "local";
  const recommendationProvider = process.env.RECOMMENDATION_PROVIDER || "local";
  const forecastProvider = process.env.FORECAST_PROVIDER || "local";

  return [
    {
      id: "storage",
      name: "Storage (S3)",
      description: "File uploads, images, and media storage",
      icon: "Database",
      status: storageProvider === "aws" ? "active" : "setup_required",
      provider: storageProvider,
      usage: storageProvider === "aws" ? {
        current: 2450,
        limit: 5000,
        unit: "GB",
      } : undefined,
      href: "/dashboard/settings/aws#storage",
    },
    {
      id: "email",
      name: "Email (SES)",
      description: "Transactional emails and notifications",
      icon: "Mail",
      status: emailProvider === "aws" ? "active" : "setup_required",
      provider: emailProvider,
      usage: emailProvider === "aws" ? {
        current: 12500,
        limit: 50000,
        unit: "emails",
      } : undefined,
      href: "/dashboard/settings/aws#email",
    },
    {
      id: "ai",
      name: "AI (Bedrock)",
      description: "Content generation and image analysis",
      icon: "Brain",
      status: aiProvider === "aws" ? "active" : "setup_required",
      provider: aiProvider,
      usage: aiProvider === "aws" ? {
        current: 850,
        limit: 10000,
        unit: "requests",
      } : undefined,
      href: "/dashboard/settings/aws#ai",
    },
    {
      id: "search",
      name: "Search (OpenSearch)",
      description: "Product search and autocomplete",
      icon: "Search",
      status: searchProvider === "aws" ? "active" : "setup_required",
      provider: searchProvider,
      usage: searchProvider === "aws" ? {
        current: 45000,
        limit: 100000,
        unit: "queries",
      } : undefined,
      href: "/dashboard/settings/aws#search",
    },
    {
      id: "recommendations",
      name: "Recommendations (Personalize)",
      description: "Personalized product suggestions",
      icon: "TrendingUp",
      status: recommendationProvider === "aws" ? "active" : "setup_required",
      provider: recommendationProvider,
      usage: recommendationProvider === "aws" ? {
        current: 3200,
        limit: 50000,
        unit: "requests",
      } : undefined,
      href: "/dashboard/settings/aws#recommendations",
    },
    {
      id: "forecast",
      name: "Forecast (SageMaker)",
      description: "Demand forecasting and inventory optimization",
      icon: "TrendingUp",
      status: forecastProvider === "aws" ? "active" : "setup_required",
      provider: forecastProvider,
      usage: forecastProvider === "aws" ? {
        current: 120,
        limit: 1000,
        unit: "forecasts",
      } : undefined,
      href: "/dashboard/settings/aws#forecast",
    },
  ];
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
    awsServices,
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
    getAWSServicesStatus(),
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
      iconColor: "chart-2",
      href: "/dashboard/analytics",
      sparklineData: generateSparkline(currentOrders.filter((o) => o.payment_status === "paid")),
    },
    {
      label: "Orders",
      value: currentOrderCount,
      change: orderGrowth,
      changeLabel: "vs last month",
      icon: "ShoppingCart",
      iconColor: "chart-1",
      href: "/dashboard/orders",
      sparklineData: generateSparkline(currentOrders),
    },
    {
      label: "Customers",
      value: totalCustomers || 0,
      change: customerGrowth,
      changeLabel: `+${newCustomers || 0} this month`,
      icon: "Users",
      iconColor: "chart-4",
      href: "/dashboard/customers",
    },
    {
      label: "Avg. Order",
      value: avgOrderValue,
      change: avgOrderGrowth,
      changeLabel: "vs last month",
      icon: "TrendingUp",
      iconColor: "chart-5",
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

  // Prepare performance metrics
  const performanceMetrics: PerformanceMetric[] = [
    {
      id: "conversion",
      label: "Conversion Rate",
      value: totalCustomers && totalCustomers > 0
        ? `${((currentOrderCount / totalCustomers) * 100).toFixed(1)}%`
        : "0%",
      change: 0.5,
      icon: "users",
      trend: [2.8, 2.9, 3.0, 3.1, 3.2],
    },
    {
      id: "avg-items",
      label: "Avg Items/Order",
      value: currentOrderCount > 0
        ? ((totalProducts || 0) / currentOrderCount).toFixed(1)
        : "0",
      change: 2.3,
      icon: "products",
      trend: [3.2, 3.4, 3.3, 3.5, 3.6],
    },
    {
      id: "repeat-rate",
      label: "Repeat Customer Rate",
      value: "24%",
      change: -1.2,
      icon: "users",
      trend: [25, 24.5, 24.8, 24.2, 24],
    },
    {
      id: "fulfillment",
      label: "Fulfillment Rate",
      value: "98%",
      change: 0,
      icon: "orders",
      trend: [98, 98, 97, 98, 98],
    },
  ];

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

  // Well-Architected Tool data
  const waEnabled = process.env.AWS_WELLARCHITECTED_ENABLED === "true";
  const waWorkloadId = process.env.AWS_WELLARCHITECTED_WORKLOAD_ID;

  return (
    <div className="space-y-6">
      {/* Setup Wizard Modal - Shows on first visit for new users */}
      <SetupWizard
        storeName={tenant?.name || "Your Store"}
        hasProducts={(totalProducts || 0) > 0}
        hasPayments={hasStripeConnected}
        storeSlug={tenant?.slug}
      />

      {/* Hero Section - Modern greeting with today's stats */}
      <HeroSection
        userName={userName}
        todayRevenue={todayRevenue}
        todayOrders={todayOrderCount}
        currency={currency}
        storeSlug={tenant?.slug}
        greeting={getGreeting()}
      />

      {/* Stripe Connect Alert */}
      {!hasStripeConnected && !showSetupChecklist && (
        <Card className="border-[var(--ds-chart-4)]/30 bg-[var(--ds-chart-4)]/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[var(--ds-chart-4)]/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[var(--ds-chart-4)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--ds-gray-900)]">Complete your payment setup</p>
                  <p className="text-sm text-[var(--ds-gray-600)]">
                    Connect Stripe to start accepting payments from customers
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/dashboard/settings/payments">
                  Setup Payments
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Checklist - Show for new stores */}
      {showSetupChecklist && <SetupChecklist steps={setupSteps} storeName={tenant?.name || "your store"} />}

      {/* Primary KPIs - Enhanced metric cards with sparklines */}
      <Suspense fallback={<StatCardGridSkeleton count={4} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {enhancedMetrics.map((metric, index) => (
            <EnhancedMetricCard
              key={index}
              metric={metric}
              currency={currency}
            />
          ))}
        </div>
      </Suspense>

      {/* Main Content - Revenue Chart + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <EnhancedRevenueChart
            data={revenueData}
            currency={currency}
            totalCurrent={currentRevenue}
            totalPrevious={previousRevenue}
          />
        </div>

        {/* Activity Feed - Takes 1 column */}
        <div className="space-y-6">
          <ActivityFeed activities={activities} maxItems={6} />
          
          {/* Well-Architected Widget */}
          <WellArchitectedWidget
            enabled={waEnabled}
            workloadName={tenant?.name}
            riskCounts={waEnabled ? { high: 2, medium: 5, low: 8, none: 45 } : undefined}
            lastReviewDate={new Date().toISOString()}
          />
        </div>
      </div>

      {/* AWS Services Overview */}
      <AWSServicesOverview services={awsServices as any} />

      {/* Performance Grid - Secondary metrics */}
      <PerformanceGrid metrics={performanceMetrics} currency={currency} />

      {/* Recent Orders Table */}
      <RecentOrdersTable orders={ordersData} currency={currency} />
    </div>
  );
}
