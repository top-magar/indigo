interface ColumnsProps { columns: number; gap: number }

export function Columns({ columns, gap }: ColumnsProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap, minHeight: 80 }}>
      {Array.from({ length: columns }, (_, i) => (
        <div key={i} className="flex items-center justify-center rounded border-2 border-dashed border-gray-200 p-4 text-sm text-gray-400">
          Column {i + 1}
        </div>
      ))}
    </div>
  )
}
