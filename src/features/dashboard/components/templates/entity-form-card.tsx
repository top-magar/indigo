/**
 * EntityFormCard — Reusable card for form sections in detail pages.
 *
 * Replaces the repeated Card + CardHeader + CardContent pattern
 * used in product-info-card, collection-info-card, category-info-card, etc.
 *
 * Usage:
 * ```tsx
 * <EntityFormCard title="Basic Information" description="Product name and description">
 *   <Input label="Name" ... />
 *   <Textarea label="Description" ... />
 * </EntityFormCard>
 * ```
 */

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EntityFormCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function EntityFormCard({
  title,
  description,
  actions,
  children,
  className,
}: EntityFormCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
        </div>
        {actions}
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}
