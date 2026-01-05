// Sidebar
export { SidebarClient } from "./sidebar";
export type { SidebarClientProps, PlanType, UserRole } from "./sidebar";

// Layout
export { DashboardHeader, SignOutButton } from "./layout";

// Analytics
export { StatCard, RevenueChart } from "./analytics";
export type { StatCardProps } from "./analytics";

// Orders
export { OrderStepper, OrderTimeline, generateOrderTimeline } from "./orders";
export type { OrderStatus, TimelineEvent as OrderTimelineEvent } from "./orders";

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
export { ActivityFeed, QuickActions, StripeConnectCard, SetupChecklist, SetupWizard, createSetupSteps } from "./widgets";
export type { ActivityItem, QuickAction, SetupStep } from "./widgets";

// Domains
export { AddDomainDialog, DomainCard } from "./domains";

// Data table components
export { DataTablePagination, DataTable } from "./data-table";
export type { DataTableColumn, DataTableFilter, DataTableFilterOption, DataTableAction, DataTableEmptyState } from "./data-table";

// Action Menu
export { ActionMenu, SimpleActionMenu } from "./action-menu";
export type { ActionMenuItem, ActionMenuGroup } from "./action-menu";

// Timeline (Saleor-inspired)
export { Timeline, TimelineAddNote, TimelineEvent, TimelineNote, groupEventsByDate } from "./timeline";
export type { TimelineEventData, TimelineActor, DateGroup } from "./timeline";

// Savebar (Saleor-inspired)
export { Savebar, SavebarActions, SavebarSpacer } from "./savebar";

// Metadata (Saleor-inspired)
export { Metadata, MetadataCard } from "./metadata";
export type { MetadataItem } from "./metadata";

// Bulk Actions Bar (Saleor-inspired)
export { BulkActionsBar, StickyBulkActionsBar } from "./bulk-actions-bar";

// Filter Presets (Saleor-inspired)
export { FilterPresetsSelect } from "./filter-presets";

