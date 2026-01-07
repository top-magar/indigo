"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AnalyticsUpIcon,
  ChartLineData01Icon,
  Activity01Icon,
  Rocket01Icon,
  AiInnovation01Icon,
  ShoppingCart01Icon,
  PackageIcon,
  MoneyBag01Icon,
  UserMultiple02Icon,
  Alert02Icon,
  PieChart01Icon,
  FilterIcon,
  Search01Icon,
  Cancel01Icon,
  Add01Icon,
  DragDropVerticalIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/shared/utils";
import {
  DEFAULT_WIDGET_CATALOG,
  type WidgetCatalogItem,
  type WidgetCategory,
  type WidgetType,
} from "./widget-types";

const WIDGET_ICONS: Record<string, typeof AnalyticsUpIcon> = {
  AnalyticsUpIcon,
  ChartLineData01Icon,
  Activity01Icon,
  Rocket01Icon,
  AiInnovation01Icon,
  ShoppingCart01Icon,
  PackageIcon,
  MoneyBag01Icon,
  UserMultiple02Icon,
  Alert02Icon,
  PieChart01Icon,
  FilterIcon,
};

const CATEGORY_CONFIG: Record<WidgetCategory, { label: string; icon: typeof AnalyticsUpIcon }> = {
  analytics: { label: "Analytics", icon: AnalyticsUpIcon },
  orders: { label: "Orders", icon: ShoppingCart01Icon },
  products: { label: "Products", icon: PackageIcon },
  customers: { label: "Customers", icon: UserMultiple02Icon },
  activity: { label: "Activity", icon: Activity01Icon },
  insights: { label: "Insights", icon: AiInnovation01Icon },
  custom: { label: "Custom", icon: Rocket01Icon },
};

export interface WidgetCatalogProps {
  catalog?: WidgetCatalogItem[];
  onAddWidget?: (type: WidgetType) => void;
  addedWidgetTypes?: WidgetType[];
  className?: string;
}

function WidgetCatalogCard({
  item,
  onAdd,
  isAdded = false,
}: {
  item: WidgetCatalogItem;
  onAdd?: () => void;
  isAdded?: boolean;
}) {
  const IconComponent = WIDGET_ICONS[item.icon] ?? AnalyticsUpIcon;

  return (
    <div
      className={cn(
        "group relative border rounded-lg p-4 transition-all hover:border-primary/50 hover:shadow-sm",
        isAdded && "bg-muted/50 border-muted"
      )}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <HugeiconsIcon icon={DragDropVerticalIcon} className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={IconComponent} className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{item.name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {item.defaultSize}
          </Badge>
          {item.isPremium && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              Pro
            </Badge>
          )}
        </div>

        <Button
          size="sm"
          variant={isAdded ? "secondary" : "default"}
          className="h-7 text-xs"
          onClick={onAdd}
          disabled={isAdded}
        >
          {isAdded ? (
            "Added"
          ) : (
            <>
              <HugeiconsIcon icon={Add01Icon} className="h-3 w-3 mr-1" />
              Add
            </>
          )}
        </Button>
      </div>
    </div>
  );
}


function WidgetCatalogContent({
  catalog = DEFAULT_WIDGET_CATALOG,
  onAddWidget,
  addedWidgetTypes = [],
}: WidgetCatalogProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<WidgetCategory | "all">("all");

  const filteredWidgets = React.useMemo(() => {
    return catalog.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [catalog, searchQuery, selectedCategory]);

  const groupedWidgets = React.useMemo(() => {
    const groups: Record<WidgetCategory, WidgetCatalogItem[]> = {
      analytics: [],
      orders: [],
      products: [],
      customers: [],
      activity: [],
      insights: [],
      custom: [],
    };
    filteredWidgets.forEach((item) => {
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredWidgets]);

  const categories = Object.keys(CATEGORY_CONFIG) as WidgetCategory[];

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-4">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          placeholder="Search widgets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setSearchQuery("")}
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Tabs
        value={selectedCategory}
        onValueChange={(v) => setSelectedCategory(v as WidgetCategory | "all")}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-4">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {CATEGORY_CONFIG[category].label}
            </TabsTrigger>
          ))}
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="all" className="mt-0 space-y-6">
            {categories.map((category) => {
              const widgets = groupedWidgets[category];
              if (widgets.length === 0) return null;
              return (
                <div key={category}>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <HugeiconsIcon icon={CATEGORY_CONFIG[category].icon} className="h-4 w-4" />
                    {CATEGORY_CONFIG[category].label}
                  </h3>
                  <div className="grid gap-3">
                    {widgets.map((item) => (
                      <WidgetCatalogCard
                        key={item.type}
                        item={item}
                        onAdd={() => onAddWidget?.(item.type)}
                        isAdded={addedWidgetTypes.includes(item.type)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid gap-3">
                {groupedWidgets[category].map((item) => (
                  <WidgetCatalogCard
                    key={item.type}
                    item={item}
                    onAdd={() => onAddWidget?.(item.type)}
                    isAdded={addedWidgetTypes.includes(item.type)}
                  />
                ))}
                {groupedWidgets[category].length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No widgets found in this category
                  </p>
                )}
              </div>
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>

      <div className="pt-4 border-t mt-4">
        <p className="text-xs text-muted-foreground">
          {filteredWidgets.length} widget{filteredWidgets.length !== 1 && "s"} available
        </p>
      </div>
    </div>
  );
}

export function WidgetCatalogSheet({
  catalog,
  onAddWidget,
  addedWidgetTypes,
  trigger,
  open,
  onOpenChange,
}: WidgetCatalogProps & {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Widget Catalog</SheetTitle>
          <SheetDescription>Browse and add widgets to customize your dashboard</SheetDescription>
        </SheetHeader>
        <div className="flex-1 mt-6 min-h-0">
          <WidgetCatalogContent catalog={catalog} onAddWidget={onAddWidget} addedWidgetTypes={addedWidgetTypes} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function WidgetCatalogDialog({
  catalog,
  onAddWidget,
  addedWidgetTypes,
  trigger,
  open,
  onOpenChange,
}: WidgetCatalogProps & {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Widget Catalog</DialogTitle>
          <DialogDescription>Browse and add widgets to customize your dashboard</DialogDescription>
        </DialogHeader>
        <div className="flex-1 mt-4 min-h-0 overflow-hidden">
          <WidgetCatalogContent catalog={catalog} onAddWidget={onAddWidget} addedWidgetTypes={addedWidgetTypes} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WidgetCatalog(props: WidgetCatalogProps) {
  return (
    <div className={cn("p-4 border rounded-lg", props.className)}>
      <h3 className="font-medium mb-4">Add Widgets</h3>
      <WidgetCatalogContent {...props} />
    </div>
  );
}

export { WidgetCatalogCard, WidgetCatalogContent, WIDGET_ICONS, CATEGORY_CONFIG };
