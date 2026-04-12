/** Compact uppercase label used across editor panels */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{children}</span>
}

/** Vertical divider for toolbars */
export function ToolbarSeparator({ className }: { className?: string }) {
  return <div className={`w-px h-4 bg-white/20 ${className ?? ""}`} />
}
