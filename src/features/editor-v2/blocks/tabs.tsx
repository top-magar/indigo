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
            className={`px-4 py-2 text-sm font-medium transition ${i === active ? "border-b-2 border-current text-[var(--theme-primary,#000)]" : "text-gray-500 hover:text-gray-700"}`}>
            {t.title}
          </button>
        ))}
      </div>
      {items[active] && (
        <div className="mt-4 text-sm text-gray-700">{items[active].content}</div>
      )}
    </div>
  )
}
