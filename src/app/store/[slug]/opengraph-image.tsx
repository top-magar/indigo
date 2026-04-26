import { ImageResponse } from "next/og"

export const alt = "Store"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const res = await fetch(`${supabaseUrl}/rest/v1/tenants?slug=eq.${slug}&select=name,description&limit=1`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  }).then(r => r.json())

  const tenant = res?.[0]
  const storeName = tenant?.name || "Store"
  const description = tenant?.description || "Shop amazing products"

  return new ImageResponse(
    (
      <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa" }}>
        <h1 style={{ fontSize: 64, fontWeight: 600, color: "#0a0a0a", marginBottom: 16 }}>{storeName}</h1>
        <p style={{ fontSize: 28, color: "#71717a", maxWidth: 700, textAlign: "center", lineHeight: 1.4 }}>
          {description.length > 100 ? `${description.slice(0, 100)}...` : description}
        </p>
        <p style={{ position: "absolute", bottom: 30, fontSize: 18, color: "#a1a1aa" }}>Powered by Indigo</p>
      </div>
    ),
    { ...size }
  )
}
