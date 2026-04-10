interface TrustBadgesProps {
  badges: string; variant: "icons" | "text"
}

export function TrustBadges({ badges, variant }: TrustBadgesProps) {
  const items: { icon: string; label: string }[] = (() => { try { return JSON.parse(badges) } catch { return [] } })()
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-6">
      {items.map((b, i) => (
        <div key={i} className={`flex items-center gap-2 ${variant === "icons" ? "flex-col text-center" : ""}`}>
          <span className="text-2xl">{b.icon}</span>
          <span className="text-sm font-medium text-gray-700">{b.label}</span>
        </div>
      ))}
    </div>
  )
}
