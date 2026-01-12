"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/shared/utils";
import { Spinner, LoadingDots } from "@/components/ui/geist";

// ============================================================================
// StatCardSkeleton - For dashboard stat cards
// ============================================================================

interface StatCardSkeletonProps {
  showIcon?: boolean;
  showTrend?: boolean;
  className?: string;
}

export function StatCardSkeleton({
  showIcon = true,
  showTrend = true,
  className,
}: StatCardSkeletonProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-24" />
            {showTrend && (
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            )}
          </div>
          {showIcon && <Skeleton className="h-10 w-10 rounded-2xl" />}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardGridSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// TableRowSkeleton - For data table rows
// ============================================================================

interface TableRowSkeletonProps {
  columns?: number;
  showCheckbox?: boolean;
  showImage?: boolean;
  columnWidths?: string[];
  className?: string;
}

export function TableRowSkeleton({
  columns = 5,
  showCheckbox = true,
  showImage = true,
  columnWidths,
  className,
}: TableRowSkeletonProps) {
  const effectiveColumns = columns - (showCheckbox ? 1 : 0) - (showImage ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-4 p-4 border-b last:border-0", className)}>
      {showCheckbox && <Skeleton className="h-4 w-4 rounded shrink-0" />}
      {showImage && <Skeleton className="h-10 w-10 rounded-lg shrink-0" />}
      {Array.from({ length: effectiveColumns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4 flex-1",
            columnWidths?.[i] || (i === 0 ? "max-w-[200px]" : i === effectiveColumns - 1 ? "max-w-[80px]" : "")
          )}
        />
      ))}
    </div>
  );
}

// ============================================================================
// DataTableSkeleton - Full table with header and multiple rows
// ============================================================================

interface DataTableSkeletonProps {
  rows?: number;
  columns?: number;
  showCheckbox?: boolean;
  showImage?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  className?: string;
}

export function DataTableSkeleton({
  rows = 10,
  columns = 6,
  showCheckbox = true,
  showImage = true,
  showSearch = true,
  showFilters = true,
  showPagination = true,
  className,
}: DataTableSkeletonProps) {
  const effectiveColumns = columns - (showCheckbox ? 1 : 0) - (showImage ? 1 : 0);

  return (
    <div className={cn("space-y-4", className)}>
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {showSearch && <Skeleton className="h-9 w-full sm:max-w-sm" />}
          {showFilters && (
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-[140px]" />
              <Skeleton className="h-9 w-[140px]" />
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      )}

      <Card>
        <div className="border-b bg-muted/30 p-4">
          <div className="flex items-center gap-4">
            {showCheckbox && <Skeleton className="h-4 w-4 rounded shrink-0" />}
            {showImage && <div className="w-10 shrink-0" />}
            {Array.from({ length: effectiveColumns }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  "h-4 flex-1",
                  i === 0 ? "max-w-[200px]" : i === effectiveColumns - 1 ? "max-w-[80px]" : ""
                )}
              />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton
            key={i}
            columns={columns}
            showCheckbox={showCheckbox}
            showImage={showImage}
          />
        ))}
      </Card>

      {showPagination && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TimelineSkeleton - For activity timeline
// ============================================================================

interface TimelineSkeletonProps {
  items?: number;
  showAddNote?: boolean;
  showDateGroups?: boolean;
  className?: string;
}

export function TimelineSkeleton({
  items = 5,
  showAddNote = false,
  showDateGroups = false,
  className,
}: TimelineSkeletonProps) {
  return (
    <div className={cn("relative", className)}>
      {showAddNote && (
        <div className="mb-6 space-y-2">
          <Skeleton className="h-20 w-full rounded-md" />
          <div className="flex justify-end">
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      )}
      {showDateGroups && (
        <div className="py-3">
          <Skeleton className="h-3 w-16" />
        </div>
      )}
      {Array.from({ length: items }).map((_, i) => (
        <TimelineItemSkeleton key={i} isLast={i === items - 1} />
      ))}
    </div>
  );
}

export function TimelineItemSkeleton({
  isLast = false,
  isNote = false,
  className,
}: {
  isLast?: boolean;
  isNote?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative flex gap-4 pb-6", className)}>
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
      )}
      <Skeleton className="relative z-10 h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 pt-0.5">
        {isNote ? (
          <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-10 rounded-full" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3 w-16 shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}


// ============================================================================
// OrderDetailSkeleton - For order detail panel/page
// ============================================================================

interface OrderDetailSkeletonProps {
  showTimeline?: boolean;
  showCustomer?: boolean;
  lineItems?: number;
  className?: string;
}

export function OrderDetailSkeleton({
  showTimeline = true,
  showCustomer = true,
  lineItems = 3,
  className,
}: OrderDetailSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: lineItems }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-md shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-4 w-16 ml-auto" />
                    <Skeleton className="h-3 w-12 ml-auto" />
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-14" />
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-20" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-12 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {showCustomer && (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-20" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          )}

          {showTimeline && (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-20" />
              </CardHeader>
              <CardContent>
                <TimelineSkeleton items={4} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// ProductCardSkeleton - For product grid view
// ============================================================================

interface ProductCardSkeletonProps {
  showPrice?: boolean;
  showStock?: boolean;
  aspectRatio?: "square" | "portrait" | "landscape";
  className?: string;
}

export function ProductCardSkeleton({
  showPrice = true,
  showStock = true,
  aspectRatio = "square",
  className,
}: ProductCardSkeletonProps) {
  const aspectClasses = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <Skeleton className={cn("w-full rounded-xl", aspectClasses[aspectRatio])} />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          {showPrice && <Skeleton className="h-5 w-16" />}
          {showStock && <Skeleton className="h-5 w-14 rounded-full" />}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductGridSkeleton({
  count = 8,
  columns = 4,
  className,
}: {
  count?: number;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const gridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
  };

  return (
    <div className={cn("grid gap-4", gridClasses[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}


// ============================================================================
// ChartSkeleton - For analytics charts
// ============================================================================

interface ChartSkeletonProps {
  type?: "line" | "bar" | "pie" | "area";
  showHeader?: boolean;
  showLegend?: boolean;
  height?: number;
  className?: string;
}

export function ChartSkeleton({
  type = "line",
  showHeader = true,
  showLegend = true,
  height = 300,
  className,
}: ChartSkeletonProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {showHeader && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-9 w-[180px]" />
          </div>
        </CardHeader>
      )}

      <CardContent className="pt-4">
        <div
          className="relative w-full bg-muted/30 rounded-xl overflow-hidden"
          style={{ height }}
        >
          {type === "bar" && (
            <div className="absolute inset-4 flex items-end justify-around gap-2">
              {[65, 40, 85, 55, 70, 45, 80].map((h, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          )}

          {type === "line" && (
            <div className="absolute inset-4">
              <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-6" />
                ))}
              </div>
              <div className="absolute left-10 right-0 top-0 bottom-6 flex flex-col justify-between">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-px bg-muted" />
                ))}
              </div>
              <div className="absolute left-10 right-0 bottom-0 flex justify-between">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-8" />
                ))}
              </div>
            </div>
          )}

          {type === "pie" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-48 w-48 rounded-full" />
            </div>
          )}

          {type === "area" && (
            <div className="absolute inset-4">
              <Skeleton className="h-full w-full rounded-xl opacity-50" />
            </div>
          )}
        </div>

        {showLegend && (
          <div className="flex items-center justify-center gap-6 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


// ============================================================================
// Additional Utility Skeletons
// ============================================================================

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}

export function FilterBarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-9 w-32" />
      <div className="ml-auto flex items-center gap-2">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

export function SidebarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 p-4", className)}>
      <Skeleton className="h-8 w-32 mb-6" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
      <div className="h-px bg-border my-4" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}


// ============================================================================
// LoadingOverlay - Centered loading spinner with optional message
// ============================================================================

interface LoadingOverlayProps {
  message?: string;
  size?: "small" | "default" | "large";
  className?: string;
}

export function LoadingOverlay({
  message = "Loading…",
  size = "default",
  className,
}: LoadingOverlayProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3 py-12",
      className
    )}>
      <Spinner size={size} />
      {message && (
        <p className="text-sm text-[var(--ds-gray-600)]">{message}</p>
      )}
    </div>
  );
}

// ============================================================================
// InlineLoading - For inline loading states with dots
// ============================================================================

interface InlineLoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function InlineLoading({
  text,
  size = "sm",
  className,
}: InlineLoadingProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {text && <span className="text-sm text-[var(--ds-gray-600)]">{text}</span>}
      <LoadingDots size={size} />
    </span>
  );
}

// ============================================================================
// ButtonLoading - For button loading states
// ============================================================================

interface ButtonLoadingProps {
  size?: "small" | "default" | "large";
  inverted?: boolean;
  className?: string;
}

export function ButtonLoading({
  size = "small",
  inverted = false,
  className,
}: ButtonLoadingProps) {
  return <Spinner size={size} inverted={inverted} className={className} />;
}
