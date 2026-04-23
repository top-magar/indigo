// Dashboard component barrel

// Primitives
export { PageHeader } from "./page-header";
export { SectionHeader } from "./section-header";
export { SettingsPage } from "./settings-page";
export { ToggleRow } from "./toggle-row";
export { StatBar } from "./stat-bar";
export { StatusBadge } from "./status-badge";

// Templates
export { EntityListPage } from "./templates/entity-list-page";
export { EntityDetailPage } from "./templates/entity-detail-page";

// Layout
export { DashboardHeader } from "./layout";
export { SidebarClient } from "./sidebar/sidebar-client";
export { Savebar } from "./savebar";

// Activity Feed
export { ActivityFeed } from "./activity-feed";
export type { ActivityItem } from "./activity-feed";

// Charts
export { EnhancedRevenueChart } from "./enhanced-revenue-chart";
export { EnhancedMetricCard } from "./enhanced-metric-card";
export { SalesChart } from "./sales-chart";

// Dashboard page components
export { HeroSection } from "./hero-section";
export { DashboardMetrics } from "./dashboard-metrics";
export { RecentOrdersTable } from "./recent-orders-table";
export { LowStockProducts } from "./low-stock-products";
export { QuickActionsCard } from "./quick-actions-card";
export { LastUpdated } from "./last-updated";

// Data table
export { DataTablePagination, DataTable } from "./data-table";
export type { DataTableColumn, DataTableFilter, DataTableFilterOption, DataTableAction, DataTableEmptyState } from "./data-table";

// Domains
export { AddDomainDialog, DomainCard } from "./domains";

// Bulk actions
export { StickyBulkActionsBar } from "./bulk-actions-bar";

// Keyboard Shortcuts
export { KeyboardShortcutsModal } from "./keyboard-shortcuts";
