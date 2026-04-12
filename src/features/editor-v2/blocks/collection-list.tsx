"use client"
import { useEffect, useState } from "react"
import { useBlockMode } from "./data-context"

interface Collection { image: string; name: string }
interface CollectionListProps { collections: string; columns: number; heading: string; limit?: number }

export function CollectionList({ collections, columns, heading, limit }: CollectionListProps) {
  const { mode, slug } = useBlockMode()
  const [items, setItems] = useState<Collection[]>([])
  const [loading, setLoading] = useState(mode === "live")

  useEffect(() => {
    if (mode === "editor") { try { setItems(JSON.parse(collections)) } catch { setItems([]) }; return }
    const params = limit ? `?limit=${limit}` : ""
    fetch(`/api/store/${slug}/categories${params}`)
      .then((r) => r.json())
      .then((d) => setItems((d.data?.categories ?? []).map((c: Record<string, unknown>) => ({
        image: (c.image as string) ?? "", name: c.name as string,
      }))))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [mode, slug, collections, limit])

  if (loading) return (
    <div className="py-8">
      {heading && <h2 className="mb-6 text-2xl" style={{ fontFamily: "var(--store-font-heading, Inter, sans-serif)", fontWeight: "var(--store-heading-weight, 700)", color: "var(--store-color-text, #0f172a)" }}>{heading}</h2>}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-gray-200" />)}
      </div>
    </div>
  )

  return (
    <div className="py-8">
      {heading && <h2 className="mb-6 text-2xl" style={{ fontFamily: "var(--store-font-heading, Inter, sans-serif)", fontWeight: "var(--store-heading-weight, 700)", color: "var(--store-color-text, #0f172a)" }}>{heading}</h2>}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {items.map((c, i) => (
          <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-200">
            {c.image && <img src={c.image} alt={c.name} className="h-full w-full object-cover" />}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
              <span className="text-lg font-semibold text-white">{c.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
