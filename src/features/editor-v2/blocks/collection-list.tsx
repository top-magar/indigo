interface CollectionListProps {
  collections: string; columns: number; heading: string
}

export function CollectionList({ collections, columns, heading }: CollectionListProps) {
  const items: { image: string; name: string }[] = (() => { try { return JSON.parse(collections) } catch { return [] } })()
  return (
    <div className="py-8">
      {heading && <h2 className="mb-6 text-2xl font-bold">{heading}</h2>}
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
