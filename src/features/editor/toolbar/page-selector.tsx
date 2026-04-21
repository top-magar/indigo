"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Trash2, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getProjectPages, createPage, deletePage2 } from "../lib/queries";
import type { EditorPage } from "@/db/schema/editor-pages";

interface PageSelectorProps {
  projectId: string;
  currentPageId: string | null;
  onPageChange: (page: { id: string; name: string; data: string | null }) => void;
}

export function PageSelector({ projectId, currentPageId, onPageChange }: PageSelectorProps) {
  const [pages, setPages] = useState<EditorPage[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const p = await getProjectPages(projectId);
    setPages(p);
  };

  useEffect(() => { load(); }, [projectId]);

  const current = pages.find(p => p.id === currentPageId);

  const handleCreate = async () => {
    setCreating(true);
    const name = `Page ${pages.length + 1}`;
    const page = await createPage(projectId, name);
    if (page) {
      await load();
      onPageChange({ id: page.id, name: page.name, data: null });
      setOpen(false);
    }
    setCreating(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pages.length <= 1) return;
    if (!confirm("Delete this page?")) return;
    await deletePage2(id);
    await load();
    if (id === currentPageId && pages.length > 1) {
      const remaining = pages.filter(p => p.id !== id);
      if (remaining[0]) onPageChange({ id: remaining[0].id, name: remaining[0].name, data: JSON.stringify(remaining[0].data) });
    }
  };

  if (pages.length === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 h-7 px-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors max-w-[140px]">
          <FileText className="size-3.5 shrink-0" />
          <span className="truncate">{current?.name || "Pages"}</span>
          <ChevronDown className="size-3 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 p-1">
        <div className="max-h-60 overflow-y-auto">
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => { onPageChange({ id: page.id, name: page.name, data: JSON.stringify(page.data) }); setOpen(false); }}
              className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs transition-colors group", page.id === currentPageId ? "bg-primary/10 text-primary" : "hover:bg-muted")}
            >
              <FileText className="size-3 shrink-0" />
              <span className="flex-1 truncate text-left">{page.name}</span>
              {page.isHomepage && <span className="text-[9px] text-muted-foreground">Home</span>}
              {pages.length > 1 && (
                <Trash2 className="size-3 shrink-0 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-destructive transition-opacity" onClick={(e) => handleDelete(page.id, e)} />
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
