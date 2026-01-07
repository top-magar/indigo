import type { Meta, StoryObj } from "@storybook/nextjs";
import * as React from "react";
import { AdvancedSearch } from "./advanced-search";
import { SearchFilters, SearchFilterChips } from "./search-filters";
import { SearchResultsPreview } from "./search-results-preview";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import type { SearchFilter, GroupedSearchResults } from "./types";

const defaultFilters: SearchFilter = {
  entityTypes: ["orders", "products", "customers"],
  status: "all",
  dateRangePreset: "last30days",
  customDateRange: { from: undefined, to: undefined },
};

const mockResults: GroupedSearchResults[] = [
  {
    entityType: "orders",
    results: [
      {
        id: "ord-1",
        title: "Order #12345",
        subtitle: "John Doe - $125.00",
        entityType: "orders",
        href: "/dashboard/orders/12345",
      },
      {
        id: "ord-2",
        title: "Order #12346",
        subtitle: "Jane Smith - $89.50",
        entityType: "orders",
        href: "/dashboard/orders/12346",
      },
    ],
    totalCount: 15,
  },
  {
    entityType: "products",
    results: [
      {
        id: "prod-1",
        title: "Premium Widget",
        subtitle: "SKU: WDG-001 - $29.99",
        entityType: "products",
        href: "/dashboard/products/1",
      },
    ],
    totalCount: 8,
  },
  {
    entityType: "customers",
    results: [
      {
        id: "cust-1",
        title: "John Doe",
        subtitle: "john@example.com - 5 orders",
        entityType: "customers",
        href: "/dashboard/customers/1",
      },
    ],
    totalCount: 3,
  },
];

const meta: Meta<typeof AdvancedSearch> = {
  title: "Dashboard/AdvancedSearch",
  component: AdvancedSearch,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Advanced search with filters, recent searches, suggestions, and keyboard navigation. Press / to focus.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: { control: "text" },
    showFilters: { control: "boolean" },
    showRecent: { control: "boolean" },
    showSuggestions: { control: "boolean" },
    maxRecentSearches: { control: "number" },
  },
  decorators: [
    (Story) => (
      <div className="w-[600px] p-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AdvancedSearch>;

export const Default: Story = {
  args: {
    placeholder: "Search orders, products, customers...",
    showFilters: true,
    showRecent: true,
    showSuggestions: true,
    maxRecentSearches: 5,
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: "What are you looking for?",
    showFilters: true,
  },
};

export const WithoutFilters: Story = {
  args: {
    showFilters: false,
    placeholder: "Search...",
  },
};

export const WithoutRecentSearches: Story = {
  args: {
    showRecent: false,
  },
};

export const MinimalMode: Story = {
  args: {
    showFilters: false,
    showRecent: false,
    showSuggestions: false,
    placeholder: "Quick search...",
  },
};

export const InteractiveDemo: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Advanced Search Demo</h3>
        <p className="text-sm text-muted-foreground">
          Try the search functionality with keyboard navigation
        </p>
      </div>
      <AdvancedSearch
        placeholder="Search orders, products, customers..."
        onSearch={(query, filters) => console.log("Search:", { query, filters })}
        onResultSelect={(result) => console.log("Selected:", result)}
      />
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-medium">Keyboard Shortcuts</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Kbd>/</Kbd>
            <span className="text-muted-foreground">Focus search</span>
          </div>
          <div className="flex items-center gap-2">
            <Kbd>Esc</Kbd>
            <span className="text-muted-foreground">Close search</span>
          </div>
          <div className="flex items-center gap-2">
            <Kbd>↑</Kbd> <Kbd>↓</Kbd>
            <span className="text-muted-foreground">Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <Kbd>↵</Kbd>
            <span className="text-muted-foreground">Select</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Wrapper component for FiltersOnly story
function FiltersOnlyDemo() {
  const [filters, setFilters] = React.useState<SearchFilter>(defaultFilters);
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Search Filters Component</h3>
      <SearchFilters
        filters={filters}
        onFiltersChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
        onReset={() => setFilters(defaultFilters)}
      />
      <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-auto">
        {JSON.stringify(filters, null, 2)}
      </pre>
    </div>
  );
}

export const FiltersOnly: Story = {
  render: () => <FiltersOnlyDemo />,
};

// Wrapper component for FilterChips story
function FilterChipsDemo() {
  const [filters, setFilters] = React.useState<SearchFilter>({
    entityTypes: ["orders", "products"],
    status: "pending",
    dateRangePreset: "last7days",
    customDateRange: { from: undefined, to: undefined },
  });
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Active Filter Chips</h3>
      <SearchFilterChips
        filters={filters}
        onFiltersChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
        onReset={() => setFilters(defaultFilters)}
      />
    </div>
  );
}

export const FilterChips: Story = {
  render: () => <FilterChipsDemo />,
};

// Wrapper component for ResultsPreview story
function ResultsPreviewDemo() {
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Search Results Preview</h3>
      <div className="border rounded-lg overflow-hidden">
        <SearchResultsPreview
          results={mockResults}
          isLoading={false}
          query="widget"
          onResultSelect={(r) => console.log("Selected:", r)}
          onViewAll={(t) => console.log("View all:", t)}
          selectedIndex={selectedIndex}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setSelectedIndex((i) => Math.max(-1, i - 1))}>
          Previous
        </Button>
        <Button size="sm" variant="outline" onClick={() => setSelectedIndex((i) => i + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export const ResultsPreview: Story = {
  render: () => <ResultsPreviewDemo />,
};

export const LoadingState: Story = {
  render: () => (
    <div className="border rounded-lg overflow-hidden">
      <SearchResultsPreview
        results={[]}
        isLoading={true}
        query="searching..."
        onResultSelect={() => {}}
        onViewAll={() => {}}
        selectedIndex={-1}
      />
    </div>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <div className="border rounded-lg overflow-hidden">
      <SearchResultsPreview
        results={[]}
        isLoading={false}
        query="xyznonexistent"
        onResultSelect={() => {}}
        onViewAll={() => {}}
        selectedIndex={-1}
      />
    </div>
  ),
};

export const InHeaderContext: Story = {
  decorators: [(Story) => <div className="w-full max-w-4xl"><Story /></div>],
  render: () => (
    <div className="border rounded-lg">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <span className="font-semibold">Dashboard</span>
        <div className="flex-1 max-w-md mx-4">
          <AdvancedSearch placeholder="Search..." />
        </div>
        <Button variant="ghost" size="sm">Settings</Button>
      </header>
      <div className="p-6 min-h-[200px] bg-muted/20">
        <p className="text-sm text-muted-foreground">Dashboard content...</p>
      </div>
    </div>
  ),
};
