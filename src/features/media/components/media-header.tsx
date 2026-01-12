"use client";

import { memo } from "react";
import {
  UploadCloud,
  Search,
  Grid3X3,
  List,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/shared/utils";
import type { ViewMode, MediaFiltersState } from "@/features/media/types";
import { MediaFilters, MediaFilterChips } from "./media-filters";

interface MediaHeaderProps {
  search: string;
  filters: MediaFiltersState;
  viewMode: ViewMode;
  isUploading: boolean;
  onSearchChange: (value: string) => void;
  onFiltersChange: (filters: Partial<MediaFiltersState>) => void;
  onClearFilters: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onUploadClick: () => void;
}

export const MediaHeader = memo(function MediaHeader({
  search,
  filters,
  viewMode,
  isUploading,
  onSearchChange,
  onFiltersChange,
  onClearFilters,
  onViewModeChange,
  onUploadClick,
}: MediaHeaderProps) {
  return (
    <div className="border-b border-[var(--ds-gray-200)] bg-background/95 backdrop-blur-sm">
      {/* Single row toolbar - Linear style */}
      <div className="h-12 px-4 flex items-center gap-2 min-w-0">
        {/* Search */}
        <div className="relative w-[200px] shrink-0">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ds-gray-500)]"
            aria-hidden="true"
          />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            size="sm"
            className={cn(
              "h-7 pl-8 pr-7 text-xs",
              search && "border-[var(--ds-gray-900)]"
            )}
            aria-label="Search files"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--ds-gray-500)] hover:text-[var(--ds-gray-900)] transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="h-4 w-px bg-[var(--ds-gray-200)]" />

        {/* Inline filters - Linear style */}
        <MediaFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearAll={onClearFilters}
        />

        <div className="flex-1" />

        {/* View Toggle */}
        <div
          className="flex h-8 border border-[var(--ds-gray-200)] rounded-md overflow-hidden shrink-0"
          role="group"
          aria-label="View mode"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("grid")}
                className="h-full w-8 p-0 rounded-none border-0"
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Grid view</TooltipContent>
          </Tooltip>
          <div className="w-px bg-[var(--ds-gray-200)]" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("list")}
                className="h-full w-8 p-0 rounded-none border-0"
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>List view</TooltipContent>
          </Tooltip>
        </div>

        {/* Upload Button */}
        <Button
          onClick={onUploadClick}
          disabled={isUploading}
          variant="geist-primary"
          size="sm"
          className="shrink-0"
        >
          <UploadCloud className="h-4 w-4" />
          <span className="hidden sm:inline">Upload</span>
        </Button>
      </div>

      {/* Active filter chips row - only show if search is active */}
      {search && (
        <div className="px-4 pb-2">
          <MediaFilterChips
            filters={filters}
            onFiltersChange={onFiltersChange}
            onClearAll={onClearFilters}
            search={search}
            onClearSearch={() => onSearchChange("")}
          />
        </div>
      )}
    </div>
  );
});
