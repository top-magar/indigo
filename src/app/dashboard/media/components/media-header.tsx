"use client";

import { memo, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Upload04Icon,
  Search01Icon,
  GridIcon,
  Menu01Icon,
  FilterIcon,
  ArrowUpDownIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { FileTypeFilter, AssetSortOption, ViewMode } from "@/lib/media/types";

interface MediaHeaderProps {
  search: string;
  fileType: FileTypeFilter;
  sort: AssetSortOption;
  viewMode: ViewMode;
  isUploading: boolean;
  onSearchChange: (value: string) => void;
  onFileTypeChange: (value: FileTypeFilter) => void;
  onSortChange: (value: AssetSortOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onUploadClick: () => void;
}

export const MediaHeader = memo(function MediaHeader({
  search,
  fileType,
  sort,
  viewMode,
  isUploading,
  onSearchChange,
  onFileTypeChange,
  onSortChange,
  onViewModeChange,
  onUploadClick,
}: MediaHeaderProps) {
  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (fileType !== "all") count++;
    if (sort !== "newest") count++;
    return count;
  }, [search, fileType, sort]);

  const clearAllFilters = () => {
    onSearchChange("");
    onFileTypeChange("all");
    onSortChange("newest");
  };

  return (
    <div className="h-14 border-b px-4 flex items-center gap-3 min-w-0 bg-background/95 backdrop-blur-sm">
      {/* Search - prominent and flexible */}
      <div className="relative flex-1 min-w-[120px] max-w-[280px]">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          placeholder="Search files..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "pl-9 pr-9 h-9 text-sm transition-all",
            search && "border-primary/50 ring-1 ring-primary/20"
          )}
          aria-label="Search files"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Filters group */}
      <div className="flex items-center gap-2">
        {/* File Type Filter */}
        <Select value={fileType} onValueChange={onFileTypeChange}>
          <SelectTrigger
            className={cn(
              "w-[110px] h-9 text-sm shrink-0 hidden sm:flex",
              fileType !== "all" && "border-primary/50 ring-1 ring-primary/20"
            )}
            aria-label="Filter by file type"
          >
            <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 mr-2 shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="images">Images</SelectItem>
            <SelectItem value="videos">Videos</SelectItem>
            <SelectItem value="documents">Documents</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger
            className={cn(
              "w-[120px] h-9 text-sm shrink-0 hidden md:flex",
              sort !== "newest" && "border-primary/50 ring-1 ring-primary/20"
            )}
            aria-label="Sort by"
          >
            <HugeiconsIcon icon={ArrowUpDownIcon} className="h-4 w-4 mr-2 shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="name_asc">Name A-Z</SelectItem>
            <SelectItem value="name_desc">Name Z-A</SelectItem>
            <SelectItem value="size_desc">Largest</SelectItem>
            <SelectItem value="size_asc">Smallest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1" />

      {/* Active filters indicator */}
      {activeFilterCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-2 text-primary hover:text-primary shrink-0 px-3"
              onClick={clearAllFilters}
            >
              <Badge variant="secondary" className="bg-primary/10 text-primary px-1.5 py-0.5 text-xs h-5">
                {activeFilterCount}
              </Badge>
              <span className="text-sm hidden sm:inline">Clear</span>
              <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear all filters</TooltipContent>
        </Tooltip>
      )}

      {/* View Toggle */}
      <div className="flex border rounded-md overflow-hidden shrink-0" role="group" aria-label="View mode">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="rounded-none h-9 w-9 p-0"
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <HugeiconsIcon icon={GridIcon} className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Grid view</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="rounded-none h-9 w-9 p-0"
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <HugeiconsIcon icon={Menu01Icon} className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>List view</TooltipContent>
        </Tooltip>
      </div>

      {/* Upload Button - prominent primary action */}
      <Button onClick={onUploadClick} disabled={isUploading} size="sm" className="h-9 shrink-0 gap-2 px-4 shadow-sm">
        <HugeiconsIcon icon={Upload04Icon} className="h-4 w-4" />
        <span className="hidden sm:inline font-medium">Upload</span>
      </Button>
    </div>
  );
});
