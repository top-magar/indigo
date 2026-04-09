import { ImageResponse } from "next/og"
import { createClient } from "@/infrastructure/supabase/server"

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
  const supabase = await createClient()

  const [tenantResult, productResult] = await Promise.all([
    supabase.from("tenants").select("name, currency").eq("slug", slug).single(),
    supabase.from("products").select("name, price, images").eq("slug", productSlug).single(),
  ])

  const tenant = tenantResult.data
  const product = productResult.data

  const storeName = tenant?.name || "Store"
  const productName = product?.name || "Product"
  const price = product?.price ? `$${Number(product.price).toFixed(2)}` : ""
  const productImage = product?.images?.[0]?.url

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#0a0a0a",
          backgroundImage: "radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)",
        }}
      >
        {/* Product Image Section */}
        <div
          style={{
            width: "50%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 16,
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#1a1a1a",
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 48, color: "#3f3f46" }}>No Image</span>
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div
          style={{
            width: "50%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "40px 60px 40px 20px",
          }}
        >
          <p style={{ fontSize: 20, color: "#71717a", marginBottom: 8 }}>{storeName}</p>
          <h1
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: 24,
              lineHeight: 1.2,
            }}
          >
            {productName.length > 50 ? `${productName.slice(0, 50)}...` : productName}
          </h1>
          {price && (
            <p
              style={{
                fontSize: 40,
                fontWeight: 600,
                color: "#22c55e",
              }}
            >
              {price}
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            right: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 18, color: "#52525b" }}>Powered by</span>
          <span style={{ fontSize: 20, fontWeight: 600, color: "#a1a1aa" }}>Indigo</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
