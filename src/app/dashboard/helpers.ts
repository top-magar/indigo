import type { ChartDataPoint } from "@/components/dashboard/enhanced-revenue-chart";

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getDateRanges() {
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

export function generateRevenueChartData(
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

export function generateSparkline(orders: { created_at: string; total: number }[], days = 7): number[] {
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

export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
