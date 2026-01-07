/**
 * Types for the Advanced Search component
 */

/** Entity types that can be searched */
export type SearchEntityType = "orders" | "products" | "customers";

/** Status options for filtering */
export type SearchStatus =
  | "all"
  | "active"
  | "pending"
  | "completed"
  | "cancelled"
  | "draft"
  | "published";

/** Date range preset options */
export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "last90days"
  | "thisMonth"
  | "lastMonth"
  | "custom";

/** Custom date range */
export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

/** Search filter configuration */
export interface SearchFilter {
  /** Entity types to include in search */
  entityTypes: SearchEntityType[];
  /** Status filter */
  status: SearchStatus;
  /** Date range preset */
  dateRangePreset: DateRangePreset;
  /** Custom date range (when preset is "custom") */
  customDateRange: DateRange;
}

/** Recent search entry */
export interface RecentSearch {
  /** Unique identifier */
  id: string;
  /** Search query text */
  query: string;
  /** Timestamp when search was performed */
  timestamp: number;
  /** Filters applied during search */
  filters?: Partial<SearchFilter>;
  /** Number of results found */
  resultCount?: number;
}

/** Search suggestion */
export interface SearchSuggestion {
  /** Unique identifier */
  id: string;
  /** Suggestion text */
  text: string;
  /** Entity type this suggestion relates to */
  entityType: SearchEntityType;
  /** Optional description */
  description?: string;
  /** Keywords for matching */
  keywords?: string[];
}

/** Individual search result */
export interface SearchResult {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Entity type */
  entityType: SearchEntityType;
  /** URL to navigate to */
  href: string;
  /** Optional metadata */
  metadata?: Record<string, string | number>;
  /** Highlight matched text */
  highlight?: string;
}

/** Grouped search results */
export interface GroupedSearchResults {
  /** Entity type */
  entityType: SearchEntityType;
  /** Results in this group */
  results: SearchResult[];
  /** Total count (may be more than results.length) */
  totalCount: number;
}

/** Search state */
export interface SearchState {
  /** Current search query */
  query: string;
  /** Whether search is expanded/focused */
  isExpanded: boolean;
  /** Whether search is loading */
  isLoading: boolean;
  /** Current filters */
  filters: SearchFilter;
  /** Recent searches */
  recentSearches: RecentSearch[];
  /** Current suggestions */
  suggestions: SearchSuggestion[];
  /** Current results */
  results: GroupedSearchResults[];
  /** Selected index for keyboard navigation */
  selectedIndex: number;
}

/** Search actions */
export interface SearchActions {
  /** Set search query */
  setQuery: (query: string) => void;
  /** Set expanded state */
  setExpanded: (expanded: boolean) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Update filters */
  setFilters: (filters: Partial<SearchFilter>) => void;
  /** Reset filters to defaults */
  resetFilters: () => void;
  /** Add a recent search */
  addRecentSearch: (search: Omit<RecentSearch, "id" | "timestamp">) => void;
  /** Remove a recent search */
  removeRecentSearch: (id: string) => void;
  /** Clear all recent searches */
  clearRecentSearches: () => void;
  /** Set suggestions */
  setSuggestions: (suggestions: SearchSuggestion[]) => void;
  /** Set results */
  setResults: (results: GroupedSearchResults[]) => void;
  /** Set selected index */
  setSelectedIndex: (index: number) => void;
  /** Move selection up */
  moveSelectionUp: () => void;
  /** Move selection down */
  moveSelectionDown: () => void;
  /** Execute search */
  executeSearch: () => void;
  /** Clear search */
  clearSearch: () => void;
}

/** Complete search store type */
export type SearchStore = SearchState & SearchActions;

/** Props for the AdvancedSearch component */
export interface AdvancedSearchProps {
  /** Placeholder text */
  placeholder?: string;
  /** Callback when search is executed */
  onSearch?: (query: string, filters: SearchFilter) => void;
  /** Callback when a result is selected */
  onResultSelect?: (result: SearchResult) => void;
  /** Callback when a suggestion is selected */
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  /** Custom className */
  className?: string;
  /** Whether to show filter chips */
  showFilters?: boolean;
  /** Whether to show recent searches */
  showRecent?: boolean;
  /** Whether to show suggestions */
  showSuggestions?: boolean;
  /** Maximum recent searches to display */
  maxRecentSearches?: number;
}

/** Props for SearchFilters component */
export interface SearchFiltersProps {
  /** Current filters */
  filters: SearchFilter;
  /** Callback when filters change */
  onFiltersChange: (filters: Partial<SearchFilter>) => void;
  /** Callback to reset filters */
  onReset: () => void;
  /** Custom className */
  className?: string;
}

/** Props for SearchResultsPreview component */
export interface SearchResultsPreviewProps {
  /** Grouped results */
  results: GroupedSearchResults[];
  /** Whether results are loading */
  isLoading: boolean;
  /** Search query for highlighting */
  query: string;
  /** Callback when a result is selected */
  onResultSelect: (result: SearchResult) => void;
  /** Callback to view all results for a type */
  onViewAll: (entityType: SearchEntityType) => void;
  /** Selected index for keyboard navigation */
  selectedIndex: number;
  /** Custom className */
  className?: string;
}
