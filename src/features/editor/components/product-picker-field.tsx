"use client"

import { useState, useEffect, useTransition } from "react"
import { fetchProductsAction } from "../actions"

interface ProductItem { id: string; name: string; slug: string; price: number; images: { url?: string }[] }

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text-secondary)' }}>{label}</span>
      {value && selected ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 'var(--editor-radius)', border: '1px solid var(--editor-border)' }}>
          {selected.images?.[0]?.url
            ? <img src={selected.images[0].url} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
            : <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--editor-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>📦</div>
          }
          <span style={{ flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--editor-text)' }}>{selected.name}</span>
          <button onClick={() => onChange(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--editor-text-secondary)' }}>✕</button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{ padding: '8px 12px', borderRadius: 'var(--editor-radius)', border: '1px dashed var(--editor-border)', background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--editor-text-secondary)', transition: 'all 0.1s' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--editor-accent)'; e.currentTarget.style.color = 'var(--editor-accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--editor-border)'; e.currentTarget.style.color = 'var(--editor-text-secondary)' }}
        >
          Choose product…
        </button>
      )}
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => { setOpen(false); setSearch("") }} />
          <div style={{ position: 'relative', zIndex: 50, marginTop: 4, borderRadius: 10, border: '1px solid var(--editor-border)', background: 'var(--editor-surface)', boxShadow: 'var(--editor-shadow-popover)' }}>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…" autoFocus
              style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: 'none', borderBottom: '1px solid var(--editor-border)', background: 'transparent', color: 'var(--editor-text)', outline: 'none' }}
            />
            <div style={{ maxHeight: 192, overflowY: 'auto' }}>
              {loading && <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--editor-text-secondary)' }}>Loading…</div>}
              {!loading && products.length === 0 && <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--editor-text-secondary)' }}>No products found</div>}
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { onChange(p); setOpen(false); setSearch("") }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 12px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 12, color: 'var(--editor-text)', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                >
                  {p.images?.[0]?.url
                    ? <img src={p.images[0].url} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />
                    : <div style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--editor-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>📦</div>
                  }
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--editor-text-secondary)' }}>${(p.price / 100).toFixed(2)}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => { setOpen(false); setSearch("") }}
              style={{ width: '100%', padding: '6px 12px', borderTop: '1px solid var(--editor-border)', border: 'none', borderTopStyle: 'solid', borderTopWidth: 1, borderTopColor: 'var(--editor-border)', background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--editor-text-secondary)', transition: 'background 0.1s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}
