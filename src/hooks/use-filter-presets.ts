"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, string>;
  createdAt: Date;
}

interface UseFilterPresetsOptions {
  /** Storage key for localStorage */
  storageKey: string;
  /** Base URL path for navigation */
  basePath?: string;
}

interface UseFilterPresetsReturn {
  /** All saved presets */
  presets: FilterPreset[];
  /** Currently active preset ID (if any) */
  activePresetId: string | null;
  /** Currently active preset */
  activePreset: FilterPreset | null;
  /** Save current filters as a new preset */
  savePreset: (name: string) => void;
  /** Update an existing preset with current filters */
  updatePreset: (id: string) => void;
  /** Delete a preset */
  deletePreset: (id: string) => void;
  /** Apply a preset (navigate to its filters) */
  applyPreset: (id: string) => void;
  /** Rename a preset */
  renamePreset: (id: string, newName: string) => void;
  /** Clear active preset and filters */
  clearFilters: () => void;
  /** Check if current filters match a preset */
  hasUnsavedChanges: boolean;
  /** Get unique name for new preset */
  getUniqueName: (baseName: string) => string;
}

/**
 * Hook for managing saved filter presets with URL persistence
 * Inspired by Saleor's useFilterPresets pattern
 * 
 * @example
 * ```tsx
 * const {
 *   presets,
 *   activePreset,
 *   savePreset,
 *   applyPreset,
 *   deletePreset,
 *   hasUnsavedChanges,
 * } = useFilterPresets({ storageKey: 'orders-filters' });
 * 
 * return (
 *   <div>
 *     <Select onValueChange={applyPreset}>
 *       <SelectTrigger>
 *         <SelectValue placeholder={activePreset?.name || "All Orders"} />
 *       </SelectTrigger>
 *       <SelectContent>
 *         <SelectItem value="all">All Orders</SelectItem>
 *         {presets.map(preset => (
 *           <SelectItem key={preset.id} value={preset.id}>
 *             {preset.name}
 *           </SelectItem>
 *         ))}
 *       </SelectContent>
 *     </Select>
 *     
 *     {hasUnsavedChanges && (
 *       <Button onClick={() => savePreset("My Filter")}>
 *         Save Filter
 *       </Button>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useFilterPresets(
  options: UseFilterPresetsOptions
): UseFilterPresetsReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = options.basePath || pathname;

  // Load presets from localStorage
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(options.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((p: FilterPreset) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        }));
      }
    } catch {
      console.warn("Failed to load filter presets from localStorage");
    }
    return [];
  });

  // Persist presets to localStorage
  const persistPresets = useCallback(
    (newPresets: FilterPreset[]) => {
      setPresets(newPresets);
      if (typeof window !== "undefined") {
        localStorage.setItem(options.storageKey, JSON.stringify(newPresets));
      }
    },
    [options.storageKey]
  );

  // Get current filters from URL
  const currentFilters = useMemo(() => {
    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      // Exclude pagination and internal params
      if (!["page", "pageSize", "preset"].includes(key)) {
        filters[key] = value;
      }
    });
    return filters;
  }, [searchParams]);

  // Active preset from URL
  const activePresetId = searchParams.get("preset");
  const activePreset = useMemo(
    () => presets.find((p) => p.id === activePresetId) || null,
    [presets, activePresetId]
  );

  // Check if current filters differ from active preset
  const hasUnsavedChanges = useMemo(() => {
    if (!activePreset) {
      return Object.keys(currentFilters).length > 0;
    }
    const presetFilters = activePreset.filters;
    const currentKeys = Object.keys(currentFilters);
    const presetKeys = Object.keys(presetFilters);

    if (currentKeys.length !== presetKeys.length) return true;

    return currentKeys.some(
      (key) => currentFilters[key] !== presetFilters[key]
    );
  }, [activePreset, currentFilters]);

  // Generate unique preset name
  const getUniqueName = useCallback(
    (baseName: string) => {
      const existingNames = presets.map((p) => p.name);
      if (!existingNames.includes(baseName)) return baseName;

      let counter = 1;
      let newName = `${baseName} (${counter})`;
      while (existingNames.includes(newName)) {
        counter++;
        newName = `${baseName} (${counter})`;
      }
      return newName;
    },
    [presets]
  );

  // Save current filters as new preset
  const savePreset = useCallback(
    (name: string) => {
      const uniqueName = getUniqueName(name);
      const newPreset: FilterPreset = {
        id: crypto.randomUUID(),
        name: uniqueName,
        filters: currentFilters,
        createdAt: new Date(),
      };

      const newPresets = [...presets, newPreset];
      persistPresets(newPresets);

      // Update URL with preset ID
      const params = new URLSearchParams(searchParams.toString());
      params.set("preset", newPreset.id);
      router.push(`${basePath}?${params.toString()}`);
    },
    [
      getUniqueName,
      currentFilters,
      presets,
      persistPresets,
      searchParams,
      router,
      basePath,
    ]
  );

  // Update existing preset with current filters
  const updatePreset = useCallback(
    (id: string) => {
      const newPresets = presets.map((p) =>
        p.id === id ? { ...p, filters: currentFilters } : p
      );
      persistPresets(newPresets);
    },
    [presets, currentFilters, persistPresets]
  );

  // Delete a preset
  const deletePreset = useCallback(
    (id: string) => {
      const newPresets = presets.filter((p) => p.id !== id);
      persistPresets(newPresets);

      // If deleting active preset, clear the preset param
      if (activePresetId === id) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("preset");
        router.push(`${basePath}?${params.toString()}`);
      }
    },
    [presets, persistPresets, activePresetId, searchParams, router, basePath]
  );

  // Apply a preset
  const applyPreset = useCallback(
    (id: string) => {
      const preset = presets.find((p) => p.id === id);
      if (!preset) return;

      const params = new URLSearchParams();
      Object.entries(preset.filters).forEach(([key, value]) => {
        params.set(key, value);
      });
      params.set("preset", id);

      router.push(`${basePath}?${params.toString()}`);
    },
    [presets, router, basePath]
  );

  // Rename a preset
  const renamePreset = useCallback(
    (id: string, newName: string) => {
      const uniqueName = getUniqueName(newName);
      const newPresets = presets.map((p) =>
        p.id === id ? { ...p, name: uniqueName } : p
      );
      persistPresets(newPresets);
    },
    [presets, getUniqueName, persistPresets]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.push(basePath);
  }, [router, basePath]);

  return {
    presets,
    activePresetId,
    activePreset,
    savePreset,
    updatePreset,
    deletePreset,
    applyPreset,
    renamePreset,
    clearFilters,
    hasUnsavedChanges,
    getUniqueName,
  };
}

export type { FilterPreset, UseFilterPresetsReturn, UseFilterPresetsOptions };
