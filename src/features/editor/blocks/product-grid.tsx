"use client"

import { AlignCenter, AlignLeft, Columns2, Columns3, Columns4, RectangleHorizontal, SquareDashed } from "lucide-react"

import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { AddToCartButton } from "@/features/store/add-to-cart-button"
import { useResponsiveStyles } from "../use-responsive"
import { Section, TextField, ColorField, SliderField, SegmentedControl, ToggleField } from "../components/editor-fields"
import { UniversalStyleControls } from "../components/universal-style-controls"

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
  bordered: { border: "1px solid var(--store-border, #e5e7eb)", borderRadius: 8, overflow: "hidden" as const },
  shadow: { boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderRadius: 8, overflow: "hidden" as const },
}

const fieldClass = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const inputClass = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"

export const ProductGridBlock = (props: ProductGridProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { columns, rows, gap, showPrice, showButton, buttonText, backgroundColor, collectionId, imageRatio, cardStyle, buttonStyle, paddingTop, paddingBottom, heading, headingAlignment, _products } = props
  const { columns: rCols } = useResponsiveStyles()
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
    <div key={key} style={{ backgroundColor: "var(--store-bg, #fff)", ...cStyle }}>{content}</div>
  )

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor: backgroundColor || undefined, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {heading && <h2 style={{ fontFamily: "var(--store-font-heading, inherit)", fontSize: 24, fontWeight: 700, margin: "0 0 24px", textAlign: headingAlignment }}>{heading}</h2>}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${rCols(columns)}, 1fr)`, gap }}>
          {products && products.length > 0
            ? products.map((p) => renderCard(
                <a key={p.id} href={`products/${p.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  <div style={{ aspectRatio: ratio, backgroundColor: "var(--store-placeholder-bg, #f3f4f6)", overflow: "hidden" }}>
                    {p.images?.[0]?.url
                      ? <img src={p.images[0].url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--store-placeholder-text, #9ca3af)", fontSize: 13 }}>{p.name}</div>
                    }
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    {showPrice && <div style={{ color: "var(--store-secondary, #6b7280)", fontSize: 14, marginTop: 4 }}>Rs. {(p.price / 100).toLocaleString()}</div>}
                    {showButton && (
                      <AddToCartButton productId={p.id} productName={p.name} price={p.price} image={p.images?.[0]?.url} text={buttonText} style={buttonStyle === "outline" ? btnOutline : btnSolid} />
                    )}
                  </div>
                </a>,
                p.id
              ))
            : Array.from({ length: count }).map((_, i) => renderCard(
                <>
                  <div style={{ aspectRatio: ratio, backgroundColor: "var(--store-placeholder-bg, #f3f4f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--store-placeholder-text, #9ca3af)", fontSize: 13 }}>
                    {collectionId ? "Loading…" : `Product ${i + 1}`}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Product Name</div>
                    {showPrice && <div style={{ color: "var(--store-secondary, #6b7280)", fontSize: 14, marginTop: 4 }}>Rs. 2,999</div>}
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
  if (!props) return null
  const set = <K extends keyof ProductGridProps>(key: K, val: ProductGridProps[K]) => setProp((p: ProductGridProps) => { (p as any)[key] = val })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
            <Section title="Data">
                  <TextField label="Collection ID" value={props.collectionId} onChange={(v) => set("collectionId", v)} placeholder="Leave empty for latest" />
                  <TextField label="Section Heading" value={props.heading} onChange={(v) => set("heading", v)} placeholder="Optional" />
          {props.heading && (
                    <SegmentedControl label="Heading Alignment" value={props.headingAlignment} onChange={(v) => set("headingAlignment", v as any)} options={[{ value: "left", label: "Left", icon: AlignLeft, iconOnly: true }, { value: "center", label: "Center", icon: AlignCenter, iconOnly: true }]} />
          )}
      </Section>

            <Section title="Grid">
                  <SegmentedControl label="Columns" value={String(props.columns)} onChange={(v) => set("columns", +v as any)} options={[{ value: "2", label: "2", icon: Columns2, iconOnly: true }, { value: "3", label: "3", icon: Columns3, iconOnly: true }, { value: "4", label: "4", icon: Columns4, iconOnly: true }]} />
                  <SliderField label="Rows" value={props.rows} onChange={(v) => set("rows", v)} min={1} max={6} />
                  <SliderField label="Gap" value={props.gap} onChange={(v) => set("gap", v)} min={4} max={32} />
                  <SegmentedControl label="Image Ratio" value={props.imageRatio} onChange={(v) => set("imageRatio", v as any)} options={[{ value: "portrait", label: "3:4" }, { value: "square", label: "1:1" }, { value: "landscape", label: "4:3" }]} />
      </Section>

            <Section title="Card">
                  <SegmentedControl label="Card Style" value={props.cardStyle} onChange={(v) => set("cardStyle", v as any)} options={[{ value: "minimal", label: "Minimal" }, { value: "bordered", label: "Bordered" }, { value: "shadow", label: "Shadow" }]} />
                  <ToggleField label="Show Vendor" checked={props.showVendor} onChange={(v) => set("showVendor", v)} />
      </Section>

            <Section title="Button">
                  <ToggleField label="Show Button" checked={props.showButton} onChange={(v) => set("showButton", v)} />
          {props.showButton && (
            <>
                      <TextField label="Text" value={props.buttonText} onChange={(v) => set("buttonText", v)} />
                      <SegmentedControl label="Style" value={props.buttonStyle} onChange={(v) => set("buttonStyle", v as any)} options={[{ value: "solid", label: "Solid", icon: RectangleHorizontal, iconOnly: true }, { value: "outline", label: "Outline", icon: SquareDashed, iconOnly: true }]} />
            </>
          )}
      </Section>

            <Section title="Style">
                  <ColorField label="Background" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
          <div className="grid grid-cols-2 gap-2">
                    <SliderField label="Pad Top" value={props.paddingTop} onChange={(v) => set("paddingTop", v)} min={0} max={96} />
                    <SliderField label="Pad Bottom" value={props.paddingBottom} onChange={(v) => set("paddingBottom", v)} min={0} max={96} />
          </div>
      </Section>
          <UniversalStyleControls skip={["style", "spacing"]} />
    </div>
  )
}

ProductGridBlock.craft = {
  displayName: "Product Grid",
  props: {
    hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false,
    _v: 1, columns: 3, rows: 2, gap: 16, showPrice: true, showButton: true,
    buttonText: "Add to Cart", backgroundColor: "", collectionId: "",
    imageRatio: "portrait", cardStyle: "minimal", showVendor: false,
    buttonStyle: "solid", paddingTop: 24, paddingBottom: 24,
    heading: "", headingAlignment: "left",
  },
  rules: { canMoveIn: () => false },
  related: { settings: ProductGridSettings },
}
