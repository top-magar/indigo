"use client";

import { useState, useCallback, useTransition, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebouncedCallback } from "./use-debounce";

/**
 * Options for configuring the useUrlFilters hook
 */
export interface UseUrlFiltersOptions {
  /** Prefix for namespacing URL params (e.g., "orders_" results in "orders_status") */
  prefix?: string;
  /** Debounce delay in milliseconds for search input. Default: 300ms */
  debounceMs?: number;
  /** Whether to reset page to 1 when filters change. Default: true */
  resetPageOnFilter?: boolean;
  /** Default page size. Default: 10 */
  defaultPageSize?: number;
  /** Default sort column */
  defaultSort?: string;
  /** Default sort direction. Default: 'desc' */
  defaultSortDir?: "asc" | "desc";
}

/**
 * Return type for the useUrlFilters hook
 */
export interface UseUrlFiltersReturn {
  /** Current filter values from URL (excluding pagination/sorting) */
  filters: Record<string, string | undefined>;
  /** Search value (local state for debouncing) */
  searchValue: string;
  /** Set search value with debounced URL update */
  setSearchValue: (value: string) => void;
  /** Date range state */
  dateRange: { from?: Date; to?: Date };
  /** Set date range with URL update */
  setDateRange: (range: { from?: Date; to?: Date }) => void;
  /** Update a single filter */
  setFilter: (key: string, value: string | undefined) => void;
  /** Update multiple filters at once */
  setFilters: (updates: Record<string, string | undefined>) => void;
  /** Clear all filters and reset to initial state */
  clearAll: () => void;
  /** Check if any filters are active (excluding pagination) */
  hasActiveFilters: boolean;
  /** Current page number (1-indexed) */
  page: number;
  /** Current page size */
  pageSize: number;
  /** Set page number */
  setPage: (page: number) => void;
  /** Set page size */
  setPageSize: (size: number) => void;
  /** Current sort column */
  sort: string;
  /** Current sort direction */
  sortDir: "asc" | "desc";
  /** Set sort column and optionally direction */
  setSort: (column: string, dir?: "asc" | "desc") => void;
  /** Whether a navigation is pending (from useTransition) */
  isPending: boolean;
  /** Get a specific filter value from URL */
  getFilter: (key: string) => string | undefined;
  /** Get the prefixed param name */
  getParamName: (key: string) => string;
}

// Reserved param keys that are handled specially
const RESERVED_KEYS = ["page", "pageSize", "sort", "sortDir", "search", "from", "to"];

/**
 * A hook for managing URL-based filter state with support for:
 * - Debounced search
 * - Date range filtering
 * - Pagination
 * - Sorting
 * - Automatic page reset on filter changes
 * - Optional param namespacing
 *
 * @example
 * ```tsx
 * const {
 *   filters,
 *   searchValue,
 *   setSearchValue,
 *   setFilter,
 *   page,
 *   setPage,
 *   isPending,
 * } = useUrlFilters({ debounceMs: 300 });
 *
 * // Use in your component
 * <Input
 *   value={searchValue}
 *   onChange={(e) => setSearchValue(e.target.value)}
 * />
 * <Select onValueChange={(v) => setFilter("status", v)} />
 * ```
 */
export function useUrlFilters(options: UseUrlFiltersOptions = {}): UseUrlFiltersReturn {
  const {
    prefix = "",
    debounceMs = 300,
    resetPageOnFilter = true,
    defaultPageSize = 10,
    defaultSort = "",
    defaultSortDir = "desc",
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Helper to get prefixed param name
  const getParamName = useCallback(
    (key: string): string => {
      return prefix ? `${prefix}${key}` : key;
    },
    [prefix]
  );

  // Helper to get param value from URL
  const getParam = useCallback(
    (key: string): string | undefined => {
      const value = searchParams.get(getParamName(key));
      return value || undefined;
    },
    [searchParams, getParamName]
  );

  // Parse current values from URL
  const page = parseInt(getParam("page") || "1", 10);
  const pageSize = parseInt(getParam("pageSize") || String(defaultPageSize), 10);
  const sort = getParam("sort") || defaultSort;
  const sortDir = (getParam("sortDir") as "asc" | "desc") || defaultSortDir;

  // Date range from URL
  const dateRangeFromUrl = useMemo(() => {
    const from = getParam("from");
    const to = getParam("to");
    return {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    };
  }, [getParam]);

  // Local state for search (for debouncing)
  const [searchValue, setSearchValueState] = useState(getParam("search") || "");

  // Local state for date range (for immediate UI feedback)
  const [dateRange, setDateRangeState] = useState<{ from?: Date; to?: Date }>(dateRangeFromUrl);

  // Extract all non-reserved filters from URL
  const filters = useMemo(() => {
    const result: Record<string, string | undefined> = {};
    const prefixLength = prefix.length;

    searchParams.forEach((value, key) => {
      // Check if key matches our prefix (or no prefix)
      const matchesPrefix = prefix ? key.startsWith(prefix) : true;
      if (!matchesPrefix) return;

      // Get the unprefixed key
      const unprefixedKey = prefix ? key.slice(prefixLength) : key;

      // Skip reserved keys
      if (RESERVED_KEYS.includes(unprefixedKey)) return;

      result[unprefixedKey] = value;
    });

    // Also include search in filters for convenience
    const search = getParam("search");
    if (search) {
      result.search = search;
    }

    return result;
  }, [searchParams, prefix, getParam]);

  // Core function to update URL params
  const updateUrl = useCallback(
    (updates: Record<string, string | undefined>, shouldResetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        const paramName = getParamName(key);
        if (value !== undefined && value !== "") {
          params.set(paramName, value);
        } else {
          params.delete(paramName);
        }
      });

      // Reset page when filters change (unless explicitly setting page)
      if (resetPageOnFilter && shouldResetPage && !("page" in updates)) {
        params.delete(getParamName("page"));
      }

      startTransition(() => {
        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
      });
    },
    [pathname, router, searchParams, getParamName, resetPageOnFilter]
  );

  // Debounced search update
  const debouncedSearchUpdate = useDebouncedCallback((value: string) => {
    updateUrl({ search: value || undefined });
  }, debounceMs);

  // Set search value with debouncing
  const setSearchValue = useCallback(
    (value: string) => {
      setSearchValueState(value);
      debouncedSearchUpdate(value);
    },
    [debouncedSearchUpdate]
  );

  // Set date range
  const setDateRange = useCallback(
    (range: { from?: Date; to?: Date }) => {
      setDateRangeState(range);
      updateUrl({
        from: range.from?.toISOString(),
        to: range.to?.toISOString(),
      });
    },
    [updateUrl]
  );

  // Set a single filter
  const setFilter = useCallback(
    (key: string, value: string | undefined) => {
      updateUrl({ [key]: value });
    },
    [updateUrl]
  );

  // Set multiple filters at once
  const setFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      updateUrl(updates);
    },
    [updateUrl]
  );

  // Clear all filters
  const clearAll = useCallback(() => {
    setSearchValueState("");
    setDateRangeState({});

    if (prefix) {
      // Only clear prefixed params
      const params = new URLSearchParams(searchParams.toString());
      const keysToDelete: string[] = [];

      params.forEach((_, key) => {
        if (key.startsWith(prefix)) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach((key) => params.delete(key));

      startTransition(() => {
        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
      });
    } else {
      // Clear all params
      startTransition(() => {
        router.push(pathname);
      });
    }
  }, [pathname, router, searchParams, prefix]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    const hasSearch = !!searchValue;
    const hasDateRange = !!dateRange.from || !!dateRange.to;
    const hasOtherFilters = Object.keys(filters).some(
      (key) => key !== "search" && filters[key] !== undefined
    );
    return hasSearch || hasDateRange || hasOtherFilters;
  }, [searchValue, dateRange, filters]);

  // Pagination helpers
  const setPage = useCallback(
    (newPage: number) => {
      updateUrl({ page: newPage > 1 ? String(newPage) : undefined }, false);
    },
    [updateUrl]
  );

  const setPageSize = useCallback(
    (size: number) => {
      updateUrl({
        pageSize: size !== defaultPageSize ? String(size) : undefined,
        page: undefined, // Reset to page 1 when changing page size
      });
    },
    [updateUrl, defaultPageSize]
  );

  // Sorting helpers
  const setSort = useCallback(
    (column: string, dir?: "asc" | "desc") => {
      const newDir = dir || (sort === column && sortDir === "asc" ? "desc" : "asc");
      updateUrl({
        sort: column || undefined,
        sortDir: column ? newDir : undefined,
      });
    },
    [updateUrl, sort, sortDir]
  );

  // Get a specific filter value
  const getFilter = useCallback(
    (key: string): string | undefined => {
      return filters[key];
    },
    [filters]
  );

  return {
    filters,
    searchValue,
    setSearchValue,
    dateRange,
    setDateRange,
    setFilter,
    setFilters,
    clearAll,
    hasActiveFilters,
    page,
    pageSize,
    setPage,
    setPageSize,
    sort,
    sortDir,
    setSort,
    isPending,
    getFilter,
    getParamName,
  };
}
