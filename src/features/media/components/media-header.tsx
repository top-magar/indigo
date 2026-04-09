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
import { useMediaStore } from "@/features/media/media-store";
import { useUploadStore } from "@/features/media/upload-store";
import { MediaFilters, MediaFilterChips } from "./media-filters";

interface MediaHeaderProps {
  onUploadClick: () => void;
}

export const MediaHeader = memo(function MediaHeader({
  onUploadClick,
}: MediaHeaderProps) {
  const search = useMediaStore((s) => s.search);
  const filters = useMediaStore((s) => s.filters);
  const viewMode = useMediaStore((s) => s.viewMode);
  const setSearch = useMediaStore((s) => s.setSearch);
  const setFilters = useMediaStore((s) => s.setFilters);
  const resetFilters = useMediaStore((s) => s.resetFilters);
  const setViewMode = useMediaStore((s) => s.setViewMode);
  const isUploading = useUploadStore((s) => s.isUploading);

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur-sm">
      {/* Single row toolbar - Linear style */}
      <div className="h-12 px-4 flex items-center gap-2 min-w-0">
        {/* Search */}
        <div className="relative w-[200px] shrink-0">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50"
            aria-hidden="true"
          />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "h-7 pl-8 pr-7 text-xs",
              search && "border-foreground"
            )}
            aria-label="Search files"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Inline filters - Linear style */}
        <MediaFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearAll={resetFilters}
        />

        <div className="flex-1" />

        {/* View Toggle */}
        <div
          className="flex h-8 border border-border rounded-md overflow-hidden shrink-0"
          role="group"
          aria-label="View mode"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                onClick={() => setViewMode("grid")}
                className="h-full w-8 p-0 rounded-none border-0"
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <Grid3X3 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Grid view</TooltipContent>
          </Tooltip>
          <div className="w-px bg-border" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                onClick={() => setViewMode("list")}
                className="h-full w-8 p-0 rounded-none border-0"
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <List className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>List view</TooltipContent>
          </Tooltip>
        </div>

        {/* Upload Button */}
        <Button
          onClick={onUploadClick}
          disabled={isUploading}
          variant="default"
          className="shrink-0"
        >
          <UploadCloud className="size-4" />
          <span className="hidden sm:inline">Upload</span>
        </Button>
      </div>

      {/* Active filter chips row - only show if search is active */}
      {search && (
        <div className="px-4 pb-2">
          <MediaFilterChips
            filters={filters}
            onFiltersChange={setFilters}
            onClearAll={resetFilters}
            search={search}
            onClearSearch={() => setSearch("")}
          />
        </div>
      )}
    </div>
  );
});
