import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { Plus, FileText, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ensureTenantSite, getTenantSitePages } from "@/features/editor/lib/site";
import { PagesClient } from "./pages-client";

export default async function PagesPage() {
  await requireUser();
  await ensureTenantSite();
  const { site, pages, tenantSlug } = await getTenantSitePages();

  if (!site) return <div className="p-6 text-sm text-muted-foreground">Something went wrong.</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight">{site.name}</h1>
            <Badge className={`text-[10px] px-1.5 py-0 ${site.published ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
              {site.published ? "Live" : "Draft"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{pages.length} page{pages.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          {site.published && site.slug && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/store/${tenantSlug}`} target="_blank" rel="noopener noreferrer">
                <Globe className="size-3.5" /> View Site
              </a>
            </Button>
          )}
          <Button size="sm" asChild>
            <Link href={`/editor?project=${site.id}`} target="_blank">
              <ExternalLink className="size-3.5" /> Open Editor
            </Link>
          </Button>
        </div>
      </div>

      {pages.length > 0 ? (
        <PagesClient site={site} pages={pages} tenantSlug={tenantSlug} />
      ) : (
        <div className="rounded-lg border p-10 text-center">
          <div className="mx-auto size-10 rounded-full bg-muted flex items-center justify-center mb-3">
            <FileText className="size-4 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">No pages yet</p>
          <p className="text-xs text-muted-foreground mb-4">Create your first page in the visual editor</p>
          <Button size="sm" asChild>
            <Link href={`/editor?project=${site.id}`} target="_blank">
              <Plus className="size-3.5" /> Create Page
            </Link>
          </Button>
        </div>
      )}

      {pages.length > 0 && (
        <Link
          href={`/editor?project=${site.id}`} target="_blank"
          className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <Plus className="size-3.5" /> Add new page in editor
        </Link>
      )}
    </div>
  );
}
