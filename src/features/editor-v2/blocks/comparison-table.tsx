interface ComparisonTableProps {
  heading: string; columns: string; rows: string
}

export function ComparisonTable({ heading, columns, rows }: ComparisonTableProps) {
  const cols: { name: string; highlighted: boolean }[] = (() => { try { return JSON.parse(columns) } catch { return [] } })()
  const items: { feature: string; values: boolean[] }[] = (() => { try { return JSON.parse(rows) } catch { return [] } })()
  return (
    <div className="py-8">
      {heading && <h2 className="mb-6 text-center text-2xl font-bold">{heading}</h2>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b p-3 text-left font-medium text-gray-500">Feature</th>
              {cols.map((c, i) => (
                <th key={i} className={`border-b p-3 text-center font-semibold ${c.highlighted ? "bg-blue-600 text-white" : "text-gray-900"}`}>
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((r, i) => (
              <tr key={i} className="border-b">
                <td className="p-3 text-gray-700">{r.feature}</td>
                {r.values.map((v, j) => (
                  <td key={j} className={`p-3 text-center ${cols[j]?.highlighted ? "bg-blue-50" : ""}`}>
                    {v ? <span className="text-green-600">✓</span> : <span className="text-gray-300">✗</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
