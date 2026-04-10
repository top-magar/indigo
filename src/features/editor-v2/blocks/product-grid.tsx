"use client"
import { useEffect, useState } from "react"
import { useBlockMode } from "./data-context"

interface Product { image: string; name: string; price: string }
interface ProductGridProps {
  heading: string; columns: number; products: string
  limit?: number; categoryFilter?: string; sortBy?: string
}

function Skeleton({ columns }: { columns: number }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-gray-200">
          <div className="aspect-square bg-gray-200" />
          <div className="space-y-2 p-3"><div className="h-4 w-2/3 rounded bg-gray-200" /><div className="h-3 w-1/3 rounded bg-gray-200" /></div>
        </div>
      ))}
    </div>
  )
}

export function ProductGrid({ heading, columns, products, limit, categoryFilter, sortBy }: ProductGridProps) {
  const { mode, slug } = useBlockMode()
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(mode === "live")

  useEffect(() => {
    if (mode === "editor") {
      try { setItems(JSON.parse(products)) } catch { setItems([]) }
      return
    }
    const params = new URLSearchParams()
    if (limit) params.set("limit", String(limit))
    if (categoryFilter) params.set("category", categoryFilter)
    if (sortBy) params.set("sort", sortBy)
    fetch(`/api/store/${slug}/products?${params}`)
      .then((r) => r.json())
      .then((d) => setItems((d.data?.products ?? []).map((p: Record<string, unknown>) => ({
        image: ((p.images as string[]) ?? [])[0] ?? "", name: p.name as string, price: `$${p.price}`,
      }))))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [mode, slug, products, limit, categoryFilter, sortBy])

  return (
    <div className="py-8">
      {heading && <h2 className="mb-6 text-2xl font-bold">{heading}</h2>}
      {loading ? <Skeleton columns={columns} /> : (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {items.map((p, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-gray-200">
              <div className="aspect-square bg-gray-100">
                {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-400">No image</div>}
              </div>
              <div className="p-3"><p className="font-medium">{p.name}</p><p className="text-sm text-gray-600">{p.price}</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
