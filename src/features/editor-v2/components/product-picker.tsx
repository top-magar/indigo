"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEditorV2Context } from "../editor-context"
import { fetchProductsAction } from "../actions"

export interface PickedProduct {
  id: string
  name: string
  price: string
  image: string
  slug: string
}

interface ProductPickerProps {
  onSelect: (product: PickedProduct) => void
  trigger?: React.ReactNode
}

export function ProductPicker({ onSelect, trigger }: ProductPickerProps) {
  const { tenantId } = useEditorV2Context()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState<{ id: string; name: string; slug: string; price: string; compare_at_price: string | null; images: { url: string; alt?: string }[]; status: string }[]>([])

  useEffect(() => {
    if (!open || !tenantId) return
    const t = setTimeout(async () => {
      const res = await fetchProductsAction(tenantId, search || undefined)
      if (res.success) setProducts(res.products)
    }, 300)
    return () => clearTimeout(t)
  }, [open, search, tenantId])

  const pick = (p: typeof products[number]) => {
    onSelect({ id: p.id, name: p.name, price: p.price, image: p.images?.[0]?.url ?? "", slug: p.slug })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button variant="outline" size="sm" className="h-7 text-xs w-full">Select Product</Button>}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[70vh] flex flex-col">
        <DialogHeader><DialogTitle className="text-sm">Pick a Product</DialogTitle></DialogHeader>
        <Input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-7 text-xs" />
        <div className="flex-1 overflow-y-auto space-y-1">
          {products.map((p) => (
            <button key={p.id} onClick={() => pick(p)} className="flex items-center gap-2 w-full p-2 rounded hover:bg-muted text-left text-xs">
              {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="h-8 w-8 rounded object-cover shrink-0" />}
              <span className="flex-1 truncate">{p.name}</span>
              <span className="text-muted-foreground">${p.price}</span>
            </button>
          ))}
          {products.length === 0 && <p className="text-xs text-muted-foreground p-2">No products found</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
