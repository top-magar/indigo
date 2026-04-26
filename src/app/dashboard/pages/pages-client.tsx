"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, FileText, Home, Eye, MoreHorizontal,
  Pencil, Globe, Trash2, Type, ExternalLink, Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirmDelete } from "@/hooks/use-confirm-dialog";
import { deletePage, renamePage } from "./actions";
import type { EditorPage } from "@/db/schema/editor-pages";

type Site = { id: string; name: string; published: boolean | null; slug: string | null };

export function PagesClient({ site, pages, tenantSlug }: { site: Site; pages: EditorPage[]; tenantSlug: string }) {
  const [query, setQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [, startTransition] = useTransition();
  const confirmDelete = useConfirmDelete();

  const filtered = query
    ? pages.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.slug.toLowerCase().includes(query.toLowerCase())
      )
    : pages;

  const handleDelete = async (page: EditorPage) => {
    if (!(await confirmDelete(page.name, "page"))) return;
    await deletePage(page.id);
    router.refresh();
  };

  const startRename = (page: EditorPage) => {
    setRenamingId(page.id);
    setRenameValue(page.name);
    setTimeout(() => renameRef.current?.select(), 0);
  };

  const commitRename = (id: string) => {
    const trimmed = renameValue.trim();
    setRenamingId(null);
    if (!trimmed) return;
    startTransition(async () => {
      await renamePage(id, trimmed);
      router.refresh();
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
        <Button variant="outline" asChild>
          <Link href={`/editor?project=${site.id}`} target="_blank">
            <Plus className="size-3.5" /> New Page
          </Link>
        </Button>
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
                        if (e.key === "Enter") commitRename(page.id);
                        if (e.key === "Escape") setRenamingId(null);
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="More actions" className="size-7 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/editor?project=${site.id}&page=${page.id}`} target="_blank">
                      <Pencil className="size-3.5" /> Edit in Editor
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => startRename(page)}>
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
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(page)}>
                        <Trash2 className="size-3.5" /> Delete
                      </DropdownMenuItem>
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
