"use client";

import { useRef, useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, FileText, Home, Eye, MoreHorizontal,
  Pencil, Globe, Trash2, Type, ExternalLink, Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityListPage } from "@/components/dashboard/templates";
import { DataTablePagination } from "@/components/dashboard/data-table/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/shared/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePage, renamePage, createPage } from "./actions";
import type { EditorPage } from "@/db/schema/editor-pages";

type Site = { id: string; name: string; published: boolean | null; slug: string | null };

export function PagesClient({ site, pages, tenantSlug }: { site: Site; pages: EditorPage[]; tenantSlug: string }) {
  const [query, setQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => query
    ? pages.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.slug.toLowerCase().includes(query.toLowerCase())
      )
    : pages, [pages, query]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const handleDelete = (page: EditorPage) => {
    startTransition(async () => {
      await deletePage(page.id);
      router.refresh();
      toast.success(`"${page.name}" deleted`);
    });
  };

  const [newPageName, setNewPageName] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);

  const handleNewPage = () => {
    if (!newPageName.trim()) return;
    startTransition(async () => {
      const result = await createPage(site.id, newPageName.trim());
      if (result.error) { toast.error(result.error); return; }
      toast.success("Page created");
      setNewPageName("");
      setShowNewDialog(false);
      router.refresh();
    });
  };

  const startRename = (page: EditorPage) => {
    setRenamingId(page.id);
    setRenameValue(page.name);
    setTimeout(() => {
      renameRef.current?.focus();
      renameRef.current?.select();
    }, 100);
  };

  const isCommitting = useRef(false);
  const commitRename = (id: string) => {
    if (isCommitting.current) return;
    isCommitting.current = true;
    const trimmed = renameValue.trim();
    setRenamingId(null);
    if (!trimmed || trimmed === pages.find(p => p.id === id)?.name) {
      isCommitting.current = false;
      return;
    }
    startTransition(async () => {
      await renamePage(id, trimmed);
      router.refresh();
      toast.success("Page renamed");
      isCommitting.current = false;
    });
  };

  return (
    <EntityListPage
      title="Pages"
      description={`${pages.length} page${pages.length !== 1 ? "s" : ""}`}
      actions={
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-3.5" /> New Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleNewPage(); }} className="space-y-3">
              <Input
                placeholder="Page name"
                value={newPageName}
                onChange={e => setNewPageName(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowNewDialog(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={!newPageName.trim()}>Create Page</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      }
    >

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search pages..." className="pl-9" value={query} onChange={e => { setQuery(e.target.value); setPageIndex(0); }} />
      </div>

      {/* Page list */}
      <div className={cn(isPending && "opacity-50 pointer-events-none", "transition-opacity rounded-lg border")}>
        {/* Header - desktop */}
        <div className="hidden sm:flex items-center gap-3 px-4 py-2 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
          <span className="flex-1">Page</span>
          <span className="w-20 text-center">Status</span>
          <span className="w-16 text-right">Views</span>
          <span className="w-8" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Globe} title={query ? "No pages match your search" : "No pages yet"} description={query ? "Try adjusting your search." : "Create your first page to get started."} size="sm" />
        ) : (
          <>
          {/* Desktop list */}
          <div className="hidden sm:block">
          {paginated.map(page => (
            <div key={page.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors group">
              {/* Icon */}
              <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                {page.isHomepage
                  ? <Home className="size-3.5 text-success" />
                  : <FileText className="size-3.5 text-muted-foreground" />
                }
              </div>

              {/* Name + slug */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {renamingId === page.id ? (
                    <Input
                      ref={renameRef}
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={() => commitRename(page.id)}
                      onKeyDown={e => {
                        if (e.key === "Enter") { e.currentTarget.blur(); }
                        if (e.key === "Escape") { setRenamingId(null); }
                      }}
                      className="h-6 text-sm font-medium px-1 py-0 w-48"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm font-medium truncate">{page.name}</p>
                  )}
                  {page.isHomepage && (
                    <Badge className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">Home</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">/{page.slug}</p>
              </div>

              {/* Status */}
              <div className="w-20 text-center">
                {page.published ? (
                  <Badge variant="outline" className="text-[10px] text-success border-success/30">Published</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">Draft</Badge>
                )}
              </div>

              {/* Views */}
              <div className="w-16 text-right">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {page.views ? page.views.toLocaleString() : "—"}
                </span>
              </div>

              {/* Actions */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="More actions" className="size-9 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/editor?project=${site.id}&page=${page.id}`} target="_blank">
                      <Pencil className="size-3.5" /> Edit in Editor
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {
                    setTimeout(() => startRename(page), 150);
                  }}>
                    <Type className="size-3.5" /> Rename
                  </DropdownMenuItem>
                  {page.published && tenantSlug && (
                    <DropdownMenuItem asChild>
                      <a href={`/store/${tenantSlug}/${page.isHomepage ? "" : page.slug}`} target="_blank" rel="noopener noreferrer">
                        <Globe className="size-3.5" /> View Live
                      </a>
                    </DropdownMenuItem>
                  )}
                  {!page.isHomepage && (
                    <>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={e => e.preventDefault()}>
                            <Trash2 className="size-3.5" /> Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{page.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete this page and its content. This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(page)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-2 p-2">
            {paginated.map(page => (
              <div key={page.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                    {page.isHomepage ? <Home className="size-3 text-success" /> : <FileText className="size-3 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{page.name}</p>
                    <p className="text-xs text-muted-foreground">/{page.slug}</p>
                  </div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="More actions"><MoreHorizontal className="size-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/editor?project=${site.id}&page=${page.id}`} target="_blank"><Pencil className="size-3.5" /> Edit in Editor</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => { setTimeout(() => startRename(page), 150); }}>
                        <Type className="size-3.5" /> Rename
                      </DropdownMenuItem>
                      {page.published && tenantSlug && (
                        <DropdownMenuItem asChild>
                          <a href={`/store/${tenantSlug}/${page.isHomepage ? "" : page.slug}`} target="_blank" rel="noopener noreferrer"><Globe className="size-3.5" /> View Live</a>
                        </DropdownMenuItem>
                      )}
                      {!page.isHomepage && (
                        <>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={e => e.preventDefault()}><Trash2 className="size-3.5" /> Delete</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{page.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete this page and its content. This cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(page)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {page.published ? (
                    <Badge variant="outline" className="text-[10px] text-success border-success/30">Published</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">Draft</Badge>
                  )}
                  <span className="tabular-nums">{page.views ? `${page.views.toLocaleString()} views` : "—"}</span>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>

      {filtered.length > 0 && (
        <DataTablePagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={pageCount}
          totalItems={filtered.length}
          onPageChange={setPageIndex}
          onPageSizeChange={(size) => { setPageSize(size); setPageIndex(0); }}
        />
      )}
    </EntityListPage>
  );
}
