"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Search,
  Settings,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { DataTablePagination } from "./pagination";
import { EmptyState } from "@/components/ui/empty-state";

// Types
export interface DataTableColumn<TData> {
  id: string;
  header: string;
  accessorKey?: keyof TData;
  cell?: (row: TData) => React.ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
  className?: string;
}

export interface DataTableFilterOption {
  label: string;
  value: string;
  count?: number;
  color?: string; // e.g., "bg-chart-2" for status dots
}

export interface DataTableFilter {
  id: string;
  label: string;
  type?: "select" | "date-range";
  options?: DataTableFilterOption[];
}

export interface DataTableAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "ghost";
  icon?: React.ReactNode;
}

// Import LucideIcon type for EmptyState compatibility
import { type LucideIcon, Inbox } from "lucide-react";

export interface DataTableEmptyState {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ActiveFilterChip {
  key: string;
  label: string;
  value: string;
  displayValue: string;
}

interface DataTableProps<TData> {
  data: TData[];
  columns: DataTableColumn<TData>[];
  filters?: DataTableFilter[];
  actions?: DataTableAction[];
  getRowId: (row: TData) => string;
  rowHref?: (row: TData) => string;
  onRowClick?: (row: TData) => void;
  totalCount: number;
  pageSize?: number;
  enableSearch?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  enableSorting?: boolean;
  enableFilterChips?: boolean;
  searchPlaceholder?: string;
  emptyState?: DataTableEmptyState;
  isLoading?: boolean;
  onBulkAction?: (selectedIds: string[], action: string) => void;
  bulkActions?: { label: string; value: string; variant?: "default" | "destructive" }[];
  prefix?: string;
  className?: string;
  // Date range support (opt-in)
  dateRange?: { from?: Date; to?: Date };
  onDateRangeChange?: (range: { from?: Date; to?: Date }) => void;
}


// URL state helpers
function getQueryParamKey(key: string, prefix?: string) {
  return prefix ? `${prefix}_${key}` : key;
}

function parseSearchParams(searchParams: URLSearchParams, prefix?: string) {
  const get = (key: string) => searchParams.get(getQueryParamKey(key, prefix));
  
  return {
    page: parseInt(get("page") || "1", 10),
    pageSize: parseInt(get("pageSize") || "10", 10),
    search: get("q") || "",
    sort: get("sort") || "",
    sortDir: (get("sortDir") as "asc" | "desc") || "asc",
    filters: {} as Record<string, string>,
  };
}

export function DataTable<TData>({
  data,
  columns,
  filters = [],
  actions = [],
  getRowId,
  rowHref,
  onRowClick,
  totalCount,
  pageSize: defaultPageSize = 10,
  enableSearch = true,
  enablePagination = true,
  enableRowSelection = false,
  enableColumnVisibility = false,
  enableSorting = false,
  enableFilterChips = true,
  searchPlaceholder = "Search...",
  emptyState,
  isLoading = false,
  onBulkAction,
  bulkActions = [],
  prefix,
  className,
  dateRange,
  onDateRangeChange,
}: DataTableProps<TData>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  // Parse URL state
  const urlState = React.useMemo(
    () => parseSearchParams(searchParams, prefix),
    [searchParams, prefix]
  );

  // Local state
  const [searchValue, setSearchValue] = React.useState(urlState.search);
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>(() =>
    columns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
  );

  // Calculate active filter chips
  const activeFilterChips = React.useMemo(() => {
    const chips: ActiveFilterChip[] = [];
    
    // Add select filter chips
    filters.forEach((filter) => {
      if (filter.type !== "date-range") {
        const value = searchParams.get(getQueryParamKey(filter.id, prefix));
        if (value) {
          const option = filter.options?.find(o => o.value === value);
          chips.push({
            key: filter.id,
            label: filter.label,
            value,
            displayValue: option?.label || value,
          });
        }
      }
    });

    // Add date range chip if present
    if (dateRange?.from) {
      const dateLabel = dateRange.to
        ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
        : format(dateRange.from, "MMM d, yyyy");
      chips.push({
        key: "dateRange",
        label: "Date",
        value: "dateRange",
        displayValue: dateLabel,
      });
    }

    return chips;
  }, [filters, searchParams, prefix, dateRange]);

  // Check if date range filter is configured
  const hasDateRangeFilter = filters.some(f => f.type === "date-range");

  // Update URL with new params
  const updateUrl = React.useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        const paramKey = getQueryParamKey(key, prefix);
        if (value) {
          params.set(paramKey, value);
        } else {
          params.delete(paramKey);
        }
      });

      // Reset to page 1 when filters change (except for page changes)
      if (!("page" in updates)) {
        params.delete(getQueryParamKey("page", prefix));
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams, prefix]
  );

  // Debounced search
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue !== urlState.search) {
        updateUrl({ q: searchValue || undefined });
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchValue, urlState.search, updateUrl]);

  // Handle sorting
  const handleSort = (columnId: string) => {
    if (!enableSorting) return;
    const newDir = urlState.sort === columnId && urlState.sortDir === "asc" ? "desc" : "asc";
    updateUrl({ sort: columnId, sortDir: newDir });
  };

  // Handle row selection
  const toggleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(getRowId)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // Handle removing a filter chip
  const removeFilterChip = (key: string) => {
    if (key === "dateRange" && onDateRangeChange) {
      onDateRangeChange({});
    } else {
      updateUrl({ [key]: undefined });
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchValue("");
    if (onDateRangeChange) {
      onDateRangeChange({});
    }
    router.push(pathname);
  };

  // Visible columns
  const visibleColumns = columns.filter(
    (col) => columnVisibility[col.id] !== false
  );

  const pageCount = Math.ceil(totalCount / urlState.pageSize);
  const hasFilters = urlState.search || activeFilterChips.length > 0;

  return (
    <div className={cn("space-y-[13px]", className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-[13px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          {enableSearch && (
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-gray-500)]"
              />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {filters.filter(f => f.type !== "date-range").map((filter) => (
              <Select
                key={filter.id}
                value={searchParams.get(getQueryParamKey(filter.id, prefix)) || "all"}
                onValueChange={(value) =>
                  updateUrl({ [filter.id]: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger className="w-[140px] bg-background">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}</SelectItem>
                  {filter.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        {opt.color && (
                          <span className={cn("h-2 w-2 rounded-full", opt.color)} />
                        )}
                        {opt.label}
                        {opt.count !== undefined && (
                          <span className="text-[var(--ds-gray-600)]">({opt.count})</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}

            {/* Date Range Filter */}
            {hasDateRangeFilter && onDateRangeChange && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !dateRange?.from && "text-[var(--ds-gray-500)]"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      <span>Pick date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange?.from, to: dateRange?.to }}
                    onSelect={(range) => {
                      onDateRangeChange({ from: range?.from, to: range?.to });
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Clear Filters */}
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Column Visibility */}
            {enableColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Columns</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {columns
                    .filter((col) => col.enableHiding !== false)
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        checked={columnVisibility[col.id] !== false}
                        onCheckedChange={(checked) =>
                          setColumnVisibility((prev) => ({ ...prev, [col.id]: checked }))
                        }
                      >
                        {col.header}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Refresh */}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => router.refresh()}
              disabled={isPending}
            >
              <RefreshCw
                className={cn("w-4 h-4", isPending && "animate-spin")}
              />
            </Button>

            {/* Custom Actions */}
            {actions.map((action, i) => (
              <Button
                key={i}
                variant={action.variant || "default"}
                size="sm"
                onClick={action.onClick}
                asChild={!!action.href}
                className="gap-2"
              >
                {action.href ? (
                  <a href={action.href}>
                    {action.icon}
                    {action.label}
                  </a>
                ) : (
                  <>
                    {action.icon}
                    {action.label}
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {enableRowSelection && selectedRows.size > 0 && (
          <div className="flex items-center gap-3 p-[13px] bg-[var(--ds-gray-100)] rounded-xl">
            <span className="text-sm font-medium">{selectedRows.size} selected</span>
            <div className="flex items-center gap-2">
              {bulkActions.map((action) => (
                <Button
                  key={action.value}
                  size="sm"
                  variant={action.variant === "destructive" ? "outline" : "outline"}
                  className={action.variant === "destructive" ? "text-destructive hover:text-destructive" : ""}
                  onClick={() => onBulkAction?.(Array.from(selectedRows), action.value)}
                >
                  {action.label}
                </Button>
              ))}
              <Button size="sm" variant="ghost" onClick={() => setSelectedRows(new Set())}>
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {enableFilterChips && activeFilterChips.length > 0 && (
          <div className="flex items-center gap-[8px] flex-wrap">
            {activeFilterChips.map((chip) => (
              <Badge
                key={chip.key}
                variant="secondary"
                className="gap-1.5 pr-1 font-normal"
              >
                <span className="text-[var(--ds-gray-600)]">{chip.label}:</span>
                <span>{chip.displayValue}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeFilterChip(chip.key)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-[var(--ds-gray-600)]"
              onClick={clearAllFilters}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {enableRowSelection && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.size === data.length && data.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {visibleColumns.map((col) => {
                // Determine aria-sort value for sortable columns
                const getAriaSortValue = (): "ascending" | "descending" | "none" | undefined => {
                  if (!col.enableSorting || !enableSorting) return undefined;
                  if (urlState.sort !== col.id) return "none";
                  return urlState.sortDir === "asc" ? "ascending" : "descending";
                };

                return (
                  <TableHead
                    key={col.id}
                    className={cn(
                      col.enableSorting && enableSorting && "cursor-pointer select-none",
                      col.className
                    )}
                    onClick={() => col.enableSorting && handleSort(col.id)}
                    aria-sort={getAriaSortValue()}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.enableSorting && enableSorting && urlState.sort === col.id && (
                        urlState.sortDir === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={visibleColumns.length + (enableRowSelection ? 1 : 0)}
                  className="h-[388px]"
                >
                  <EmptyState
                    icon={emptyState?.icon}
                    title={emptyState?.title || (hasFilters ? "No results found" : "No data")}
                    description={
                      emptyState?.description ||
                      (hasFilters ? "Try adjusting your search or filters" : undefined)
                    }
                    action={
                      hasFilters
                        ? { label: "Clear Filters", onClick: () => router.push(pathname) }
                        : emptyState?.action
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const rowId = getRowId(row);
                const isSelected = selectedRows.has(rowId);

                return (
                  <TableRow
                    key={rowId}
                    className={cn(
                      "group",
                      isSelected && "bg-[var(--ds-gray-100)]",
                      (rowHref || onRowClick) && "cursor-pointer"
                    )}
                    onClick={() => {
                      if (onRowClick) onRowClick(row);
                      else if (rowHref) router.push(rowHref(row));
                    }}
                  >
                    {enableRowSelection && (
                      <TableCell className="py-[13px]" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(rowId)}
                          aria-label={`Select row ${rowId}`}
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map((col) => (
                      <TableCell key={col.id} className={cn("py-[13px]", col.className)}>
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                          ? String((row as Record<string, unknown>)[col.accessorKey as string] ?? "")
                          : null}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

      {/* Pagination */}
      {enablePagination && totalCount > 0 && (
        <DataTablePagination
          pageIndex={urlState.page - 1}
          pageSize={urlState.pageSize}
          pageCount={pageCount}
          totalItems={totalCount}
          selectedCount={selectedRows.size}
          onPageChange={(page) => updateUrl({ page: String(page + 1) })}
          onPageSizeChange={(size) => updateUrl({ pageSize: String(size) })}
        />
      )}
    </div>
  );
}
