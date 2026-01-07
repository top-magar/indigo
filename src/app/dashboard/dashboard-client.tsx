"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Settings02Icon,
    GridIcon,
    FloppyDiskIcon,
    ArrowReloadHorizontalIcon,
    Add01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveWidgetGrid } from "@/components/dashboard/widgets/widget-grid";
import { WidgetCatalogSheet } from "@/components/dashboard/widgets/widget-catalog";
import { useDashboardLayout } from "@/shared/hooks/use-dashboard-layout";
import { saveLayoutPreferences } from "./actions";
import type { WidgetSize } from "@/components/dashboard/widgets/widget-types";
import { cn } from "@/shared/utils";

interface DashboardClientProps {
    /** Initial currency for formatting */
    currency?: string;
    /** Store slug for links */
    storeSlug?: string;
    /** User name for greeting */
    userName?: string;
}

export function DashboardClient({
    currency = "USD",
    storeSlug,
    userName,
}: DashboardClientProps) {
    const {
        widgets,
        visibleWidgets,
        layout,
        presets,
        isEditMode,
        hasUnsavedChanges,
        addWidget,
        removeWidget,
        resizeWidget,
        reorderWidgets,
        resetLayout,
        saveLayout,
        applyPreset,
        setEditMode,
        toggleEditMode,
    } = useDashboardLayout();

    const [isSaving, setIsSaving] = React.useState(false);
    const [showCatalog, setShowCatalog] = React.useState(false);

    // Handle widget reorder from drag-and-drop
    const handleWidgetsChange = React.useCallback(
        (newWidgets: typeof widgets) => {
            reorderWidgets(newWidgets);
        },
        [reorderWidgets]
    );

    // Handle widget removal
    const handleWidgetRemove = React.useCallback(
        (widgetId: string) => {
            removeWidget(widgetId);
        },
        [removeWidget]
    );

    // Handle widget resize
    const handleWidgetResize = React.useCallback(
        (widgetId: string, size: WidgetSize) => {
            resizeWidget(widgetId, size);
        },
        [resizeWidget]
    );

    // Handle save layout
    const handleSaveLayout = React.useCallback(async () => {
        setIsSaving(true);
        try {
            // Save to local storage via zustand persist
            saveLayout();
            
            // Also save to server for cross-device sync
            await saveLayoutPreferences({
                widgets: widgets.map(w => ({
                    id: w.id,
                    type: w.type,
                    position: w.position,
                    visible: w.visible,
                })),
                columns: layout.columns,
                rowHeight: layout.rowHeight,
                gap: layout.gap,
            });
        } catch (error) {
            console.error("Failed to save layout:", error);
        } finally {
            setIsSaving(false);
        }
    }, [widgets, layout, saveLayout]);

    // Handle preset selection
    const handlePresetSelect = React.useCallback(
        (presetId: string) => {
            applyPreset(presetId);
        },
        [applyPreset]
    );

    return (
        <div className="space-y-4">
            {/* Edit Mode Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isEditMode && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowCatalog(true)}
                            >
                                <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
                                Add Widget
                            </Button>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <HugeiconsIcon icon={GridIcon} className="w-4 h-4 mr-2" />
                                        Presets
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48">
                                    {presets.map((preset) => (
                                        <DropdownMenuItem
                                            key={preset.id}
                                            onClick={() => handlePresetSelect(preset.id)}
                                        >
                                            {preset.name}
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={resetLayout}>
                                        <HugeiconsIcon icon={ArrowReloadHorizontalIcon} className="w-4 h-4 mr-2" />
                                        Reset to Default
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {isEditMode && hasUnsavedChanges && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSaveLayout}
                            disabled={isSaving}
                        >
                            <HugeiconsIcon
                                icon={FloppyDiskIcon}
                                className={cn("w-4 h-4 mr-2", isSaving && "animate-pulse")}
                            />
                            {isSaving ? "Saving..." : "Save Layout"}
                        </Button>
                    )}
                    
                    <Button
                        variant={isEditMode ? "secondary" : "outline"}
                        size="sm"
                        onClick={toggleEditMode}
                    >
                        <HugeiconsIcon icon={Settings02Icon} className="w-4 h-4 mr-2" />
                        {isEditMode ? "Done Editing" : "Customize"}
                    </Button>
                </div>
            </div>

            {/* Edit Mode Banner */}
            {isEditMode && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
                    <p className="text-primary font-medium">
                        Edit Mode Active
                    </p>
                    <p className="text-muted-foreground mt-1">
                        Drag widgets to reorder them. Use the menu on each widget to resize or remove.
                        Click &quot;Save Layout&quot; when you&apos;re done.
                    </p>
                </div>
            )}

            {/* Widget Grid */}
            <ResponsiveWidgetGrid
                widgets={visibleWidgets}
                isEditMode={isEditMode}
                gap={layout.gap}
                rowHeight={layout.rowHeight}
                onWidgetsChange={handleWidgetsChange}
                onWidgetRemove={handleWidgetRemove}
                onWidgetResize={handleWidgetResize}
            />

            {/* Widget Catalog Sheet */}
            <WidgetCatalogSheet
                open={showCatalog}
                onOpenChange={setShowCatalog}
                onAddWidget={(type) => {
                    addWidget(type);
                    setShowCatalog(false);
                }}
                addedWidgetTypes={widgets.map(w => w.type)}
            />
        </div>
    );
}
