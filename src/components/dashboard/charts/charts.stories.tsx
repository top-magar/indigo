import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { InteractiveChart } from "./interactive-chart";
import { ComparisonChart } from "./comparison-chart";
import { ChartToolbar } from "./chart-toolbar";
import { DrillDownModal } from "./drill-down-modal";
import type {
  ChartDataPoint,
  DrillDownDataPoint,
  DrillDownLevel,
  TimeRange,
  ChartType,
  ComparisonMode,
} from "./chart-types";

// ============================================================================
// Mock Data
// ============================================================================

const generateMockData = (days: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const baseValue = 10000;
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const variation = Math.random() * 0.4 - 0.2;
    const trend = ((days - i) / days) * 0.3;
    const value = Math.round(baseValue * (1 + variation + trend));

    data.push({
      x: date.toISOString().split("T")[0],
      y: value,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }

  return data;
};

const mockRevenueData = generateMockData(30);

const mockComparisonCurrentData: ChartDataPoint[] = [
  { x: "Jan", y: 12500, label: "January" },
  { x: "Feb", y: 14200, label: "February" },
  { x: "Mar", y: 13800, label: "March" },
  { x: "Apr", y: 15600, label: "April" },
  { x: "May", y: 16900, label: "May" },
  { x: "Jun", y: 18200, label: "June" },
];

const mockComparisonPreviousData: ChartDataPoint[] = [
  { x: "Jan", y: 10200, label: "January" },
  { x: "Feb", y: 11500, label: "February" },
  { x: "Mar", y: 12100, label: "March" },
  { x: "Apr", y: 13400, label: "April" },
  { x: "May", y: 14200, label: "May" },
  { x: "Jun", y: 15100, label: "June" },
];

const mockDrillDownData: DrillDownDataPoint[] = [
  {
    id: "electronics",
    x: "Electronics",
    y: 45000,
    label: "Electronics",
    level: 0,
    children: [
      { id: "phones", x: "Phones", y: 20000, label: "Phones", level: 1, children: [] },
      { id: "laptops", x: "Laptops", y: 15000, label: "Laptops", level: 1, children: [] },
      { id: "tablets", x: "Tablets", y: 10000, label: "Tablets", level: 1, children: [] },
    ],
  },
  {
    id: "clothing",
    x: "Clothing",
    y: 32000,
    label: "Clothing",
    level: 0,
    children: [
      { id: "mens", x: "Men's", y: 14000, label: "Men's", level: 1, children: [] },
      { id: "womens", x: "Women's", y: 12000, label: "Women's", level: 1, children: [] },
      { id: "kids", x: "Kids", y: 6000, label: "Kids", level: 1, children: [] },
    ],
  },
  {
    id: "home",
    x: "Home & Garden",
    y: 28000,
    label: "Home & Garden",
    level: 0,
    children: [
      { id: "furniture", x: "Furniture", y: 15000, label: "Furniture", level: 1, children: [] },
      { id: "decor", x: "Decor", y: 8000, label: "Decor", level: 1, children: [] },
      { id: "garden", x: "Garden", y: 5000, label: "Garden", level: 1, children: [] },
    ],
  },
  {
    id: "sports",
    x: "Sports",
    y: 18000,
    label: "Sports",
    level: 0,
    children: [
      { id: "fitness", x: "Fitness", y: 8000, label: "Fitness", level: 1, children: [] },
      { id: "outdoor", x: "Outdoor", y: 6000, label: "Outdoor", level: 1, children: [] },
      { id: "team", x: "Team Sports", y: 4000, label: "Team Sports", level: 1, children: [] },
    ],
  },
];

// ============================================================================
// Interactive Chart Stories
// ============================================================================

const meta: Meta<typeof InteractiveChart> = {
  title: "Dashboard/Charts/InteractiveChart",
  component: InteractiveChart,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InteractiveChart>;

export const Default: Story = {
  args: {
    title: "Revenue Over Time",
    description: "Daily revenue for the last 30 days",
    data: mockRevenueData,
    height: 300,
    showToolbar: false,
    enableFullscreen: true,
    enableZoom: true,
    enableLegendToggle: true,
    formatValue: (value: number) => `$${value.toLocaleString()}`,
  },
};

export const WithToolbar: Story = {
  render: function WithToolbarRender() {
    const [timeRange, setTimeRange] = useState<TimeRange>("30d");
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("none");

    return (
      <InteractiveChart
        title="Revenue Over Time"
        description="Daily revenue with toolbar controls"
        data={mockRevenueData}
        height={300}
        showToolbar={true}
        timeRange={timeRange}
        onTimeRangeChange={(range) => setTimeRange(range)}
        comparisonMode={comparisonMode}
        onComparisonModeChange={(mode) => setComparisonMode(mode)}
        onRefresh={() => console.log("Refresh clicked")}
        formatValue={(value: number) => `$${value.toLocaleString()}`}
      />
    );
  },
};

export const AreaChart: Story = {
  args: {
    title: "Area Chart",
    description: "Revenue displayed as area chart",
    data: mockRevenueData,
    chartType: "area",
    height: 300,
    showToolbar: false,
    formatValue: (value: number) => `$${value.toLocaleString()}`,
  },
};

export const BarChart: Story = {
  args: {
    title: "Bar Chart",
    description: "Revenue displayed as bar chart",
    data: mockRevenueData.slice(0, 12),
    chartType: "bar",
    height: 300,
    showToolbar: false,
    formatValue: (value: number) => `$${value.toLocaleString()}`,
  },
};

export const LineChart: Story = {
  args: {
    title: "Line Chart",
    description: "Revenue displayed as line chart",
    data: mockRevenueData,
    chartType: "line",
    height: 300,
    showToolbar: false,
    formatValue: (value: number) => `$${value.toLocaleString()}`,
  },
};

export const Loading: Story = {
  args: {
    title: "Loading Chart",
    description: "Chart in loading state",
    data: [],
    isLoading: true,
    height: 300,
  },
};

export const Empty: Story = {
  args: {
    title: "Empty Chart",
    description: "No data available",
    data: [],
    height: 300,
  },
};

// ============================================================================
// Comparison Chart Stories
// ============================================================================

export const ComparisonOverlay: StoryObj<typeof ComparisonChart> = {
  render: function ComparisonOverlayRender() {
    return (
      <ComparisonChart
        title="Revenue Comparison"
        description="Current vs Previous Period"
        currentData={mockComparisonCurrentData}
        previousData={mockComparisonPreviousData}
        currentLabel="This Year"
        previousLabel="Last Year"
        mode="overlay"
        chartType="area"
        showPercentageChange={true}
        showTrendIndicators={true}
        formatValue={(value: number) => `$${value.toLocaleString()}`}
      />
    );
  },
};

export const ComparisonBar: StoryObj<typeof ComparisonChart> = {
  render: function ComparisonBarRender() {
    return (
      <ComparisonChart
        title="Monthly Sales Comparison"
        description="Side-by-side comparison"
        currentData={mockComparisonCurrentData}
        previousData={mockComparisonPreviousData}
        currentLabel="2024"
        previousLabel="2023"
        mode="side-by-side"
        chartType="bar"
        showPercentageChange={true}
        formatValue={(value: number) => `$${value.toLocaleString()}`}
      />
    );
  },
};

export const ComparisonLine: StoryObj<typeof ComparisonChart> = {
  render: function ComparisonLineRender() {
    return (
      <ComparisonChart
        title="Trend Comparison"
        description="Line chart comparison"
        currentData={mockComparisonCurrentData}
        previousData={mockComparisonPreviousData}
        mode="overlay"
        chartType="line"
        showPercentageChange={true}
        showTrendIndicators={false}
        formatValue={(value: number) => `$${value.toLocaleString()}`}
      />
    );
  },
};

// ============================================================================
// Chart Toolbar Stories
// ============================================================================

export const ToolbarOnly: StoryObj<typeof ChartToolbar> = {
  render: function ToolbarOnlyRender() {
    const [timeRange, setTimeRange] = useState<TimeRange>("30d");
    const [chartType, setChartType] = useState<ChartType>("area");
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("none");

    return (
      <div className="p-4 border rounded-lg">
        <ChartToolbar
          timeRange={timeRange}
          onTimeRangeChange={(range) => setTimeRange(range)}
          chartType={chartType}
          onChartTypeChange={(type) => setChartType(type)}
          comparisonMode={comparisonMode}
          onComparisonModeChange={(mode) => setComparisonMode(mode)}
          onExport={(format) => console.log("Export:", format)}
          onRefresh={() => console.log("Refresh")}
          showComparison={true}
          showChartTypeSwitcher={true}
          showExport={true}
          showRefresh={true}
        />
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Time Range: {timeRange}</p>
          <p>Chart Type: {chartType}</p>
          <p>Comparison: {comparisonMode}</p>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Drill-Down Modal Stories
// ============================================================================

export const DrillDownExample: StoryObj<typeof DrillDownModal> = {
  render: function DrillDownExampleRender() {
    const [open, setOpen] = useState(true);
    const [levelStack, setLevelStack] = useState<DrillDownLevel[]>([
      {
        id: "root",
        name: "Sales by Category",
        data: mockDrillDownData,
        parentId: null,
      },
    ]);
    const [currentLevel, setCurrentLevel] = useState(0);

    const handleNavigateDown = (point: DrillDownDataPoint) => {
      if (point.children && point.children.length > 0) {
        const newLevel: DrillDownLevel = {
          id: point.id,
          name: point.label || String(point.x),
          data: point.children,
          parentId: levelStack[currentLevel].id,
        };
        setLevelStack([...levelStack.slice(0, currentLevel + 1), newLevel]);
        setCurrentLevel(currentLevel + 1);
      }
    };

    const handleNavigateUp = () => {
      if (currentLevel > 0) {
        setCurrentLevel(currentLevel - 1);
      }
    };

    const handleNavigateToLevel = (index: number) => {
      setCurrentLevel(index);
    };

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Open Drill-Down Modal
        </button>
        <DrillDownModal
          open={open}
          onOpenChange={setOpen}
          levelStack={levelStack}
          currentLevel={currentLevel}
          onNavigateToLevel={handleNavigateToLevel}
          onNavigateUp={handleNavigateUp}
          onNavigateDown={handleNavigateDown}
          chartType="bar"
          formatValue={(value: number) => `$${value.toLocaleString()}`}
        />
      </div>
    );
  },
};

// ============================================================================
// Full Dashboard Example
// ============================================================================

export const DashboardExample: Story = {
  render: function DashboardExampleRender() {
    const [timeRange, setTimeRange] = useState<TimeRange>("30d");
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("none");

    return (
      <div className="space-y-6">
        <InteractiveChart
          title="Revenue Overview"
          description="Track your revenue performance over time"
          data={mockRevenueData}
          height={350}
          showToolbar={true}
          timeRange={timeRange}
          onTimeRangeChange={(range) => setTimeRange(range)}
          comparisonMode={comparisonMode}
          onComparisonModeChange={(mode) => setComparisonMode(mode)}
          onRefresh={() => console.log("Refresh")}
          enableFullscreen={true}
          enableZoom={true}
          enableLegendToggle={true}
          formatValue={(value: number) => `$${value.toLocaleString()}`}
        />

        <div className="grid grid-cols-2 gap-6">
          <ComparisonChart
            title="YoY Comparison"
            description="This year vs last year"
            currentData={mockComparisonCurrentData}
            previousData={mockComparisonPreviousData}
            mode="overlay"
            chartType="area"
            height={250}
            formatValue={(value: number) => `$${value.toLocaleString()}`}
          />

          <ComparisonChart
            title="Monthly Breakdown"
            description="Revenue by month"
            currentData={mockComparisonCurrentData}
            previousData={mockComparisonPreviousData}
            mode="side-by-side"
            chartType="bar"
            height={250}
            formatValue={(value: number) => `$${value.toLocaleString()}`}
          />
        </div>
      </div>
    );
  },
};
