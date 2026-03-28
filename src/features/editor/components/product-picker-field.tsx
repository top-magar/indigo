"use client"

import { useState, useEffect, useTransition } from "react"
import { fetchProductsAction } from "../actions"

interface ProductItem {
  id: string
  name: string
  slug: string
  price: number
  images: any[]
}

interface ProductPickerFieldProps {
  label: string
  tenantId: string
  value: string
  onChange: (product: ProductItem | null) => void
}

export function ProductPickerField({ label, tenantId, value, onChange }: ProductPickerFieldProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, startLoad] = useTransition()

  useEffect(() => {
    if (!open) return
    startLoad(async () => {
      const res = await fetchProductsAction(tenantId, search || undefined)
      if (res.success) setProducts(res.products as ProductItem[])
    })
  }, [open, search, tenantId])

  const selected = products.find((p) => p.id === value)

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      {value && selected ? (
        <div className="flex items-center gap-2 rounded border border-border/50 p-2">
          {selected.images?.[0]?.url ? (
            <img src={selected.images[0].url} alt="" className="h-8 w-8 rounded object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-[11px]">📦</div>
          )}
          <div className="flex-1 truncate text-[11px]">{selected.name}</div>
          <button onClick={() => onChange(null)} aria-label="Remove product" className="text-[11px] text-muted-foreground hover:text-foreground">✕</button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="rounded border border-dashed border-border/50 px-3 py-2 text-[11px] text-muted-foreground hover:border-foreground">
          Choose product…
        </button>
      )}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearch("") }} />
          <div className="relative z-50 mt-1 rounded-lg border border-border/50 bg-background shadow-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full border-b border-border/50 bg-transparent px-3 py-2 text-[11px] outline-none"
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto">
            {loading && <div className="px-3 py-2 text-[11px] text-muted-foreground">Loading…</div>}
            {!loading && products.length === 0 && <div className="px-3 py-2 text-[11px] text-muted-foreground">No products found</div>}
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => { onChange(p); setOpen(false); setSearch("") }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-accent"
              >
                {p.images?.[0]?.url ? (
                  <img src={p.images[0].url} alt="" className="h-6 w-6 rounded object-cover" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-[11px]">📦</div>
                )}
                <span className="flex-1 truncate">{p.name}</span>
                <span className="text-[10px] text-muted-foreground">${(p.price / 100).toFixed(2)}</span>
              </button>
            ))}
          </div>
          <button onClick={() => { setOpen(false); setSearch("") }} className="w-full border-t border-border/50 px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-accent">
            Cancel
          </button>
          </div>
        </>
      )}
    </div>
  )
}
