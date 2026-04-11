import { useState } from "react"

interface Tab { title: string; content: string }
interface TabsProps { tabs: string }

const parse = (s: string): Tab[] => { try { return JSON.parse(s) } catch { return [] } }

export function Tabs({ tabs }: TabsProps) {
  const [active, setActive] = useState(0)
  const items = parse(tabs)
  return (
    <div className="mx-auto max-w-3xl py-12 px-6">
      <div className="flex gap-1 border-b">
        {items.map((t, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-medium transition ${i === active ? "border-b-2 border-current text-[var(--store-color-primary)]" : "hover:opacity-70"}`} style={i !== active ? { color: "var(--store-color-muted)" } : undefined}>
            {t.title}
          </button>
        ))}
      </div>
      {items[active] && (
        <div className="mt-4 text-sm" style={{ color: "var(--store-color-muted)" }}>{items[active].content}</div>
      )}
    </div>
  )
}
