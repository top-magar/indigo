interface MarqueeProps {
  items: string; speed: number; direction: "left" | "right"; pauseOnHover: boolean
}

export function Marquee({ items, speed = 30, direction, pauseOnHover }: MarqueeProps) {
  const list: { text: string }[] = (() => { try { return JSON.parse(items) } catch { return [] } })()
  const doubled = [...list, ...list]
  const dir = direction === "right" ? "reverse" : "normal"
  return (
    <div className="overflow-hidden py-4" style={pauseOnHover ? { ["--pause" as string]: "paused" } : undefined}>
      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .marquee-track { display: flex; gap: 3rem; width: max-content; animation: marquee ${speed}s linear infinite; animation-direction: ${dir}; }
        .marquee-track:hover { animation-play-state: var(--pause, running); }
      `}</style>
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="whitespace-nowrap text-lg font-medium" style={{ color: "var(--store-color-muted, #64748b)" }}>{item.text}</span>
        ))}
      </div>
    </div>
  )
}
