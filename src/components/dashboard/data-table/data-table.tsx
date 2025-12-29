"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  FilterIcon,
  Settings01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
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

export interface DataTableFilter {
  id: string;
  label: string;
  options: { label: string; value: string }[];
}

export interface DataTableAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "ghost";
  icon?: React.ReactNode;
}

import { InboxIcon } from "@hugeicons/core-free-icons";

type HugeIcon = typeof InboxIcon;

export interface DataTableEmptyState {
  icon?: HugeIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
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
  searchPlaceholder?: string;
  emptyState?: DataTableEmptyState;
  isLoading?: boolean;
  onBulkAction?: (selectedIds: string[], action: string) => void;
  bulkActions?: { label: string; value: string; variant?: "default" | "destructive" }[];
  prefix?: string;
  className?: string;
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
  searchPlaceholder = "Search...",
  emptyState,
  isLoading = false,
  onBulkAction,
  bulkActions = [],
  prefix,
  className,
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

  // Visible columns
  const visibleColumns = columns.filter(
    (col) => columnVisibility[col.id] !== false
  );

  const pageCount = Math.ceil(totalCount / urlState.pageSize);
  const hasFilters = urlState.search || filters.some((f) => searchParams.get(getQueryParamKey(f.id, prefix)));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          {enableSearch && (
            <div className="relative flex-1 w-full sm:max-w-sm">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
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
            {filters.map((filter) => (
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
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}

            {/* Clear Filters */}
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchValue("");
                  router.push(pathname);
                }}
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
                  <Button variant="outline" size="sm" className="gap-2">
                    <HugeiconsIcon icon={Settings01Icon} className="w-4 h-4" />
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
              size="icon"
              className="h-9 w-9"
              onClick={() => router.refresh()}
              disabled={isPending}
            >
              <HugeiconsIcon
                icon={RefreshIcon}
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
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
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
      </div>

      {/* Table */}
      <Card>
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
              {visibleColumns.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn(
                    col.enableSorting && enableSorting && "cursor-pointer select-none",
                    col.className
                  )}
                  onClick={() => col.enableSorting && handleSort(col.id)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.enableSorting && enableSorting && urlState.sort === col.id && (
                      <HugeiconsIcon
                        icon={urlState.sortDir === "asc" ? ArrowUp01Icon : ArrowDown01Icon}
                        className="w-3 h-3"
                      />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={visibleColumns.length + (enableRowSelection ? 1 : 0)}
                  className="h-[300px]"
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
                      isSelected && "bg-muted/50",
                      (rowHref || onRowClick) && "cursor-pointer"
                    )}
                    onClick={() => {
                      if (onRowClick) onRowClick(row);
                      else if (rowHref) router.push(rowHref(row));
                    }}
                  >
                    {enableRowSelection && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(rowId)}
                          aria-label={`Select row ${rowId}`}
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map((col) => (
                      <TableCell key={col.id} className={col.className}>
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
      </Card>

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
