import { db } from "@/infrastructure/db";
import { editorProjects } from "@/db/schema/editor-projects";
import { eq, desc } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { Plus, FileText, ExternalLink } from "lucide-react";
import { DeletePageButton } from "./delete-button";

export default async function PagesPage() {
  const user = await requireUser();
  const pages = await db.select().from(editorProjects)
    .where(eq(editorProjects.tenantId, user.tenantId))
    .orderBy(desc(editorProjects.updatedAt));

  const realPages = pages.filter(p => !p.name.startsWith("[Template]"));

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">Build and manage your storefront pages</p>
        </div>
        <Link
          href={`/editor?project=${crypto.randomUUID()}`}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} /> New Page
        </Link>
      </div>

      {realPages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText size={40} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm text-muted-foreground">No pages yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Create your first page to start building your storefront</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {realPages.map(page => (
            <div key={page.id} className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors group">
              <FileText size={18} className="text-muted-foreground/40 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{page.name}</p>
                  {page.published && <span className="shrink-0 rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[10px] font-medium">Live</span>}
                </div>
                <p className="text-xs text-muted-foreground/50 mt-0.5">
                  Updated {new Date(page.updatedAt).toLocaleDateString()} at {new Date(page.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {page.slug && page.published && <> · <a href={`/p/${page.slug}`} target="_blank" className="text-blue-500 hover:underline">/p/{page.slug}</a></>}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/editor?project=${page.id}`}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Edit <ExternalLink size={12} />
                </Link>
                <DeletePageButton id={page.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
