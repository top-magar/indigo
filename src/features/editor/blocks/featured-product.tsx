"use client"
import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { ProductPickerField } from "../components/product-picker-field"
import { ImagePickerField } from "../components/image-picker-field"
import { AddToCartButton } from "@/features/store/add-to-cart-button"
import { Section, TextField, TextAreaField, ColorField, SliderField, SelectField, ToggleField, ImageField, NumberField, Row } from "../components/editor-fields"

interface FeaturedProductProps {
  layout: "left" | "right"; productName: string; description: string; price: string
  imageUrl: string; ctaText: string; backgroundColor: string; productId: string; tenantId: string
  ctaStyle: "solid" | "outline"; ctaColor: string; ctaTextColor: string
  showBadge: boolean; badgeText: string; badgeColor: string
  imageRatio: "auto" | "square" | "portrait"; imageBorderRadius: number
  paddingTop: number; paddingBottom: number; textColor: string; headingSize: number
}

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"
const ratioMap: Record<string, string | undefined> = { auto: undefined, square: "1/1", portrait: "3/4" }

export const FeaturedProductBlock = (props: FeaturedProductProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { layout, productName, description, price, imageUrl, ctaText, backgroundColor, productId, ctaStyle, ctaColor, ctaTextColor, showBadge, badgeText, badgeColor, imageRatio, imageBorderRadius, paddingTop, paddingBottom, textColor, headingSize } = props
  const priceInCents = Math.round(parseFloat(price.replace(/[^0-9.]/g, "")) * 100) || 0
  const radius = "var(--store-radius, 8px)"
  const btnStyle: React.CSSProperties = ctaStyle === "outline"
    ? { marginTop: 24, padding: "14px 36px", fontSize: 16, fontWeight: 600, backgroundColor: "transparent", color: ctaColor, border: `2px solid ${ctaColor}`, borderRadius: radius, cursor: "pointer" }
    : { marginTop: 24, padding: "14px 36px", fontSize: 16, fontWeight: 600, backgroundColor: ctaColor, color: ctaTextColor, border: "none", borderRadius: radius, cursor: "pointer" }

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, padding: `${paddingTop}px 48px ${paddingBottom}px` }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, maxWidth: 1200, margin: "0 auto", alignItems: "center" }}>
        <div style={{ order: layout === "right" ? 1 : 0, position: "relative" }}>
          {showBadge && badgeText && <span style={{ position: "absolute", top: 12, left: 12, zIndex: 1, padding: "4px 12px", borderRadius: 20, backgroundColor: badgeColor, color: "#fff", fontSize: 12, fontWeight: 600 }}>{badgeText}</span>}
          {imageUrl ? (
            <img src={imageUrl} alt={productName} style={{ width: "100%", borderRadius: imageBorderRadius, objectFit: "cover", aspectRatio: ratioMap[imageRatio] }} />
          ) : (
            <div style={{ height: 400, backgroundColor: "#f3f4f6", borderRadius: imageBorderRadius, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14, aspectRatio: ratioMap[imageRatio] }}>Product Image</div>
          )}
        </div>
        <div>
          <h2 style={{ fontSize: headingSize, fontWeight: 700, margin: 0, fontFamily: "var(--store-font-heading)" }}>{productName}</h2>
          <p style={{ fontSize: 24, fontWeight: 600, marginTop: 8 }}>{price}</p>
          <p style={{ fontSize: 16, opacity: 0.7, marginTop: 16, lineHeight: 1.6 }}>{description}</p>
          <AddToCartButton productId={productId} productName={productName} price={priceInCents} image={imageUrl} text={ctaText} style={btnStyle} />
        </div>
      </div>
    </div>
  )
}

const FeaturedProductSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as FeaturedProductProps }))
  if (!props) return null
  const set = <K extends keyof FeaturedProductProps>(k: K, v: FeaturedProductProps[K]) => setProp((p: FeaturedProductProps) => { (p as any)[k] = v })
  return (
    <div className="flex flex-col gap-1 p-1">
      <Section title="Product">
        {props.tenantId && <ProductPickerField label="Link to Product" tenantId={props.tenantId} value={props.productId} onChange={(product) => { if (product) { setProp((p: FeaturedProductProps) => { p.productId = product.id; p.productName = product.name; p.price = `Rs. ${(product.price / 100).toFixed(0)}`; if (product.images?.[0]?.url) p.imageUrl = product.images[0].url }) } else { set("productId", "") } }} />}
                <TextField label="Name" value={props.productName} onChange={(v) => set("productName", v)} />
                <TextField label="Price" value={props.price} onChange={(v) => set("price", v)} />
                <TextAreaField label="Description" value={props.description} onChange={(v) => set("description", v)} />
        <ImagePickerField label="Image" value={props.imageUrl} onChange={(url) => set("imageUrl", url)} />
      </Section>
      <Section title="Badge">
                <ToggleField label="Show Badge" checked={props.showBadge} onChange={(v) => set("showBadge", v)} />
        {props.showBadge && <>        <TextField label="Text" value={props.badgeText} onChange={(v) => set("badgeText", v)} />        <ColorField label="Color" value={props.badgeColor} onChange={(v) => set("badgeColor", v)} /></>}
      </Section>
      <Section title="Button">
                <TextField label="Text" value={props.ctaText} onChange={(v) => set("ctaText", v)} />
                <SelectField label="Style" value={props.ctaStyle} onChange={(v) => set("ctaStyle", v as any)} options={[{ value: "solid", label: "Solid" }, { value: "outline", label: "Outline" }]} />
        <div className="grid grid-cols-2 gap-2">        <ColorField label="BG" value={props.ctaColor} onChange={(v) => set("ctaColor", v)} />        <ColorField label="Text" value={props.ctaTextColor} onChange={(v) => set("ctaTextColor", v)} /></div>
      </Section>
      <Section title="Layout">
                <SelectField label="Image Position" value={props.layout} onChange={(v) => set("layout", v as any)} options={[{ value: "left", label: "Left" }, { value: "right", label: "Right" }]} />
                <SelectField label="Image Ratio" value={props.imageRatio} onChange={(v) => set("imageRatio", v as any)} options={[{ value: "auto", label: "Auto" }, { value: "square", label: "Square" }, { value: "portrait", label: "Portrait" }]} />
                <SliderField label="Image Radius" value={props.imageBorderRadius} onChange={(v) => set("imageBorderRadius", v)} min={0} max={24} />
                <SliderField label="Heading Size" value={props.headingSize} onChange={(v) => set("headingSize", v)} min={20} max={48} />
        <div className="grid grid-cols-2 gap-2">
                  <SliderField label="Pad Top" value={props.paddingTop} onChange={(v) => set("paddingTop", v)} min={0} max={96} />
                  <SliderField label="Pad Bottom" value={props.paddingBottom} onChange={(v) => set("paddingBottom", v)} min={0} max={96} />
        </div>
      </Section>
      <Section title="Colors">
                <ColorField label="Background" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
                <ColorField label="Text" value={props.textColor} onChange={(v) => set("textColor", v)} />
      </Section>
    </div>
  )
}

FeaturedProductBlock.craft = {
  displayName: "Featured Product",
  props: { _v: 1, layout: "left", productName: "Featured Product", description: "A premium product that your customers will love.", price: "Rs. 4,999", imageUrl: "", ctaText: "Buy Now", backgroundColor: "#ffffff", productId: "", tenantId: "", ctaStyle: "solid", ctaColor: "#000000", ctaTextColor: "#ffffff", showBadge: false, badgeText: "New", badgeColor: "#ef4444", imageRatio: "auto", imageBorderRadius: 12, paddingTop: 48, paddingBottom: 48, textColor: "#111827", headingSize: 32 },
  rules: { canMoveIn: () => false },
  related: { settings: FeaturedProductSettings },
}
