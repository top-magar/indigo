import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Product"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>
}) {
  const { slug, productSlug } = await params

  // Use REST API directly to avoid importing heavy Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const [tenantRes, productRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/tenants?slug=eq.${slug}&select=name,currency&limit=1`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    }).then(r => r.json()),
    fetch(`${supabaseUrl}/rest/v1/products?slug=eq.${productSlug}&select=name,price,images&limit=1`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    }).then(r => r.json()),
  ])

  const tenant = tenantRes?.[0]
  const product = productRes?.[0]
  const storeName = tenant?.name || "Store"
  const productName = product?.name || "Product"
  const price = product?.price ? `NPR ${Number(product.price).toLocaleString()}` : ""

  return new ImageResponse(
    (
      <div style={{ height: "100%", width: "100%", display: "flex", backgroundColor: "#fafafa" }}>
        <div style={{ width: "50%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div style={{ width: "100%", height: "100%", backgroundColor: "#f4f4f5", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 40, color: "#a1a1aa" }}>{productName[0]}</span>
          </div>
        </div>
        <div style={{ width: "50%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 60px 40px 20px" }}>
          <p style={{ fontSize: 18, color: "#71717a", marginBottom: 8 }}>{storeName}</p>
          <h1 style={{ fontSize: 42, fontWeight: 600, color: "#0a0a0a", marginBottom: 20, lineHeight: 1.2 }}>
            {productName.length > 50 ? `${productName.slice(0, 50)}...` : productName}
          </h1>
          {price && <p style={{ fontSize: 36, fontWeight: 600, color: "#0a0a0a" }}>{price}</p>}
        </div>
      </div>
    ),
    { ...size }
  )
}
