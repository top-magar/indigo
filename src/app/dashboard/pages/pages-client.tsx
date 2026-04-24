"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, FileText, Home, Eye, MoreHorizontal, Pencil, Globe, Trash2, Type } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  const confirmDelete = useConfirmDelete();

  const filtered = query
    ? pages.filter(
        (p) =>
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

  const commitRename = async (id: string) => {
    const trimmed = renameValue.trim();
    setRenamingId(null);
    if (!trimmed) return;
    await renamePage(id, trimmed);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="relative flex-1 w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search pages..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="rounded-lg border divide-y">
        {filtered.map((page) => (
          <div
            key={page.id}
            className="flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors group"
          >
            {page.isHomepage ? (
              <Home className="size-4 text-success shrink-0" />
            ) : (
              <FileText className="size-4 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`size-1.5 rounded-full shrink-0 ${page.published ? "bg-success" : "bg-muted-foreground/40"}`} />
                {renamingId === page.id ? (
                  <Input
                    ref={renameRef}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(page.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename(page.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    className="h-6 text-sm font-medium px-1 py-0"
                    autoFocus
                  />
                ) : (
                  <button
                    className="text-sm font-medium truncate text-left hover:underline"
                    onClick={() => startRename(page)}
                  >
                    {page.name}
                  </button>
                )}
                {page.isHomepage && (
                  <Badge className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">
                    Home
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground ml-3.5">
                /{page.slug}
                {page.views ? (
                  <>
                    {" · "}
                    <Eye className="size-3 inline" /> {page.views}
                  </>
                ) : null}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => startRename(page)}>
                  <Type className="size-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/editor?project=${site.id}&page=${page.id}`} target="_blank">
                    <Pencil className="size-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                {page.published && site.slug && (
                  <DropdownMenuItem asChild>
                    <a
                      href={`/store/${tenantSlug}/${page.isHomepage ? "" : page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="size-4" />
                      View
                    </a>
                  </DropdownMenuItem>
                )}
                {!page.isHomepage && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(page)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No pages match your search.
          </div>
        )}
      </div>
    </div>
  );
}
