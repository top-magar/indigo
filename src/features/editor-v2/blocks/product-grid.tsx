interface ProductGridProps {
  columns: number; products: string; heading: string
}

export function ProductGrid({ columns, products, heading }: ProductGridProps) {
  const items: { image: string; name: string; price: string }[] = (() => { try { return JSON.parse(products) } catch { return [] } })()
  return (
    <div className="py-8">
      {heading && <h2 className="mb-6 text-2xl font-bold">{heading}</h2>}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {items.map((p, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-gray-200">
            <div className="aspect-square bg-gray-100">
              {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-400">No image</div>}
            </div>
            <div className="p-3">
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-600">{p.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
