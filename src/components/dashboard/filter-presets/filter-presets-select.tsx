"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FilterIcon,
  Add01Icon,
  Delete01Icon,
  PencilEdit01Icon,
  CheckmarkCircle02Icon,
  Bookmark01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { FilterPreset } from "@/shared/hooks/use-filter-presets";

interface FilterPresetsSelectProps {
  /** Available presets */
  presets: FilterPreset[];
  /** Currently active preset */
  activePreset: FilterPreset | null;
  /** Whether current filters have unsaved changes */
  hasUnsavedChanges: boolean;
  /** Callback to apply a preset */
  onApply: (id: string) => void;
  /** Callback to save current filters as preset */
  onSave: (name: string) => void;
  /** Callback to update a preset */
  onUpdate: (id: string) => void;
  /** Callback to delete a preset */
  onDelete: (id: string) => void;
  /** Callback to rename a preset */
  onRename: (id: string, name: string) => void;
  /** Callback to clear filters */
  onClear: () => void;
  /** Default label when no preset is active */
  defaultLabel?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Dropdown for managing saved filter presets
 * Inspired by Saleor's FilterPresetsSelect
 * 
 * @example
 * ```tsx
 * const { filters } = useUrlFilters();
 * const {
 *   presets,
 *   activePreset,
 *   hasUnsavedChanges,
 *   savePreset,
 *   applyPreset,
 *   deletePreset,
 *   renamePreset,
 *   clearFilters,
 *   updatePreset,
 * } = useFilterPresets({ 
 *   pageKey: 'orders',
 *   currentFilters: filters 
 * });
 * 
 * <FilterPresetsSelect
 *   presets={presets}
 *   activePreset={activePreset}
 *   hasUnsavedChanges={hasUnsavedChanges}
 *   onApply={applyPreset}
 *   onSave={savePreset}
 *   onUpdate={(id) => updatePreset(id)}
 *   onDelete={deletePreset}
 *   onRename={renamePreset}
 *   onClear={clearFilters}
 * />
 * ```
 */
export function FilterPresetsSelect({
  presets,
  activePreset,
  hasUnsavedChanges,
  onApply,
  onSave,
  onUpdate,
  onDelete,
  onRename,
  onClear,
  defaultLabel = "All items",
  className,
}: FilterPresetsSelectProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const handleSave = () => {
    if (newName.trim()) {
      onSave(newName.trim());
      setNewName("");
      setSaveDialogOpen(false);
    }
  };

  const handleRename = () => {
    if (selectedPresetId && newName.trim()) {
      onRename(selectedPresetId, newName.trim());
      setNewName("");
      setSelectedPresetId(null);
      setRenameDialogOpen(false);
    }
  };

  const handleDelete = () => {
    if (selectedPresetId) {
      onDelete(selectedPresetId);
      setSelectedPresetId(null);
      setDeleteDialogOpen(false);
    }
  };

  const openRenameDialog = (preset: FilterPreset) => {
    setSelectedPresetId(preset.id);
    setNewName(preset.name);
    setRenameDialogOpen(true);
  };

  const openDeleteDialog = (preset: FilterPreset) => {
    setSelectedPresetId(preset.id);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={cn("gap-2", className)}>
            <HugeiconsIcon icon={FilterIcon} className="w-4 h-4" />
            <span className="max-w-[150px] truncate">
              {activePreset?.name || defaultLabel}
            </span>
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                Modified
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {/* Default option */}
          <DropdownMenuItem onClick={onClear}>
            <span className="flex-1">{defaultLabel}</span>
            {!activePreset && !hasUnsavedChanges && (
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>

          {presets.length > 0 && <DropdownMenuSeparator />}

          {/* Saved presets */}
          {presets.map((preset) => (
            <DropdownMenuItem
              key={preset.id}
              className="group flex items-center justify-between"
            >
              <button
                className="flex-1 text-left"
                onClick={() => onApply(preset.id)}
              >
                <span className="flex items-center gap-2">
                  <HugeiconsIcon icon={Bookmark01Icon} className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="truncate max-w-[120px]">{preset.name}</span>
                </span>
              </button>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    openRenameDialog(preset);
                  }}
                >
                  <HugeiconsIcon icon={PencilEdit01Icon} className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(preset);
                  }}
                >
                  <HugeiconsIcon icon={Delete01Icon} className="w-3 h-3" />
                </Button>
              </div>
              {activePreset?.id === preset.id && !hasUnsavedChanges && (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-primary ml-2" />
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* Save current filters */}
          {hasUnsavedChanges && (
            <DropdownMenuItem onClick={() => setSaveDialogOpen(true)}>
              <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
              Save current filters
            </DropdownMenuItem>
          )}

          {/* Update active preset */}
          {activePreset && hasUnsavedChanges && (
            <DropdownMenuItem onClick={() => onUpdate(activePreset.id)}>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 mr-2" />
              Update "{activePreset.name}"
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Preset name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!newName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="New name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Preset</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this filter preset? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

FilterPresetsSelect.displayName = "FilterPresetsSelect";
