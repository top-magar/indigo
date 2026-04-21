"use client";

import { useState, useRef, useCallback } from "react";
import { MIcon } from "../../ui/m-icon";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { El } from "../../core/types";
import { cn } from "@/lib/utils";
import { uploadEditorAsset } from "../../lib/upload";
import { getProjectPages } from "../../lib/queries";
import { useEditor } from "../../core/provider";
import { toast } from "sonner";

// ─── Link Picker (Popover-based) ────────────────────────

function LinkPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { pageId } = useEditor();
  const [pages, setPages] = useState<{ name: string; slug: string; isHomepage: boolean | null }[]>([]);
  const [tab, setTab] = useState<'url' | 'page' | 'email' | 'phone'>('url');

  const loadPages = async () => {
    const r = await getProjectPages(pageId);
    setPages(r.map(p => ({ name: p.name, slug: p.slug, isHomepage: p.isHomepage })));
  };

  return (
    <Popover onOpenChange={(open) => { if (open) loadPages(); }}>
      <PopoverTrigger asChild>
        <button className="shrink-0 size-7 rounded-md border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <MIcon name="link" size={13} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        {/* Tabs */}
        <div className="flex border-b">
          {([['url', 'URL'], ['page', 'Page'], ['email', 'Email'], ['phone', 'Phone']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={cn("flex-1 py-2 text-[10px] font-medium transition-colors", tab === id ? "text-foreground border-b-2 border-primary" : "text-muted-foreground/70 hover:text-foreground")}>
              {label}
            </button>
          ))}
        </div>
        <div className="p-2.5">
          {tab === 'url' && (
            <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] font-mono" placeholder="https://..." autoFocus />
          )}
          {tab === 'page' && (
            <div className="space-y-0.5 max-h-40 overflow-y-auto">
              {pages.map(p => (
                <button key={p.slug} onClick={() => onChange(`#page:${p.slug}`)}
                  className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-[11px] transition-colors", value === `#page:${p.slug}` ? "bg-primary/10 text-primary" : "hover:bg-muted")}>
                  <MIcon name={p.isHomepage ? "home" : "description"} size={11} className="text-muted-foreground/40" />
                  <span className="flex-1 text-left truncate">{p.name}</span>
                </button>
              ))}
            </div>
          )}
          {tab === 'email' && (
            <Input value={value.replace('mailto:', '')} onChange={(e) => onChange(`mailto:${e.target.value}`)} className="h-7 text-[11px]" placeholder="hello@example.com" autoFocus />
          )}
          {tab === 'phone' && (
            <Input value={value.replace('tel:', '')} onChange={(e) => onChange(`tel:${e.target.value}`)} className="h-7 text-[11px]" placeholder="+1 555 123 4567" autoFocus />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Image Field (upload + preview + alt) ───────────────

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await uploadEditorAsset(fd);
    setUploading(false);
    if ('url' in res) onChange(res.url);
    else toast.error('error' in res ? res.error : 'Upload failed');
  };

  return (
    <div className="space-y-1.5">
      {value ? (
        <div className="relative group rounded-lg border border-sidebar-border overflow-hidden">
          <img src={value} alt="" className="w-full h-28 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button onClick={() => ref.current?.click()} className="size-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <MIcon name="cloud_upload" size={14} />
            </button>
            <button onClick={() => onChange('')} className="size-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-red-500/50 transition-colors">
              <MIcon name="delete" size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
          onClick={() => ref.current?.click()}
          className={cn("flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6 cursor-pointer transition-colors",
            dragOver ? "border-primary bg-primary/5" : "border-sidebar-border/50 hover:border-primary/30 hover:bg-muted/30",
            uploading && "opacity-50 pointer-events-none"
          )}>
          <MIcon name={uploading ? "hourglass_empty" : "cloud_upload"} size={20} className={cn("text-muted-foreground/20", uploading && "animate-spin")} />
          <p className="text-[10px] text-muted-foreground/40">{uploading ? "Uploading..." : "Drop image or click to upload"}</p>
        </div>
      )}
      <Input ref={ref as unknown as React.Ref<HTMLInputElement>} type="file" accept="image/*,video/mp4" className="hidden"
        onChange={(e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleUpload(f); }} />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[10px] font-mono text-muted-foreground" placeholder="or paste URL..." />
    </div>
  );
}

// ─── Rich Text Toolbar ──────────────────────────────────

function RichTextField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 pb-1">
        {[
          { icon: 'format_bold', wrap: ['**', '**'], tip: 'Bold' },
          { icon: 'format_italic', wrap: ['_', '_'], tip: 'Italic' },
          { icon: 'format_underlined', wrap: ['<u>', '</u>'], tip: 'Underline' },
        ].map(({ icon, tip }) => (
          <button key={icon} className="size-6 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-colors" title={tip}>
            <MIcon name={icon} size={13} />
          </button>
        ))}
        <div className="w-px h-3 bg-sidebar-border/50 mx-0.5" />
        <button className="size-6 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-colors" title="Clear formatting">
          <MIcon name="format_clear" size={13} />
        </button>
      </div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-sidebar-border bg-sidebar px-2.5 py-2 text-[11px] leading-relaxed outline-none resize-y focus:border-primary min-h-[72px] transition-colors" rows={3} />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/20">{value.split(/\s+/).filter(Boolean).length} words</span>
        <span className="text-[10px] text-muted-foreground/20 tabular-nums">{value.length}</span>
      </div>
    </div>
  );
}

// ─── Items Editor (Accordion/Tabs) ──────────────────────

function ItemsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  let items: { title: string; body: string }[] = [];
  try { items = JSON.parse(value || '[]'); } catch { /* bad JSON */ }
  const update = (newItems: { title: string; body: string }[]) => onChange(JSON.stringify(newItems));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const n = [...items];
    const [moved] = n.splice(from, 1);
    n.splice(to, 0, moved);
    update(n);
  };

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-sidebar-border/50 overflow-hidden bg-sidebar/30">
          <div className="flex items-center gap-1 px-2 py-1 bg-sidebar-accent/20 border-b border-sidebar-border/30">
            <div className="flex flex-col">
              <button onClick={() => move(i, i - 1)} disabled={i === 0} className="text-muted-foreground/20 hover:text-foreground disabled:opacity-20 transition-colors"><MIcon name="expand_less" size={10} /></button>
              <button onClick={() => move(i, i + 1)} disabled={i === items.length - 1} className="text-muted-foreground/20 hover:text-foreground disabled:opacity-20 transition-colors"><MIcon name="expand_more" size={10} /></button>
            </div>
            <Input value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; update(n); }}
              className="h-5 text-[11px] font-medium bg-transparent border-0 shadow-none focus-visible:ring-0 px-0 flex-1" placeholder="Title" />
            <button onClick={() => update(items.filter((_, j) => j !== i))} className="text-muted-foreground/20 hover:text-destructive transition-colors"><MIcon name="close" size={10} /></button>
          </div>
          <div className="px-2 py-1.5">
            <textarea value={item.body} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], body: e.target.value }; update(n); }}
              className="w-full bg-transparent text-[10px] leading-relaxed outline-none resize-none min-h-[36px] text-muted-foreground placeholder:text-muted-foreground/20" placeholder="Content..." />
          </div>
        </div>
      ))}
      <button onClick={() => update([...items, { title: '', body: '' }])}
        className="flex items-center gap-2 w-full rounded-lg border border-dashed border-sidebar-border/30 px-2 py-2 text-[10px] text-muted-foreground/40 hover:text-foreground hover:border-primary/30 hover:bg-muted/20 transition-all">
        <MIcon name="add" size={12} /> Add item
      </button>
    </div>
  );
}

// ─── Field Type Detection ───────────────────────────────

type FieldType = 'text' | 'richtext' | 'url' | 'image' | 'code' | 'date' | 'number' | 'csv' | 'items';

function detectFieldType(key: string, val: string): FieldType {
  if (key === 'src') return 'image';
  if (key === 'href') return 'url';
  if (key === 'innerText' && val.length > 60) return 'richtext';
  if (key === 'innerText') return 'text';
  if (key === 'code') return 'code';
  if (key === 'targetDate') return 'date';
  if (key === 'zoom' || key === 'rating' || key === 'reviews') return 'number';
  if (key === 'images' || key === 'platforms' || key === 'links') return 'csv';
  if (key === 'items') return 'items';
  return 'text';
}

const fieldMeta: Record<string, { icon: string; label: string }> = {
  innerText: { icon: 'text_fields', label: 'Text' },
  src: { icon: 'image', label: 'Image' },
  href: { icon: 'link', label: 'Link' },
  alt: { icon: 'label', label: 'Alt text' },
  code: { icon: 'code', label: 'Code' },
  address: { icon: 'location_on', label: 'Address' },
  zoom: { icon: 'zoom_in', label: 'Zoom' },
  brand: { icon: 'storefront', label: 'Brand' },
  links: { icon: 'menu', label: 'Links' },
  platforms: { icon: 'share', label: 'Platforms' },
  images: { icon: 'photo_library', label: 'Images' },
  items: { icon: 'list', label: 'Items' },
  targetDate: { icon: 'schedule', label: 'Date' },
  rating: { icon: 'star', label: 'Rating' },
  reviews: { icon: 'reviews', label: 'Reviews' },
};

// ─── Content Field ──────────────────────────────────────

function ContentField({ fieldKey, value, onChange }: { fieldKey: string; value: string; onChange: (v: string) => void }) {
  const type = detectFieldType(fieldKey, value);
  const { icon, label } = fieldMeta[fieldKey] ?? { icon: 'edit', label: fieldKey };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <MIcon name={icon} size={11} className="text-muted-foreground/20" />
        <span className="text-[10px] font-medium text-muted-foreground/70">{label}</span>
        <div className="flex-1" />
        {value && type !== 'image' && (
          <button onClick={() => onChange('')} className="text-muted-foreground/20 hover:text-destructive transition-colors"><MIcon name="close" size={9} /></button>
        )}
      </div>

      {type === 'text' && <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] bg-sidebar" />}
      {type === 'richtext' && <RichTextField value={value} onChange={onChange} />}
      {type === 'image' && <ImageField value={value} onChange={onChange} />}
      {type === 'url' && (
        <div className="flex gap-1 relative">
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] font-mono bg-sidebar flex-1" placeholder="https://..." />
          <LinkPicker value={value} onChange={onChange} />
        </div>
      )}
      {type === 'code' && (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-sidebar-border bg-[#0d1117] text-emerald-400/90 px-3 py-2 text-[10px] font-mono leading-relaxed outline-none resize-y focus:border-emerald-500/30 min-h-[80px]" rows={4} spellCheck={false} />
      )}
      {type === 'date' && <Input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] bg-sidebar" />}
      {type === 'number' && <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] bg-sidebar" step={fieldKey === 'rating' ? '0.5' : '1'} min={fieldKey === 'rating' ? '0' : undefined} max={fieldKey === 'rating' ? '5' : undefined} />}
      {type === 'csv' && (
        <div className="space-y-1.5">
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] bg-sidebar" placeholder="item1, item2, item3" />
          {value && (
            <div className="flex flex-wrap gap-1">
              {value.split(',').filter(Boolean).map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 h-5 pl-2 pr-1 rounded-full bg-primary/8 text-[9px] font-medium text-primary/70 border border-primary/10">
                  {item.trim()}
                  <button onClick={() => onChange(value.split(',').filter((_, j) => j !== i).join(','))} className="hover:text-destructive transition-colors"><MIcon name="close" size={8} /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {type === 'items' && <ItemsEditor value={value} onChange={onChange} />}
    </div>
  );
}

// ─── Main Content Tab ───────────────────────────────────

export default function ContentTab({ selected, onUpdate }: { selected: El; onUpdate: (el: El) => void }) {
  const content = selected.content;
  const isContainer = Array.isArray(content);
  const entries = !isContainer ? Object.entries(content as Record<string, string>) : [];
  const [search, setSearch] = useState('');

  // Leaf element
  if (entries.length > 0) {
    const filtered = search ? entries.filter(([k]) => (fieldMeta[k]?.label || k).toLowerCase().includes(search.toLowerCase())) : entries;
    return (
      <div className="flex-1 overflow-y-auto">
        {entries.length > 3 && (
          <div className="px-3 pt-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} className="h-7 text-[10px] bg-sidebar" placeholder="Search fields..." />
          </div>
        )}
        <div className="divide-y divide-sidebar-border/20">
          {filtered.map(([key, val]) => (
            <div key={key} className="px-3 py-3">
              <ContentField fieldKey={key} value={val}
                onChange={(v) => onUpdate({ ...selected, content: { ...(content as Record<string, string>), [key]: v } })} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Container — flatten descendants
  if (isContainer) {
    const groups: { el: El; fields: [string, string][] }[] = [];
    const collect = (els: El[]) => {
      for (const el of els) {
        if (Array.isArray(el.content)) collect(el.content);
        else if (el.content && Object.keys(el.content).length > 0) {
          groups.push({ el, fields: Object.entries(el.content as Record<string, string>) });
        }
      }
    };
    collect(content as El[]);

    if (groups.length === 0) return <EmptyState icon="dashboard_customize" text="Empty container" sub="Add elements to edit their content" />;

    const filtered = search ? groups.filter(g => g.el.name.toLowerCase().includes(search.toLowerCase()) || g.fields.some(([k]) => (fieldMeta[k]?.label || k).toLowerCase().includes(search.toLowerCase()))) : groups;

    return (
      <div className="flex-1 overflow-y-auto">
        {groups.length > 4 && (
          <div className="px-3 pt-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} className="h-7 text-[10px] bg-sidebar" placeholder="Search content..." />
          </div>
        )}
        {filtered.map(({ el, fields }) => {
          const leafContent = el.content as Record<string, string>;
          return (
            <div key={el.id} className="border-b border-sidebar-border/20">
              <div className="px-3 pt-3 pb-1">
                <p className="text-[9px] font-semibold text-muted-foreground/20 uppercase tracking-wider">{el.name}</p>
              </div>
              <div className="px-3 pb-3 space-y-2.5">
                {fields.map(([key, value]) => (
                  <ContentField key={key} fieldKey={key} value={value}
                    onChange={(v) => onUpdate({ ...el, content: { ...leafContent, [key]: v } })} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return <EmptyState icon="block" text="No editable content" sub="Use the Design tab to style this element" />;
}

function EmptyState({ icon, text, sub }: { icon: string; text: string; sub: string }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted/30">
          <MIcon name={icon} size={18} className="text-muted-foreground/20" />
        </div>
        <p className="text-[11px] font-medium text-muted-foreground/40">{text}</p>
        <p className="text-[9px] text-muted-foreground/20 mt-1">{sub}</p>
      </div>
    </div>
  );
}
