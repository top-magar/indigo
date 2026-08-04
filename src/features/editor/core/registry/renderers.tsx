'use client';

import { useState, useEffect, type ReactNode } from 'react';
import type { El } from '../types';
import { resolveStyles } from '../types';
import { useDocumentStore } from '../document-store';
import { useEditorStore } from '../editor-store';
import ElementWrapper from '../../canvas/element-wrapper';
import { MIcon } from '../../ui/m-icon';
import { registry } from './types';
import { useEditor } from '../provider';
import { formatPrice } from '@/shared/currency';
import { parseCsv, parseItems, parseNumber } from '../../lib/content-utils';
import { safeUrl } from '@/shared/utils/safe-url';
import type { CanvasRendererType } from './renderer-manifests';

// ─── Helpers ────────────────────────────────────────────────

function W({ element, children }: { element: El; children: ReactNode }) {
  const device = useEditorStore(s => s.device);
  return <ElementWrapper element={element} style={resolveStyles(element, device)}>{children}</ElementWrapper>;
}
function c(el: El) { return el.content as Record<string, string>; }

function useBoundValue(el: El) {
  const { sampleProduct, currency } = useEditor();
  const binding = el.binding;
  if (!binding) return null;
  if (binding.source === "product" && sampleProduct) {
    if (binding.field === "name") return sampleProduct.name;
    if (binding.field === "slug") return sampleProduct.slug;
    if (binding.field === "description") return sampleProduct.description ?? "";
    if (binding.field === "price") return formatPrice(sampleProduct.price, currency);
    if (binding.field === "compareAtPrice") return sampleProduct.compareAtPrice ? formatPrice(sampleProduct.compareAtPrice, currency) : "";
    if (binding.field === "images[0]") return sampleProduct.images?.[0]?.url ?? "";
  }
  return null;
}

// ─── Text (contentEditable) ─────────────────────────────────

function TextRenderer({ element }: { element: El }) {
  const selected = useEditorStore(s => s.selected);
  const isSel = selected?.id === element.id;
  const content = c(element);
  const bound = useBoundValue(element);
  const text = bound ?? content.innerText;

  return (
    <W element={element}>
      <p
        contentEditable={isSel && !bound}
        suppressContentEditableWarning
        spellCheck={false}
        className="outline-none min-h-[1em]"
        style={{ whiteSpace: 'pre-wrap', cursor: isSel && !bound ? 'text' : 'default', opacity: bound && !isSel ? 0.8 : 1 }}
        onBlur={(e) => {
          if (bound) return;
          const newText = e.currentTarget.innerText;
          if (newText !== content.innerText) {
            useDocumentStore.getState().updateElement({ ...element, content: { ...content, innerText: newText } });
          }
        }}
      >{text}</p>
    </W>
  );
}

// ─── Simple renderers ───────────────────────────────────────

function LinkRenderer({ element }: { element: El }) {
  const preview = useEditorStore(s => s.preview);
  const bound = useBoundValue(element);
  const href = safeUrl(c(element).href);
  return <W element={element}><a href={preview ? (href ?? undefined) : undefined} style={{ color: 'inherit' }}>{bound ?? (c(element).innerText || 'Link')}</a></W>;
}

function ButtonRenderer({ element }: { element: El }) {
  const preview = useEditorStore(s => s.preview);
  const bound = useBoundValue(element);
  const href = safeUrl(c(element).href);
  return <W element={element}><a href={preview ? (href ?? undefined) : undefined} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>{bound ?? (c(element).innerText || 'Button')}</a></W>;
}

function ImageRenderer({ element }: { element: El }) {
  const content = c(element);
  const bound = useBoundValue(element);
  const src = safeUrl(bound || content.src);
  return (
    <W element={element}>
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={src} alt={content.alt || element.name} className="block w-full" />
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-2 bg-muted/50 py-12 text-muted-foreground">
          <MIcon name="image" size={24} /><span className="text-xs">Add image</span>
        </div>
      )}
    </W>
  );
}

function VideoRenderer({ element }: { element: El }) {
  const src = safeUrl(c(element).src);
  return <W element={element}><iframe src={src ?? undefined} className="w-full aspect-video border-0" allowFullScreen /></W>;
}

function DividerRenderer({ element }: { element: El }) {
  return <W element={element}><hr className="border-current" /></W>;
}

function SpacerRenderer({ element }: { element: El }) {
  const preview = useEditorStore(s => s.preview);
  return <W element={element}>{!preview && <span className="text-[10px] text-muted-foreground/40 absolute inset-0 flex items-center justify-center">{parseNumber(String(element.styles.height), 48)}px</span>}</W>;
}

function QuoteRenderer({ element }: { element: El }) {
  const bound = useBoundValue(element);
  return <W element={element}><blockquote>{bound ?? c(element).innerText}</blockquote></W>;
}

function BadgeRenderer({ element }: { element: El }) {
  const bound = useBoundValue(element);
  return <W element={element}><span>{bound ?? (c(element).innerText || 'Badge')}</span></W>;
}

function ListRenderer({ element }: { element: El }) {
  const bound = useBoundValue(element);
  return <W element={element}><ul style={{ listStyleType: element.styles.listStyleType as string || 'disc' }}>{((bound || c(element).innerText) || '').split('\n').map((li, i) => <li key={i}>{li}</li>)}</ul></W>;
}

function CodeRenderer({ element }: { element: El }) {
  return <W element={element}><pre><code>{c(element).innerText}</code></pre></W>;
}

function IconRenderer({ element }: { element: El }) {
  return <W element={element}><span>{c(element).innerText || '★'}</span></W>;
}

function EmbedRenderer({ element }: { element: El }) {
  return (
    <W element={element}>
      <div className="flex items-center justify-center bg-muted/50 py-8 text-xs text-muted-foreground">
        <span>⚠️ HTML embeds disabled for security</span>
      </div>
    </W>
  );
}

function SocialIconsRenderer({ element }: { element: El }) {
  return <W element={element}>{parseCsv(c(element).platforms).map((p, i) => <a key={i} href="#" className="opacity-70 hover:opacity-100">{p}</a>)}</W>;
}

function MapRenderer({ element }: { element: El }) {
  const content = c(element);
  return <W element={element}><iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(content.address || '')}&z=${content.zoom || '13'}&output=embed`} className="w-full h-full border-0" loading="lazy" /></W>;
}

function GalleryRenderer({ element }: { element: El }) {
  /* eslint-disable @next/next/no-img-element */
  return <W element={element}>{parseCsv(c(element).images).map((src, i) => <img key={i} src={src} alt="" className="w-full object-cover" />)}</W>;
}

function AccordionRenderer({ element }: { element: El }) {
  const items = parseItems(c(element).items);
  return <W element={element}><div>{items.map((item, i) => <details key={i} className="border-b border-current/10"><summary className="cursor-pointer py-3 font-medium">{item.title}</summary><p className="pb-3 opacity-70">{item.body}</p></details>)}</div></W>;
}

function TabsRenderer({ element }: { element: El }) {
  const [active, setActive] = useState(0);
  const items = parseItems(c(element).items);
  return (
    <W element={element}>
      <div className="flex border-b border-current/10">{items.map((t, i) => <button key={i} onClick={() => setActive(i)} className={`px-4 py-2 text-sm font-medium ${i === active ? 'border-b-2 border-primary' : 'opacity-50'}`}>{t.title}</button>)}</div>
      <div className="p-4">{items[active]?.body}</div>
    </W>
  );
}

function CountdownRenderer({ element }: { element: El }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const target = new Date(c(element).targetDate || Date.now()).getTime();
  const diff = Math.max(0, target - now);
  const units = [['Days', Math.floor(diff / 86400000)], ['Hrs', Math.floor((diff % 86400000) / 3600000)], ['Min', Math.floor((diff % 3600000) / 60000)], ['Sec', Math.floor((diff % 60000) / 1000)]] as const;
  return <W element={element}><div className="flex justify-center gap-4">{units.map(([l, v]) => <div key={l} className="text-center"><div className="text-[inherit] font-[inherit]">{String(v).padStart(2, '0')}</div><div className="mt-1 text-[10px] opacity-50">{l}</div></div>)}</div></W>;
}

// ─── E-Commerce renderers ───────────────────────────────────

function StarRatingRenderer({ element }: { element: El }) {
  const content = c(element);
  const rating = parseNumber(content.rating, 5);
  const reviews = content.reviews || '0';
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(rating) ? '★' : i < rating ? '★' : '☆');
  return <W element={element}><span>{stars.join('')}</span><span style={{ marginLeft: 4, opacity: 0.6 }}>({reviews})</span></W>;
}

function CartButtonRenderer({ element }: { element: El }) {
  const bound = useBoundValue(element);
  return <W element={element}><span>🛒</span><span>{bound ?? (c(element).innerText || 'Add to Cart')}</span></W>;
}

// ─── Shared canvas renderer map ─────────────────────────────
// Explicit, typed, and audited: element defs may provide their own `render`
// (e.g. plugins, HTML embed); this map is the fallback for built-in leaves.
// Registration is strict — an unknown type key is a bug and fails loudly,
// and the registry coverage test enforces that every leaf type is rendered.

export const CANVAS_RENDERERS: Record<CanvasRendererType, (props: { element: El }) => ReactNode> = {
  text: TextRenderer, heading: TextRenderer, subheading: TextRenderer,
  link: LinkRenderer, button: ButtonRenderer,
  image: ImageRenderer, video: VideoRenderer,
  divider: DividerRenderer, spacer: SpacerRenderer,
  quote: QuoteRenderer, badge: BadgeRenderer,
  list: ListRenderer, code: CodeRenderer, icon: IconRenderer,
  socialIcons: SocialIconsRenderer,
  map: MapRenderer, gallery: GalleryRenderer,
  accordion: AccordionRenderer, tabs: TabsRenderer, countdown: CountdownRenderer,
  starRating: StarRatingRenderer, cartButton: CartButtonRenderer,
};

// Attach renderers to registry entries. Element-provided `render` wins
// (plugins, embed) — the shared map only fills gaps.
for (const [type, render] of Object.entries(CANVAS_RENDERERS)) {
  const def = registry.get(type);
  if (!def) {
    throw new Error(`[editor] Canvas renderer registered for unknown element type "${type}". Fix the CANVAS_RENDERERS map or register the element.`);
  }
  if (!def.render) def.render = render;
}
