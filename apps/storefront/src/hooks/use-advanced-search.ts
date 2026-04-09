"use client";

import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useDebouncedCallback } from "./use-debounce";
import type {
  SearchState,
  SearchStore,
  SearchFilter,
  RecentSearch,
  SearchSuggestion,
  GroupedSearchResults,
} from "@/components/dashboard/advanced-search/types";

// Constants
const MAX_RECENT_SEARCHES = 10;
const SEARCH_DEBOUNCE_MS = 300;

// Default filter state
const defaultFilters: SearchFilter = {
  entityTypes: ["orders", "products", "customers"],
  status: "all",
  dateRangePreset: "last30days",
  customDateRange: { from: undefined, to: undefined },
};

// Initial state
const initialState: SearchState = {
  query: "",
  isExpanded: false,
  isLoading: false,
  filters: defaultFilters,
  recentSearches: [],
  suggestions: [],
  results: [],
  selectedIndex: -1,
};

/**
 * Zustand store for advanced search state management
 * Persists recent searches to localStorage
 */
export const useAdvancedSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Query management
      setQuery: (query: string) => {
        set({ query, selectedIndex: -1 });
      },

      // Expanded state
      setExpanded: (isExpanded: boolean) => {
        set({ isExpanded });
        if (!isExpanded) {
          set({ selectedIndex: -1 });
        }
      },

      // Loading state
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      // Filter management
      setFilters: (filters: Partial<SearchFilter>) => {
        const { filters: currentFilters } = get();
        set({
          filters: { ...currentFilters, ...filters },
          selectedIndex: -1,
        });
      },

      resetFilters: () => {
        set({ filters: defaultFilters, selectedIndex: -1 });
      },

      // Recent searches management
      addRecentSearch: (search: Omit<RecentSearch, "id" | "timestamp">) => {
        const { recentSearches } = get();
        const newSearch: RecentSearch = {
          ...search,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };

        // Remove duplicates with same query
        const filtered = recentSearches.filter(
          (s) => s.query.toLowerCase() !== search.query.toLowerCase()
        );

        // Add new search at the beginning and limit to max
        const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        set({ recentSearches: updated });
      },

      removeRecentSearch: (id: string) => {
        const { recentSearches } = get();
        set({
          recentSearches: recentSearches.filter((s) => s.id !== id),
        });
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },

      // Suggestions management
      setSuggestions: (suggestions: SearchSuggestion[]) => {
        set({ suggestions });
      },

      // Results management
      setResults: (results: GroupedSearchResults[]) => {
        set({ results, isLoading: false });
      },

      // Keyboard navigation
      setSelectedIndex: (selectedIndex: number) => {
        set({ selectedIndex });
      },

      moveSelectionUp: () => {
        const { selectedIndex, suggestions, results, recentSearches, query } = get();
        
        // Calculate total selectable items
        let totalItems = 0;
        if (!query && recentSearches.length > 0) {
          totalItems = recentSearches.length;
        } else if (query) {
          totalItems = suggestions.length + results.reduce((acc, g) => acc + g.results.length, 0);
        }

        if (totalItems === 0) return;

        const newIndex = selectedIndex <= 0 ? totalItems - 1 : selectedIndex - 1;
        set({ selectedIndex: newIndex });
      },

      moveSelectionDown: () => {
        const { selectedIndex, suggestions, results, recentSearches, query } = get();
        
        // Calculate total selectable items
        let totalItems = 0;
        if (!query && recentSearches.length > 0) {
          totalItems = recentSearches.length;
        } else if (query) {
          totalItems = suggestions.length + results.reduce((acc, g) => acc + g.results.length, 0);
        }

        if (totalItems === 0) return;

        const newIndex = selectedIndex >= totalItems - 1 ? 0 : selectedIndex + 1;
        set({ selectedIndex: newIndex });
      },

      // Execute search
      executeSearch: () => {
        const { query, filters, addRecentSearch } = get();
        if (query.trim()) {
          addRecentSearch({ query: query.trim(), filters });
        }
      },

      // Clear search
      clearSearch: () => {
        set({
          query: "",
          results: [],
          suggestions: [],
          selectedIndex: -1,
          isLoading: false,
        });
      },
    }),
    {
      name: "advanced-search-storage",
      // Only persist recent searches
      partialize: (state) => ({
        recentSearches: state.recentSearches,
      }),
    }
  )
);

// Mock suggestions generator (replace with actual API call)
function generateSuggestions(query: string): SearchSuggestion[] {
  if (!query.trim()) return [];

  const suggestions: SearchSuggestion[] = [];
  const lowerQuery = query.toLowerCase();

  // Order suggestions
  if ("order".includes(lowerQuery) || lowerQuery.includes("order")) {
    suggestions.push(
      { id: "sug-1", text: `Orders containing "${query}"`, entityType: "orders", description: "Search in orders" },
      { id: "sug-2", text: `Order #${query}`, entityType: "orders", description: "Find by order number" }
    );
  }

  // Product suggestions
  if ("product".includes(lowerQuery) || lowerQuery.includes("product")) {
    suggestions.push(
      { id: "sug-3", text: `Products matching "${query}"`, entityType: "products", description: "Search products" }
    );
  }

  // Customer suggestions
  if ("customer".includes(lowerQuery) || lowerQuery.includes("customer") || query.includes("@")) {
    suggestions.push(
      { id: "sug-4", text: `Customers matching "${query}"`, entityType: "customers", description: "Search customers" }
    );
  }

  // Generic suggestions if no specific matches
  if (suggestions.length === 0) {
    suggestions.push(
      { id: "sug-5", text: `Search all for "${query}"`, entityType: "orders", description: "Search everywhere" }
    );
  }

  return suggestions.slice(0, 5);
}

// Mock results generator (replace with actual API call)
function generateMockResults(query: string, filters: SearchFilter): GroupedSearchResults[] {
  if (!query.trim()) return [];

  const results: GroupedSearchResults[] = [];

  // Generate mock order results
  if (filters.entityTypes.includes("orders")) {
    results.push({
      entityType: "orders",
      results: [
        { id: "ord-1", title: `Order #${Math.floor(Math.random() * 10000)}`, subtitle: "John Doe - $125.00", entityType: "orders", href: "/dashboard/orders/1", highlight: query },
        { id: "ord-2", title: `Order #${Math.floor(Math.random() * 10000)}`, subtitle: "Jane Smith - $89.50", entityType: "orders", href: "/dashboard/orders/2", highlight: query },
      ],
      totalCount: 15,
    });
  }

  // Generate mock product results
  if (filters.entityTypes.includes("products")) {
    results.push({
      entityType: "products",
      results: [
        { id: "prod-1", title: "Premium Widget", subtitle: "SKU: WDG-001 - $29.99", entityType: "products", href: "/dashboard/products/1", highlight: query },
        { id: "prod-2", title: "Deluxe Gadget", subtitle: "SKU: GDG-002 - $49.99", entityType: "products", href: "/dashboard/products/2", highlight: query },
      ],
      totalCount: 8,
    });
  }

  // Generate mock customer results
  if (filters.entityTypes.includes("customers")) {
    results.push({
      entityType: "customers",
      results: [
        { id: "cust-1", title: "John Doe", subtitle: "john@example.com - 5 orders", entityType: "customers", href: "/dashboard/customers/1", highlight: query },
        { id: "cust-2", title: "Jane Smith", subtitle: "jane@example.com - 3 orders", entityType: "customers", href: "/dashboard/customers/2", highlight: query },
      ],
      totalCount: 12,
    });
  }

  return results;
}

/**
 * Hook for using the advanced search functionality
 * Handles debounced search, keyboard shortcuts, and state management
 */
export function useAdvancedSearch() {
  // Get store state and actions
  const query = useAdvancedSearchStore((s) => s.query);
  const isExpanded = useAdvancedSearchStore((s) => s.isExpanded);
  const isLoading = useAdvancedSearchStore((s) => s.isLoading);
  const filters = useAdvancedSearchStore((s) => s.filters);
  const recentSearches = useAdvancedSearchStore((s) => s.recentSearches);
  const suggestions = useAdvancedSearchStore((s) => s.suggestions);
  const results = useAdvancedSearchStore((s) => s.results);
  const selectedIndex = useAdvancedSearchStore((s) => s.selectedIndex);

  const setQuery = useAdvancedSearchStore((s) => s.setQuery);
  const setExpanded = useAdvancedSearchStore((s) => s.setExpanded);
  const setLoading = useAdvancedSearchStore((s) => s.setLoading);
  const setFilters = useAdvancedSearchStore((s) => s.setFilters);
  const resetFilters = useAdvancedSearchStore((s) => s.resetFilters);
  const addRecentSearch = useAdvancedSearchStore((s) => s.addRecentSearch);
  const removeRecentSearch = useAdvancedSearchStore((s) => s.removeRecentSearch);
  const clearRecentSearches = useAdvancedSearchStore((s) => s.clearRecentSearches);
  const setSuggestions = useAdvancedSearchStore((s) => s.setSuggestions);
  const setResults = useAdvancedSearchStore((s) => s.setResults);
  const setSelectedIndex = useAdvancedSearchStore((s) => s.setSelectedIndex);
  const moveSelectionUp = useAdvancedSearchStore((s) => s.moveSelectionUp);
  const moveSelectionDown = useAdvancedSearchStore((s) => s.moveSelectionDown);
  const executeSearch = useAdvancedSearchStore((s) => s.executeSearch);
  const clearSearch = useAdvancedSearchStore((s) => s.clearSearch);

  // Debounced search function
  const debouncedSearch = useDebouncedCallback(
    (searchQuery: string, searchFilters: SearchFilter) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setSuggestions([]);
        setLoading(false);
        return;
      }

      // Generate suggestions
      const newSuggestions = generateSuggestions(searchQuery);
      setSuggestions(newSuggestions);

      // Generate mock results (replace with actual API call)
      const newResults = generateMockResults(searchQuery, searchFilters);
      setResults(newResults);
    },
    SEARCH_DEBOUNCE_MS
  );

  // Trigger search when query or filters change
  useEffect(() => {
    if (query.trim()) {
      setLoading(true);
      debouncedSearch(query, filters);
    } else {
      setResults([]);
      setSuggestions([]);
    }
  }, [query, filters, debouncedSearch, setLoading, setResults, setSuggestions]);

  // Handle keyboard shortcut "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" to focus search (when not in an input)
      if (
        e.key === "/" &&
        !isExpanded &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setExpanded(true);
      }

      // Escape to close
      if (e.key === "Escape" && isExpanded) {
        e.preventDefault();
        setExpanded(false);
        clearSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, setExpanded, clearSearch]);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.entityTypes.length < 3) count++;
    if (filters.status !== "all") count++;
    if (filters.dateRangePreset !== "last30days") count++;
    return count;
  }, [filters]);

  // Check if any filters are active
  const hasActiveFilters = activeFiltersCount > 0;

  return {
    // State
    query,
    isExpanded,
    isLoading,
    filters,
    recentSearches,
    suggestions,
    results,
    selectedIndex,
    activeFiltersCount,
    hasActiveFilters,

    // Actions
    setQuery,
    setExpanded,
    setFilters,
    resetFilters,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    setSelectedIndex,
    moveSelectionUp,
    moveSelectionDown,
    executeSearch,
    clearSearch,
  };
}

export type UseAdvancedSearchReturn = ReturnType<typeof useAdvancedSearch>;
