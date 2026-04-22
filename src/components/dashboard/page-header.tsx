"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  count?: number;
  actions?: ReactNode;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  filters?: ReactNode;
}

export function PageHeader({
  title,
  description,
  count,
  actions,
  search,
  filters,
}: PageHeaderProps) {
  return (
    <div className="space-y-3">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {title}
            {count !== undefined && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {count}
              </span>
            )}
          </h1>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Search + filters row */}
      {(search || filters) && (
        <div className="flex items-center gap-2">
          {search && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={search.placeholder || "Search..."}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                className="pl-8 h-8"
              />
              {search.value && (
                <Button
                  variant="ghost"
                  size="icon-sm" aria-label="Clear search"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5"
                  onClick={() => search.onChange("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          {filters}
        </div>
      )}
    </div>
  );
}
