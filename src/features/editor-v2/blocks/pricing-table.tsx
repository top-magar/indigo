interface PricingTableProps {
  tiers: string; heading: string
}

export function PricingTable({ tiers, heading }: PricingTableProps) {
  const items: { name: string; price: string; features: string[]; highlighted: boolean }[] = (() => { try { return JSON.parse(tiers) } catch { return [] } })()
  return (
    <div className="py-8">
      {heading && <h2 className="mb-6 text-center text-2xl" style={{ fontFamily: "var(--store-font-heading)", fontWeight: "var(--store-heading-weight)", color: "var(--store-color-text)" }}>{heading}</h2>}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${items.length || 1}, minmax(0, 1fr))` }}>
        {items.map((t, i) => (
          <div key={i} className={`rounded-lg border-2 p-6 ${t.highlighted ? "border-black" : "border-gray-200"}`}>
            <h3 className="text-lg font-semibold">{t.name}</h3>
            <p className="mt-2 text-3xl" style={{ fontWeight: "var(--store-heading-weight)", color: "var(--store-color-text)" }}>{t.price}</p>
            <ul className="mt-4 space-y-2">
              {t.features.map((f, j) => <li key={j} className="text-sm" style={{ color: "var(--store-color-muted)" }}>✓ {f}</li>)}
            </ul>
            <button className="mt-6 w-full rounded py-2 text-sm font-medium text-white" style={{ backgroundColor: t.highlighted ? "var(--store-color-primary, #000)" : "var(--store-color-muted, #6b7280)", borderRadius: "var(--store-btn-radius, 8px)" }}>Choose Plan</button>
          </div>
        ))}
      </div>
    </div>
  )
}
