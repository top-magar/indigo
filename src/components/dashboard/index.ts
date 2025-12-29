// Sidebar
export { SidebarClient } from "./sidebar";
export type { SidebarClientProps, PlanType, UserRole } from "./sidebar";

// Layout
export { DashboardHeader, SignOutButton } from "./layout";

// Analytics
export { StatCard, RevenueChart } from "./analytics";
export type { StatCardProps } from "./analytics";

// Tables
export { ProductsTable, OrdersTable, CategoriesTable } from "./tables";
export type { ProductsTableProps, ProductWithCategory, OrdersTableProps, OrderWithDetails, CategoriesTableProps } from "./tables";

// Orders
export { OrderStepper } from "./orders";
export type { OrderStatus } from "./orders";

// Forms
export { CategoryForm, ProductForm, StoreSettingsForm } from "./forms";
export {
  FormInput,
  FormTextarea,
  FormSwitch,
  FormSelect,
  FormPriceInput,
} from "./forms/form-wrapper";

// Widgets
export { ActivityFeed, QuickActions, StripeConnectCard } from "./widgets";
export type { ActivityItem, QuickAction } from "./widgets";

// Domains
export { AddDomainDialog, DomainCard } from "./domains";

// Data table components
export { DataTablePagination, DataTable } from "./data-table";
export type { DataTableColumn, DataTableFilter, DataTableAction, DataTableEmptyState } from "./data-table";

// Action Menu
export { ActionMenu, SimpleActionMenu } from "./action-menu";
export type { ActionMenuItem, ActionMenuGroup } from "./action-menu";
