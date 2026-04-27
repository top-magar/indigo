"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, FileText, Home, Eye, MoreHorizontal,
  Pencil, Globe, Trash2, Type, ExternalLink, Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePage, renamePage, createPage } from "./actions";
import type { EditorPage } from "@/db/schema/editor-pages";

type Site = { id: string; name: string; published: boolean | null; slug: string | null };

export function PagesClient({ site, pages, tenantSlug }: { site: Site; pages: EditorPage[]; tenantSlug: string }) {
  const [query, setQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const filtered = query
    ? pages.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.slug.toLowerCase().includes(query.toLowerCase())
      )
    : pages;

  const handleDelete = (page: EditorPage) => {
    startTransition(async () => {
      await deletePage(page.id);
      router.refresh();
    });
  };

  const [newPageName, setNewPageName] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);

  const handleNewPage = () => {
    if (!newPageName.trim()) return;
    startTransition(async () => {
      await createPage(site.id, newPageName.trim());
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
      isCommitting.current = false;
    });
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search pages..." className="pl-9" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
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
      </div>

      {/* Page list */}
      <div className="rounded-lg border">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-2 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
          <span className="flex-1">Page</span>
          <span className="w-20 text-center hidden sm:block">Status</span>
          <span className="w-16 text-right hidden sm:block">Views</span>
          <span className="w-8" />
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {query ? "No pages match your search." : "No pages yet."}
          </div>
        ) : (
          filtered.map(page => (
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
              <div className="w-20 text-center hidden sm:block">
                {page.published ? (
                  <Badge variant="outline" className="text-[10px] text-success border-success/30">Published</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">Draft</Badge>
                )}
              </div>

              {/* Views */}
              <div className="w-16 text-right hidden sm:block">
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
          ))
        )}
      </div>
    </div>
  );
}
