"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, FileText, Home, Eye, MoreHorizontal, Pencil, Globe, Trash2 } from "lucide-react";
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
import { deletePage } from "./actions";
import type { EditorPage } from "@/db/schema/editor-pages";

type Site = { id: string; name: string; published: boolean | null; slug: string | null };

export function PagesClient({ site, pages, tenantSlug }: { site: Site; pages: EditorPage[]; tenantSlug: string }) {
  const [query, setQuery] = useState("");
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
                <p className="text-sm font-medium truncate">{page.name}</p>
                {page.isHomepage && (
                  <Badge className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">
                    Home
                  </Badge>
                )}
                {page.published && (
                  <span className="size-1.5 rounded-full bg-success shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
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
