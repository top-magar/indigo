"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Home, FileText, Trash2, GripVertical, Eye, EyeOff,
  Settings, ChevronLeft, File, Users, Mail, Briefcase,
  HelpCircle, MessageSquare, CreditCard, Image, Rocket, ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditor } from "../../core/provider";
import { useEditorStore } from "../../core/editor-store";
import {
  getProjectPages, createPage, deletePage2,
  updatePage, updatePageSeo, setHomepage,
} from "../../lib/queries";
import { pageTemplates } from "../../lib/page-templates";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

const iconMap: Record<string, LucideIcon> = {
  File, Users, Mail, Briefcase, HelpCircle,
  MessageSquare, CreditCard, Image, Rocket, ShoppingBag,
};

interface PageItem {
  id: string;
  name: string;
  slug: string;
  isHomepage: boolean;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
}

type View = "list" | "templates" | "settings";

export default function PagesTab({ onPageChange }: { onPageChange: (page: { id: string; name: string; data: string | null }) => void }) {
  const { pageId, activePageId: _initialPageId } = useEditor();
  const activePageId = useEditorStore(s => s.currentPageId) ?? _initialPageId;
  const [pages, setPages] = useState<PageItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [creating, setCreating] = useState(false);
  const [view, setView] = useState<View>("list");
  const [settingsPage, setSettingsPage] = useState<PageItem | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const load = useCallback(async () => {
    const result = await getProjectPages(pageId);
    setPages(result.map(p => ({
      id: p.id, name: p.name, slug: p.slug,
      isHomepage: p.isHomepage ?? false, published: p.published ?? false,
      seoTitle: p.seoTitle ?? "", seoDescription: p.seoDescription ?? "", ogImage: p.ogImage ?? "",
    })));
  }, [pageId]);

  useEffect(() => { load(); }, [load]);

  const handleSelect = async (page: PageItem) => {
    const all = await getProjectPages(pageId);
    const found = all.find(p => p.id === page.id);
    onPageChange({ id: page.id, name: page.name, data: found ? JSON.stringify(found.data) : null });
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    setCreating(true);
    const template = pageTemplates.find(t => t.id === templateId);
    if (!template) { setCreating(false); return; }

    const name = template.id === "blank" ? `Page ${pages.length + 1}` : template.name;
    const page = await createPage(pageId, name);
    if (page) {
      const elements = template.factory();
      if (elements.length > 0) {
        await updatePage(page.id, { data: JSON.stringify(elements) });
      }
      await load();
      onPageChange({ id: page.id, name: page.name, data: elements.length > 0 ? JSON.stringify(elements) : null });
    }
    setCreating(false);
    setView("list");
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
    const slug = editName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setPages(prev => prev.map(p => p.id === editingId ? { ...p, name: editName.trim(), slug } : p));
    // Don't call onPageChange — rename should NOT reload canvas
    setEditingId(null);
  };

  const debouncedSave = (fn: () => Promise<void>) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, 500);
  };

  const updateSettingsField = (field: keyof PageItem, value: string | boolean) => {
    if (!settingsPage) return;
    const updated = { ...settingsPage, [field]: value };
    if (field === "name" && !settingsPage.isHomepage) {
      updated.slug = (value as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
    setSettingsPage(updated);
    setPages(prev => prev.map(p => p.id === updated.id ? updated : p));

    debouncedSave(async () => {
      if (field === "name") {
        await updatePage(updated.id, { name: value as string });
      } else if (field === "seoTitle" || field === "seoDescription" || field === "ogImage") {
        await updatePageSeo(updated.id, { [field]: value as string });
      }
    });
  };

  const handleSetHomepage = async (checked: boolean) => {
    if (!settingsPage || !checked) return;
    await setHomepage(pageId, settingsPage.id);
    setSettingsPage({ ...settingsPage, isHomepage: true, slug: "" });
    await load();
  };

  // ─── Template Picker ──────────────────────────────────
  if (view === "templates") {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-2 px-2 py-2 border-b">
          <button onClick={() => setView("list")} className="p-1 rounded hover:bg-muted">
            <ChevronLeft className="size-3.5" />
          </button>
          <span className="text-[11px] font-medium">Choose a Template</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 p-2">
          {pageTemplates.map(tmpl => {
            const Icon = iconMap[tmpl.icon] ?? File;
            return (
              <button
                key={tmpl.id}
                disabled={creating}
                onClick={() => handleCreateFromTemplate(tmpl.id)}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-transparent p-3 text-center hover:bg-muted hover:border-border transition-colors"
              >
                <Icon className="size-5 text-muted-foreground" />
                <span className="text-[11px] font-medium leading-tight">{tmpl.name}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{tmpl.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Page Settings ────────────────────────────────────
  if (view === "settings" && settingsPage) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-2 px-2 py-2 border-b">
          <button onClick={() => { setView("list"); setSettingsPage(null); }} className="p-1 rounded hover:bg-muted">
            <ChevronLeft className="size-3.5" />
          </button>
          <span className="text-[11px] font-medium truncate">{settingsPage.name}</span>
        </div>
        <Tabs defaultValue="info" className="px-2 pt-2">
          <TabsList className="w-full h-7 p-0.5">
            <TabsTrigger value="info" className="text-[10px] h-6 flex-1">Info</TabsTrigger>
            <TabsTrigger value="seo" className="text-[10px] h-6 flex-1">SEO</TabsTrigger>
            <TabsTrigger value="social" className="text-[10px] h-6 flex-1">Social</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-3 mt-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Page Name</Label>
              <Input
                value={settingsPage.name}
                onChange={e => updateSettingsField("name", e.target.value)}
                className="h-7 text-[11px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Slug</Label>
              <div className="flex items-center h-7 rounded-md border bg-muted/50 px-2 text-[11px] text-muted-foreground font-mono">
                /{settingsPage.isHomepage ? "" : settingsPage.slug}
              </div>
            </div>
            <div className="flex items-center justify-between py-1">
              <Label className="text-[10px] text-muted-foreground">Homepage</Label>
              <Switch
                checked={settingsPage.isHomepage}
                onCheckedChange={handleSetHomepage}
                className="scale-75 origin-right"
              />
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-3 mt-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">SEO Title</Label>
              <Input
                value={settingsPage.seoTitle}
                onChange={e => updateSettingsField("seoTitle", e.target.value)}
                placeholder={settingsPage.name}
                className="h-7 text-[11px]"
              />
              <p className="text-[9px] text-muted-foreground">{settingsPage.seoTitle.length}/60</p>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Meta Description</Label>
              <Textarea
                value={settingsPage.seoDescription}
                onChange={e => updateSettingsField("seoDescription", e.target.value)}
                placeholder="Describe this page for search engines..."
                className="text-[11px] min-h-[60px] resize-none"
              />
              <p className="text-[9px] text-muted-foreground">{settingsPage.seoDescription.length}/160</p>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-3 mt-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">OG Image URL</Label>
              <Input
                value={settingsPage.ogImage}
                onChange={e => updateSettingsField("ogImage", e.target.value)}
                placeholder="https://example.com/og.png"
                className="h-7 text-[11px]"
              />
              <p className="text-[9px] text-muted-foreground">Recommended: 1200×630px</p>
            </div>
            {settingsPage.ogImage && (
              <div className="rounded-md border overflow-hidden">
                <img
                  src={settingsPage.ogImage}
                  alt="OG preview"
                  className="w-full h-auto object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // ─── Page List ────────────────────────────────────────
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
              onChange={e => setEditName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setEditingId(null); }}
              onClick={e => e.stopPropagation()}
              className="flex-1 min-w-0 h-5 bg-transparent border-b border-primary text-xs outline-none"
            />
          ) : (
            <span
              className="flex-1 truncate text-left"
              onDoubleClick={e => { e.stopPropagation(); setEditingId(page.id); setEditName(page.name); }}
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

          <Settings
            className="size-3 shrink-0 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity"
            onClick={e => { e.stopPropagation(); setSettingsPage(page); setView("settings"); }}
          />

          {!page.isHomepage && (
            <Trash2
              className="size-3 shrink-0 opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:text-destructive transition-opacity"
              onClick={e => { e.stopPropagation(); handleDelete(page.id); }}
            />
          )}
        </button>
      ))}

      <button
        onClick={() => setView("templates")}
        disabled={creating}
        className="flex items-center gap-2 w-full rounded-md px-2 py-2 mt-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-dashed border-transparent hover:border-border"
      >
        <Plus className="size-3.5" />
        {creating ? "Creating..." : "Add Page"}
      </button>
    </div>
  );
}
