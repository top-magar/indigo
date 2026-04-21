"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, FileText, Trash2, ChevronDown, Home } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getProjectPages, createPage, deletePage2, updatePage } from "../lib/queries";

interface PageItem {
  id: string;
  name: string;
  isHomepage: boolean;
}

interface PageSelectorProps {
  projectId: string;
  projectName: string;
  currentPageId: string | null;
  onPageChange: (page: { id: string; name: string; data: string | null }) => void;
}

export function PageSelector({ projectId, projectName, currentPageId, onPageChange }: PageSelectorProps) {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const load = useCallback(async () => {
    const result = await getProjectPages(projectId);
    setPages(result.map(p => ({ id: p.id, name: p.name, isHomepage: p.isHomepage ?? false })));
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const activeId = currentPageId || pages.find(p => p.isHomepage)?.id || pages[0]?.id;
  const current = pages.find(p => p.id === activeId);

  const handleSelect = async (page: PageItem) => {
    const all = await getProjectPages(projectId);
    const found = all.find(p => p.id === page.id);
    onPageChange({
      id: page.id,
      name: page.name,
      data: found ? JSON.stringify(found.data) : null,
    });
    setOpen(false);
  };

  const handleCreate = async () => {
    setCreating(true);
    const name = `Page ${pages.length + 1}`;
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
    if (pages.length <= 1) return;
    if (!confirm("Delete this page?")) return;
    await deletePage2(id);
    const remaining = pages.filter(p => p.id !== id);
    setPages(remaining);
    if (id === activeId && remaining[0]) {
      const all = await getProjectPages(projectId);
      const first = all[0];
      if (first) onPageChange({ id: first.id, name: first.name, data: JSON.stringify(first.data) });
    }
  };

  const commitRename = async () => {
    if (!editingId || !editName.trim()) { setEditingId(null); return; }
    await updatePage(editingId, { name: editName.trim() });
    setPages(pages.map(p => p.id === editingId ? { ...p, name: editName.trim() } : p));
    if (editingId === activeId) onPageChange({ id: editingId, name: editName.trim(), data: null });
    setEditingId(null);
  };

  if (pages.length === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 h-7 px-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors max-w-[140px]">
          <FileText className="size-3.5 shrink-0" />
          <span className="truncate">{current?.name || projectName}</span>
          {pages.length > 1 && <span className="text-[9px] text-muted-foreground/50 tabular-nums">{pages.length}</span>}
          <ChevronDown className="size-3 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        <div className="max-h-60 overflow-y-auto">
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => handleSelect(page)}
              className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs transition-colors group", page.id === activeId ? "bg-primary/10 text-primary" : "hover:bg-muted")}
            >
              {page.isHomepage ? <Home className="size-3 shrink-0" /> : <FileText className="size-3 shrink-0" />}
              {editingId === page.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null); }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 min-w-0 h-5 bg-transparent border-b border-primary text-xs outline-none"
                />
              ) : (
                <span className="flex-1 truncate text-left" onDoubleClick={(e) => { e.stopPropagation(); setEditingId(page.id); setEditName(page.name); }}>{page.name}</span>
              )}
              {page.isHomepage && <span className="text-[9px] text-muted-foreground/50">Home</span>}
              {!page.isHomepage && pages.length > 1 && (
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
