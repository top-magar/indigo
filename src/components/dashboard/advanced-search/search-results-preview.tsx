"use client";

import * as React from "react";
import {
  ShoppingCart,
  Package,
  Users,
  ArrowRight,
  Search,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  SearchResultsPreviewProps,
  SearchResult,
  SearchEntityType,
} from "./types";

// Entity type configuration
const entityConfig: Record<
  SearchEntityType,
  { label: string; icon: LucideIcon; color: string }
> = {
  orders: {
    label: "Orders",
    icon: ShoppingCart,
    color: "text-[var(--ds-blue-700)]",
  },
  products: {
    label: "Products",
    icon: Package,
    color: "text-[var(--ds-green-700)]",
  },
  customers: {
    label: "Customers",
    icon: Users,
    color: "text-[var(--ds-purple-700)]",
  },
};

// Highlight matching text in search results
function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-primary/20 text-foreground rounded-xs px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

// Loading skeleton
function ResultsSkeleton() {
  return (
    <div className="space-y-4 p-2">
      {[1, 2, 3].map((group) => (
        <div key={group} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="space-y-1">
            {[1, 2].map((item) => (
              <div key={item} className="flex items-center gap-2 p-2">
                <Skeleton className="size-4 rounded" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state
function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="rounded-full bg-muted p-3 mb-3">
        <Search className="size-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">No results found</p>
      <p className="text-xs text-muted-foreground max-w-[200px]">
        No results match &quot;{query}&quot;. Try adjusting your search or filters.
      </p>
    </div>
  );
}

// Single result item
function ResultItem({
  result,
  query,
  isSelected,
  onClick,
}: {
  result: SearchResult;
  query: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const config = entityConfig[result.entityType];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors",
        "hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
        isSelected && "bg-muted"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center size-8 rounded-md bg-muted/50",
          config.color
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          <HighlightedText text={result.title} query={query} />
        </p>
        {result.subtitle && (
          <p className="text-xs text-muted-foreground truncate">
            {result.subtitle}
          </p>
        )}
      </div>
      <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

// Result group
function ResultGroup({
  entityType,
  results,
  totalCount,
  query,
  selectedIndex,
  startIndex,
  onResultSelect,
  onViewAll,
}: {
  entityType: SearchEntityType;
  results: SearchResult[];
  totalCount: number;
  query: string;
  selectedIndex: number;
  startIndex: number;
  onResultSelect: (result: SearchResult) => void;
  onViewAll: () => void;
}) {
  const config = entityConfig[entityType];
  const hasMore = totalCount > results.length;
  const Icon = config.icon;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-1.5">
          <Icon className={cn("size-3.5", config.color)} />
          <span className="text-xs font-medium text-muted-foreground">
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground/60">
            ({totalCount})
          </span>
        </div>
        {hasMore && (
          <button
            onClick={onViewAll}
            className="text-xs text-primary hover:underline flex items-center gap-0.5"
          >
            View all
            <ArrowRight className="size-3" />
          </button>
        )}
      </div>
      <div className="space-y-0.5">
        {results.map((result, index) => (
          <ResultItem
            key={result.id}
            result={result}
            query={query}
            isSelected={selectedIndex === startIndex + index}
            onClick={() => onResultSelect(result)}
          />
        ))}
      </div>
    </div>
  );
}

export function SearchResultsPreview({
  results,
  isLoading,
  query,
  onResultSelect,
  onViewAll,
  selectedIndex,
  className,
}: SearchResultsPreviewProps) {
  const groupStartIndices = React.useMemo(() => {
    const indices: number[] = [];
    let currentIndex = 0;
    results.forEach((group) => {
      indices.push(currentIndex);
      currentIndex += group.results.length;
    });
    return indices;
  }, [results]);

  if (isLoading) {
    return (
      <div className={cn("", className)}>
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="size-4 text-muted-foreground animate-spin" />
          <span className="text-xs text-muted-foreground">Searching...</span>
        </div>
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <div className={className}>
        <EmptyState query={query} />
      </div>
    );
  }

  if (!query) {
    return null;
  }

  return (
    <div className={cn("space-y-3 py-2", className)}>
      {results.map((group, groupIndex) => (
        <ResultGroup
          key={group.entityType}
          entityType={group.entityType}
          results={group.results}
          totalCount={group.totalCount}
          query={query}
          selectedIndex={selectedIndex}
          startIndex={groupStartIndices[groupIndex]}
          onResultSelect={onResultSelect}
          onViewAll={() => onViewAll(group.entityType)}
        />
      ))}
      {results.length > 0 && (
        <div className="border-t pt-2 px-2">
          <p className="text-xs text-muted-foreground text-center">
            Showing top results •{" "}
            <button
              onClick={() => onViewAll("orders")}
              className="text-primary hover:underline"
            >
              View all results
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

export { ResultsSkeleton as SearchResultsSkeleton };
