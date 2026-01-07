import type { Meta, StoryObj } from "@storybook/nextjs";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Settings02Icon, LayoutGridIcon } from "@hugeicons/core-free-icons";
import { WidgetGrid } from "./widget-grid";
import { WidgetContainer } from "./widget-container";
import { WidgetCatalog, WidgetCatalogSheet, WidgetCatalogDialog } from "./widget-catalog";
import { WidgetRenderer } from "./widget-renderer";
import { WidgetType, createWidget, type Widget } from "./widget-types";

const meta: Meta = {
  title: "Dashboard/Widgets",
  parameters: { layout: "padded" },
  tags: ["autodocs"],
};

export default meta;

const sampleWidgets: Widget[] = [
  createWidget(WidgetType.STAT_CARD, { x: 0, y: 0, width: 3, height: 2 }, { id: "stat-1", title: "Revenue", config: { settings: { statType: "revenue" } } }),
  createWidget(WidgetType.STAT_CARD, { x: 3, y: 0, width: 3, height: 2 }, { id: "stat-2", title: "Orders", config: { settings: { statType: "orders" } } }),
  createWidget(WidgetType.STAT_CARD, { x: 6, y: 0, width: 3, height: 2 }, { id: "stat-3", title: "Customers", config: { settings: { statType: "customers" } } }),
  createWidget(WidgetType.STAT_CARD, { x: 9, y: 0, width: 3, height: 2 }, { id: "stat-4", title: "Products", config: { settings: { statType: "products" } } }),
  createWidget(WidgetType.REVENUE_CHART, { x: 0, y: 2, width: 8, height: 4 }, { id: "chart-1", title: "Revenue Overview", config: { chartType: "area" } }),
  createWidget(WidgetType.QUICK_ACTIONS, { x: 8, y: 2, width: 4, height: 2 }, { id: "actions-1", title: "Quick Actions" }),
  createWidget(WidgetType.ACTIVITY_FEED, { x: 8, y: 4, width: 4, height: 4 }, { id: "activity-1", title: "Recent Activity", config: { maxItems: 5 } }),
];

function GridDefaultStory() {
  const [widgets, setWidgets] = React.useState(sampleWidgets);
  return <div className="w-full"><WidgetGrid widgets={widgets} isEditMode={false} onWidgetsChange={setWidgets} /></div>;
}

function GridEditModeStory() {
  const [widgets, setWidgets] = React.useState(sampleWidgets);
  const [isEditMode, setIsEditMode] = React.useState(true);
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <Button variant={isEditMode ? "default" : "outline"} size="sm" onClick={() => setIsEditMode(!isEditMode)}>
          <HugeiconsIcon icon={Settings02Icon} className="h-4 w-4 mr-2" />{isEditMode ? "Done Editing" : "Edit Layout"}
        </Button>
      </div>
      <WidgetGrid widgets={widgets} isEditMode={isEditMode} onWidgetsChange={setWidgets} onWidgetRemove={(id) => setWidgets(widgets.filter((w) => w.id !== id))} />
    </div>
  );
}

function CatalogInlineStory() {
  const [addedTypes, setAddedTypes] = React.useState<WidgetType[]>([]);
  return <div className="w-[400px]"><WidgetCatalog onAddWidget={(type) => setAddedTypes([...addedTypes, type])} addedWidgetTypes={addedTypes} /></div>;
}


function CatalogSheetStory() {
  const [open, setOpen] = React.useState(false);
  return <WidgetCatalogSheet open={open} onOpenChange={setOpen} trigger={<Button><HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />Add Widget</Button>} onAddWidget={(type) => console.log("Add:", type)} />;
}

function CatalogDialogStory() {
  const [open, setOpen] = React.useState(false);
  return <WidgetCatalogDialog open={open} onOpenChange={setOpen} trigger={<Button variant="outline"><HugeiconsIcon icon={LayoutGridIcon} className="h-4 w-4 mr-2" />Browse</Button>} onAddWidget={(type) => { console.log("Add:", type); setOpen(false); }} />;
}

function FullDashboardStory() {
  const [widgets, setWidgets] = React.useState(sampleWidgets);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [catalogOpen, setCatalogOpen] = React.useState(false);
  const handleAddWidget = (type: WidgetType) => {
    const maxY = Math.max(...widgets.map((w) => w.position.y + w.position.height), 0);
    setWidgets([...widgets, createWidget(type, { x: 0, y: maxY, width: 6, height: 3 })]);
    setCatalogOpen(false);
  };
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          {isEditMode && <WidgetCatalogSheet open={catalogOpen} onOpenChange={setCatalogOpen} trigger={<Button variant="outline" size="sm"><HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />Add Widget</Button>} onAddWidget={handleAddWidget} addedWidgetTypes={widgets.map((w) => w.type)} />}
          <Button variant={isEditMode ? "default" : "outline"} size="sm" onClick={() => setIsEditMode(!isEditMode)}><HugeiconsIcon icon={Settings02Icon} className="h-4 w-4 mr-2" />{isEditMode ? "Done" : "Customize"}</Button>
        </div>
      </div>
      <WidgetGrid widgets={widgets} isEditMode={isEditMode} onWidgetsChange={setWidgets} onWidgetRemove={(id) => setWidgets(widgets.filter((w) => w.id !== id))} />
    </div>
  );
}

export const GridDefault: StoryObj = { name: "Widget Grid - Default", render: () => <GridDefaultStory /> };
export const GridEditMode: StoryObj = { name: "Widget Grid - Edit Mode", render: () => <GridEditModeStory /> };

export const ContainerDefault: StoryObj = {
  name: "Widget Container - Default",
  render: () => {
    const widget = createWidget(WidgetType.STAT_CARD, { x: 0, y: 0, width: 4, height: 2 }, { title: "Total Revenue", config: { settings: { statType: "revenue" } } });
    return <div className="w-[400px]"><WidgetContainer widget={widget}><WidgetRenderer widget={widget} /></WidgetContainer></div>;
  },
};

export const ContainerEditMode: StoryObj = {
  name: "Widget Container - Edit Mode",
  render: () => {
    const widget = createWidget(WidgetType.ACTIVITY_FEED, { x: 0, y: 0, width: 4, height: 4 }, { title: "Recent Activity", config: { maxItems: 5 } });
    return <div className="w-[400px]"><WidgetContainer widget={widget} isEditMode onRemove={(id) => console.log("Remove:", id)}><WidgetRenderer widget={widget} /></WidgetContainer></div>;
  },
};

export const ContainerLoading: StoryObj = {
  name: "Widget Container - Loading",
  render: () => {
    const widget = createWidget(WidgetType.CHART, { x: 0, y: 0, width: 6, height: 4 }, { title: "Revenue Chart", isLoading: true });
    return <div className="w-[500px]"><WidgetContainer widget={widget}><WidgetRenderer widget={widget} /></WidgetContainer></div>;
  },
};

export const ContainerError: StoryObj = {
  name: "Widget Container - Error",
  render: () => {
    const widget = createWidget(WidgetType.CHART, { x: 0, y: 0, width: 6, height: 4 }, { title: "Revenue Chart", error: "Failed to load chart data" });
    return <div className="w-[500px]"><WidgetContainer widget={widget} onRefresh={(id) => console.log("Retry:", id)}><WidgetRenderer widget={widget} /></WidgetContainer></div>;
  },
};

export const CatalogInline: StoryObj = { name: "Widget Catalog - Inline", render: () => <CatalogInlineStory /> };
export const CatalogSheet: StoryObj = { name: "Widget Catalog - Sheet", render: () => <CatalogSheetStory /> };
export const CatalogDialog: StoryObj = { name: "Widget Catalog - Dialog", render: () => <CatalogDialogStory /> };

export const RendererStatCard: StoryObj = {
  name: "Widget Renderer - Stat Card",
  render: () => {
    const widget = createWidget(WidgetType.STAT_CARD, { x: 0, y: 0, width: 3, height: 2 }, { title: "Revenue", config: { settings: { statType: "revenue" } } });
    return <div className="w-[300px] h-[160px] border rounded-lg p-4"><WidgetRenderer widget={widget} /></div>;
  },
};

export const RendererChart: StoryObj = {
  name: "Widget Renderer - Chart",
  render: () => {
    const widget = createWidget(WidgetType.CHART, { x: 0, y: 0, width: 6, height: 4 }, { title: "Revenue Chart", config: { chartType: "area" } });
    return <div className="w-[600px] h-[320px] border rounded-lg p-4"><WidgetRenderer widget={widget} /></div>;
  },
};

export const RendererActivityFeed: StoryObj = {
  name: "Widget Renderer - Activity Feed",
  render: () => {
    const widget = createWidget(WidgetType.ACTIVITY_FEED, { x: 0, y: 0, width: 4, height: 4 }, { title: "Recent Activity", config: { maxItems: 5 } });
    return <div className="w-[400px] h-[320px] border rounded-lg p-4"><WidgetRenderer widget={widget} /></div>;
  },
};

export const RendererQuickActions: StoryObj = {
  name: "Widget Renderer - Quick Actions",
  render: () => {
    const widget = createWidget(WidgetType.QUICK_ACTIONS, { x: 0, y: 0, width: 4, height: 2 }, { title: "Quick Actions" });
    return <div className="w-[400px] h-[200px] border rounded-lg p-4"><WidgetRenderer widget={widget} /></div>;
  },
};

export const RendererInsights: StoryObj = {
  name: "Widget Renderer - Insights",
  render: () => {
    const widget = createWidget(WidgetType.INSIGHTS, { x: 0, y: 0, width: 6, height: 4 }, { title: "AI Insights", config: { maxItems: 3 } });
    return <div className="w-[500px] h-[320px] border rounded-lg p-4"><WidgetRenderer widget={widget} /></div>;
  },
};

export const RendererRecentOrders: StoryObj = {
  name: "Widget Renderer - Recent Orders",
  render: () => {
    const widget = createWidget(WidgetType.RECENT_ORDERS, { x: 0, y: 0, width: 6, height: 3 }, { title: "Recent Orders", config: { maxItems: 5 } });
    return <div className="w-[500px] h-[240px] border rounded-lg p-4"><WidgetRenderer widget={widget} /></div>;
  },
};

export const RendererTopProducts: StoryObj = {
  name: "Widget Renderer - Top Products",
  render: () => {
    const widget = createWidget(WidgetType.TOP_PRODUCTS, { x: 0, y: 0, width: 6, height: 3 }, { title: "Top Products", config: { maxItems: 5 } });
    return <div className="w-[500px] h-[240px] border rounded-lg p-4"><WidgetRenderer widget={widget} /></div>;
  },
};

export const FullDashboard: StoryObj = { name: "Full Dashboard Example", render: () => <FullDashboardStory /> };
