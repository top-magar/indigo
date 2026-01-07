import type { Meta, StoryObj } from '@storybook/nextjs';
import {
  StatCardSkeleton,
  StatCardGridSkeleton,
  TableRowSkeleton,
  DataTableSkeleton,
  OrderDetailSkeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  ChartSkeleton,
  TimelineSkeleton,
  TimelineItemSkeleton,
  PageHeaderSkeleton,
  FilterBarSkeleton,
  SidebarSkeleton,
} from './index';

const meta: Meta = {
  title: 'Dashboard/Skeletons',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;

// ============================================================================
// StatCardSkeleton Stories
// ============================================================================

export const StatCard: StoryObj<typeof StatCardSkeleton> = {
  render: () => <StatCardSkeleton className="w-[280px]" />,
};

export const StatCardWithoutIcon: StoryObj<typeof StatCardSkeleton> = {
  render: () => <StatCardSkeleton showIcon={false} className="w-[280px]" />,
};

export const StatCardWithoutTrend: StoryObj<typeof StatCardSkeleton> = {
  render: () => <StatCardSkeleton showTrend={false} className="w-[280px]" />,
};

export const StatCardGrid: StoryObj<typeof StatCardGridSkeleton> = {
  render: () => <StatCardGridSkeleton count={4} />,
};

// ============================================================================
// TableRowSkeleton Stories
// ============================================================================

export const TableRow: StoryObj<typeof TableRowSkeleton> = {
  render: () => (
    <div className="border rounded-lg">
      <TableRowSkeleton columns={6} />
    </div>
  ),
};

export const TableRowWithoutImage: StoryObj<typeof TableRowSkeleton> = {
  render: () => (
    <div className="border rounded-lg">
      <TableRowSkeleton columns={5} showImage={false} />
    </div>
  ),
};

export const TableRowWithoutCheckbox: StoryObj<typeof TableRowSkeleton> = {
  render: () => (
    <div className="border rounded-lg">
      <TableRowSkeleton columns={5} showCheckbox={false} />
    </div>
  ),
};

// ============================================================================
// DataTableSkeleton Stories
// ============================================================================

export const DataTable: StoryObj<typeof DataTableSkeleton> = {
  render: () => <DataTableSkeleton rows={10} columns={6} />,
};

export const DataTableMinimal: StoryObj<typeof DataTableSkeleton> = {
  render: () => (
    <DataTableSkeleton
      rows={5}
      columns={4}
      showCheckbox={false}
      showImage={false}
      showFilters={false}
    />
  ),
};

export const DataTableWithoutPagination: StoryObj<typeof DataTableSkeleton> = {
  render: () => <DataTableSkeleton rows={5} showPagination={false} />,
};

// ============================================================================
// OrderDetailSkeleton Stories
// ============================================================================

export const OrderDetail: StoryObj<typeof OrderDetailSkeleton> = {
  render: () => <OrderDetailSkeleton />,
};

export const OrderDetailMinimal: StoryObj<typeof OrderDetailSkeleton> = {
  render: () => (
    <OrderDetailSkeleton
      showTimeline={false}
      showCustomer={false}
      lineItems={2}
    />
  ),
};

export const OrderDetailManyItems: StoryObj<typeof OrderDetailSkeleton> = {
  render: () => <OrderDetailSkeleton lineItems={6} />,
};

// ============================================================================
// ProductCardSkeleton Stories
// ============================================================================

export const ProductCard: StoryObj<typeof ProductCardSkeleton> = {
  render: () => <ProductCardSkeleton className="w-[280px]" />,
};

export const ProductCardPortrait: StoryObj<typeof ProductCardSkeleton> = {
  render: () => <ProductCardSkeleton aspectRatio="portrait" className="w-[280px]" />,
};

export const ProductCardLandscape: StoryObj<typeof ProductCardSkeleton> = {
  render: () => <ProductCardSkeleton aspectRatio="landscape" className="w-[320px]" />,
};

export const ProductGrid: StoryObj<typeof ProductGridSkeleton> = {
  render: () => <ProductGridSkeleton count={8} columns={4} />,
};

export const ProductGridThreeColumns: StoryObj<typeof ProductGridSkeleton> = {
  render: () => <ProductGridSkeleton count={6} columns={3} />,
};

// ============================================================================
// ChartSkeleton Stories
// ============================================================================

export const ChartLine: StoryObj<typeof ChartSkeleton> = {
  render: () => <ChartSkeleton type="line" />,
};

export const ChartBar: StoryObj<typeof ChartSkeleton> = {
  render: () => <ChartSkeleton type="bar" />,
};

export const ChartPie: StoryObj<typeof ChartSkeleton> = {
  render: () => <ChartSkeleton type="pie" height={350} />,
};

export const ChartArea: StoryObj<typeof ChartSkeleton> = {
  render: () => <ChartSkeleton type="area" />,
};

export const ChartWithoutHeader: StoryObj<typeof ChartSkeleton> = {
  render: () => <ChartSkeleton type="bar" showHeader={false} />,
};

export const ChartWithoutLegend: StoryObj<typeof ChartSkeleton> = {
  render: () => <ChartSkeleton type="line" showLegend={false} />,
};

// ============================================================================
// TimelineSkeleton Stories
// ============================================================================

export const Timeline: StoryObj<typeof TimelineSkeleton> = {
  render: () => (
    <div className="w-[400px]">
      <TimelineSkeleton items={5} />
    </div>
  ),
};

export const TimelineWithAddNote: StoryObj<typeof TimelineSkeleton> = {
  render: () => (
    <div className="w-[400px]">
      <TimelineSkeleton items={3} showAddNote />
    </div>
  ),
};

export const TimelineWithDateGroups: StoryObj<typeof TimelineSkeleton> = {
  render: () => (
    <div className="w-[400px]">
      <TimelineSkeleton items={4} showDateGroups />
    </div>
  ),
};

export const TimelineItem: StoryObj<typeof TimelineItemSkeleton> = {
  render: () => (
    <div className="w-[400px]">
      <TimelineItemSkeleton />
    </div>
  ),
};

export const TimelineItemNote: StoryObj<typeof TimelineItemSkeleton> = {
  render: () => (
    <div className="w-[400px]">
      <TimelineItemSkeleton isNote />
    </div>
  ),
};

// ============================================================================
// Utility Skeleton Stories
// ============================================================================

export const PageHeader: StoryObj<typeof PageHeaderSkeleton> = {
  render: () => <PageHeaderSkeleton />,
};

export const FilterBar: StoryObj<typeof FilterBarSkeleton> = {
  render: () => <FilterBarSkeleton />,
};

export const Sidebar: StoryObj<typeof SidebarSkeleton> = {
  render: () => (
    <div className="w-[240px] border rounded-lg">
      <SidebarSkeleton />
    </div>
  ),
};

// ============================================================================
// Combined Examples
// ============================================================================

export const DashboardPage: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatCardGridSkeleton count={4} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton type="line" />
        <ChartSkeleton type="bar" />
      </div>
      <DataTableSkeleton rows={5} />
    </div>
  ),
};

export const ProductsPage: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <FilterBarSkeleton />
      <ProductGridSkeleton count={8} columns={4} />
    </div>
  ),
};

export const OrdersPage: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <DataTableSkeleton rows={10} columns={7} />
    </div>
  ),
};
