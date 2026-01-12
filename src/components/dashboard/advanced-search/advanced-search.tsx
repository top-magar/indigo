"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, ArrowRight, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { cn } from "@/shared/utils";
import { useAdvancedSearch } from "@/shared/hooks/use-advanced-search";
import { SearchFilters, SearchFilterChips } from "./search-filters";
import { SearchResultsPreview } from "./search-results-preview";
import type {
  AdvancedSearchProps,
  SearchResult,
  SearchSuggestion,
  RecentSearch,
} from "./types";

export function AdvancedSearch({
  placeholder = "Search orders, products, customers...",
  onSearch,
  onResultSelect,
  onSuggestionSelect,
  className,
  showFilters = true,
  showRecent = true,
  showSuggestions = true,
  maxRecentSearches = 5,
}: AdvancedSearchProps) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const {
    query,
    isExpanded,
    isLoading,
    filters,
    recentSearches,
    suggestions,
    results,
    selectedIndex,
    hasActiveFilters,
    setQuery,
    setExpanded,
    setFilters,
    resetFilters,
    removeRecentSearch,
    clearRecentSearches,
    setSelectedIndex,
    moveSelectionUp,
    moveSelectionDown,
    executeSearch,
    clearSearch,
  } = useAdvancedSearch();

  // Focus input when expanded
  React.useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveSelectionDown();
        break;
      case "ArrowUp":
        e.preventDefault();
        moveSelectionUp();
        break;
      case "Enter":
        e.preventDefault();
        handleEnterKey();
        break;
      case "Escape":
        e.preventDefault();
        handleClose();
        break;
    }
  };

  // Handle enter key press
  const handleEnterKey = () => {
    if (selectedIndex >= 0) {
      // Select the highlighted item
      const allItems = getSelectableItems();
      const selectedItem = allItems[selectedIndex];
      if (selectedItem) {
        handleItemSelect(selectedItem);
      }
    } else if (query.trim()) {
      // Execute search
      executeSearch();
      onSearch?.(query, filters);
    }
  };

  // Get all selectable items for keyboard navigation
  const getSelectableItems = (): (SearchResult | SearchSuggestion | RecentSearch)[] => {
    if (!query && showRecent && recentSearches.length > 0) {
      return recentSearches.slice(0, maxRecentSearches);
    }
    
    const items: (SearchResult | SearchSuggestion | RecentSearch)[] = [];
    
    if (showSuggestions) {
      items.push(...suggestions);
    }
    
    results.forEach((group) => {
      items.push(...group.results);
    });
    
    return items;
  };

  // Handle item selection
  const handleItemSelect = (item: SearchResult | SearchSuggestion | RecentSearch) => {
    if ("href" in item) {
      // SearchResult
      onResultSelect?.(item);
      router.push(item.href);
      handleClose();
    } else if ("entityType" in item && "text" in item) {
      // SearchSuggestion
      setQuery(item.text);
      onSuggestionSelect?.(item);
    } else if ("timestamp" in item) {
      // RecentSearch
      setQuery(item.query);
      if (item.filters) {
        setFilters(item.filters);
      }
    }
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    onResultSelect?.(result);
    router.push(result.href);
    handleClose();
  };

  // Handle view all for entity type
  const handleViewAll = (entityType: string) => {
    executeSearch();
    router.push(`/dashboard/${entityType}?search=${encodeURIComponent(query)}`);
    handleClose();
  };

  // Handle close
  const handleClose = () => {
    setExpanded(false);
    clearSearch();
    inputRef.current?.blur();
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setExpanded(true);
  };

  // Handle clear input
  const handleClearInput = () => {
    setQuery("");
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Recent searches to display
  const displayedRecentSearches = recentSearches.slice(0, maxRecentSearches);

  // Should show dropdown
  const shouldShowDropdown = isExpanded && (
    Boolean(query.trim()) ||
    (showRecent && displayedRecentSearches.length > 0)
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Popover open={shouldShowDropdown} onOpenChange={setExpanded}>
        <PopoverAnchor asChild>
          <div className="relative flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search
                  className="size-4 text-muted-foreground"
                />
              </div>
              <Input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={cn(
                  "pl-9 pr-20 h-9 text-sm",
                  isExpanded && "ring-2 ring-ring/30 border-ring"
                )}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearInput}
                    className="h-6 w-6 p-0"
                  >
                    <X className="size-3.5" />
                    <span className="sr-only">Clear search</span>
                  </Button>
                )}
                {!isExpanded && (
                  <Kbd className="text-[0.625rem] px-1.5">/</Kbd>
                )}
              </div>
            </div>

            {/* Filters Button */}
            {showFilters && (
              <SearchFilters
                filters={filters}
                onFiltersChange={setFilters}
                onReset={resetFilters}
              />
            )}
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-[var(--radix-popover-trigger-width)] min-w-[400px] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-[400px] overflow-y-auto">
            {/* Filter Chips */}
            {hasActiveFilters && (
              <div className="p-2 border-b">
                <SearchFilterChips
                  filters={filters}
                  onFiltersChange={setFilters}
                  onReset={resetFilters}
                />
              </div>
            )}

            {/* Recent Searches (when no query) */}
            {!query && showRecent && displayedRecentSearches.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-2 py-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Clock
                      className="size-3.5 text-muted-foreground"
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      Recent searches
                    </span>
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-0.5">
                  {displayedRecentSearches.map((search, index) => (
                    <div
                      key={search.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md group",
                        "hover:bg-muted/50 cursor-pointer",
                        selectedIndex === index && "bg-muted"
                      )}
                      onClick={() => handleItemSelect(search)}
                    >
                      <Clock
                        className="size-4 text-muted-foreground"
                      />
                      <span className="flex-1 text-sm truncate">
                        {search.query}
                      </span>
                      {search.resultCount !== undefined && (
                        <Badge variant="secondary" className="h-5 text-[0.625rem]">
                          {search.resultCount} results
                        </Badge>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(search.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity"
                      >
                        <Trash2
                          className="size-3.5 text-muted-foreground"
                        />
                        <span className="sr-only">Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {query && showSuggestions && suggestions.length > 0 && (
              <div className="p-2 border-b">
                <div className="px-2 py-1 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Suggestions
                  </span>
                </div>
                <div className="space-y-0.5">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleItemSelect(suggestion)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded-md text-left",
                        "hover:bg-muted/50 transition-colors",
                        selectedIndex === index && "bg-muted"
                      )}
                    >
                      <Search
                        className="size-4 text-muted-foreground"
                      />
                      <span className="flex-1 text-sm">{suggestion.text}</span>
                      {suggestion.description && (
                        <span className="text-xs text-muted-foreground">
                          {suggestion.description}
                        </span>
                      )}
                      <ArrowRight
                        className="size-4 text-muted-foreground"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results Preview */}
            {query && (
              <SearchResultsPreview
                results={results}
                isLoading={isLoading}
                query={query}
                onResultSelect={handleResultSelect}
                onViewAll={handleViewAll}
                selectedIndex={selectedIndex - suggestions.length}
              />
            )}
          </div>

          {/* Footer with keyboard hints */}
          <div className="border-t px-3 py-2 flex items-center justify-between text-[0.625rem] text-muted-foreground bg-muted/30">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <Kbd>↵</Kbd>
                <span>Select</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Kbd>Esc</Kbd>
              <span>Close</span>
            </span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
