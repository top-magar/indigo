import type { Meta, StoryObj } from "@storybook/react";
import { ProductsListView } from "@/app/dashboard/products/products-client";

const noop = () => {};

const mockProducts = [
  {
    id: "p1", name: "Classic T-Shirt", slug: "classic-t-shirt", description: "Soft cotton tee", price: 29.99,
    compare_at_price: 39.99, cost_price: 12.00, sku: "TSH-BLK-L", barcode: null, quantity: 150,
    track_quantity: true, status: "active" as const, images: [], category_id: "cat-1",
    category_name: "Apparel", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: "p2", name: "Denim Jacket", slug: "denim-jacket", description: null, price: 89.99,
    compare_at_price: null, cost_price: 35.00, sku: "JKT-DNM-M", barcode: null, quantity: 3,
    track_quantity: true, status: "active" as const, images: [], category_id: "cat-1",
    category_name: "Apparel", created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: "p3", name: "Draft Sneakers", slug: "draft-sneakers", description: "Work in progress", price: 65.00,
    compare_at_price: null, cost_price: null, sku: null, barcode: null, quantity: 0,
    track_quantity: true, status: "draft" as const, images: [], category_id: "cat-2",
    category_name: "Footwear", created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const mockCategories = [
  { id: "cat-1", name: "Apparel" },
  { id: "cat-2", name: "Footwear" },
];

const mockStats = {
  total: 48, active: 32, draft: 10, archived: 6, lowStock: 5, outOfStock: 2, totalValue: 12500,
};

const mockBulkActions = {
  selected: new Set<string>(),
  selectedArray: [] as string[],
  selectedCount: 0,
  isSelected: () => false,
  toggle: noop,
  add: noop,
  remove: noop,
  toggleAll: noop,
  set: noop,
  reset: noop,
  isAllSelected: () => false,
  isIndeterminate: () => false,
  setClearCallback: noop,
  isLoading: false,
  executeBulkAction: (() => Promise.resolve({ success: true, successCount: 0, failedCount: 0 })) as never,
};

const defaultArgs = {
  products: mockProducts,
  categories: mockCategories,
  stats: mockStats,
  totalCount: 48,
  currentPage: 1,
  pageSize: 20,
  currency: "USD",
  searchValue: "",
  onSearchChange: noop,
  getFilter: () => undefined,
  onFilterChange: noop,
  onClearFilters: noop,
  hasActiveFilters: false,
  isPending: false,
  bulkActions: mockBulkActions,
  onDelete: noop,
  onBulkDelete: noop,
  onBulkStatusUpdate: noop,
  onExport: noop,
  onImportOpen: noop,
  onRefresh: noop,
  onPageChange: noop,
  onPageSizeChange: noop,
  onNavigate: noop,
  importDialogOpen: false,
  onImportDialogChange: noop,
};

const meta: Meta<typeof ProductsListView> = {
  component: ProductsListView,
  title: "Pages/Dashboard/Products List (Real)",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof ProductsListView>;

export const Default: Story = { args: defaultArgs };

export const Empty: Story = {
  args: { ...defaultArgs, products: [], totalCount: 0, stats: { ...mockStats, total: 0, active: 0 } },
};

export const WithActiveFilters: Story = {
  args: { ...defaultArgs, searchValue: "shirt", hasActiveFilters: true, getFilter: (key: string) => key === "status" ? "active" : undefined },
};
