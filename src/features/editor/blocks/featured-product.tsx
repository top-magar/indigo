"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"
import { ProductPickerField } from "../components/product-picker-field"
import { ImagePickerField } from "../components/image-picker-field"
import { AddToCartButton } from "@/features/store/add-to-cart-button"

interface FeaturedProductProps {
  layout: "left" | "right"
  productName: string
  description: string
  price: string
  imageUrl: string
  ctaText: string
  backgroundColor: string
  productId: string
  tenantId: string
}

export const FeaturedProductBlock = ({
  layout, productName, description, price, imageUrl, ctaText, backgroundColor, productId,
}: FeaturedProductProps) => {
  const { connectors: { connect, drag } } = useNode()

  // Parse price string to cents for cart (e.g., "Rs. 4,999" → 499900, "$49.99" → 4999)
  const priceInCents = Math.round(parseFloat(price.replace(/[^0-9.]/g, "")) * 100) || 0

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, padding: 48 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, maxWidth: 1200, margin: "0 auto", alignItems: "center" }}>
        <div style={{ order: layout === "right" ? 1 : 0 }}>
          {imageUrl ? (
            <img src={imageUrl} alt={productName} style={{ width: "100%", borderRadius: 12, objectFit: "cover", maxHeight: 400 }} />
          ) : (
            <div style={{ height: 400, backgroundColor: "#f3f4f6", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
              Product Image
            </div>
          )}
        </div>
        <div>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>{productName}</h2>
          <p style={{ fontSize: 24, fontWeight: 600, color: "var(--store-text, #111)", marginTop: 8 }}>{price}</p>
          <p style={{ fontSize: 16, color: "#6b7280", marginTop: 16, lineHeight: 1.6 }}>{description}</p>
          <AddToCartButton
            productId={productId}
            productName={productName}
            price={priceInCents}
            image={imageUrl}
            text={ctaText}
            style={{ marginTop: 24, padding: "14px 36px", fontSize: 16, fontWeight: 600, backgroundColor: "var(--store-primary, #111)", color: "#fff", border: "none", borderRadius: "var(--store-radius, 8px)", cursor: "pointer" }}
          />
        </div>
      </div>
    </div>
  )
}

const FeaturedProductSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as FeaturedProductProps }))
  return (
    <div className="flex flex-col gap-3">
      {props.tenantId && (
        <ProductPickerField
          label="Link to Product"
          tenantId={props.tenantId}
          value={props.productId}
          onChange={(product) => {
            if (product) {
              setProp((p: FeaturedProductProps) => {
                p.productId = product.id
                p.productName = product.name
                p.price = `$${(product.price / 100).toFixed(2)}`
                if (product.images?.[0]?.url) p.imageUrl = product.images[0].url
              })
            } else {
              setProp((p: FeaturedProductProps) => (p.productId = ""))
            }
          }}
        />
      )}
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Layout
        <select value={props.layout} onChange={(e) => setProp((p: FeaturedProductProps) => (p.layout = e.target.value as any))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
          <option value="left">Image Left</option><option value="right">Image Right</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Product Name
        <input type="text" value={props.productName} onChange={(e) => setProp((p: FeaturedProductProps) => (p.productName = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Price
        <input type="text" value={props.price} onChange={(e) => setProp((p: FeaturedProductProps) => (p.price = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Description
        <textarea value={props.description} onChange={(e) => setProp((p: FeaturedProductProps) => (p.description = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" rows={3} />
      </label>
      <ImagePickerField label="Product Image" value={props.imageUrl} onChange={(url) => setProp((p: FeaturedProductProps) => (p.imageUrl = url))} />
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        CTA Text
        <input type="text" value={props.ctaText} onChange={(e) => setProp((p: FeaturedProductProps) => (p.ctaText = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Background
        <input type="color" value={props.backgroundColor} onChange={(e) => setProp((p: FeaturedProductProps) => (p.backgroundColor = e.target.value))} />
      </label>
    </div>
  )
}

FeaturedProductBlock.craft = {
  displayName: "Featured Product",
  props: { layout: "left", productName: "Featured Product", description: "A premium product that your customers will love. Highlight its best features here.", price: "$49.99", imageUrl: "", ctaText: "Buy Now", backgroundColor: "#ffffff", productId: "", tenantId: "" } satisfies FeaturedProductProps,
  related: { settings: FeaturedProductSettings },
}
