"use client";

import { useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FilterIcon,
  Cancel01Icon,
  Mail01Icon,
  ShoppingCart01Icon,
  PackageIcon,
  UserMultiple02Icon,
  Comment01Icon,
} from "@hugeicons/core-free-icons";

// Use Mail01Icon as a substitute for MentionIcon (@ symbol)
const MentionIcon = Mail01Icon;
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  type ActivityFilter,
  type ActivityCategory,
  type TeamMember,
} from "./activity-types";

export interface ActivityFiltersProps {
  filter: ActivityFilter;
  onFilterChange: (filter: Partial<ActivityFilter>) => void;
  onReset: () => void;
  teamMembers?: TeamMember[];
  className?: string;
  compact?: boolean;
}

const CATEGORY_OPTIONS: { value: ActivityCategory; label: string; icon: typeof FilterIcon }[] = [
  { value: "all", label: "All Activities", icon: FilterIcon },
  { value: "orders", label: "Orders", icon: ShoppingCart01Icon },
  { value: "products", label: "Products", icon: PackageIcon },
  { value: "customers", label: "Customers", icon: UserMultiple02Icon },
  { value: "comments", label: "Comments", icon: Comment01Icon },
  { value: "mentions", label: "Mentions", icon: MentionIcon },
];

/**
 * Get initials from a name
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Check if any filters are active
 */
function hasActiveFilters(filter: ActivityFilter): boolean {
  return !!(
    (filter.category && filter.category !== "all") ||
    (filter.actorIds && filter.actorIds.length > 0) ||
    filter.mentionsOnly ||
    filter.unreadOnly
  );
}

export function ActivityFilters({
  filter,
  onFilterChange,
  onReset,
  teamMembers = [],
  className,
  compact = false,
}: ActivityFiltersProps) {
  const handleCategoryChange = useCallback(
    (value: string) => {
      onFilterChange({ category: value as ActivityCategory });
    },
    [onFilterChange]
  );

  const handleTeamMemberChange = useCallback(
    (value: string) => {
      if (value === "all") {
        onFilterChange({ actorIds: undefined });
      } else {
        onFilterChange({ actorIds: [value] });
      }
    },
    [onFilterChange]
  );

  const handleMentionsOnlyChange = useCallback(
    (checked: boolean) => {
      onFilterChange({ mentionsOnly: checked });
    },
    [onFilterChange]
  );

  const isFiltered = hasActiveFilters(filter);
  const selectedCategory = filter.category || "all";
  const selectedTeamMember = filter.actorIds?.[0] || "all";

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {/* Category filter */}
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={option.icon} className="h-3.5 w-3.5" />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mentions toggle */}
        <Button
          variant={filter.mentionsOnly ? "secondary" : "outline"}
          size="sm"
          onClick={() => handleMentionsOnlyChange(!filter.mentionsOnly)}
          className="gap-1.5"
        >
          <HugeiconsIcon icon={MentionIcon} className="h-3.5 w-3.5" />
          @mentions
        </Button>

        {/* Clear filters */}
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
            <HugeiconsIcon icon={Cancel01Icon} className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          {isFiltered && (
            <Badge variant="secondary" className="text-[10px]">
              Active
            </Badge>
          )}
        </div>
        {isFiltered && (
          <Button variant="ghost" size="xs" onClick={onReset} className="gap-1 text-xs">
            <HugeiconsIcon icon={Cancel01Icon} className="h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Filter controls */}
      <div className="space-y-3">
        {/* Activity type filter */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Activity Type</Label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="All activities" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={option.icon} className="h-3.5 w-3.5" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Team member filter */}
        {teamMembers.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Team Member</Label>
            <Select value={selectedTeamMember} onValueChange={handleTeamMemberChange}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="All team members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={UserMultiple02Icon} className="h-3.5 w-3.5" />
                    <span>All team members</span>
                  </div>
                </SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar size="sm" className="h-5 w-5">
                        {member.avatarUrl ? (
                          <AvatarImage src={member.avatarUrl} alt={member.name} />
                        ) : null}
                        <AvatarFallback className="text-[8px]">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Mentions only toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={MentionIcon} className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="mentions-only" className="text-sm cursor-pointer">
              Only show @mentions
            </Label>
          </div>
          <Switch
            id="mentions-only"
            size="sm"
            checked={filter.mentionsOnly || false}
            onCheckedChange={handleMentionsOnlyChange}
          />
        </div>
      </div>
    </div>
  );
}

export { CATEGORY_OPTIONS, hasActiveFilters };
