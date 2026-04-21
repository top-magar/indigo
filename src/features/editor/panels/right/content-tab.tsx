"use client";

import { useState, useRef } from "react";
import { MIcon } from "../../ui/m-icon";
import { Input } from "@/components/ui/input";
import type { El } from "../../core/types";
import { cn } from "@/lib/utils";
import { uploadEditorAsset } from "../../lib/upload";
import { getProjectPages } from "../../lib/queries";
import { useEditor } from "../../core/provider";
import { toast } from "sonner";

// ─── Page Link Picker ───────────────────────────────────

function PageLinkPicker({ onSelect }: { onSelect: (url: string) => void }) {
  const { pageId } = useEditor();
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState<{ name: string; slug: string; isHomepage: boolean | null }[]>([]);

  return (
    <>
      <button onClick={async () => { const r = await getProjectPages(pageId); setPages(r.map(p => ({ name: p.name, slug: p.slug, isHomepage: p.isHomepage }))); setOpen(true); }}
        className="shrink-0 size-7 rounded-md border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Link to page">
        <MIcon name="link" size={13} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95">
          <p className="px-2 py-1 text-[9px] font-medium text-muted-foreground/50 uppercase tracking-wider">Link to page</p>
          {pages.map(p => (
            <button key={p.slug} onClick={() => { onSelect(`#page:${p.slug}`); setOpen(false); }}
              className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-[11px] hover:bg-muted transition-colors">
              <MIcon name={p.isHomepage ? "home" : "description"} size={11} className="text-muted-foreground/50" />
              <span className="flex-1 text-left truncate">{p.name}</span>
              <span className="text-[9px] text-muted-foreground/30 font-mono">/{p.slug}</span>
            </button>
          ))}
          <button onClick={() => setOpen(false)} className="w-full mt-1 pt-1 border-t text-[10px] text-muted-foreground/40 hover:text-foreground py-1 transition-colors">Cancel</button>
        </div>
      )}
    </>
  );
}

// ─── Upload Button ──────────────────────────────────────

function UploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  return (
    <>
      <input ref={ref} type="file" accept="image/*,video/mp4" className="hidden" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        const res = await uploadEditorAsset(fd);
        setUploading(false);
        if ('url' in res) onUploaded(res.url);
        else toast.error('error' in res ? res.error : 'Upload failed');
        if (ref.current) ref.current.value = '';
      }} />
      <button onClick={() => ref.current?.click()} disabled={uploading}
        className={cn("shrink-0 size-7 rounded-md border flex items-center justify-center transition-colors", uploading ? "opacity-40" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
        {uploading ? <MIcon name="hourglass_empty" size={13} className="animate-spin" /> : <MIcon name="cloud_upload" size={13} />}
      </button>
    </>
  );
}

// ─── Field Type Detection ───────────────────────────────

type FieldType = 'text' | 'textarea' | 'url' | 'code' | 'date' | 'number' | 'csv' | 'json';

function detectFieldType(key: string, val: string): FieldType {
  if (key === 'innerText' && val.length > 60) return 'textarea';
  if (key === 'innerText') return 'text';
  if (key === 'code') return 'code';
  if (key === 'src' || key === 'href') return 'url';
  if (key === 'targetDate') return 'date';
  if (key === 'zoom' || key === 'rating' || key === 'reviews') return 'number';
  if (key === 'images' || key === 'platforms' || key === 'links') return 'csv';
  if (key === 'items') return 'json';
  return 'text';
}

const fieldConfig: Record<string, { icon: string; label: string }> = {
  innerText: { icon: 'text_fields', label: 'Text' },
  src: { icon: 'image', label: 'Source' },
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
  const { icon, label } = fieldConfig[fieldKey] ?? { icon: 'edit', label: fieldKey };

  return (
    <div className="space-y-1.5">
      {/* Label row */}
      <div className="flex items-center gap-1.5">
        <MIcon name={icon} size={11} className="text-muted-foreground/30" />
        <span className="text-[10px] font-medium text-muted-foreground/60">{label}</span>
        <div className="flex-1" />
        {type === 'url' && value && (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500/50 hover:text-blue-500 transition-colors"><MIcon name="open_in_new" size={10} /></a>
        )}
        {value && (
          <button onClick={() => onChange('')} className="text-muted-foreground/20 hover:text-destructive transition-colors"><MIcon name="close" size={10} /></button>
        )}
      </div>

      {/* Text */}
      {type === 'text' && (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] bg-sidebar" />
      )}

      {/* Textarea */}
      {type === 'textarea' && (
        <div className="relative">
          <textarea value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-sidebar-border bg-sidebar px-2.5 py-2 text-[11px] leading-relaxed outline-none resize-y focus:border-primary min-h-[72px] transition-colors" rows={3} />
          <span className="absolute bottom-1.5 right-2 text-[8px] text-muted-foreground/20 tabular-nums">{value.length}</span>
        </div>
      )}

      {/* URL */}
      {type === 'url' && (
        <div className="space-y-1.5">
          <div className="flex gap-1 relative">
            <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] font-mono bg-sidebar flex-1 pr-1" placeholder="https://..." />
            {fieldKey === 'src' && <UploadButton onUploaded={onChange} />}
            {fieldKey === 'href' && <PageLinkPicker onSelect={onChange} />}
          </div>
          {fieldKey === 'src' && value && (
            <div className="rounded-lg border border-sidebar-border overflow-hidden">
              <img src={value} alt="" className="w-full h-24 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
        </div>
      )}

      {/* Code */}
      {type === 'code' && (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-sidebar-border bg-[#0d1117] text-emerald-400 px-2.5 py-2 text-[10px] font-mono leading-relaxed outline-none resize-y focus:border-primary min-h-[80px]" rows={4} spellCheck={false} />
      )}

      {/* Date */}
      {type === 'date' && (
        <Input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] bg-sidebar" />
      )}

      {/* Number */}
      {type === 'number' && (
        <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] bg-sidebar" />
      )}

      {/* CSV tags */}
      {type === 'csv' && (
        <div className="space-y-1.5">
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] bg-sidebar" placeholder="item1, item2, item3" />
          {value && (
            <div className="flex flex-wrap gap-1">
              {value.split(',').filter(Boolean).map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 h-5 pl-2 pr-1 rounded-full bg-primary/8 text-[9px] font-medium text-primary/70">
                  {item.trim()}
                  <button onClick={() => onChange(value.split(',').filter((_, j) => j !== i).join(','))} className="hover:text-destructive transition-colors rounded-full"><MIcon name="close" size={8} /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* JSON items (accordion/tabs) */}
      {type === 'json' && fieldKey === 'items' && (() => {
        let items: { title: string; body: string }[] = [];
        try { items = JSON.parse(value || '[]'); } catch { /* bad JSON */ }
        const update = (newItems: { title: string; body: string }[]) => onChange(JSON.stringify(newItems));
        return (
          <div className="space-y-1.5">
            {items.map((item, i) => (
              <div key={i} className="rounded-lg border border-sidebar-border/60 bg-sidebar/50 overflow-hidden">
                <div className="flex items-center gap-1 px-2 py-1.5 bg-sidebar-accent/30">
                  <span className="text-[9px] text-muted-foreground/30 font-mono w-4">{i + 1}</span>
                  <Input value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; update(n); }}
                    className="h-5 text-[11px] font-medium bg-transparent border-0 shadow-none focus-visible:ring-0 px-0 flex-1" placeholder="Title" />
                  <button onClick={() => update(items.filter((_, j) => j !== i))} className="text-muted-foreground/20 hover:text-destructive transition-colors"><MIcon name="close" size={10} /></button>
                </div>
                <div className="px-2 py-1.5">
                  <textarea value={item.body} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], body: e.target.value }; update(n); }}
                    className="w-full bg-transparent text-[10px] leading-relaxed outline-none resize-none min-h-[40px] text-muted-foreground" placeholder="Content..." />
                </div>
              </div>
            ))}
            <button onClick={() => update([...items, { title: '', body: '' }])}
              className="flex items-center gap-1.5 w-full rounded-lg border border-dashed border-sidebar-border/40 px-2 py-1.5 text-[10px] text-muted-foreground/40 hover:text-foreground hover:border-primary/30 transition-colors">
              <MIcon name="add" size={12} /> Add item
            </button>
          </div>
        );
      })()}

      {type === 'json' && fieldKey !== 'items' && (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-sidebar-border bg-sidebar px-2.5 py-2 text-[10px] font-mono outline-none resize-y focus:border-primary min-h-[60px]" rows={3} spellCheck={false} />
      )}
    </div>
  );
}

// ─── Main Content Tab ───────────────────────────────────

export default function ContentTab({ selected, onUpdate }: { selected: El; onUpdate: (el: El) => void }) {
  const content = selected.content;
  const isContainer = Array.isArray(content);
  const entries = !isContainer ? Object.entries(content as Record<string, string>) : [];

  // Leaf element with content fields
  if (entries.length > 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-sidebar-border/30">
          {entries.map(([key, val]) => (
            <div key={key} className="px-3 py-2.5">
              <ContentField fieldKey={key} value={val}
                onChange={(v) => onUpdate({ ...selected, content: { ...(content as Record<string, string>), [key]: v } })} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Container — flatten all descendant leaf content
  if (isContainer) {
    const leaves: { el: El }[] = [];
    const collect = (els: El[]) => {
      for (const el of els) {
        if (Array.isArray(el.content)) collect(el.content);
        else if (el.content && Object.keys(el.content).length > 0) leaves.push({ el });
      }
    };
    collect(content as El[]);

    if (leaves.length === 0) {
      return <EmptyState icon="dashboard_customize" text="Empty container" sub="Add elements to edit their content" />;
    }

    return (
      <div className="flex-1 overflow-y-auto">
        {leaves.map(({ el }) => {
          const leafContent = el.content as Record<string, string>;
          return (
            <div key={el.id} className="border-b border-sidebar-border/30">
              <div className="px-3 pt-2.5 pb-0.5">
                <p className="text-[9px] font-semibold text-muted-foreground/30 uppercase tracking-wider">{el.name}</p>
              </div>
              <div className="px-3 pb-2.5 space-y-2">
                {Object.entries(leafContent).map(([key, value]) => (
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
        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted/50">
          <MIcon name={icon} size={18} className="text-muted-foreground/20" />
        </div>
        <p className="text-[11px] font-medium text-muted-foreground/40">{text}</p>
        <p className="text-[9px] text-muted-foreground/25 mt-1">{sub}</p>
      </div>
    </div>
  );
}
