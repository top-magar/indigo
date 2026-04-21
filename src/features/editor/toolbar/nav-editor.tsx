"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, GripVertical, Trash2, Link2, FileText, Menu } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getNavConfig, saveNavConfig, getProjectPages, type NavItem } from "../lib/queries";

interface NavEditorProps {
  projectId: string;
}

export function NavEditor({ projectId }: NavEditorProps) {
  const [items, setItems] = useState<NavItem[]>([]);
  const [pages, setPages] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNavConfig(projectId).then(setItems);
    getProjectPages(projectId).then(p => setPages(p.map(x => ({ id: x.id, name: x.name, slug: x.slug }))));
  }, [projectId]);

  const save = useCallback(async (updated: NavItem[]) => {
    setItems(updated);
    setSaving(true);
    await saveNavConfig(projectId, updated);
    setSaving(false);
  }, [projectId]);

  const addPageLink = (pageId: string, label: string) => {
    save([...items, { id: crypto.randomUUID(), label, pageId }]);
  };

  const addCustomLink = () => {
    save([...items, { id: crypto.randomUUID(), label: "Link", href: "https://" }]);
  };

  const updateItem = (id: string, updates: Partial<NavItem>) => {
    save(items.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const removeItem = (id: string) => {
    save(items.filter(i => i.id !== id));
  };

  const autoGenerate = () => {
    const nav: NavItem[] = pages.map(p => ({ id: crypto.randomUUID(), label: p.name, pageId: p.id }));
    save(nav);
  };

  const usedPageIds = new Set(items.filter(i => i.pageId).map(i => i.pageId));
  const unusedPages = pages.filter(p => !usedPageIds.has(p.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 h-7 px-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Menu className="size-3.5" />
          <span>Nav</span>
          {items.length > 0 && <span className="text-[9px] text-muted-foreground/50 tabular-nums">{items.length}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold">Navigation</p>
          <span className={cn("text-[9px] transition-colors", saving ? "text-muted-foreground" : "text-transparent")}>Saving...</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-[11px] text-muted-foreground mb-2">No navigation items yet</p>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={autoGenerate}>
              Auto-generate from pages
            </Button>
          </div>
        ) : (
          <div className="space-y-1 mb-2 max-h-60 overflow-y-auto">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-1 group">
                <GripVertical className="size-3 text-muted-foreground/30 shrink-0" />
                {item.pageId ? <FileText className="size-3 text-muted-foreground/50 shrink-0" /> : <Link2 className="size-3 text-muted-foreground/50 shrink-0" />}
                <Input
                  value={item.label}
                  onChange={(e) => updateItem(item.id, { label: e.target.value })}
                  className="h-6 text-[11px] flex-1 min-w-0"
                />
                {item.href !== undefined && (
                  <Input
                    value={item.href}
                    onChange={(e) => updateItem(item.id, { href: e.target.value })}
                    className="h-6 text-[11px] w-24 font-mono"
                    placeholder="URL"
                  />
                )}
                <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-destructive transition-opacity">
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-2 space-y-1">
          {unusedPages.length > 0 && (
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground mb-1">Add page</p>
              {unusedPages.map(p => (
                <button key={p.id} onClick={() => addPageLink(p.id, p.name)} className="flex items-center gap-2 w-full rounded px-2 py-1 text-[11px] hover:bg-muted transition-colors">
                  <FileText className="size-3 text-muted-foreground/50" />
                  {p.name}
                </button>
              ))}
            </div>
          )}
          <button onClick={addCustomLink} className="flex items-center gap-2 w-full rounded px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Plus className="size-3" />
            Custom link
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
