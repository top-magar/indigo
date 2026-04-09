"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  WidgetType,
  type Widget,
  type WidgetSize,
  type WidgetPosition,
  type DashboardLayout,
  type LayoutPreset,
  type ResponsiveBreakpoint,
  WIDGET_SIZE_MAP,
  RESPONSIVE_WIDGET_SIZE_MAP,
  createWidget,
} from "@/components/dashboard/widgets/widget-types";

/**
 * Responsive layout configuration per breakpoint
 */
export interface ResponsiveLayoutConfig {
  mobile: {
    columns: number;
    gap: number;
    rowHeight: number | "auto";
  };
  tablet: {
    columns: number;
    gap: number;
    rowHeight: number;
  };
  desktop: {
    columns: number;
    gap: number;
    rowHeight: number;
  };
}

/**
 * Default responsive layout configuration
 */
export const DEFAULT_RESPONSIVE_CONFIG: ResponsiveLayoutConfig = {
  mobile: {
    columns: 1,
    gap: 12,
    rowHeight: "auto",
  },
  tablet: {
    columns: 2,
    gap: 16,
    rowHeight: 80,
  },
  desktop: {
    columns: 12,
    gap: 16,
    rowHeight: 80,
  },
};

export interface DashboardLayoutState {
  widgets: Widget[];
  layout: DashboardLayout;
  presets: LayoutPreset[];
  activePresetId: string | null;
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  /** Current breakpoint for responsive layouts */
  currentBreakpoint: ResponsiveBreakpoint;
  /** Responsive layout configuration */
  responsiveConfig: ResponsiveLayoutConfig;
  /** Separate widget layouts per breakpoint (optional) */
  breakpointLayouts: {
    mobile?: Widget[];
    tablet?: Widget[];
    desktop?: Widget[];
  };
}

export interface DashboardLayoutActions {
  addWidget: (type: WidgetType, position?: Partial<WidgetPosition>) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<Widget>) => void;
  moveWidget: (widgetId: string, position: WidgetPosition) => void;
  resizeWidget: (widgetId: string, size: WidgetSize) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  toggleWidgetCollapse: (widgetId: string) => void;
  reorderWidgets: (widgets: Widget[]) => void;
  setLayout: (layout: Partial<DashboardLayout>) => void;
  resetLayout: () => void;
  saveLayout: () => void;
  applyPreset: (presetId: string) => void;
  saveAsPreset: (name: string, description?: string) => void;
  deletePreset: (presetId: string) => void;
  setEditMode: (enabled: boolean) => void;
  toggleEditMode: () => void;
  getWidgetById: (widgetId: string) => Widget | undefined;
  getVisibleWidgets: () => Widget[];
  findNextAvailablePosition: () => WidgetPosition;
  /** Set the current responsive breakpoint */
  setBreakpoint: (breakpoint: ResponsiveBreakpoint) => void;
  /** Get widgets adjusted for the current breakpoint */
  getResponsiveWidgets: () => Widget[];
  /** Get layout configuration for a specific breakpoint */
  getLayoutForBreakpoint: (breakpoint: ResponsiveBreakpoint) => {
    columns: number;
    gap: number;
    rowHeight: number | "auto";
  };
  /** Save layout for a specific breakpoint */
  saveBreakpointLayout: (breakpoint: ResponsiveBreakpoint, widgets: Widget[]) => void;
  /** Update responsive configuration */
  setResponsiveConfig: (config: Partial<ResponsiveLayoutConfig>) => void;
}

export type DashboardLayoutStore = DashboardLayoutState & DashboardLayoutActions;

const DEFAULT_WIDGETS: Widget[] = [
  createWidget(WidgetType.STAT_CARD, { x: 0, y: 0, width: 3, height: 2 }, {
    id: "widget-stat-revenue", title: "Revenue", config: { settings: { statType: "revenue" } },
  }),
  createWidget(WidgetType.STAT_CARD, { x: 3, y: 0, width: 3, height: 2 }, {
    id: "widget-stat-orders", title: "Orders", config: { settings: { statType: "orders" } },
  }),
  createWidget(WidgetType.STAT_CARD, { x: 6, y: 0, width: 3, height: 2 }, {
    id: "widget-stat-customers", title: "Customers", config: { settings: { statType: "customers" } },
  }),
  createWidget(WidgetType.STAT_CARD, { x: 9, y: 0, width: 3, height: 2 }, {
    id: "widget-stat-products", title: "Products", config: { settings: { statType: "products" } },
  }),
  createWidget(WidgetType.REVENUE_CHART, { x: 0, y: 2, width: 8, height: 4 }, {
    id: "widget-revenue-chart", title: "Revenue Overview", config: { chartType: "area" },
  }),
  createWidget(WidgetType.QUICK_ACTIONS, { x: 8, y: 2, width: 4, height: 2 }, {
    id: "widget-quick-actions", title: "Quick Actions",
  }),
  createWidget(WidgetType.ACTIVITY_FEED, { x: 8, y: 4, width: 4, height: 4 }, {
    id: "widget-activity-feed", title: "Recent Activity", config: { maxItems: 5 },
  }),
  createWidget(WidgetType.RECENT_ORDERS, { x: 0, y: 6, width: 6, height: 3 }, {
    id: "widget-recent-orders", title: "Recent Orders", config: { maxItems: 5 },
  }),
  createWidget(WidgetType.TOP_PRODUCTS, { x: 6, y: 6, width: 6, height: 3 }, {
    id: "widget-top-products", title: "Top Products", config: { maxItems: 5 },
  }),
];

const DEFAULT_LAYOUT: DashboardLayout = {
  id: "default",
  name: "Default Layout",
  description: "Standard dashboard layout",
  widgets: DEFAULT_WIDGETS.map((w) => ({ widgetId: w.id, position: w.position, visible: w.visible })),
  columns: 12,
  rowHeight: 80,
  gap: 16,
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};


const DEFAULT_PRESETS: LayoutPreset[] = [
  {
    id: "overview",
    name: "Overview",
    description: "High-level metrics and activity",
    isSystem: true,
    widgets: [
      { type: WidgetType.STAT_CARD, title: "Revenue", size: "small", position: { x: 0, y: 0, width: 3, height: 2 }, visible: true, config: { settings: { statType: "revenue" } } },
      { type: WidgetType.STAT_CARD, title: "Orders", size: "small", position: { x: 3, y: 0, width: 3, height: 2 }, visible: true, config: { settings: { statType: "orders" } } },
      { type: WidgetType.STAT_CARD, title: "Customers", size: "small", position: { x: 6, y: 0, width: 3, height: 2 }, visible: true, config: { settings: { statType: "customers" } } },
      { type: WidgetType.STAT_CARD, title: "Products", size: "small", position: { x: 9, y: 0, width: 3, height: 2 }, visible: true, config: { settings: { statType: "products" } } },
      { type: WidgetType.REVENUE_CHART, title: "Revenue", size: "large", position: { x: 0, y: 2, width: 12, height: 4 }, visible: true, config: { chartType: "area" } },
    ],
  },
  {
    id: "analytics",
    name: "Analytics Focus",
    description: "Charts and data visualization",
    isSystem: true,
    widgets: [
      { type: WidgetType.REVENUE_CHART, title: "Revenue", size: "large", position: { x: 0, y: 0, width: 8, height: 4 }, visible: true, config: { chartType: "area" } },
      { type: WidgetType.SALES_BY_CATEGORY, title: "Sales by Category", size: "medium", position: { x: 8, y: 0, width: 4, height: 4 }, visible: true, config: { chartType: "pie" } },
      { type: WidgetType.TOP_PRODUCTS, title: "Top Products", size: "medium", position: { x: 0, y: 4, width: 6, height: 3 }, visible: true },
      { type: WidgetType.CONVERSION_FUNNEL, title: "Conversion Funnel", size: "medium", position: { x: 6, y: 4, width: 6, height: 3 }, visible: true, config: { chartType: "bar" } },
    ],
  },
  {
    id: "operations",
    name: "Operations",
    description: "Orders and inventory management",
    isSystem: true,
    widgets: [
      { type: WidgetType.RECENT_ORDERS, title: "Recent Orders", size: "large", position: { x: 0, y: 0, width: 8, height: 4 }, visible: true, config: { maxItems: 10 } },
      { type: WidgetType.QUICK_ACTIONS, title: "Quick Actions", size: "small", position: { x: 8, y: 0, width: 4, height: 2 }, visible: true },
      { type: WidgetType.INVENTORY_ALERTS, title: "Inventory Alerts", size: "small", position: { x: 8, y: 2, width: 4, height: 2 }, visible: true },
      { type: WidgetType.ACTIVITY_FEED, title: "Activity", size: "medium", position: { x: 0, y: 4, width: 6, height: 4 }, visible: true },
      { type: WidgetType.INSIGHTS, title: "Insights", size: "medium", position: { x: 6, y: 4, width: 6, height: 4 }, visible: true },
    ],
  },
];

const initialState: DashboardLayoutState = {
  widgets: DEFAULT_WIDGETS,
  layout: DEFAULT_LAYOUT,
  presets: DEFAULT_PRESETS,
  activePresetId: null,
  isEditMode: false,
  hasUnsavedChanges: false,
  lastSavedAt: null,
  currentBreakpoint: "desktop",
  responsiveConfig: DEFAULT_RESPONSIVE_CONFIG,
  breakpointLayouts: {},
};

export const useDashboardLayoutStore = create<DashboardLayoutStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      addWidget: (type, position) => {
        set((state) => {
          const pos = position ? { ...get().findNextAvailablePosition(), ...position } : get().findNextAvailablePosition();
          const newWidget = createWidget(type, pos as WidgetPosition);
          state.widgets.push(newWidget);
          state.hasUnsavedChanges = true;
        });
      },

      removeWidget: (widgetId) => {
        set((state) => {
          const index = state.widgets.findIndex((w) => w.id === widgetId);
          if (index !== -1) {
            state.widgets.splice(index, 1);
            state.hasUnsavedChanges = true;
          }
        });
      },

      updateWidget: (widgetId, updates) => {
        set((state) => {
          const widget = state.widgets.find((w) => w.id === widgetId);
          if (widget) {
            Object.assign(widget, updates);
            state.hasUnsavedChanges = true;
          }
        });
      },

      moveWidget: (widgetId, position) => {
        set((state) => {
          const widget = state.widgets.find((w) => w.id === widgetId);
          if (widget) {
            widget.position = position;
            state.hasUnsavedChanges = true;
          }
        });
      },

      resizeWidget: (widgetId, size) => {
        set((state) => {
          const widget = state.widgets.find((w) => w.id === widgetId);
          if (widget) {
            const dimensions = WIDGET_SIZE_MAP[size];
            widget.size = size;
            widget.position.width = dimensions.width;
            widget.position.height = dimensions.height;
            state.hasUnsavedChanges = true;
          }
        });
      },

      toggleWidgetVisibility: (widgetId) => {
        set((state) => {
          const widget = state.widgets.find((w) => w.id === widgetId);
          if (widget) {
            widget.visible = !widget.visible;
            state.hasUnsavedChanges = true;
          }
        });
      },

      toggleWidgetCollapse: (widgetId) => {
        set((state) => {
          const widget = state.widgets.find((w) => w.id === widgetId);
          if (widget) {
            widget.config = { ...widget.config, collapsed: !widget.config?.collapsed };
            state.hasUnsavedChanges = true;
          }
        });
      },

      reorderWidgets: (widgets) => {
        set((state) => {
          state.widgets = widgets;
          state.hasUnsavedChanges = true;
        });
      },

      setLayout: (layout) => {
        set((state) => {
          Object.assign(state.layout, layout);
          state.layout.updatedAt = new Date();
          state.hasUnsavedChanges = true;
        });
      },

      resetLayout: () => {
        set((state) => {
          state.widgets = [...DEFAULT_WIDGETS];
          state.layout = { ...DEFAULT_LAYOUT };
          state.activePresetId = null;
          state.hasUnsavedChanges = false;
        });
      },

      saveLayout: () => {
        set((state) => {
          state.layout.updatedAt = new Date();
          state.hasUnsavedChanges = false;
          state.lastSavedAt = new Date();
        });
      },

      applyPreset: (presetId) => {
        const preset = get().presets.find((p) => p.id === presetId);
        if (!preset) return;
        set((state) => {
          state.widgets = preset.widgets.map((w, index) =>
            createWidget(w.type, w.position, { id: `widget-${presetId}-${index}`, title: w.title, size: w.size, config: w.config, visible: w.visible })
          );
          state.activePresetId = presetId;
          state.hasUnsavedChanges = true;
        });
      },

      saveAsPreset: (name, description) => {
        set((state) => {
          const newPreset: LayoutPreset = {
            id: `preset-${Date.now()}`,
            name,
            description,
            isSystem: false,
            widgets: state.widgets.map((w) => ({ type: w.type, title: w.title, size: w.size, position: w.position, config: w.config, visible: w.visible })),
          };
          state.presets.push(newPreset);
        });
      },

      deletePreset: (presetId) => {
        set((state) => {
          const index = state.presets.findIndex((p) => p.id === presetId && !p.isSystem);
          if (index !== -1) {
            state.presets.splice(index, 1);
            if (state.activePresetId === presetId) state.activePresetId = null;
          }
        });
      },

      setEditMode: (enabled) => {
        set((state) => { state.isEditMode = enabled; });
      },

      toggleEditMode: () => {
        set((state) => { state.isEditMode = !state.isEditMode; });
      },

      getWidgetById: (widgetId) => get().widgets.find((w) => w.id === widgetId),

      getVisibleWidgets: () => get().widgets.filter((w) => w.visible),

      findNextAvailablePosition: () => {
        const widgets = get().widgets;
        if (widgets.length === 0) return { x: 0, y: 0, width: 6, height: 3 };
        const maxY = Math.max(...widgets.map((w) => w.position.y + w.position.height));
        return { x: 0, y: maxY, width: 6, height: 3 };
      },

      setBreakpoint: (breakpoint) => {
        set((state) => {
          state.currentBreakpoint = breakpoint;
        });
      },

      getResponsiveWidgets: () => {
        const state = get();
        const { currentBreakpoint, widgets, breakpointLayouts } = state;
        
        // Check if there's a saved layout for this breakpoint
        const breakpointWidgets = breakpointLayouts[currentBreakpoint];
        if (breakpointWidgets && breakpointWidgets.length > 0) {
          return breakpointWidgets;
        }

        // Otherwise, adjust widgets based on breakpoint
        return widgets.map((widget) => {
          const sizeMap = RESPONSIVE_WIDGET_SIZE_MAP[currentBreakpoint];
          const baseSize = typeof widget.size === "string" ? widget.size : "medium";
          const responsiveDimensions = sizeMap[baseSize];

          return {
            ...widget,
            position: {
              ...widget.position,
              width: responsiveDimensions.width,
              height: responsiveDimensions.height,
            },
          };
        });
      },

      getLayoutForBreakpoint: (breakpoint) => {
        const config = get().responsiveConfig;
        return config[breakpoint];
      },

      saveBreakpointLayout: (breakpoint, widgets) => {
        set((state) => {
          state.breakpointLayouts[breakpoint] = widgets;
          state.hasUnsavedChanges = true;
        });
      },

      setResponsiveConfig: (config) => {
        set((state) => {
          state.responsiveConfig = {
            ...state.responsiveConfig,
            ...config,
          };
          state.hasUnsavedChanges = true;
        });
      },
    })),
    {
      name: "dashboard-layout",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        widgets: state.widgets,
        layout: state.layout,
        presets: state.presets.filter((p) => !p.isSystem),
        activePresetId: state.activePresetId,
        responsiveConfig: state.responsiveConfig,
        breakpointLayouts: state.breakpointLayouts,
      }),
    }
  )
);

export function useDashboardLayout() {
  const store = useDashboardLayoutStore();
  return {
    widgets: store.widgets,
    visibleWidgets: store.getVisibleWidgets(),
    layout: store.layout,
    presets: store.presets,
    activePresetId: store.activePresetId,
    isEditMode: store.isEditMode,
    hasUnsavedChanges: store.hasUnsavedChanges,
    lastSavedAt: store.lastSavedAt,
    currentBreakpoint: store.currentBreakpoint,
    responsiveConfig: store.responsiveConfig,
    breakpointLayouts: store.breakpointLayouts,
    addWidget: store.addWidget,
    removeWidget: store.removeWidget,
    updateWidget: store.updateWidget,
    moveWidget: store.moveWidget,
    resizeWidget: store.resizeWidget,
    toggleWidgetVisibility: store.toggleWidgetVisibility,
    toggleWidgetCollapse: store.toggleWidgetCollapse,
    reorderWidgets: store.reorderWidgets,
    setLayout: store.setLayout,
    resetLayout: store.resetLayout,
    saveLayout: store.saveLayout,
    applyPreset: store.applyPreset,
    saveAsPreset: store.saveAsPreset,
    deletePreset: store.deletePreset,
    setEditMode: store.setEditMode,
    toggleEditMode: store.toggleEditMode,
    getWidgetById: store.getWidgetById,
    setBreakpoint: store.setBreakpoint,
    getResponsiveWidgets: store.getResponsiveWidgets,
    getLayoutForBreakpoint: store.getLayoutForBreakpoint,
    saveBreakpointLayout: store.saveBreakpointLayout,
    setResponsiveConfig: store.setResponsiveConfig,
  };
}

export type { Widget, WidgetSize, WidgetPosition, DashboardLayout, LayoutPreset, ResponsiveBreakpoint };
