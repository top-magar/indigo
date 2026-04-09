import { ImageResponse } from "next/og"
import { createClient } from "@/infrastructure/supabase/server"

export const runtime = "edge"
export const alt = "Store"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("name, description, logo_url")
    .eq("slug", slug)
    .single()

  const storeName = tenant?.name || "Store"
  const description = tenant?.description || "Shop amazing products"

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage: "radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "40px 80px",
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: 20,
              lineHeight: 1.1,
            }}
          >
            {storeName}
          </h1>
          <p
            style={{
              fontSize: 32,
              color: "#a1a1aa",
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            {description.length > 100 ? `${description.slice(0, 100)}...` : description}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 24, color: "#71717a" }}>Powered by</span>
          <span style={{ fontSize: 28, fontWeight: 600, color: "#ffffff" }}>Indigo</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
