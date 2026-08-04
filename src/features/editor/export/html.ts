import type { El } from '../core/types';
import { getDef } from '../core/registry';
import { parseCsv, parseItems, parseNumber } from '../lib/content-utils';
import { safeUrl } from '@/shared/utils/safe-url';
import type { ExportRendererType } from '../core/registry/renderer-manifests';

/** Escape HTML entities to prevent XSS */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function cssify(styles: Record<string, unknown>): string {
  const UNSAFE_CSS = /expression|javascript:|url\s*\(|behavior:|\\-moz\\-binding|@import|@charset/i;
  return Object.entries(styles).filter(([, v]) => v !== undefined && v !== '').filter(([, v]) => !UNSAFE_CSS.test(String(v))).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${String(v).replace(/[;\"<>{}\\]/g, '')}`).join(';');
}

const LAYOUT_KEYS = new Set(['display', 'flexDirection', 'gap', 'rowGap', 'columnGap', 'flexWrap', 'alignItems', 'justifyContent', 'justifyItems', 'gridTemplateColumns', 'gridTemplateRows']);

function splitContainerStyles(styles: Record<string, unknown>): { outer: Record<string, unknown>; inner: Record<string, unknown>; needsSplit: boolean } {
  const outer: Record<string, unknown> = {};
  const inner: Record<string, unknown> = {};
  let hasLayout = false;
  let hasVisual = false;
  for (const [k, v] of Object.entries(styles)) {
    if (v === undefined || v === '') continue;
    if (LAYOUT_KEYS.has(k)) { inner[k] = v; hasLayout = true; }
    else { outer[k] = v; if (['padding','paddingTop','paddingRight','paddingBottom','paddingLeft','background','backgroundColor','border','borderRadius'].includes(k)) hasVisual = true; }
  }
  return { outer, inner, needsSplit: hasLayout && hasVisual };
}

function containerHtml(el: El, fonts: Set<string>, did: string, tag: string, children: string): string {
  const style = cssify(el.styles as Record<string, unknown>);
  const { outer, inner, needsSplit } = splitContainerStyles(el.styles as Record<string, unknown>);
  return needsSplit
    ? `<${tag}${did} style="${cssify(outer)}"><div style="${cssify(inner)}">${children}</div></${tag}>`
    : `<${tag}${did} style="${style}">${children}</${tag}>`;
}

// ─── Per-type static export renderers ───────────────────────
// Shared with the storefront/canvas coverage test. def.exportHTML takes
// precedence when present; this map is the fallback for built-in types.

const EXPORT_RENDERERS: Record<ExportRendererType, (el: El, fonts: Set<string>) => string> = {
  text: (el, _f) => `<p data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}">${esc((el.content as Record<string,string>)?.innerText || '')}</p>`,
  heading: (el, _f) => `<h1 data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}">${esc((el.content as Record<string,string>)?.innerText || '')}</h1>`,
  subheading: (el, _f) => `<h2 data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}">${esc((el.content as Record<string,string>)?.innerText || '')}</h2>`,
  link: (el, _f) => { const href = safeUrl((el.content as Record<string,string>)?.href) ?? '#'; return `<a data-id="${el.id}" href="${esc(href)}" style="${cssify(el.styles as Record<string, unknown>)}">${esc((el.content as Record<string,string>)?.innerText || '')}</a>`; },
  button: (el, _f) => { const href = safeUrl((el.content as Record<string,string>)?.href) ?? '#'; return `<a data-id="${el.id}" href="${esc(href)}" style="${cssify(el.styles as Record<string, unknown>)};display:inline-block;text-decoration:none">${esc((el.content as Record<string,string>)?.innerText || '')}</a>`; },
  image: (el, _f) => { const src = safeUrl((el.content as Record<string,string>)?.src) ?? ''; return `<img data-id="${el.id}" src="${esc(src)}" alt="${esc((el.content as Record<string,string>)?.alt || '')}" style="${cssify(el.styles as Record<string, unknown>)}" />`; },
  video: (el, _f) => { const src = safeUrl((el.content as Record<string,string>)?.src) ?? ''; return `<iframe data-id="${el.id}" src="${esc(src)}" style="${cssify(el.styles as Record<string, unknown>)};border:0" allowfullscreen></iframe>`; },
  divider: (el, _f) => `<hr data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}" />`,
  spacer: (el, _f) => `<div data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}"></div>`,
  icon: (el, _f) => `<span data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}">${esc((el.content as Record<string,string>)?.innerText || '★')}</span>`,
  badge: (el, _f) => `<span data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}">${esc((el.content as Record<string,string>)?.innerText || '')}</span>`,
  quote: (el, _f) => `<blockquote data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}">${esc((el.content as Record<string,string>)?.innerText || '')}</blockquote>`,
  list: (el, _f) => `<ul data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}">${parseCsv((el.content as Record<string,string>)?.innerText).map(li => `<li>${esc(li)}</li>`).join('')}</ul>`,
  code: (el, _f) => `<pre data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}"><code>${esc((el.content as Record<string,string>)?.innerText || '')}</code></pre>`,
  embed: (el, _f) => `<div data-id="${el.id}" style="width:${el.styles.width || '100%'}">${esc((el.content as Record<string,string>)?.code || '')}</div>`,
  map: (el, _f) => `<iframe data-id="${el.id}" src="https://maps.google.com/maps?q=${encodeURIComponent((el.content as Record<string,string>)?.address || '')}&z=${(el.content as Record<string,string>)?.zoom || '13'}&output=embed" style="${cssify(el.styles as Record<string, unknown>)};border:0" loading="lazy"></iframe>`,
  gallery: (el, _f) => `<div data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}">${parseCsv((el.content as Record<string,string>)?.images).map(src => `<img src="${esc(src)}" style="width:100%;object-fit:cover" />`).join('')}</div>`,
  socialIcons: (el, _f) => `<div data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}">${parseCsv((el.content as Record<string,string>)?.platforms).map(p => `<a href="#" style="opacity:0.7">${esc(p)}</a>`).join('')}</div>`,
  accordion: (el, _f) => `<div data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}">${parseItems((el.content as Record<string,string>)?.items).map(i => `<details><summary style="cursor:pointer;padding:12px 0;font-weight:600">${esc(i.title)}</summary><p style="padding:0 0 12px">${esc(i.body)}</p></details>`).join('')}</div>`,
  tabs: (el, _f) => `<div data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}">${parseItems((el.content as Record<string,string>)?.items).map((t, i) => `<div style="padding:16px${i > 0 ? ';display:none' : ''}"><h4>${esc(t.title)}</h4><p>${esc(t.body)}</p></div>`).join('')}</div>`,
  countdown: (el, _f) => `<div data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}">Countdown to ${esc((el.content as Record<string,string>)?.targetDate || '')}</div>`,
  starRating: (el, _f) => { const r = parseNumber((el.content as Record<string,string>)?.rating, 5); return `<div data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}">${'★'.repeat(Math.floor(r))}${'☆'.repeat(5 - Math.floor(r))} <span style="opacity:0.6">(${esc((el.content as Record<string,string>)?.reviews || '0')})</span></div>`; },
  cartButton: (el, _f) => `<button data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}">🛒 ${esc((el.content as Record<string,string>)?.innerText || 'Add to Cart')}</button>`,
  // Container elements with semantic tags
  navbar: (el, fonts) => { if (Array.isArray(el.content)) { const ch = el.content.map(child => renderEl(child, fonts)).join(''); return containerHtml(el, fonts, ` data-id="${el.id}"`, 'nav', ch); } return ''; },
  header: (el, fonts) => { if (Array.isArray(el.content)) { const ch = el.content.map(child => renderEl(child, fonts)).join(''); return containerHtml(el, fonts, ` data-id="${el.id}"`, 'header', ch); } return ''; },
  footer: (el, fonts) => { if (Array.isArray(el.content)) { const ch = el.content.map(child => renderEl(child, fonts)).join(''); return containerHtml(el, fonts, ` data-id="${el.id}"`, 'footer', ch); } return ''; },
  section: (el, fonts) => { if (Array.isArray(el.content)) { const ch = el.content.map(child => renderEl(child, fonts)).join(''); return containerHtml(el, fonts, ` data-id="${el.id}"`, 'section', ch); } return ''; },
  contactForm: (el, fonts) => { if (Array.isArray(el.content)) return `<form data-id="${el.id}" style="${cssify(el.styles as Record<string, unknown>)}">${el.content.map(child => renderEl(child, fonts)).join('')}</form>`; return ''; },
};

/** Types that render via def.exportHTML only (they need custom output). */
const DEF_EXPORT_ONLY = new Set(["embed"]);

function renderEl(el: El, fonts: Set<string>): string {
  if (el.styles.fontFamily) fonts.add(String(el.styles.fontFamily).split(',')[0].trim().replace(/['"]/g, ''));
  const did = ` data-id="${el.id}"`;
  const style = cssify(el.styles as Record<string, unknown>);

  // Element-provided export (e.g. plugins, embed).
  const def = getDef(el.type);
  if (def?.exportHTML) return def.exportHTML(el);

  // Per-type renderer.
  const renderer = (EXPORT_RENDERERS as Record<string, ((el: El, fonts: Set<string>) => string) | undefined>)[el.type];
  if (renderer) return renderer(el, fonts);

  // Container fallback — split visual/layout like canvas does.
  if (Array.isArray(el.content)) {
    const children = el.content.map(child => renderEl(child, fonts)).join('');
    const { outer, inner, needsSplit } = splitContainerStyles(el.styles as Record<string, unknown>);
    if (needsSplit) return `<div${did} style="${cssify(outer)}"><div style="${cssify(inner)}">${children}</div></div>`;
    return `<div${did} style="${style}">${children}</div>`;
  }
  return `<div${did} style="${style}">${esc((el.content as Record<string, string>)?.innerText || '')}</div>`;
}

/** All leaf types handled by this export (for the coverage test). */
export function getExportHandledTypes(): string[] {
  return Object.keys(EXPORT_RENDERERS);
}

export function generateHTML(elements: El[], options: { title: string; description?: string; ogImage?: string }): string {
  const body = elements[0];
  if (!body) return '';
  const fonts = new Set<string>();
  const bodyHTML = renderEl(body, fonts);

  // Responsive styles
  const responsiveCSS: string[] = [];
  const collectResponsive = (el: El) => {
    if (el.responsiveStyles) {
      for (const [device, styles] of Object.entries(el.responsiveStyles)) {
        const bp = device === 'tablet' ? 768 : device === 'mobile' ? 420 : 0;
        if (bp && styles && Object.keys(styles).length) {
          responsiveCSS.push(`@media(max-width:${bp}px){[data-id="${el.id}"]{${cssify(styles as Record<string, unknown>)}}}`);
        }
      }
    }
    if (Array.isArray(el.content)) el.content.forEach(collectResponsive);
  };
  collectResponsive(body);

  const fontLinks = [...fonts].filter(f => f && f !== 'Inter' && f !== 'system-ui')
    .map(f => `<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}:wght@400;500;600;700;800&display=swap" rel="stylesheet">`).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(options.title)}</title>${options.description ? `<meta name="description" content="${esc(options.description)}">` : ''}${options.ogImage ? `<meta property="og:image" content="${esc(options.ogImage)}">` : ''}${fontLinks}<style>*{box-sizing:border-box;margin:0}img{max-width:100%;height:auto}p,h1,h2,h3,h4,li,blockquote{word-break:break-word}@media(max-width:768px){h1{font-size:clamp(28px,5vw,48px)!important}h2{font-size:clamp(22px,4vw,36px)!important}}${responsiveCSS.join('')}</style></head><body style="margin:0;font-family:Inter,system-ui,sans-serif">${bodyHTML}</body></html>`;
}

export function downloadHTML(elements: El[], options: { title: string; description?: string; ogImage?: string }) {
  const html = generateHTML(elements, options);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${options.title.replace(/\s+/g, '-').toLowerCase()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
