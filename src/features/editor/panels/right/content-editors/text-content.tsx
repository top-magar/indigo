"use client";

import { MIcon } from "../../../ui/m-icon";
import { Input } from "@/components/ui/input";
import { ImageField } from "./image-content";
import { LinkPicker } from "./link-content";

// ─── Rich Text Toolbar ──────────────────────────────────

export function RichTextField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
        className="w-full rounded-md border border-sidebar-border bg-sidebar px-2.5 py-2 text-xs leading-relaxed outline-none resize-y focus:border-primary min-h-[72px] transition-colors" rows={3} />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/40">{value.split(/\s+/).filter(Boolean).length} words</span>
        <span className="text-[10px] text-muted-foreground/40 tabular-nums">{value.length}</span>
      </div>
    </div>
  );
}

// ─── Items Editor (Accordion/Tabs) ──────────────────────

export function ItemsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-sidebar-border/50 overflow-hidden bg-sidebar/30">
          <div className="flex items-center gap-1 px-2 py-1 bg-sidebar-accent/20 border-b border-sidebar-border/30">
            <div className="flex flex-col">
              <button onClick={() => move(i, i - 1)} disabled={i === 0} className="text-muted-foreground/40 hover:text-foreground disabled:opacity-20 transition-colors"><MIcon name="expand_less" size={10} /></button>
              <button onClick={() => move(i, i + 1)} disabled={i === items.length - 1} className="text-muted-foreground/40 hover:text-foreground disabled:opacity-20 transition-colors"><MIcon name="expand_more" size={10} /></button>
            </div>
            <Input value={item.title} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; update(n); }}
              className="h-5 text-xs font-medium bg-transparent border-0 shadow-none focus-visible:ring-0 px-0 flex-1" placeholder="Title" />
            <button onClick={() => update(items.filter((_, j) => j !== i))} className="text-muted-foreground/40 hover:text-destructive transition-colors"><MIcon name="close" size={10} /></button>
          </div>
          <div className="px-2 py-1.5">
            <textarea value={item.body} onChange={(e) => { const n = [...items]; n[i] = { ...n[i], body: e.target.value }; update(n); }}
              className="w-full bg-transparent text-[10px] leading-relaxed outline-none resize-none min-h-[36px] text-muted-foreground placeholder:text-muted-foreground/40" placeholder="Content..." />
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

export const fieldMeta: Record<string, { icon: string; label: string }> = {
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

export function ContentField({ fieldKey, value, onChange }: { fieldKey: string; value: string; onChange: (v: string) => void }) {
  const type = detectFieldType(fieldKey, value);
  const { icon, label } = fieldMeta[fieldKey] ?? { icon: 'edit', label: fieldKey };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <MIcon name={icon} size={11} className="text-muted-foreground/40" />
        <span className="text-[10px] font-medium text-muted-foreground/70">{label}</span>
        <div className="flex-1" />
        {value && type !== 'image' && (
          <button onClick={() => onChange('')} className="text-muted-foreground/40 hover:text-destructive transition-colors"><MIcon name="close" size={9} /></button>
        )}
      </div>

      {type === 'text' && <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs bg-sidebar" />}
      {type === 'richtext' && <RichTextField value={value} onChange={onChange} />}
      {type === 'image' && <ImageField value={value} onChange={onChange} />}
      {type === 'url' && (
        <div className="flex gap-1 relative">
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs font-mono bg-sidebar flex-1" placeholder="https://..." />
          <LinkPicker value={value} onChange={onChange} />
        </div>
      )}
      {type === 'code' && (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-sidebar-border bg-[#0d1117] text-emerald-400/90 px-3 py-2 text-[10px] font-mono leading-relaxed outline-none resize-y focus:border-emerald-500/30 min-h-[80px]" rows={4} spellCheck={false} />
      )}
      {type === 'date' && <Input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs bg-sidebar" />}
      {type === 'number' && <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs bg-sidebar" step={fieldKey === 'rating' ? '0.5' : '1'} min={fieldKey === 'rating' ? '0' : undefined} max={fieldKey === 'rating' ? '5' : undefined} />}
      {type === 'csv' && (
        <div className="space-y-2">
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs bg-sidebar" placeholder="item1, item2, item3" />
          {value && (
            <div className="flex flex-wrap gap-1">
              {value.split(',').filter(Boolean).map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 h-5 pl-2 pr-1 rounded-full bg-primary/8 text-[10px] font-medium text-primary/70 border border-primary/10">
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
