"use client"
import { useEffect, useState } from "react"
import NextImage from "next/image"
import { useBlockMode } from "./data-context"

interface FeaturedProductProps {
  image: string; name: string; price: string; description: string
  buttonText: string; badge: string; productId?: string
}

export function FeaturedProduct({ image, name, price, description, buttonText, badge, productId }: FeaturedProductProps) {
  const { mode, slug } = useBlockMode()
  const [data, setData] = useState({ image, name, price, description })
  const [loading, setLoading] = useState(mode === "live" && !!productId)

  useEffect(() => {
    if (mode === "editor" || !productId) { setData({ image, name, price, description }); return }
    fetch(`/api/store/${slug}/products/${productId}`)
      .then((r) => r.json())
      .then((d) => {
        const p = d.data?.product
        if (p) setData({ image: (p.images as string[])?.[0] ?? "", name: p.name, price: `$${p.price}`, description: p.description ?? "" })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [mode, slug, productId, image, name, price, description])

  if (loading) return <div className="grid min-h-[400px] animate-pulse grid-cols-1 gap-8 py-8 @md:grid-cols-2"><div className="rounded-lg bg-gray-200" /><div className="space-y-4 py-12"><div className="h-8 w-2/3 rounded bg-gray-200" /><div className="h-6 w-1/4 rounded bg-gray-200" /><div className="h-20 w-full rounded bg-gray-200" /></div></div>

  return (
    <div className="grid min-h-[400px] grid-cols-1 gap-8 py-8 @md:grid-cols-2">
      <div className="relative overflow-hidden rounded-lg bg-gray-100">
        {data.image ? <NextImage src={data.image} alt={data.name} fill sizes="(max-width: 768px) 100vw, 50vw" loading="lazy" unoptimized className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-400">Product image</div>}
        {badge && <span className="absolute left-3 top-3 rounded bg-black px-2 py-1 text-xs font-semibold text-white">{badge}</span>}
      </div>
      <div className="flex flex-col justify-center">
        <h2 className="text-3xl" style={{ fontFamily: "var(--store-font-heading)", fontWeight: "var(--store-heading-weight)", color: "var(--store-color-text)" }}>{data.name}</h2>
        <p className="mt-2 text-2xl font-semibold">{data.price}</p>
        {data.description && <p className="mt-4" style={{ color: "var(--store-color-muted)" }}>{data.description}</p>}
        {buttonText && <button className="mt-6 w-fit rounded px-8 py-3 font-medium text-white" style={{ backgroundColor: "var(--store-color-primary, #000)", borderRadius: "var(--store-btn-radius, 8px)" }}>{buttonText}</button>}
      </div>
    </div>
  )
}
