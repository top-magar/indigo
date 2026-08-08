import type { CSSProperties, ReactNode } from "react"
import { ThemeProvider } from "@/features/store/components/theme-provider"
import type { ThemeConfig } from "@/features/editor/lib/theme-utils"
import { AddToCartButton } from "@/features/store/add-to-cart-button"
import { formatPrice } from "@/shared/currency"
import type { EditorDocumentV2 } from "../core/document-v2"
import type { El, StorefrontProduct } from "../core/types"
import { registry, type StorefrontRenderProps } from "../core/registry/types"
// Registers every element def + plugin without importing canvas client renderers.
import "../core/registry/server-bootstrap"
import { parseCsv, parseItems, parseNumber } from "../lib/content-utils"
import { safeUrl } from "@/shared/utils/safe-url"
import { MotionWrapper } from "../canvas/motion-wrapper"
import type { StorefrontRendererType } from "../core/registry/renderer-manifests"

export type { StorefrontProduct }

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

type ElementProps = { element: El; context: StorefrontRenderContext; mode: NonNullable<RendererProps["mode"]>; product?: StorefrontProduct }

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
            <img src={safeUrl(image.url) ?? ""} alt={image.alt || product.name} className="size-full object-cover" />
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

// ─── Shared helpers for renderers ───────────────────────────

const elProps = (element: El) => ({ style: element.styles as CSSProperties, "data-storefront-element": element.id })

function renderChildren(props: ElementProps): ReactNode {
  return Array.isArray(props.element.content)
    ? props.element.content.map((child) => <Element key={child.id} element={child} context={props.context} mode={props.mode} product={props.product} />)
    : null
}

function contentOf(element: El) {
  return Array.isArray(element.content) ? null : element.content
}

// ─── Per-type storefront renderers ──────────────────────────
// Single source of truth for the live storefront. Element defs (including
// plugins) may provide their own `storefrontRender` — the registry coverage
// test enforces that every registered leaf type is handled here or by a def.
// These functions are server-safe: no hooks, RSC compatible.

const STOREFRONT_RENDERERS: Record<StorefrontRendererType, (props: ElementProps) => ReactNode> = {
  __body: ({ element, ...props }) => <div {...elProps(element)}>{renderChildren({ element, ...props })}</div>,

  heading: (props) => <h1 {...elProps(props.element)}>{renderTextOrChildren(props)}</h1>,
  h1: (props) => <h1 {...elProps(props.element)}>{renderTextOrChildren(props)}</h1>,
  subheading: (props) => <h2 {...elProps(props.element)}>{renderTextOrChildren(props)}</h2>,
  h2: (props) => <h2 {...elProps(props.element)}>{renderTextOrChildren(props)}</h2>,
  sectionHeading: (props) => <h2 {...elProps(props.element)}>{renderTextOrChildren(props)}</h2>,
  h3: (props) => <h3 {...elProps(props.element)}>{renderTextOrChildren(props)}</h3>,
  text: (props) => <p {...elProps(props.element)}>{renderText(props)}</p>,
  paragraph: (props) => <p {...elProps(props.element)}>{renderText(props)}</p>,
  label: (props) => <p {...elProps(props.element)}>{renderText(props)}</p>,
  badge: (props) => <span {...elProps(props.element)}>{renderText(props)}</span>,

  image: (props) => {
    const src = safeUrl(boundOrContent(props, "src"))
    return src
      // eslint-disable-next-line @next/next/no-img-element
      ? <img {...elProps(props.element)} src={src} alt={contentOf(props.element)?.alt || props.element.name} />
      : <div {...elProps(props.element)} aria-label={`${props.element.name}: no image selected`} />
  },
  divider: (props) => <hr {...elProps(props.element)} />,
  input: (props) => <input {...elProps(props.element)} aria-label={contentOf(props.element)?.label || props.element.name} placeholder={contentOf(props.element)?.placeholder} />,
  textarea: (props) => <textarea {...elProps(props.element)} aria-label={contentOf(props.element)?.label || props.element.name} placeholder={contentOf(props.element)?.placeholder} />,
  link: (props) => <a {...elProps(props.element)} href={safeUrl(contentOf(props.element)?.href) ?? "#"}>{renderTextOrChildren(props)}</a>,
  button: (props) => {
    const href = safeUrl(contentOf(props.element)?.href)
    return href
      ? <a {...elProps(props.element)} href={href}>{renderText(props)}</a>
      : <button {...elProps(props.element)} type="button">{renderText(props)}</button>
  },
  addToCart: (props) => {
    if (!props.product) return null
    return <AddToCartButton productId={props.product.id} productName={props.product.name} price={Number(props.product.price)} image={props.product.images?.[0]?.url} text={renderText(props) || "Add to cart"} style={props.element.styles} />
  },
  productGrid: (props) => {
    const { element, context, mode } = props
    let productIds = element.repeat?.resourceId ? context.collections?.[element.repeat.resourceId] : undefined
    if (!element.repeat?.resourceId && context.activeCollection) {
      productIds = context.collections?.[context.activeCollection.id]
    }
    const repeatedProducts = productIds ? context.products.filter((item) => productIds.includes(item.id)) : context.products
    return (
      <div {...elProps(element)}>
        {repeatedProducts.slice(0, element.repeat?.limit ?? 12).map((item) => (
          Array.isArray(element.content) && element.content.length > 0
            ? <div key={item.id}>{element.content.map((child) => <Element key={child.id} element={child} context={context} mode={mode} product={item} />)}</div>
            : <ProductTile key={item.id} product={item} context={context} mode={mode} />
        ))}
      </div>
    )
  },
  navigation: (props) => (
    <nav {...elProps(props.element)} aria-label={props.element.name}>
      {props.context.navigation?.map((item) => <a key={item.id} href={safeUrl(item.href) ?? "/"}>{item.label}</a>)}
    </nav>
  ),
  video: (props) => <iframe {...elProps(props.element)} src={safeUrl(contentOf(props.element)?.src) ?? undefined} allowFullScreen />,
  spacer: (props) => <div {...elProps(props.element)} />,
  quote: (props) => <blockquote {...elProps(props.element)}>{renderText(props)}</blockquote>,
  list: (props) => {
    const { element } = props
    const text = renderText(props)
    return <ul {...elProps(element)} style={{ ...(element.styles as CSSProperties), listStyleType: (element.styles.listStyleType as string) || 'disc' }}>{(text || '').split('\n').map((li, i) => <li key={i}>{li}</li>)}</ul>
  },
  code: (props) => <pre {...elProps(props.element)}><code>{renderText(props)}</code></pre>,
  icon: (props) => <span {...elProps(props.element)}>{renderText(props) || '★'}</span>,
  embed: (props) => <div {...elProps(props.element)}>⚠️ HTML embeds disabled for security</div>,
  socialIcons: (props) => (
    <div {...elProps(props.element)}>
      {parseCsv(contentOf(props.element)?.platforms).map((p: string, i: number) => <a key={i} href="#" style={{ opacity: 0.7 }}>{p}</a>)}
    </div>
  ),
  map: (props) => (
    <iframe {...elProps(props.element)} src={`https://maps.google.com/maps?q=${encodeURIComponent(contentOf(props.element)?.address || '')}&z=${contentOf(props.element)?.zoom || '13'}&output=embed`} loading="lazy" />
  ),
  gallery: (props) => (
    <div {...elProps(props.element)}>
      {parseCsv(contentOf(props.element)?.images).map((src: string, i: number) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={safeUrl(src) ?? ""} alt="" style={{ width: '100%', objectFit: 'cover' }} />
      ))}
    </div>
  ),
  accordion: (props) => {
    const items = parseItems(contentOf(props.element)?.items)
    return (
      <div {...elProps(props.element)}>
        {items.map((item, i) => (
          <details key={i} style={{ borderBottom: '1px solid currentColor', opacity: 0.9 }}>
            <summary style={{ cursor: 'pointer', padding: '12px 0', fontWeight: 500 }}>{item.title}</summary>
            <p style={{ paddingBottom: '12px', opacity: 0.7 }}>{item.body}</p>
          </details>
        ))}
      </div>
    )
  },
  tabs: (props) => {
    const items = parseItems(contentOf(props.element)?.items)
    return (
      <div {...elProps(props.element)} data-tabs={contentOf(props.element)?.items}>
        {/* Static fallback: full tabbed behavior is hydrated client-side where available */}
        {items.map((item, i) => <div key={i}><strong>{item.title}</strong><p>{item.body}</p></div>)}
      </div>
    )
  },
  countdown: (props) => (
    <div {...elProps(props.element)} data-countdown={contentOf(props.element)?.targetDate}>
      <div>{new Date(contentOf(props.element)?.targetDate || Date.now()).toLocaleDateString()}</div>
    </div>
  ),
  starRating: (props) => {
    const rating = parseNumber(contentOf(props.element)?.rating, 5)
    const reviews = contentOf(props.element)?.reviews || '0'
    const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(rating) ? '★' : i < rating ? '★' : '☆')
    return <div {...elProps(props.element)}><span>{stars.join('')}</span><span style={{ marginLeft: 4, opacity: 0.6 }}>({reviews})</span></div>
  },
  cartButton: (props) => <button {...elProps(props.element)}>🛒 {renderText(props) || 'Add to Cart'}</button>,
}

/** Bound value if the element has a data binding, else the field from content. */
function boundOrContent(props: ElementProps, field: string): string | undefined {
  const bound = boundValue(props.element, props.context, props.product)
  return bound ?? contentOf(props.element)?.[field]
}

/** Text value for a leaf element: binding wins, then innerText. */
function renderText(props: ElementProps): string {
  const bound = boundValue(props.element, props.context, props.product)
  return bound ?? contentOf(props.element)?.innerText ?? ""
}

/** Text for heading-like leaves, falling back to children for hybrid containers. */
function renderTextOrChildren(props: ElementProps): ReactNode {
  const text = renderText(props)
  return text || renderChildren(props)
}

// Legacy storefront-only types kept for compatibility with older documents.
const LEGACY_STOREFRONT_TYPES = new Set(["h1", "h2", "h3", "paragraph", "label", "sectionHeading", "addToCart", "productTile"])

/** Types the storefront handles explicitly (used by the coverage test). */
export function getStorefrontHandledTypes(): string[] {
  return Object.keys(STOREFRONT_RENDERERS).filter((type) => !LEGACY_STOREFRONT_TYPES.has(type))
}

function Element({ element, context, mode, product }: ElementProps) {
  if (element.hidden) return null

  const children = renderChildren({ element, context, mode, product })
  const common = elProps(element)

  // 1. Explicit per-type renderer.
  const explicit = (STOREFRONT_RENDERERS as Record<string, ((props: ElementProps) => ReactNode) | undefined>)[element.type]
  if (explicit) {
    const rendered = explicit({ element, context, mode, product })
    if (element.animations && element.animations.preset !== 'none') {
      return <MotionWrapper animations={element.animations}>{rendered}</MotionWrapper>
    }
    return rendered
  }

  // 2. Plugin/element-provided storefront renderer.
  const def = registry.get(element.type)
  if (def?.storefrontRender) {
    const rendered = def.storefrontRender({ element, context, mode, product })
    if (element.animations && element.animations.preset !== 'none') {
      return <MotionWrapper animations={element.animations}>{rendered}</MotionWrapper>
    }
    return rendered
  }

  // 3. Generic fallback: containers render children, leaves render text.
  const fallback = <div {...common}>{children ?? renderText({ element, context, mode, product })}</div>
  if (element.animations && element.animations.preset !== 'none') {
    return <MotionWrapper animations={element.animations}>{fallback}</MotionWrapper>
  }
  return fallback
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
