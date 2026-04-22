/**
 * EntityListPage — Reusable template for all list/index pages.
 *
 * Layout: SectionTabs → PageHeader → FilterBar → Content → BulkActions
 */

import type { ReactNode } from "react";
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
  /** @deprecated Stats removed — use analytics page instead */
  stats?: StatItem[];
  filters?: ReactNode;
  children: ReactNode;
  bulkActions?: ReactNode;
}

export function EntityListPage({
  tabs, title, description, actions, filters, children, bulkActions,
}: EntityListPageProps) {
  return (
    <div className="space-y-3">
      {tabs && <SectionTabs tabs={tabs} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {filters}
      {children}
      {bulkActions}
    </div>
  );
}
