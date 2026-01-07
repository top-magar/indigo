"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * Represents a saved filter preset
 */
export interface FilterPreset {
  /** Unique identifier for the preset */
  id: string;
  /** User-defined name for the preset */
  name: string;
  /** Filter key-value pairs */
  filters: Record<string, string | undefined>;
  /** When the preset was created */
  createdAt: Date;
}

/**
 * Options for configuring the useFilterPresets hook
 */
export interface UseFilterPresetsOptions {
  /** 
   * Page key for namespacing presets in localStorage 
   * e.g., "orders" results in "orders-presets" storage key
   */
  pageKey: string;
  /** 
   * Current filter values to compare against presets
   * Used to detect unsaved changes and for saving new presets
   */
  currentFilters?: Record<string, string | undefined>;
  /** 
   * @deprecated Use pageKey instead. Storage key for localStorage 
   */
  storageKey?: string;
  /** Base URL path for navigation */
  basePath?: string;
}

/**
 * Return type for the useFilterPresets hook
 */
export interface UseFilterPresetsReturn {
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
  /** Apply a preset (navigate to its filters) - alias for loadPreset */
  applyPreset: (id: string) => void;
  /** Load a preset (navigate to its filters) */
  loadPreset: (id: string) => void;
  /** Get all presets */
  getPresets: () => FilterPreset[];
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
 * // Basic usage with pageKey
 * const {
 *   presets,
 *   activePreset,
 *   savePreset,
 *   applyPreset,
 *   deletePreset,
 *   hasUnsavedChanges,
 * } = useFilterPresets({ 
 *   pageKey: 'orders',
 *   currentFilters: { status: 'pending', payment: 'unpaid' }
 * });
 * 
 * // With useUrlFilters integration
 * const { filters } = useUrlFilters();
 * const { presets, savePreset, applyPreset, activePresetId } = useFilterPresets({
 *   pageKey: "orders",
 *   currentFilters: filters
 * });
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
  
  // Derive storage key from pageKey or use legacy storageKey
  const storageKey = options.storageKey || `${options.pageKey}-presets`;

  // Load presets from localStorage
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(storageKey);
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

  // Re-load presets when storage key changes (e.g., navigating between pages)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPresets(parsed.map((p: FilterPreset) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        })));
      } else {
        setPresets([]);
      }
    } catch {
      console.warn("Failed to load filter presets from localStorage");
      setPresets([]);
    }
  }, [storageKey]);

  // Persist presets to localStorage
  const persistPresets = useCallback(
    (newPresets: FilterPreset[]) => {
      setPresets(newPresets);
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, JSON.stringify(newPresets));
      }
    },
    [storageKey]
  );

  // Get current filters - prefer passed in currentFilters, fallback to URL
  const currentFilters = useMemo(() => {
    // If currentFilters is provided, use it (allows integration with useUrlFilters)
    if (options.currentFilters) {
      // Filter out undefined values and pagination params
      const filters: Record<string, string | undefined> = {};
      Object.entries(options.currentFilters).forEach(([key, value]) => {
        if (!["page", "pageSize", "preset"].includes(key) && value !== undefined) {
          filters[key] = value;
        }
      });
      return filters;
    }
    
    // Fallback: read from URL search params
    const filters: Record<string, string | undefined> = {};
    searchParams.forEach((value, key) => {
      // Exclude pagination and internal params
      if (!["page", "pageSize", "preset"].includes(key)) {
        filters[key] = value;
      }
    });
    return filters;
  }, [options.currentFilters, searchParams]);

  // Active preset from URL
  const activePresetId = searchParams.get("preset");
  const activePreset = useMemo(
    () => presets.find((p) => p.id === activePresetId) || null,
    [presets, activePresetId]
  );

  // Check if current filters differ from active preset
  const hasUnsavedChanges = useMemo(() => {
    // Filter out undefined values for comparison
    const cleanCurrentFilters = Object.fromEntries(
      Object.entries(currentFilters).filter(([, v]) => v !== undefined)
    );
    
    if (!activePreset) {
      return Object.keys(cleanCurrentFilters).length > 0;
    }
    const presetFilters = activePreset.filters;
    const cleanPresetFilters = Object.fromEntries(
      Object.entries(presetFilters).filter(([, v]) => v !== undefined)
    );
    
    const currentKeys = Object.keys(cleanCurrentFilters);
    const presetKeys = Object.keys(cleanPresetFilters);

    if (currentKeys.length !== presetKeys.length) return true;

    return currentKeys.some(
      (key) => cleanCurrentFilters[key] !== cleanPresetFilters[key]
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
      // Filter out undefined values when saving
      const filtersToSave = Object.fromEntries(
        Object.entries(currentFilters).filter(([, v]) => v !== undefined)
      ) as Record<string, string | undefined>;
      
      const newPreset: FilterPreset = {
        id: crypto.randomUUID(),
        name: uniqueName,
        filters: filtersToSave,
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
        if (value !== undefined) {
          params.set(key, value);
        }
      });
      params.set("preset", id);

      router.push(`${basePath}?${params.toString()}`);
    },
    [presets, router, basePath]
  );

  // Alias for applyPreset (matches requested API)
  const loadPreset = applyPreset;

  // Get all presets (matches requested API)
  const getPresets = useCallback(() => presets, [presets]);

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
    loadPreset,
    getPresets,
    renamePreset,
    clearFilters,
    hasUnsavedChanges,
    getUniqueName,
  };
}
