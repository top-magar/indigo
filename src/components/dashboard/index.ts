// Sidebar
export { SidebarClient } from "./sidebar";
export type { SidebarClientProps, PlanType, UserRole } from "./sidebar";

// Layout
export { DashboardHeader, SignOutButton } from "./layout";

// Analytics
export { StatCard, RevenueChart } from "./analytics";
export type { StatCardProps } from "./analytics";

// New Dashboard Components
export { DashboardMetrics } from "./dashboard-metrics";
export type { MetricData } from "./dashboard-metrics";
export { RecentOrdersTable } from "./recent-orders-table";
export type { OrderData } from "./recent-orders-table";
export { SalesChart } from "./sales-chart";
export type { ChartDataPoint } from "./sales-chart";
export { QuickActionsCard } from "./quick-actions-card";
export { LowStockProducts } from "./low-stock-products";
export type { LowStockProduct } from "./low-stock-products";

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

// Legacy Widgets
export { ActivityFeed, QuickActions, StripeConnectCard, SetupChecklist, SetupWizard, createSetupSteps } from "./widgets";
export type { ActivityItem, QuickAction, SetupStep } from "./widgets";

// Widget System
export {
  // Types and utilities
  WidgetType,
  WIDGET_SIZE_MAP,
  GRID_BREAKPOINTS,
  COLUMNS_PER_BREAKPOINT,
  DEFAULT_WIDGET_CATALOG,
  getWidgetCatalogItem,
  getWidgetsByCategory,
  createWidget,
  // Components
  WidgetContainer,
  WidgetPlaceholder,
  WidgetSkeleton,
  WidgetError,
  WidgetGrid,
  ResponsiveWidgetGrid,
  WidgetDropZone,
  WidgetCatalog,
  WidgetCatalogSheet,
  WidgetCatalogDialog,
  WidgetRenderer,
  WidgetLoadingSkeleton,
  PlaceholderWidget,
  // Widget Renderers
  StatCardWidget,
  ChartWidget,
  ActivityFeedWidget,
  QuickActionsWidget,
  RecentOrdersWidget,
  TopProductsWidget,
  WIDGET_ICONS,
  CATEGORY_CONFIG,
  // Preset Widgets (with built-in data fetching)
  RevenueWidget,
  RevenueWidgetSkeleton,
  OrdersWidget,
  OrdersWidgetSkeleton,
  ConversionWidget,
  ConversionWidgetSkeleton,
} from "./widgets";
export type {
  Widget,
  WidgetConfig,
  WidgetSize,
  WidgetPosition,
  WidgetLayout,
  DashboardLayout,
  LayoutPreset,
  WidgetCatalogItem,
  WidgetCategory,
  WidgetContainerProps,
  WidgetGridProps,
  WidgetCatalogProps,
  WidgetRendererProps,
} from "./widgets";

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

// Enhanced Bulk Actions (with dialogs and export)
export {
  BulkActionToolbar,
  BulkActionDialog,
  BulkExportDialog,
  BulkActionType,
  ORDER_BULK_ACTIONS,
  PRODUCT_BULK_ACTIONS,
  CUSTOMER_BULK_ACTIONS,
  getBulkActionsForContext,
} from "./bulk-actions";
export type {
  BulkActionContext,
  BulkActionConfig,
  BulkActionResult,
  BulkActionError,
  BulkActionProgress,
  ExportFormat,
  ExportColumn,
  ExportConfig,
  AffectedItem,
} from "./bulk-actions";

// Filter Presets (Saleor-inspired)
export { FilterPresetsSelect } from "./filter-presets";

// Last Updated indicator
export { LastUpdated, LastUpdatedInline } from "./last-updated";
export type { LastUpdatedProps } from "./last-updated";

// Command Palette (VS Code/Linear-style)
export {
  CommandPalette,
  CommandPaletteProvider,
  useCommandPalette,
  useRegisterCommands,
  CommandIcons,
} from "./command-palette";
export type {
  CommandPaletteCommand,
  CommandPaletteGroup,
  CommandPaletteProps,
  CommandPaletteProviderProps,
} from "./command-palette";

// Onboarding components
export {
  OnboardingTooltip,
  ControlledOnboardingTooltip,
  OnboardingProgress,
  InlineOnboardingProgress,
  WelcomeModal,
  QuickWelcomeModal,
} from "./onboarding";
export type { OnboardingStep } from "./onboarding";

// Mobile Navigation
export { MobileBottomNav, MobileNavSheet } from "./mobile-nav";
export type { MobileBottomNavProps, MobileNavSheetProps } from "./mobile-nav";

// Page Transitions
export { PageTransition, StaggerChildren, StaggerItem, FadeIn, FadeInOnScroll } from "./transitions";
export type {
  PageTransitionProps,
  StaggerChildrenProps,
  StaggerItemProps,
  FadeInProps,
  FadeInOnScrollProps,
} from "./transitions";

// Skeleton Loading Components
export {
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
} from "./skeletons";

// Notification Center
export {
  NotificationCenter,
  NotificationEmptyState,
  NotificationItem,
  getNotificationConfig,
  notificationConfig,
} from "./notifications";
export type {
  NotificationCenterProps,
  NotificationItemProps,
  NotificationType,
  NotificationCategory,
  Notification,
  CreateNotificationInput,
  NotificationMetadata,
  NotificationTypeConfig,
} from "./notifications";

// AI-Powered Insights
export {
  InsightCard,
  InsightCardCompact,
  InsightsPanel,
  InsightsPanelSkeleton,
  InsightsPanelEmpty,
  InsightType,
  INSIGHT_CONFIG,
  PRIORITY_CONFIG,
} from "./insights";
export type {
  InsightCardProps,
  InsightCardCompactProps,
  InsightsPanelProps,
  InsightsWidgetProps,
  Insight,
  InsightPriority,
  InsightAction,
  InsightMetric,
  InsightConfig,
  InsightsState,
  InsightsActions,
  InsightsStore,
} from "./insights";

// Keyboard Shortcuts Help Modal
export {
  KeyboardShortcutsModal,
  defaultShortcutsConfig,
  navigationShortcuts,
  actionShortcuts,
  viewShortcuts,
  searchShortcuts,
  getAllShortcuts,
  findShortcutById,
  getShortcutsByCategory,
} from "./keyboard-shortcuts";
export type {
  Shortcut,
  ShortcutCategory,
  KeyboardShortcutsConfig,
  KeyboardShortcutsModalProps,
  ShortcutHandler,
  ShortcutRegistration,
} from "./keyboard-shortcuts";

// Advanced Search
export {
  AdvancedSearch,
  SearchFilters,
  SearchFilterChips,
  SearchResultsPreview,
  SearchResultsSkeleton,
} from "./advanced-search";
export type {
  SearchEntityType,
  SearchStatus,
  DateRangePreset,
  DateRange,
  SearchFilter,
  RecentSearch,
  SearchSuggestion,
  SearchResult,
  GroupedSearchResults,
  AdvancedSearchProps,
  SearchFiltersProps,
  SearchResultsPreviewProps,
} from "./advanced-search";

// Activity Feed
export {
  ActivityFeed as EnhancedActivityFeed,
} from "./activity-feed";
export type {
  ActivityFeedProps,
} from "./activity-feed";

// Offline Support Components
export {
  OfflineIndicator,
  OfflineIndicatorCompact,
  SyncStatus,
  OfflineBanner,
  OfflineBannerCompact,
  ReconnectedBanner,
  OfflineFallback,
  StaleDataWarning,
  CachedDataBadge,
} from "./offline";
export type {
  OfflineIndicatorProps,
  SyncStatusProps,
  OfflineBannerProps,
  OfflineFallbackProps,
  SyncStatus as SyncStatusType,
  SyncOperationType,
  SyncEntityType,
  ConflictResolution,
  SyncOperation,
  SyncQueueItem,
  SyncConflict,
  OfflineState,
  SyncQueueState,
  SyncQueueActions,
  SyncQueueStore,
  CacheEntry,
  CacheInvalidationStrategy,
  CacheConfig,
  UseOnlineStatusReturn,
  UseSyncQueueReturn,
} from "./offline";
