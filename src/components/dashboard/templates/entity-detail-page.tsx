/**
 * EntityDetailPage — Reusable template for all detail/edit pages.
 *
 * Provides the standard layout:
 *   BackLink → Header (title + status + actions) → Content grid (main + sidebar)
 *
 * Usage:
 * ```tsx
 * <EntityDetailPage
 *   backHref="/dashboard/products"
 *   backLabel="Products"
 *   title={product.name}
 *   status={<Badge>Active</Badge>}
 *   actions={<Button>Save</Button>}
 *   sidebar={<ProductOrganizationCard />}
 * >
 *   <ProductInfoCard />
 *   <ProductPricingCard />
 * </EntityDetailPage>
 * ```
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface EntityDetailPageProps {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  status?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  sidebar?: ReactNode;
}

export function EntityDetailPage({
  backHref,
  backLabel,
  title,
  subtitle,
  status,
  actions,
  children,
  sidebar,
}: EntityDetailPageProps) {
  return (
    <div className="space-y-3">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        {backLabel}
      </Link>

      {title && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {status}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {sidebar ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <div className="space-y-3">{children}</div>
          <div className="space-y-3">{sidebar}</div>
        </div>
      ) : (
        <div className="space-y-4">{children}</div>
      )}
    </div>
  );
}
