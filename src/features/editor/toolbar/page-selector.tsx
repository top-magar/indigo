"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, FileText, Trash2, ChevronDown, Home } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getProjectPages, createPage, deletePage2 } from "../lib/queries";

interface PageItem {
  id: string;
  name: string;
  isHomepage?: boolean;
}

interface PageSelectorProps {
  projectId: string;
  projectName: string;
  currentPageId: string | null;
  onPageChange: (page: { id: string; name: string; data: string | null }) => void;
}

export function PageSelector({ projectId, projectName, currentPageId, onPageChange }: PageSelectorProps) {
  const [subPages, setSubPages] = useState<PageItem[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const pages = await getProjectPages(projectId);
    setSubPages(pages.map(p => ({ id: p.id, name: p.name, isHomepage: p.isHomepage ?? false })));
    setLoaded(true);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  // Build display list: project itself as "Homepage" + any sub-pages
  const allPages: PageItem[] = [
    { id: projectId, name: projectName, isHomepage: true },
    ...subPages,
  ];

  const activeId = currentPageId || projectId;
  const current = allPages.find(p => p.id === activeId);

  const handleCreate = async () => {
    setCreating(true);
    const name = `Page ${subPages.length + 1}`;
    const page = await createPage(projectId, name);
    if (page) {
      await load();
      onPageChange({ id: page.id, name: page.name, data: null });
    }
    setCreating(false);
    setOpen(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this page?")) return;
    await deletePage2(id);
    await load();
    // Switch back to homepage if deleted current
    if (id === activeId) {
      onPageChange({ id: projectId, name: projectName, data: null });
    }
  };

  const handleSelect = async (page: PageItem) => {
    if (page.id === projectId) {
      // Switching to homepage — signal with null data so editor reloads from project
      onPageChange({ id: projectId, name: projectName, data: null });
    } else {
      // Fetch sub-page data
      const pages = await getProjectPages(projectId);
      const found = pages.find(p => p.id === page.id);
      onPageChange({ id: page.id, name: page.name, data: found ? JSON.stringify(found.data) : null });
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 h-7 px-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors max-w-[140px]">
          <FileText className="size-3.5 shrink-0" />
          <span className="truncate">{current?.name || "Pages"}</span>
          {loaded && <span className="text-[9px] text-muted-foreground/50 tabular-nums">{allPages.length}</span>}
          <ChevronDown className="size-3 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        <div className="max-h-60 overflow-y-auto">
          {allPages.map(page => (
            <button
              key={page.id}
              onClick={() => handleSelect(page)}
              className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs transition-colors group", page.id === activeId ? "bg-primary/10 text-primary" : "hover:bg-muted")}
            >
              {page.isHomepage ? <Home className="size-3 shrink-0" /> : <FileText className="size-3 shrink-0" />}
              <span className="flex-1 truncate text-left">{page.name}</span>
              {page.isHomepage && <span className="text-[9px] text-muted-foreground/50">Home</span>}
              {!page.isHomepage && (
                <Trash2
                  className="size-3 shrink-0 opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:text-destructive transition-opacity"
                  onClick={(e) => handleDelete(page.id, e)}
                />
              )}
            </button>
          ))}
        </div>
        <div className="border-t mt-1 pt-1">
          <button onClick={handleCreate} disabled={creating} className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Plus className="size-3" />
            {creating ? "Creating..." : "Add Page"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
