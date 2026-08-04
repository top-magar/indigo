"use client";

import { useState } from "react";
import { MIcon } from "../../../ui/m-icon";
import type { El } from "../../../core/types";
import { getEditorProducts } from "../../../lib/queries";

const PRODUCT_FIELDS = [
  { value: "name", label: "Product Name" },
  { value: "price", label: "Price" },
  { value: "compareAtPrice", label: "Compare Price" },
  { value: "description", label: "Description" },
  { value: "images[0]", label: "Main Image" },
  { value: "slug", label: "Slug" },
];

const COLLECTION_FIELDS = [
  { value: "name", label: "Collection Name" },
  { value: "description", label: "Description" },
];

export function BindingSection({ selected, onUpdate }: { selected: El; onUpdate: (el: El) => void }) {
  const [products, setProducts] = useState<{ id: string; name: string; price: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const binding = selected.binding;

  const loadProducts = async () => {
    if (products.length > 0) return;
    setLoading(true);
    const data = await getEditorProducts({ limit: 20 });
    setProducts(data.map(p => ({ id: p.id, name: p.name, price: p.price })));
    setLoading(false);
  };

  const setBindingSource = (source: "product" | "collection") => {
    onUpdate({ ...selected, binding: { source, field: "name", resourceId: undefined } });
  };

  const setBindingField = (field: string) => {
    if (!binding) return;
    onUpdate({ ...selected, binding: { source: binding.source, field, resourceId: (binding as any).resourceId } as any });
  };

  const setProductId = (id: string) => {
    if (binding?.source !== "product") return;
    onUpdate({ ...selected, binding: { source: 'product', field: binding.field || 'name', resourceId: id || undefined } });
  };

  const clearBinding = () => {
    const el = { ...selected };
    delete el.binding;
    onUpdate(el);
  };

  return (
    <div className="px-3 py-2 border-b border-sidebar-border">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">Data Binding</span>
        {binding && <button onClick={clearBinding} className="text-[10px] text-destructive hover:underline">Remove</button>}
      </div>
      {binding ? (
        <div className="space-y-1">
          <div className="flex items-center gap-1 h-6 px-2 rounded-md bg-primary/10 text-primary text-[10px] font-medium">
            <MIcon name="link" size={11} />
            <span>{binding.source}.{binding.field}</span>
          </div>
          
          <select value={binding.source} onChange={(e) => setBindingSource(e.target.value as "product" | "collection")} className="w-full h-6 rounded-md border border-sidebar-border bg-sidebar text-[10px] px-1">
            <option value="product">Product Data</option>
            <option value="collection">Collection Data</option>
          </select>
          
          <select value={binding.field} onChange={(e) => setBindingField(e.target.value)} className="w-full h-6 rounded-md border border-sidebar-border bg-sidebar text-[10px] px-1">
            {(binding.source === "collection" ? COLLECTION_FIELDS : PRODUCT_FIELDS).map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          {binding.source === "product" && (
            <select value={binding.resourceId || ''} onChange={(e) => setProductId(e.target.value)} onFocus={loadProducts} className="w-full h-8 rounded-md border border-sidebar-border bg-sidebar text-xs px-2">
              <option value="">All products (dynamic)</option>
              {loading && <option disabled>Loading...</option>}
              {products.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>)}
            </select>
          )}
        </div>
      ) : (
        <div className="flex gap-1">
          <button onClick={() => setBindingSource('product')} className="flex-1 flex items-center justify-center gap-1 h-6 rounded-md border border-dashed border-sidebar-border text-[10px] text-muted-foreground/40 hover:text-foreground hover:border-primary/40 transition-colors">
            <MIcon name="link" size={11} /> Product
          </button>
          <button onClick={() => setBindingSource('collection')} className="flex-1 flex items-center justify-center gap-1 h-6 rounded-md border border-dashed border-sidebar-border text-[10px] text-muted-foreground/40 hover:text-foreground hover:border-primary/40 transition-colors">
            <MIcon name="link" size={11} /> Collection
          </button>
        </div>
      )}
    </div>
  );
}
