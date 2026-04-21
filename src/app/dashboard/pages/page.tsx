import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { Plus, FileText, ExternalLink, Home, Globe, Eye } from "lucide-react";
import { DeletePageButton } from "./delete-button";
import { ensureTenantSite, getTenantSitePages } from "@/features/editor/lib/site";

export default async function PagesPage() {
  await requireUser();
  await ensureTenantSite();
  const { site, pages } = await getTenantSitePages();

  if (!site) return <div className="p-6">Something went wrong.</div>;

  return (
    <div className="p-6 max-w-4xl">
      {/* Site header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{site.name}</h1>
            {site.published ? (
              <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[10px] font-medium">Live</span>
            ) : (
              <span className="rounded-full bg-amber-500/10 text-amber-600 px-2 py-0.5 text-[10px] font-medium">Draft</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{pages.length} pages · Manage your storefront</p>
        </div>
        <div className="flex items-center gap-2">
          {site.published && site.slug && (
            <a href={`/p/${site.slug}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
              <Globe size={14} /> View Site
            </a>
          )}
          <Link
            href={`/editor?project=${site.id}`} target="_blank"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ExternalLink size={14} /> Open Editor
          </Link>
        </div>
      </div>

      {/* Pages list */}
      <div className="grid gap-2">
        {pages.map(page => (
          <div key={page.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors group">
            {page.isHomepage ? <Home size={16} className="text-emerald-500 shrink-0" /> : <FileText size={16} className="text-muted-foreground/40 shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{page.name}</p>
                {page.isHomepage && <span className="text-[10px] text-muted-foreground/50">Homepage</span>}
                {page.published && <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />}
              </div>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                /{page.slug}
                {page.views ? <> · <Eye size={10} className="inline" /> {page.views}</> : null}
              </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href={`/editor?project=${site.id}&page=${page.id}`} target="_blank"
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-1 text-[11px] font-medium hover:bg-primary/20"
              >
                Edit
              </Link>
              {!page.isHomepage && <DeletePageButton id={page.id} />}
            </div>
          </div>
        ))}
      </div>

      {/* Add page */}
      <Link
        href={`/editor?project=${site.id}`} target="_blank"
        className="flex items-center gap-2 mt-3 rounded-lg border border-dashed p-3 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-muted/30 transition-colors"
      >
        <Plus size={14} /> Add new page in editor
      </Link>
    </div>
  );
}
