"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/shared/utils"
import type { BlockType } from "@/types/blocks"

// =============================================================================
// TYPES
// =============================================================================

export type GroupByOption = "none" | "type" | "section" | "status"
export type SortByOption = "order" | "name" | "type"

interface LayersFilterMenuProps {
  groupBy: GroupByOption
  onGroupByChange: (option: GroupByOption) => void
  filterByType: BlockType[]
  onFilterByTypeChange: (types: BlockType[]) => void
  filterByVisibility: "all" | "visible" | "hidden"
  onFilterByVisibilityChange: (filter: "all" | "visible" | "hidden") => void
  filterByLock: "all" | "locked" | "unlocked"
  onFilterByLockChange: (filter: "all" | "locked" | "unlocked") => void
  sortBy: SortByOption
  onSortByChange: (option: SortByOption) => void
  availableBlockTypes: BlockType[]
}

// =============================================================================
// CONSTANTS
// =============================================================================

const GROUP_BY_OPTIONS: { value: GroupByOption; label: string }[] = [
  { value: "none", label: "None" },
  { value: "type", label: "By Type" },
  { value: "section", label: "By Section" },
  { value: "status", label: "By Status" },
]

const SORT_BY_OPTIONS: { value: SortByOption; label: string }[] = [
  { value: "order", label: "By Order" },
  { value: "name", label: "By Name" },
  { value: "type", label: "By Type" },
]

const VISIBILITY_OPTIONS: { value: "all" | "visible" | "hidden"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "visible", label: "Visible only" },
  { value: "hidden", label: "Hidden only" },
]

const LOCK_OPTIONS: { value: "all" | "locked" | "unlocked"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "locked", label: "Locked only" },
  { value: "unlocked", label: "Unlocked only" },
]

// Block type display names
const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  header: "Header",
  hero: "Hero",
  "featured-product": "Featured Product",
  "product-grid": "Product Grid",
  "promotional-banner": "Promo Banner",
  testimonials: "Testimonials",
  "trust-signals": "Trust Signals",
  newsletter: "Newsletter",
  footer: "Footer",
  "rich-text": "Rich Text",
  image: "Image",
  button: "Button",
  spacer: "Spacer",
  divider: "Divider",
  video: "Video",
  faq: "FAQ",
  countdown: "Countdown",
  gallery: "Gallery",
  icon: "Icon",
  section: "Section",
  columns: "Columns",
  column: "Column",
}

// =============================================================================
// COMPONENT
// =============================================================================

export function LayersFilterMenu({
  groupBy,
  onGroupByChange,
  filterByType,
  onFilterByTypeChange,
  filterByVisibility,
  onFilterByVisibilityChange,
  filterByLock,
  onFilterByLockChange,
  sortBy,
  onSortByChange,
  availableBlockTypes,
}: LayersFilterMenuProps) {
  // Check if any filters are active
  const hasActiveFilters =
    groupBy !== "none" ||
    filterByType.length > 0 ||
    filterByVisibility !== "all" ||
    filterByLock !== "all" ||
    sortBy !== "order"

  // Handle block type toggle
  const handleTypeToggle = (type: BlockType, checked: boolean) => {
    if (checked) {
      onFilterByTypeChange([...filterByType, type])
    } else {
      onFilterByTypeChange(filterByType.filter((t) => t !== type))
    }
  }

  // Clear all filters
  const handleClearAll = () => {
    onGroupByChange("none")
    onFilterByTypeChange([])
    onFilterByVisibilityChange("all")
    onFilterByLockChange("all")
    onSortByChange("order")
  }

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-5 w-5 shrink-0",
                hasActiveFilters && "text-violet-500"
              )}
            >
              <HugeiconsIcon icon={FilterIcon} className="h-3 w-3" />
              {hasActiveFilters && (
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Filter & Group
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        align="start"
        className="w-[220px] p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-xs font-medium">Filter & Group</span>
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="p-2 space-y-3 max-h-[400px] overflow-y-auto">
          {/* Group By Section */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Group By
            </Label>
            <RadioGroup
              value={groupBy}
              onValueChange={(value) => onGroupByChange(value as GroupByOption)}
              className="gap-1"
            >
              {GROUP_BY_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`group-${option.value}`}
                    className="h-3 w-3"
                  />
                  <Label
                    htmlFor={`group-${option.value}`}
                    className="text-xs font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Sort By Section */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Sort By
            </Label>
            <RadioGroup
              value={sortBy}
              onValueChange={(value) => onSortByChange(value as SortByOption)}
              className="gap-1"
            >
              {SORT_BY_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`sort-${option.value}`}
                    className="h-3 w-3"
                  />
                  <Label
                    htmlFor={`sort-${option.value}`}
                    className="text-xs font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Filter by Visibility */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Visibility
            </Label>
            <RadioGroup
              value={filterByVisibility}
              onValueChange={(value) =>
                onFilterByVisibilityChange(value as "all" | "visible" | "hidden")
              }
              className="gap-1"
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`visibility-${option.value}`}
                    className="h-3 w-3"
                  />
                  <Label
                    htmlFor={`visibility-${option.value}`}
                    className="text-xs font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Filter by Lock Status */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Lock Status
            </Label>
            <RadioGroup
              value={filterByLock}
              onValueChange={(value) =>
                onFilterByLockChange(value as "all" | "locked" | "unlocked")
              }
              className="gap-1"
            >
              {LOCK_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`lock-${option.value}`}
                    className="h-3 w-3"
                  />
                  <Label
                    htmlFor={`lock-${option.value}`}
                    className="text-xs font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Filter by Block Type (only show if there are available types) */}
          {availableBlockTypes.length > 0 && (
            <>
              <Separator />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Block Types
                  </Label>
                  {filterByType.length > 0 && (
                    <button
                      onClick={() => onFilterByTypeChange([])}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1 max-h-[120px] overflow-y-auto">
                  {availableBlockTypes.map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={filterByType.includes(type)}
                        onCheckedChange={(checked) =>
                          handleTypeToggle(type, checked === true)
                        }
                        className="h-3 w-3"
                      />
                      <Label
                        htmlFor={`type-${type}`}
                        className="text-xs font-normal cursor-pointer truncate"
                      >
                        {BLOCK_TYPE_LABELS[type] || type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
