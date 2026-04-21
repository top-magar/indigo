"use client";

import { useState, useRef } from "react";
import { MIcon } from "../../ui/m-icon";
import { Input } from "@/components/ui/input";
import type { El } from "../../core/types";
import { cn } from "@/lib/utils";
import { uploadEditorAsset } from "../../lib/upload";
import { getProjectPages } from "../../lib/queries";
import { useEditor } from "../../core/provider";

function PageLinkPicker({ onSelect }: { onSelect: (url: string) => void }) {
  const { pageId } = useEditor();
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState<{ name: string; slug: string; isHomepage: boolean | null }[]>([]);

  const load = async () => {
    const result = await getProjectPages(pageId);
    setPages(result.map(p => ({ name: p.name, slug: p.slug, isHomepage: p.isHomepage })));
    setOpen(true);
  };

  return (
    <>
      <button onClick={load} className="shrink-0 h-7 px-2 rounded-md border text-[10px] font-medium hover:bg-muted transition-colors" title="Link to page">
        <MIcon name="link" size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-md border bg-popover p-1 shadow-md">
          {pages.map(p => (
            <button key={p.slug} onClick={() => { onSelect(`#page:${p.slug}`); setOpen(false); }}
              className="flex items-center gap-2 w-full rounded px-2 py-1.5 text-[11px] hover:bg-muted transition-colors">
              <MIcon name={p.isHomepage ? "home" : "description"} size={12} />
              {p.name}
              <span className="ml-auto text-[9px] text-muted-foreground">/{p.slug}</span>
            </button>
          ))}
          <div className="border-t mt-1 pt-1">
            <button onClick={() => setOpen(false)} className="w-full text-[10px] text-muted-foreground hover:text-foreground px-2 py-1">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}

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
        if (ref.current) ref.current.value = '';
      }} />
      <button onClick={() => ref.current?.click()} disabled={uploading} className={cn("shrink-0 h-7 px-2 rounded-md border text-[10px] font-medium transition-colors", uploading ? "opacity-50" : "hover:bg-muted")}>
        {uploading ? "..." : <MIcon name="add_photo_alternate" size={14} />}
      </button>
    </>
  );
}

// ─── Field type detection ───────────────────────────────

type FieldType = 'text' | 'textarea' | 'url' | 'code' | 'date' | 'number' | 'csv' | 'json' | 'image';

function detectFieldType(key: string, val: string): FieldType {
  if (key === 'innerText' && val.length > 60) return 'textarea';
  if (key === 'innerText') return 'text';
  if (key === 'code') return 'code';
  if (key === 'src' || key === 'href') return 'url';
  if (key === 'alt' || key === 'brand') return 'text';
  if (key === 'targetDate') return 'date';
  if (key === 'zoom') return 'number';
  if (key === 'images' || key === 'platforms' || key === 'links') return 'csv';
  if (key === 'items') return 'json';
  return 'text';
}

const fieldIcons: Record<string, string> = {
  innerText: 'text_fields', src: 'link', href: 'link', alt: 'image',
  code: 'code', address: 'location_on', zoom: 'zoom_in', brand: 'branding_watermark',
  links: 'menu', platforms: 'share', images: 'photo_library', items: 'list',
  targetDate: 'schedule',
};

const fieldLabels: Record<string, string> = {
  innerText: 'Text', src: 'Source URL', href: 'Link URL', alt: 'Alt text',
  code: 'HTML Code', address: 'Address', zoom: 'Zoom level', brand: 'Brand name',
  links: 'Nav links', platforms: 'Platforms', images: 'Image URLs', items: 'Items (JSON)',
  targetDate: 'Target date',
};

// ─── Smart Field Component ──────────────────────────────

function ContentField({ fieldKey, value, onChange }: { fieldKey: string; value: string; onChange: (v: string) => void }) {
  const type = detectFieldType(fieldKey, value);
  const icon = fieldIcons[fieldKey] ?? 'edit';
  const label = fieldLabels[fieldKey] ?? fieldKey;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <MIcon name={icon} size={12} className="text-sidebar-foreground/40" />
        <label className="text-[10px] font-medium text-sidebar-foreground/50">{label}</label>
        {type === 'url' && value && (
          <a href={value} target="_blank" rel="noopener noreferrer" className="ml-auto text-primary/60 hover:text-primary"><MIcon name="open_in_new" size={11} /></a>
        )}
        {value && (
          <button onClick={() => onChange('')} className="ml-auto text-sidebar-foreground/30 hover:text-destructive"><MIcon name="close" size={11} /></button>
        )}
      </div>

      {type === 'textarea' && (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-sidebar-border bg-sidebar p-2 text-[11px] outline-none resize-y focus:border-primary min-h-[60px]" rows={3} />
      )}

      {type === 'text' && (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px]" />
      )}

      {type === 'url' && (
        <>
          <div className="flex gap-1">
            <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] font-mono flex-1" placeholder="https://..." />
            {fieldKey === 'src' && <UploadButton onUploaded={onChange} />}
            {fieldKey === 'href' && <PageLinkPicker onSelect={onChange} />}
          </div>
          {fieldKey === 'src' && value && (
            <img src={value} alt="" className="mt-1.5 rounded-md border border-sidebar-border w-full h-20 object-cover" />
          )}
        </>
      )}

      {type === 'code' && (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-sidebar-border bg-sidebar p-2 text-[10px] font-mono outline-none resize-y focus:border-primary min-h-[80px]" rows={4} spellCheck={false} />
      )}

      {type === 'date' && (
        <Input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px]" />
      )}

      {type === 'number' && (
        <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px]" />
      )}

      {type === 'csv' && (
        <>
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px]" placeholder="item1,item2,item3" />
          <div className="flex flex-wrap gap-1 mt-1.5">
            {value.split(',').filter(Boolean).map((item, i) => (
              <span key={i} className="inline-flex items-center gap-0.5 h-5 px-1.5 rounded bg-sidebar-accent text-[9px] text-sidebar-foreground/70">
                {item.trim()}
                <button onClick={() => onChange(value.split(',').filter((_, j) => j !== i).join(','))} className="text-sidebar-foreground/30 hover:text-destructive"><MIcon name="close" size={9} /></button>
              </span>
            ))}
          </div>
        </>
      )}

      {type === 'json' && fieldKey === 'items' && (() => {
        let items: { title: string; body: string }[] = [];
        try { items = JSON.parse(value || '[]'); } catch { /* bad JSON */ }
        const update = (newItems: { title: string; body: string }[]) => onChange(JSON.stringify(newItems));
        return (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="rounded-md border border-sidebar-border p-2 space-y-1">
                <div className="flex items-center gap-1">
                  <Input value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; update(n); }} className="h-6 text-[11px] flex-1" placeholder="Title" />
                  <button onClick={() => update(items.filter((_, j) => j !== i))} className="text-muted-foreground/30 hover:text-destructive"><MIcon name="close" size={11} /></button>
                </div>
                <textarea value={item.body} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], body: e.target.value }; update(n); }} className="w-full rounded border border-sidebar-border bg-sidebar p-1.5 text-[10px] outline-none resize-none h-12 focus:border-primary" placeholder="Content" />
              </div>
            ))}
            <button onClick={() => update([...items, { title: 'New Item', body: 'Content here' }])} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              <MIcon name="add" size={12} /> Add item
            </button>
          </div>
        );
      })()}

      {type === 'json' && fieldKey !== 'items' && (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-sidebar-border bg-sidebar p-2 text-[10px] font-mono outline-none resize-y focus:border-primary min-h-[80px]" rows={4} spellCheck={false} />
      )}

      {/* Character count for text fields */}
      {(type === 'text' || type === 'textarea') && value && (
        <span className="text-[9px] text-sidebar-foreground/30 mt-0.5 block text-right">{value.length} chars</span>
      )}
    </div>
  );
}

// ─── Main Content Tab ───────────────────────────────────

export default function ContentTab({ selected, onUpdate }: { selected: El; onUpdate: (el: El) => void }) {
  const content = selected.content;
  const isContainer = Array.isArray(content);
  const entries = !isContainer ? Object.entries(content as Record<string, string>) : [];
  const hasContent = entries.length > 0;

  if (hasContent) {
    return (
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          {entries.map(([key, val]) => (
            <ContentField
              key={key}
              fieldKey={key}
              value={val}
              onChange={(v) => onUpdate({ ...selected, content: { ...(content as Record<string, string>), [key]: v } })}
            />
          ))}
        </div>
      </div>
    );
  }

  // Container — show all descendant leaf content fields
  if (isContainer) {
    const leaves: { el: El; depth: number }[] = [];
    const collect = (els: El[], depth: number) => {
      for (const el of els) {
        if (Array.isArray(el.content)) collect(el.content, depth + 1);
        else if (el.content && Object.keys(el.content).length > 0) leaves.push({ el, depth });
      }
    };
    collect(content as El[], 0);

    if (leaves.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <MIcon name="dashboard_customize" size={28} className="text-muted-foreground/15 mx-auto mb-2" />
            <p className="text-[11px] text-muted-foreground/40">Empty container</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto">
        {leaves.map(({ el }) => {
          const leafContent = el.content as Record<string, string>;
          const leafEntries = Object.entries(leafContent);
          return (
            <div key={el.id} className="border-b border-sidebar-border/50 px-3 py-2">
              <p className="text-[10px] font-medium text-muted-foreground/50 mb-1.5">{el.name}</p>
              {leafEntries.map(([key, value]) => (
                <ContentField
                  key={key}
                  fieldKey={key}
                  value={value}
                  onChange={(v) => onUpdate({ ...el, content: { ...leafContent, [key]: v } })}
                />
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  // Empty leaf
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <MIcon name="block" size={28} className="text-muted-foreground/15 mx-auto mb-2" />
        <p className="text-[11px] text-muted-foreground/40">No editable content</p>
      </div>
    </div>
  );
}
