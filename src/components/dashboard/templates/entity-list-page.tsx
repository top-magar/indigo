/**
 * EntityListPage — Reusable template for all list/index pages.
 *
 * Provides the standard layout:
 *   SectionTabs → PageHeader → StatCards → FilterBar → Content → BulkActions
 *
 * Usage:
 * ```tsx
 * <EntityListPage
 *   tabs={PRODUCT_TABS}
 *   title="Products"
 *   description="Manage your product catalog"
 *   actions={<Button>Add Product</Button>}
 *   stats={[{ label: "Total", value: 42 }]}
 * >
 *   <DataTable ... />
 * </EntityListPage>
 * ```
 */

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionTabs, type Tab } from "@/components/dashboard/section-tabs";

export interface StatItem {
  label: string;
  value: string | number;
  change?: string;
  icon?: ReactNode;
}

interface EntityListPageProps {
  tabs?: Tab[];
  title: string;
  description?: string;
  actions?: ReactNode;
  stats?: StatItem[];
  filters?: ReactNode;
  children: ReactNode;
  bulkActions?: ReactNode;
}

export function EntityListPage({
  tabs,
  title,
  description,
  actions,
  stats,
  filters,
  children,
  bulkActions,
}: EntityListPageProps) {
  return (
    <div className="space-y-3">
      {tabs && <SectionTabs tabs={tabs} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-semibold tracking-tight">{stat.value}</p>
                    {stat.change && (
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    )}
                  </div>
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filters}

      {children}

      {bulkActions}
    </div>
  );
}
