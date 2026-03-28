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
  columns: 2 | 3 | 4
  rows: number
  gap: number
  showPrice: boolean
  showButton: boolean
  buttonText: string
  backgroundColor: string
  collectionId: string
  /** Injected at render time by storefront — not stored in Craft.js */
  _products?: ProductGridProduct[]
}

export const ProductGridBlock = ({
  columns, rows, gap, showPrice, showButton, buttonText, backgroundColor,
  collectionId, _products,
}: ProductGridProps) => {
  const { connectors: { connect, drag } } = useNode()
  const count = columns * rows
  const products = _products?.slice(0, count)

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap, maxWidth: 1200, margin: "0 auto" }}>
        {products && products.length > 0
          ? products.map((p) => (
              <a key={p.id} href={`products/${p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", backgroundColor: "#fff" }}>
                  <div style={{ height: 200, backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ color: "#9ca3af", fontSize: 13 }}>{p.name}</span>
                    )}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    {showPrice && <div style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>Rs. {(p.price / 100).toLocaleString()}</div>}
                    {showButton && (
                      <AddToCartButton
                        productId={p.id}
                        productName={p.name}
                        price={p.price}
                        image={p.images?.[0]?.url}
                        text={buttonText}
                        style={{ marginTop: 12, width: "100%", padding: "8px 16px", fontSize: 13, fontWeight: 500, backgroundColor: "var(--store-primary, #111)", color: "#fff", border: "none", borderRadius: "var(--store-radius, 6px)", cursor: "pointer" }}
                      />
                    )}
                  </div>
                </div>
              </a>
            ))
          : Array.from({ length: count }).map((_, i) => (
              <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", backgroundColor: "#fff" }}>
                <div style={{ height: 200, backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
                  {collectionId ? "Loading…" : `Product ${i + 1}`}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Product Name</div>
                  {showPrice && <div style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>Rs. 2,999</div>}
                  {showButton && (
                    <button style={{ marginTop: 12, width: "100%", padding: "8px 16px", fontSize: 13, fontWeight: 500, backgroundColor: "var(--store-primary, #111)", color: "#fff", border: "none", borderRadius: "var(--store-radius, 6px)", cursor: "pointer" }}>
                      {buttonText}
                    </button>
                  )}
                </div>
              </div>
            ))
        }
      </div>
    </div>
  )
}

const ProductGridSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as ProductGridProps }))
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Collection ID
        <input type="text" value={props.collectionId} onChange={(e) => setProp((p: ProductGridProps) => (p.collectionId = e.target.value))} placeholder="Leave empty for latest products" className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Columns
        <select value={props.columns} onChange={(e) => setProp((p: ProductGridProps) => (p.columns = +e.target.value as any))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
          <option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Rows ({props.rows})
        <input type="range" min={1} max={4} value={props.rows} onChange={(e) => setProp((p: ProductGridProps) => (p.rows = +e.target.value))} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Gap ({props.gap}px)
        <input type="range" min={8} max={32} value={props.gap} onChange={(e) => setProp((p: ProductGridProps) => (p.gap = +e.target.value))} />
      </label>
      <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <input type="checkbox" checked={props.showPrice} onChange={(e) => setProp((p: ProductGridProps) => (p.showPrice = e.target.checked))} />
        Show Price
      </label>
      <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <input type="checkbox" checked={props.showButton} onChange={(e) => setProp((p: ProductGridProps) => (p.showButton = e.target.checked))} />
        Show Button
      </label>
      {props.showButton && (
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Button Text
          <input type="text" value={props.buttonText} onChange={(e) => setProp((p: ProductGridProps) => (p.buttonText = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
        </label>
      )}
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Background
        <input type="color" value={props.backgroundColor} onChange={(e) => setProp((p: ProductGridProps) => (p.backgroundColor = e.target.value))} />
      </label>
    </div>
  )
}

ProductGridBlock.craft = {
  displayName: "Product Grid",
  props: { _v: 1, columns: 3, rows: 2, gap: 16, showPrice: true, showButton: true, buttonText: "Add to Cart", backgroundColor: "#ffffff", collectionId: "" },
  rules: { canMoveIn: () => false },
  related: { settings: ProductGridSettings },
}
