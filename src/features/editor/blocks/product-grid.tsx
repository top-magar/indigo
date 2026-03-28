"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"
import { AddToCartButton } from "@/features/store/add-to-cart-button"

export interface ProductGridProduct {
  id: string
  name: string
  price: number
  images: { url: string }[] | null
  slug: string
}

interface ProductGridProps {
  columns: 2 | 3 | 4 | 5
  rows: number
  gap: number
  showPrice: boolean
  showButton: boolean
  buttonText: string
  backgroundColor: string
  collectionId: string
  imageRatio: "square" | "portrait" | "landscape"
  cardStyle: "minimal" | "bordered" | "shadow"
  showVendor: boolean
  buttonStyle: "solid" | "outline"
  paddingTop: number
  paddingBottom: number
  heading: string
  headingAlignment: "left" | "center"
  _products?: ProductGridProduct[]
}

const ratioMap = { square: "1/1", portrait: "3/4", landscape: "4/3" }
const cardStyleMap = {
  minimal: {},
  bordered: { border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" as const },
  shadow: { boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderRadius: 8, overflow: "hidden" as const },
}

const summaryClass = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const fieldClass = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const inputClass = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"

export const ProductGridBlock = (props: ProductGridProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { columns, rows, gap, showPrice, showButton, buttonText, backgroundColor, collectionId, imageRatio, cardStyle, buttonStyle, paddingTop, paddingBottom, heading, headingAlignment, _products } = props
  const count = columns * rows
  const products = _products?.slice(0, count)
  const ratio = ratioMap[imageRatio]
  const cStyle = cardStyleMap[cardStyle]

  const btnBase: React.CSSProperties = {
    marginTop: 12, width: "100%", padding: "8px 16px", fontSize: 13, fontWeight: 500,
    borderRadius: "var(--store-radius, 6px)", cursor: "pointer", transition: "opacity 0.15s",
  }
  const btnSolid: React.CSSProperties = { ...btnBase, backgroundColor: "var(--store-primary, #111)", color: "#fff", border: "none" }
  const btnOutline: React.CSSProperties = { ...btnBase, backgroundColor: "transparent", color: "var(--store-primary, #111)", border: "1.5px solid var(--store-primary, #111)" }

  const renderCard = (content: React.ReactNode, key: string | number) => (
    <div key={key} style={{ backgroundColor: "#fff", ...cStyle }}>{content}</div>
  )

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {heading && <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 24px", textAlign: headingAlignment }}>{heading}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
          {products && products.length > 0
            ? products.map((p) => renderCard(
                <a key={p.id} href={`products/${p.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  <div style={{ aspectRatio: ratio, backgroundColor: "#f3f4f6", overflow: "hidden" }}>
                    {p.images?.[0]?.url
                      ? <img src={p.images[0].url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>{p.name}</div>
                    }
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    {showPrice && <div style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>Rs. {(p.price / 100).toLocaleString()}</div>}
                    {showButton && (
                      <AddToCartButton productId={p.id} productName={p.name} price={p.price} image={p.images?.[0]?.url} text={buttonText} style={buttonStyle === "outline" ? btnOutline : btnSolid} />
                    )}
                  </div>
                </a>,
                p.id
              ))
            : Array.from({ length: count }).map((_, i) => renderCard(
                <>
                  <div style={{ aspectRatio: ratio, backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
                    {collectionId ? "Loading…" : `Product ${i + 1}`}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Product Name</div>
                    {showPrice && <div style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>Rs. 2,999</div>}
                    {showButton && <button style={buttonStyle === "outline" ? btnOutline : btnSolid}>{buttonText}</button>}
                  </div>
                </>,
                i
              ))
          }
        </div>
      </div>
    </div>
  )
}

const ProductGridSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as ProductGridProps }))
  const set = <K extends keyof ProductGridProps>(key: K, val: ProductGridProps[K]) => setProp((p: ProductGridProps) => { (p as any)[key] = val })

  return (
    <div className="flex flex-col gap-1 p-1">
      <details open>
        <summary className={summaryClass}>Data</summary>
        <div className="flex flex-col gap-2.5 pb-3">
          <label className={fieldClass}>Collection ID<input type="text" value={props.collectionId} onChange={(e) => set("collectionId", e.target.value)} placeholder="Leave empty for latest" className={inputClass} /></label>
          <label className={fieldClass}>Section Heading<input type="text" value={props.heading} onChange={(e) => set("heading", e.target.value)} placeholder="Optional" className={inputClass} /></label>
          {props.heading && (
            <label className={fieldClass}>Heading Alignment
              <select value={props.headingAlignment} onChange={(e) => set("headingAlignment", e.target.value as any)} className={inputClass}>
                <option value="left">Left</option><option value="center">Center</option>
              </select>
            </label>
          )}
        </div>
      </details>

      <details open>
        <summary className={summaryClass}>Grid</summary>
        <div className="flex flex-col gap-2.5 pb-3">
          <label className={fieldClass}>Columns
            <select value={props.columns} onChange={(e) => set("columns", +e.target.value as any)} className={inputClass}>
              <option value={2}>2</option><option value={3}>3</option><option value={4}>4</option><option value={5}>5</option>
            </select>
          </label>
          <label className={fieldClass}>Rows ({props.rows})<input type="range" min={1} max={6} value={props.rows} onChange={(e) => set("rows", +e.target.value)} /></label>
          <label className={fieldClass}>Gap ({props.gap}px)<input type="range" min={4} max={32} value={props.gap} onChange={(e) => set("gap", +e.target.value)} /></label>
          <label className={fieldClass}>Image Ratio
            <select value={props.imageRatio} onChange={(e) => set("imageRatio", e.target.value as any)} className={inputClass}>
              <option value="portrait">Portrait (3:4)</option><option value="square">Square (1:1)</option><option value="landscape">Landscape (4:3)</option>
            </select>
          </label>
        </div>
      </details>

      <details>
        <summary className={summaryClass}>Card</summary>
        <div className="flex flex-col gap-2.5 pb-3">
          <label className={fieldClass}>Card Style
            <select value={props.cardStyle} onChange={(e) => set("cardStyle", e.target.value as any)} className={inputClass}>
              <option value="minimal">Minimal</option><option value="bordered">Bordered</option><option value="shadow">Shadow</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><input type="checkbox" checked={props.showVendor} onChange={(e) => set("showVendor", e.target.checked)} />Show Vendor</label>
        </div>
      </details>

      <details>
        <summary className={summaryClass}>Button</summary>
        <div className="flex flex-col gap-2.5 pb-3">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><input type="checkbox" checked={props.showButton} onChange={(e) => set("showButton", e.target.checked)} />Show Button</label>
          {props.showButton && (
            <>
              <label className={fieldClass}>Text<input type="text" value={props.buttonText} onChange={(e) => set("buttonText", e.target.value)} className={inputClass} /></label>
              <label className={fieldClass}>Style
                <select value={props.buttonStyle} onChange={(e) => set("buttonStyle", e.target.value as any)} className={inputClass}>
                  <option value="solid">Solid</option><option value="outline">Outline</option>
                </select>
              </label>
            </>
          )}
        </div>
      </details>

      <details>
        <summary className={summaryClass}>Style</summary>
        <div className="flex flex-col gap-2.5 pb-3">
          <label className={fieldClass}>Background<input type="color" value={props.backgroundColor} onChange={(e) => set("backgroundColor", e.target.value)} /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className={fieldClass}>Pad Top ({props.paddingTop})<input type="range" min={0} max={96} value={props.paddingTop} onChange={(e) => set("paddingTop", +e.target.value)} /></label>
            <label className={fieldClass}>Pad Bottom ({props.paddingBottom})<input type="range" min={0} max={96} value={props.paddingBottom} onChange={(e) => set("paddingBottom", +e.target.value)} /></label>
          </div>
        </div>
      </details>
    </div>
  )
}

ProductGridBlock.craft = {
  displayName: "Product Grid",
  props: {
    _v: 1, columns: 3, rows: 2, gap: 16, showPrice: true, showButton: true,
    buttonText: "Add to Cart", backgroundColor: "#ffffff", collectionId: "",
    imageRatio: "portrait", cardStyle: "minimal", showVendor: false,
    buttonStyle: "solid", paddingTop: 24, paddingBottom: 24,
    heading: "", headingAlignment: "left",
  },
  rules: { canMoveIn: () => false },
  related: { settings: ProductGridSettings },
}
