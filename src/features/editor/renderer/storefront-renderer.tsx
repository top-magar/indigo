import type { CSSProperties } from "react"
import { ThemeProvider } from "@/components/store/theme-provider"
import type { ThemeConfig } from "@/features/editor/lib/theme-utils"
import { AddToCartButton } from "@/features/store/add-to-cart-button"
import { formatPrice } from "@/shared/currency"
import type { EditorDocumentV2 } from "../core/document-v2"
import type { El } from "../core/types"

export type StorefrontProduct = {
  id: string
  name: string
  slug: string
  description?: string | null
  price: string
  compareAtPrice?: string | null
  images?: Array<{ url: string; alt?: string }> | null
}

export type StorefrontRenderContext = {
  store: { name: string; slug: string }
  currency: string
  products: StorefrontProduct[]
  collections?: Record<string, string[]>
  navigation?: Array<{ id: string; label: string; href: string }>
  cart?: { itemCount: number }
  activeProduct?: StorefrontProduct
  activeCollection?: { id: string; name: string; description?: string | null }
}

type RendererProps = {
  document: EditorDocumentV2
  context: StorefrontRenderContext
  mode?: "canvas" | "preview" | "live"
  themeConfig?: Partial<ThemeConfig> | null
}

function kebabCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function cssValue(value: unknown) {
  return String(value).replace(/[<>;}]/g, "").trim()
}

function responsiveCss(elements: El[]) {
  const rules: string[] = []
  const walk = (items: El[]) => {
    for (const element of items) {
      for (const [device, styles] of Object.entries(element.responsiveStyles ?? {})) {
        if (!styles || device === "desktop" || !/^[a-zA-Z0-9_-]+$/.test(element.id)) continue
        const width = device === "tablet" ? "1023px" : "639px"
        const declarations = Object.entries(styles)
          .filter(([, value]) => value !== undefined && value !== null)
          .map(([property, value]) => `${kebabCase(property)}:${cssValue(value)}!important`)
          .join(";")
        if (declarations) rules.push(`@media(max-width:${width}){[data-storefront-element="${element.id}"]{${declarations}}}`)
      }
      if (Array.isArray(element.content)) walk(element.content)
    }
  }
  walk(elements)
  return rules.join("")
}

function boundValue(element: El, context: StorefrontRenderContext, product?: StorefrontProduct) {
  const binding = element.binding
  if (!binding) return null
  if (binding.source === "store") {
    if (binding.field === "name") return context.store.name
    if (binding.field === "slug") return context.store.slug
    if (binding.field === "currency") return context.currency
  }
  if (binding.source === "cart" && binding.field === "itemCount") return String(context.cart?.itemCount ?? 0)
  if (binding.source === "collection") {
    if (binding.field === "name") return context.activeCollection?.name ?? null
    if (binding.field === "description") return context.activeCollection?.description ?? null
  }
  if (binding.source === "product") {
    const selected = binding.resourceId
      ? context.products.find((item) => item.id === binding.resourceId)
      : (product ?? context.activeProduct)
    if (!selected) return null
    if (binding.field === "name") return selected.name
    if (binding.field === "slug") return selected.slug
    if (binding.field === "description") return selected.description ?? ""
    if (binding.field === "price") return formatPrice(selected.price, context.currency)
    if (binding.field === "compareAtPrice") return selected.compareAtPrice ? formatPrice(selected.compareAtPrice, context.currency) : ""
    if (binding.field === "images[0]") return selected.images?.[0]?.url ?? ""
  }
  return null
}

function ProductTile({ product, context, mode }: { product: StorefrontProduct; context: StorefrontRenderContext; mode: RendererProps["mode"] }) {
  const image = product.images?.[0]
  const href = `/store/${context.store.slug}/products/${product.slug}`
  return (
    <article className="group min-w-0" data-product-id={product.id}>
      <a href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="aspect-[4/5] overflow-hidden rounded-lg bg-muted">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.url} alt={image.alt || product.name} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center px-4 text-center text-sm text-muted-foreground">No product image</div>
          )}
        </div>
        <h3 className="mt-3 text-sm font-medium text-foreground">{product.name}</h3>
        <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{formatPrice(product.price, context.currency)}</p>
      </a>
      <AddToCartButton
        productId={product.id}
        productName={product.name}
        price={Number(product.price)}
        image={image?.url}
        text={mode === "canvas" ? "Add to cart" : undefined}
        className="mt-3 h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
      />
    </article>
  )
}

import { MotionWrapper } from "../canvas/motion-wrapper"

// ... inside StorefrontRenderer ...

function Element({ element, context, mode, product }: { element: El; context: StorefrontRenderContext; mode: RendererProps["mode"]; product?: StorefrontProduct }) {
  if (element.hidden) return null
  const content = Array.isArray(element.content) ? null : element.content
  const children = Array.isArray(element.content)
    ? element.content.map((child) => <Element key={child.id} element={child} context={context} mode={mode} product={product} />)
    : null
  const value = boundValue(element, context, product)
  const text = value ?? content?.innerText ?? ""
  const style = element.styles as CSSProperties
  const common = { style, "data-storefront-element": element.id }

  let rendered: React.ReactNode = null;

  if (element.type === "__body") rendered = <div {...common}>{children}</div>
  else if (["heading", "h1"].includes(element.type)) rendered = <h1 {...common}>{text || children}</h1>
  else if (["h2", "sectionHeading"].includes(element.type)) rendered = <h2 {...common}>{text || children}</h2>
  else if (["h3"].includes(element.type)) rendered = <h3 {...common}>{text || children}</h3>
  else if (["text", "paragraph", "badge", "label"].includes(element.type)) rendered = <p {...common}>{text}</p>
  else if (element.type === "image") {
    const src = value || content?.src
    rendered = src
      // eslint-disable-next-line @next/next/no-img-element
      ? <img {...common} src={src} alt={content?.alt || element.name} />
      : <div {...common} aria-label={`${element.name}: no image selected`} />
  }
  else if (element.type === "divider") rendered = <hr {...common} />
  else if (element.type === "input") rendered = <input {...common} aria-label={content?.label || element.name} placeholder={content?.placeholder} />
  else if (element.type === "textarea") rendered = <textarea {...common} aria-label={content?.label || element.name} placeholder={content?.placeholder} />
  else if (element.type === "link") rendered = <a {...common} href={content?.href || "#"}>{text || children}</a>
  else if (element.type === "button") {
    rendered = content?.href
      ? <a {...common} href={content.href}>{text}</a>
      : <button {...common} type="button">{text}</button>
  }
  else if (element.type === "addToCart" && product) {
    rendered = <AddToCartButton productId={product.id} productName={product.name} price={Number(product.price)} image={product.images?.[0]?.url} text={text || "Add to cart"} style={style} />
  }
  else if (element.type === "productGrid" && element.repeat) {
    let productIds = element.repeat.resourceId ? context.collections?.[element.repeat.resourceId] : undefined
    if (!element.repeat.resourceId && context.activeCollection) {
      productIds = context.collections?.[context.activeCollection.id]
    }
    const repeatedProducts = productIds ? context.products.filter((item) => productIds.includes(item.id)) : context.products
    rendered = (
      <div {...common}>
        {repeatedProducts.slice(0, element.repeat.limit ?? 12).map((item) => (
          Array.isArray(element.content) && element.content.length > 0
            ? <div key={item.id}>{element.content.map((child) => <Element key={child.id} element={child} context={context} mode={mode} product={item} />)}</div>
            : <ProductTile key={item.id} product={item} context={context} mode={mode} />
        ))}
      </div>
    )
  }
  else if (element.type === "navigation") {
    rendered = <nav {...common} aria-label={element.name}>{context.navigation?.map((item) => <a key={item.id} href={item.href}>{item.label}</a>)}</nav>
  }
  else if (element.type === "video") rendered = <iframe {...common} src={content?.src} allowFullScreen />
  else if (element.type === "spacer") rendered = <div {...common} />
  else if (element.type === "quote") rendered = <blockquote {...common}>{text}</blockquote>
  else if (element.type === "list") rendered = <ul {...common} style={{ ...style, listStyleType: style.listStyleType as string || 'disc' }}>{(text || '').split('\n').map((li, i) => <li key={i}>{li}</li>)}</ul>
  else if (element.type === "code") rendered = <pre {...common}><code>{text}</code></pre>
  else if (element.type === "icon") rendered = <span {...common}>{text || '★'}</span>
  else if (element.type === "embed") rendered = <div {...common}>⚠️ HTML embeds disabled for security</div>
  else if (element.type === "socialIcons") rendered = <div {...common}>{(content?.platforms || '').split(',').map((p: string, i: number) => <a key={i} href="#" style={{ opacity: 0.7 }}>{p.trim()}</a>)}</div>
  else if (element.type === "map") rendered = <iframe {...common} src={`https://maps.google.com/maps?q=${encodeURIComponent(content?.address || '')}&z=${content?.zoom || '13'}&output=embed`} loading="lazy" />
  else if (element.type === "gallery") rendered = <div {...common}>{(content?.images || '').split(',').map((src: string, i: number) => <img key={i} src={src.trim()} alt="" style={{ width: '100%', objectFit: 'cover' }} />)}</div>
  else if (element.type === "accordion") {
    let items: { title: string; body: string }[] = [];
    try { items = JSON.parse(content?.items || '[]'); } catch { /* bad JSON */ }
    rendered = <div {...common}>{items.map((item, i) => <details key={i} style={{ borderBottom: '1px solid currentColor', opacity: 0.9 }}><summary style={{ cursor: 'pointer', padding: '12px 0', fontWeight: 500 }}>{item.title}</summary><p style={{ paddingBottom: '12px', opacity: 0.7 }}>{item.body}</p></details>)}</div>
  }
  else if (element.type === "tabs") {
    let items: { title: string; body: string }[] = [];
    try { items = JSON.parse(content?.items || '[]'); } catch { /* bad JSON */ }
    rendered = <div {...common} data-tabs={content?.items}>
      {/* Fallback to simple list if client-side JS isn't rendering it */}
      {items.map((item, i) => <div key={i}><strong>{item.title}</strong><p>{item.body}</p></div>)}
    </div>
  }
  else if (element.type === "countdown") {
    rendered = <div {...common} data-countdown={content?.targetDate}>
      {/* Fallback */}
      <div>{new Date(content?.targetDate || Date.now()).toLocaleDateString()}</div>
    </div>
  }
  else if (element.type === "starRating") {
    const rating = parseFloat(content?.rating || '5');
    const reviews = content?.reviews || '0';
    const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(rating) ? '★' : i < rating ? '★' : '☆');
    rendered = <div {...common}><span>{stars.join('')}</span><span style={{ marginLeft: 4, opacity: 0.6 }}>({reviews})</span></div>
  }
  else if (element.type === "cartButton") {
    rendered = <button {...common}>🛒 {text || 'Add to Cart'}</button>
  }
  else {
    rendered = <div {...common}>{children ?? text}</div>
  }

  if (element.animations && element.animations.preset !== 'none') {
    return <MotionWrapper animations={element.animations}>{rendered}</MotionWrapper>
  }

  return rendered;
}

export function StorefrontRenderer({ document, context, mode = "live", themeConfig }: RendererProps) {
  const css = responsiveCss(document.root)
  return (
    <ThemeProvider theme={themeConfig ?? null} className="min-h-full">
      <div data-storefront-renderer data-render-mode={mode} className="min-h-full bg-background text-foreground">
        {css ? <style>{css}</style> : null}
        {document.root.map((element) => <Element key={element.id} element={element} context={context} mode={mode} />)}
      </div>
    </ThemeProvider>
  )
}

export function isPublicationSnapshot(value: unknown): value is {
  schemaVersion: 2
  project: { id: string; name: string; slug: string | null; navConfig?: unknown; themeConfig?: unknown }
  pages: Array<{ id: string; name: string; slug: string; isHomepage: boolean | null; visible: boolean; document: EditorDocumentV2 }>
} {
  if (!value || typeof value !== "object") return false
  const snapshot = value as { schemaVersion?: unknown; pages?: unknown }
  return snapshot.schemaVersion === 2 && Array.isArray(snapshot.pages)
}
