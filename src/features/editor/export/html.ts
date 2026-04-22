import type { El } from '../core/types';
import { getDef } from '../core/registry';

/** Escape HTML entities to prevent XSS */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function cssify(styles: Record<string, unknown>): string {
  return Object.entries(styles).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${String(v).replace(/[;"<>]/g, '')}`).join(';');
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
    else { outer[k] = v; if (k === 'padding' || k === 'paddingTop' || k === 'paddingRight' || k === 'paddingBottom' || k === 'paddingLeft' || k === 'background' || k === 'backgroundColor' || k === 'border' || k === 'borderRadius') hasVisual = true; }
  }
  return { outer, inner, needsSplit: hasLayout && hasVisual };
}

function renderEl(el: El, fonts: Set<string>): string {
  const style = cssify(el.styles as Record<string, unknown>);
  const c = el.content as Record<string, string>;
  const did = ` data-id="${el.id}"`;
  if (el.styles.fontFamily) fonts.add(String(el.styles.fontFamily).split(',')[0].trim().replace(/['"]/g, ''));

  // Check registry for custom exportHTML
  const def = getDef(el.type);
  if (def?.exportHTML) return def.exportHTML(el);

  // Built-in leaf renderers
  switch (el.type) {
    case 'text': return `<p${did} style="${style}">${esc(c.innerText || '')}</p>`;
    case 'heading': return `<h1${did} style="${style}">${esc(c.innerText || '')}</h1>`;
    case 'subheading': return `<h2${did} style="${style}">${esc(c.innerText || '')}</h2>`;
    case 'link': return `<a${did} href="${esc(c.href || '#')}" style="${style}">${esc(c.innerText || '')}</a>`;
    case 'button': return `<a${did} href="${esc(c.href || '#')}" style="${style};display:inline-block;text-decoration:none">${esc(c.innerText || '')}</a>`;
    case 'image': return `<img${did} src="${esc(c.src || '')}" alt="${esc(c.alt || '')}" style="${style}" />`;
    case 'video': return `<iframe${did} src="${esc(c.src || '')}" style="${style};border:0" allowfullscreen></iframe>`;
    case 'divider': return `<hr${did} style="${style}" />`;
    case 'spacer': return `<div${did} style="${style}"></div>`;
    case 'icon': case 'badge': return `<span${did} style="${style}">${esc(c.innerText || '')}</span>`;
    case 'quote': return `<blockquote${did} style="${style}">${esc(c.innerText || '')}</blockquote>`;
    case 'list': return `<ul${did} style="${style}">${(c.innerText || '').split('\n').map(li => `<li>${esc(li)}</li>`).join('')}</ul>`;
    case 'code': return `<pre${did} style="${style}"><code>${esc(c.innerText || '')}</code></pre>`;
    case 'embed': return ''; // embed disabled for security — raw HTML injection vector
    case 'map': return `<iframe${did} src="https://maps.google.com/maps?q=${encodeURIComponent(c.address || '')}&z=${c.zoom || '13'}&output=embed" style="${style};border:0" loading="lazy"></iframe>`;
    case 'gallery': return `<div${did} style="${style}">${(c.images || '').split(',').map(src => `<img src="${esc(src.trim())}" style="width:100%;object-fit:cover" />`).join('')}</div>`;
    case 'socialIcons': return `<div${did} style="${style}">${(c.platforms || '').split(',').map(p => `<a href="#" style="opacity:0.7">${esc(p.trim())}</a>`).join('')}</div>`;
    case 'accordion': { let items: { title: string; body: string }[] = []; try { items = JSON.parse(c.items || '[]'); } catch { /* skip */ } return `<div${did} style="${style}">${items.map(i => `<details><summary style="cursor:pointer;padding:12px 0;font-weight:600">${esc(i.title)}</summary><p style="padding:0 0 12px">${esc(i.body)}</p></details>`).join('')}</div>`; }
    case 'tabs': { let items: { title: string; body: string }[] = []; try { items = JSON.parse(c.items || '[]'); } catch { /* skip */ } return `<div${did} style="${style}">${items.map((t, i) => `<div style="padding:16px${i > 0 ? ';display:none' : ''}"><h4>${esc(t.title)}</h4><p>${esc(t.body)}</p></div>`).join('')}</div>`; }
    case 'countdown': return `<div${did} style="${style}">Countdown to ${esc(c.targetDate || '')}</div>`;
    case 'starRating': { const r = parseFloat(c.rating || '5'); return `<div${did} style="${style}">${'★'.repeat(Math.floor(r))}${'☆'.repeat(5 - Math.floor(r))} <span style="opacity:0.6">(${esc(c.reviews || '0')})</span></div>`; }
    case 'cartButton': return `<button${did} style="${style}">🛒 ${esc(c.innerText || 'Add to Cart')}</button>`;
    case 'navbar': if (Array.isArray(el.content)) { const { outer, inner, needsSplit } = splitContainerStyles(el.styles as Record<string, unknown>); const ch = el.content.map(child => renderEl(child, fonts)).join(''); return needsSplit ? `<nav${did} style="${cssify(outer)}"><div style="${cssify(inner)}">${ch}</div></nav>` : `<nav${did} style="${style}">${ch}</nav>`; } break;
    case 'header': if (Array.isArray(el.content)) { const { outer, inner, needsSplit } = splitContainerStyles(el.styles as Record<string, unknown>); const ch = el.content.map(child => renderEl(child, fonts)).join(''); return needsSplit ? `<header${did} style="${cssify(outer)}"><div style="${cssify(inner)}">${ch}</div></header>` : `<header${did} style="${style}">${ch}</header>`; } break;
    case 'footer': if (Array.isArray(el.content)) { const { outer, inner, needsSplit } = splitContainerStyles(el.styles as Record<string, unknown>); const ch = el.content.map(child => renderEl(child, fonts)).join(''); return needsSplit ? `<footer${did} style="${cssify(outer)}"><div style="${cssify(inner)}">${ch}</div></footer>` : `<footer${did} style="${style}">${ch}</footer>`; } break;
    case 'section': if (Array.isArray(el.content)) { const { outer, inner, needsSplit } = splitContainerStyles(el.styles as Record<string, unknown>); const ch = el.content.map(child => renderEl(child, fonts)).join(''); return needsSplit ? `<section${did} style="${cssify(outer)}"><div style="${cssify(inner)}">${ch}</div></section>` : `<section${did} style="${style}">${ch}</section>`; } break;
    case 'contactForm': if (Array.isArray(el.content)) return `<form${did} style="${style}">${el.content.map(child => renderEl(child, fonts)).join('')}</form>`; break;
    default: break;
  }
  // Container fallback — split visual/layout like canvas does
  if (Array.isArray(el.content)) {
    const { outer, inner, needsSplit } = splitContainerStyles(el.styles as Record<string, unknown>);
    const children = el.content.map(child => renderEl(child, fonts)).join('');
    if (needsSplit) return `<div${did} style="${cssify(outer)}"><div style="${cssify(inner)}">${children}</div></div>`;
    return `<div${did} style="${style}">${children}</div>`;
  }
  return `<div${did} style="${style}">${esc(c.innerText || '')}</div>`;
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
