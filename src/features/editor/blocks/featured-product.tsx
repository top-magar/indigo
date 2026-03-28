"use client"
import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"
import { ProductPickerField } from "../components/product-picker-field"
import { ImagePickerField } from "../components/image-picker-field"
import { AddToCartButton } from "@/features/store/add-to-cart-button"

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
  const set = <K extends keyof FeaturedProductProps>(k: K, v: FeaturedProductProps[K]) => setProp((p: FeaturedProductProps) => { (p as any)[k] = v })
  return (
    <div className="flex flex-col gap-1 p-1">
      <details open><summary className={S}>Product</summary><div className="flex flex-col gap-2.5 pb-3">
        {props.tenantId && <ProductPickerField label="Link to Product" tenantId={props.tenantId} value={props.productId} onChange={(product) => { if (product) { setProp((p: FeaturedProductProps) => { p.productId = product.id; p.productName = product.name; p.price = `Rs. ${(product.price / 100).toFixed(0)}`; if (product.images?.[0]?.url) p.imageUrl = product.images[0].url }) } else { set("productId", "") } }} />}
        <label className={F}>Name<input type="text" value={props.productName} onChange={(e) => set("productName", e.target.value)} className={I} /></label>
        <label className={F}>Price<input type="text" value={props.price} onChange={(e) => set("price", e.target.value)} className={I} /></label>
        <label className={F}>Description<textarea value={props.description} onChange={(e) => set("description", e.target.value)} className={I} rows={3} /></label>
        <ImagePickerField label="Image" value={props.imageUrl} onChange={(url) => set("imageUrl", url)} />
      </div></details>
      <details><summary className={S}>Badge</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><input type="checkbox" checked={props.showBadge} onChange={(e) => set("showBadge", e.target.checked)} />Show Badge</label>
        {props.showBadge && <><label className={F}>Text<input type="text" value={props.badgeText} onChange={(e) => set("badgeText", e.target.value)} className={I} /></label><label className={F}>Color<input type="color" value={props.badgeColor} onChange={(e) => set("badgeColor", e.target.value)} /></label></>}
      </div></details>
      <details><summary className={S}>Button</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Text<input type="text" value={props.ctaText} onChange={(e) => set("ctaText", e.target.value)} className={I} /></label>
        <label className={F}>Style<select value={props.ctaStyle} onChange={(e) => set("ctaStyle", e.target.value as any)} className={I}><option value="solid">Solid</option><option value="outline">Outline</option></select></label>
        <div className="grid grid-cols-2 gap-2"><label className={F}>BG<input type="color" value={props.ctaColor} onChange={(e) => set("ctaColor", e.target.value)} /></label><label className={F}>Text<input type="color" value={props.ctaTextColor} onChange={(e) => set("ctaTextColor", e.target.value)} /></label></div>
      </div></details>
      <details><summary className={S}>Layout</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Image Position<select value={props.layout} onChange={(e) => set("layout", e.target.value as any)} className={I}><option value="left">Left</option><option value="right">Right</option></select></label>
        <label className={F}>Image Ratio<select value={props.imageRatio} onChange={(e) => set("imageRatio", e.target.value as any)} className={I}><option value="auto">Auto</option><option value="square">Square</option><option value="portrait">Portrait</option></select></label>
        <label className={F}>Image Radius ({props.imageBorderRadius}px)<input type="range" min={0} max={24} value={props.imageBorderRadius} onChange={(e) => set("imageBorderRadius", +e.target.value)} /></label>
        <label className={F}>Heading Size ({props.headingSize}px)<input type="range" min={20} max={48} value={props.headingSize} onChange={(e) => set("headingSize", +e.target.value)} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className={F}>Pad Top ({props.paddingTop})<input type="range" min={0} max={96} value={props.paddingTop} onChange={(e) => set("paddingTop", +e.target.value)} /></label>
          <label className={F}>Pad Bottom ({props.paddingBottom})<input type="range" min={0} max={96} value={props.paddingBottom} onChange={(e) => set("paddingBottom", +e.target.value)} /></label>
        </div>
      </div></details>
      <details><summary className={S}>Colors</summary><div className="flex flex-col gap-2.5 pb-3">
        <label className={F}>Background<input type="color" value={props.backgroundColor} onChange={(e) => set("backgroundColor", e.target.value)} /></label>
        <label className={F}>Text<input type="color" value={props.textColor} onChange={(e) => set("textColor", e.target.value)} /></label>
      </div></details>
    </div>
  )
}

FeaturedProductBlock.craft = {
  displayName: "Featured Product",
  props: { _v: 1, layout: "left", productName: "Featured Product", description: "A premium product that your customers will love.", price: "Rs. 4,999", imageUrl: "", ctaText: "Buy Now", backgroundColor: "#ffffff", productId: "", tenantId: "", ctaStyle: "solid", ctaColor: "#000000", ctaTextColor: "#ffffff", showBadge: false, badgeText: "New", badgeColor: "#ef4444", imageRatio: "auto", imageBorderRadius: 12, paddingTop: 48, paddingBottom: 48, textColor: "#111827", headingSize: 32 },
  rules: { canMoveIn: () => false },
  related: { settings: FeaturedProductSettings },
}
