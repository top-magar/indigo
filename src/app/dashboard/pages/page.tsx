import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { ExternalLink, Globe, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ensureTenantSite, getTenantSitePages } from "@/features/editor/lib/site";
import { PagesClient } from "./pages-client";

export default async function PagesPage() {
  await requireUser();
  await ensureTenantSite();
  const { site, pages, tenantSlug } = await getTenantSitePages();

  if (!site) return <div className="p-6 text-sm text-muted-foreground">Something went wrong.</div>;

  const publishedCount = pages.filter(p => p.published).length;
  const totalViews = pages.reduce((sum, p) => sum + (p.views || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Website</h1>
          <p className="text-xs text-muted-foreground">Manage your storefront pages</p>
        </div>
        <div className="flex items-center gap-2">
          {site.published && tenantSlug && (
            <Button variant="outline" asChild>
              <a href={`/store/${tenantSlug}`} target="_blank" rel="noopener noreferrer">
                <Globe className="size-3.5" /> View Site
              </a>
            </Button>
          )}
          <Button asChild>
            <Link href={`/editor?project=${site.id}`} target="_blank">
              <ExternalLink className="size-3.5" /> Open Editor
            </Link>
          </Button>
        </div>
      </div>

      {/* Site overview card */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Layout className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{site.name}</p>
              <Badge className={`text-[10px] px-1.5 py-0 ${site.published ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {site.published ? "Live" : "Draft"}
              </Badge>
            </div>
            {tenantSlug && (
              <p className="text-xs text-muted-foreground truncate">
                {process.env.NEXT_PUBLIC_APP_URL || "https://indigo.store"}/store/{tenantSlug}
              </p>
            )}
          </div>
          <div className="flex items-center gap-6 shrink-0 text-center">
            <div>
              <p className="text-lg font-semibold tabular-nums">{pages.length}</p>
              <p className="text-[10px] text-muted-foreground">Pages</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">{publishedCount}</p>
              <p className="text-[10px] text-muted-foreground">Published</p>
            </div>
            {totalViews > 0 && (
              <div>
                <p className="text-lg font-semibold tabular-nums">{totalViews.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Views</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pages list */}
      {pages.length > 0 ? (
        <PagesClient site={site} pages={pages} tenantSlug={tenantSlug} />
      ) : (
        <div className="rounded-lg border p-12 text-center">
          <div className="mx-auto size-10 rounded-full bg-muted flex items-center justify-center mb-3">
            <Layout className="size-4 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">No pages yet</p>
          <p className="text-xs text-muted-foreground mb-4">Open the visual editor to create your first page</p>
          <Button asChild>
            <Link href={`/editor?project=${site.id}`} target="_blank">
              <ExternalLink className="size-3.5" /> Open Editor
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
