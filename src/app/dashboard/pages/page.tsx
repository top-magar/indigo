import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { Plus, FileText, Home, Globe, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeletePageButton } from "./delete-button";
import { ensureTenantSite, getTenantSitePages } from "@/features/editor/lib/site";

export default async function PagesPage() {
  await requireUser();
  await ensureTenantSite();
  const { site, pages } = await getTenantSitePages();

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
              <a href={`/p/${site.slug}`} target="_blank" rel="noopener noreferrer">
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

      {/* Pages list */}
      {pages.length > 0 ? (
        <div className="rounded-lg border divide-y">
          {pages.map(page => (
            <div key={page.id} className="flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors group">
              {page.isHomepage ? <Home className="size-4 text-success shrink-0" /> : <FileText className="size-4 text-muted-foreground shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{page.name}</p>
                  {page.isHomepage && <Badge className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">Home</Badge>}
                  {page.published && <span className="size-1.5 rounded-full bg-success shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  /{page.slug}
                  {page.views ? <> · <Eye className="size-3 inline" /> {page.views}</> : null}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link href={`/editor?project=${site.id}&page=${page.id}`} target="_blank">Edit</Link>
                </Button>
                {!page.isHomepage && <DeletePageButton id={page.id} name={page.name} />}
              </div>
            </div>
          ))}
        </div>
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

      {/* Add page link */}
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
