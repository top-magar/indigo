"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Home, FileText, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditor } from "../../core/provider";
import { getProjectPages, createPage, deletePage2, updatePage } from "../../lib/queries";

interface PageItem {
  id: string;
  name: string;
  slug: string;
  isHomepage: boolean;
  published: boolean;
}

export default function PagesTab({ onPageChange }: { onPageChange: (page: { id: string; name: string; data: string | null }) => void }) {
  const { pageId, activePageId } = useEditor();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const result = await getProjectPages(pageId);
    setPages(result.map(p => ({
      id: p.id, name: p.name, slug: p.slug,
      isHomepage: p.isHomepage ?? false, published: p.published ?? false,
    })));
  }, [pageId]);

  useEffect(() => { load(); }, [load]);

  const handleSelect = async (page: PageItem) => {
    const all = await getProjectPages(pageId);
    const found = all.find(p => p.id === page.id);
    onPageChange({ id: page.id, name: page.name, data: found ? JSON.stringify(found.data) : null });
  };

  const handleCreate = async () => {
    setCreating(true);
    const name = `Page ${pages.length + 1}`;
    const page = await createPage(pageId, name);
    if (page) {
      await load();
      onPageChange({ id: page.id, name: page.name, data: null });
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (pages.length <= 1) return;
    if (!confirm("Delete this page?")) return;
    await deletePage2(id);
    await load();
    if (id === activePageId) {
      const remaining = pages.filter(p => p.id !== id);
      if (remaining[0]) handleSelect(remaining[0]);
    }
  };

  const commitRename = async () => {
    if (!editingId || !editName.trim()) { setEditingId(null); return; }
    await updatePage(editingId, { name: editName.trim() });
    setPages(pages.map(p => p.id === editingId ? { ...p, name: editName.trim(), slug: editName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') } : p));
    if (editingId === activePageId) onPageChange({ id: editingId, name: editName.trim(), data: null });
    setEditingId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {pages.map(page => (
        <button
          key={page.id}
          onClick={() => handleSelect(page)}
          className={cn(
            "flex items-center gap-2 w-full rounded-md px-2 py-2 text-xs transition-colors group mb-0.5",
            page.id === activePageId ? "bg-primary/10 text-primary" : "hover:bg-muted"
          )}
        >
          <GripVertical className="size-3 text-muted-foreground/20 shrink-0" />
          {page.isHomepage ? <Home className="size-3.5 shrink-0" /> : <FileText className="size-3.5 shrink-0" />}

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
            <span
              className="flex-1 truncate text-left"
              onDoubleClick={(e) => { e.stopPropagation(); setEditingId(page.id); setEditName(page.name); }}
            >
              {page.name}
            </span>
          )}

          <span className="text-[9px] text-muted-foreground/40 font-mono">/{page.slug}</span>

          {page.published ? (
            <Eye className="size-3 text-emerald-500/50 shrink-0" />
          ) : (
            <EyeOff className="size-3 text-muted-foreground/20 shrink-0" />
          )}

          {!page.isHomepage && (
            <Trash2
              className="size-3 shrink-0 opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:text-destructive transition-opacity"
              onClick={(e) => { e.stopPropagation(); handleDelete(page.id); }}
            />
          )}
        </button>
      ))}

      <button
        onClick={handleCreate}
        disabled={creating}
        className="flex items-center gap-2 w-full rounded-md px-2 py-2 mt-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-dashed border-transparent hover:border-border"
      >
        <Plus className="size-3.5" />
        {creating ? "Creating..." : "Add Page"}
      </button>
    </div>
  );
}
