"use client"

import { useState, useEffect, useTransition } from "react"
import { fetchProductsAction } from "../actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ProductItem { id: string; name: string; slug: string; price: number; images: { url?: string }[] }

interface ProductPickerFieldProps { label: string; tenantId: string; value: string; onChange: (product: ProductItem | null) => void }

export function ProductPickerField({ label, tenantId, value, onChange }: ProductPickerFieldProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, startLoad] = useTransition()

  useEffect(() => {
    if (!open) return
    startLoad(async () => { const res = await fetchProductsAction(tenantId, search || undefined); if (res.success) setProducts(res.products as ProductItem[]) })
  }, [open, search, tenantId])

  const selected = products.find((p) => p.id === value)

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {value && selected ? (
        <div className="flex items-center gap-2 p-2 rounded border border-border">
          {selected.images?.[0]?.url
            ? <img src={selected.images[0].url} alt="" className="w-8 h-8 rounded-md object-cover" />
            : <div className="w-8 h-8 rounded-md flex items-center justify-center text-xs" style={{ background: 'var(--editor-surface-secondary)' }}>📦</div>}
          <span className="flex-1 text-xs truncate text-foreground">{selected.name}</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onChange(null)}>✕</Button>
        </div>
      ) : (
        <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch("") }}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-auto py-2 text-xs font-normal border-dashed justify-start text-muted-foreground">
              Choose product…
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" autoFocus className="h-9 text-[13px] rounded-none border-0 border-b" />
            <ScrollArea className="max-h-48">
              {loading && <div className="px-3 py-2 text-xs text-muted-foreground">Loading…</div>}
              {!loading && products.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No products found</div>}
              {products.map((p) => (
                <Button key={p.id} variant="ghost" onClick={() => { onChange(p); setOpen(false); setSearch("") }}
                  className="flex items-center gap-2 w-full px-3 py-2 h-auto text-left text-xs justify-start font-normal text-foreground">
                  {p.images?.[0]?.url
                    ? <img src={p.images[0].url} alt="" className="w-6 h-6 rounded object-cover" />
                    : <div className="w-6 h-6 rounded flex items-center justify-center text-[10px]" style={{ background: 'var(--editor-surface-secondary)' }}>📦</div>}
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="text-[11px] text-muted-foreground">${(p.price / 100).toFixed(2)}</span>
                </Button>
              ))}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
