"use client"

import { useEffect, useRef } from "react"
import { useEditor } from "@craftjs/core"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SettingsPanel } from "./settings-panel"
import { BatchEditor } from "./batch-editor"
import { PageSettingsPanel } from "./page-settings-panel"

interface RightPanelProps {
  open: boolean
  onToggle: () => void
}

export function RightPanel({ open, onToggle }: RightPanelProps) {
  const { selectionCount } = useEditor((state) => ({
    selectionCount: state.events.selected.size,
  }))

  const prevCount = useRef(selectionCount)
  useEffect(() => {
    // Only auto-open when selection goes from 0 → >0
    if (selectionCount > 0 && prevCount.current === 0 && !open) onToggle()
    prevCount.current = selectionCount
  }, [selectionCount]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex shrink-0" style={{ height: '100%' }}>
      {/* Ribbon toggle */}
      <div className="flex flex-col items-center shrink-0 border-l bg-background" style={{ borderColor: 'var(--editor-border)', width: 20 }}>
        <button
          onClick={onToggle}
          title={open ? "Close panel" : "Open settings"}
          className="group flex items-center justify-center w-full py-3 mt-1 transition-colors hover:bg-accent/60"
          style={{ borderRadius: '4px 0 0 4px' }}
        >
          {open
            ? <ChevronRight className="size-3.5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
            : <ChevronLeft className="size-3.5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
          }
        </button>
        {/* Subtle line indicator when panel has content */}
        {selectionCount > 0 && !open && (
          <div className="w-1 h-8 mt-2 rounded-full" style={{ backgroundColor: 'var(--editor-accent, #005bd3)', opacity: 0.3 }} />
        )}
      </div>

      {/* Panel content */}
      <div style={{
        width: open ? 280 : 0, height: '100%',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', background: '#ffffff',
        borderLeft: open ? '1px solid var(--editor-border)' : 'none',
        transition: 'width 0.15s ease',
      }}>
        <div style={{ display: selectionCount > 1 ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <BatchEditor />
        </div>
        <div style={{ display: selectionCount === 1 ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <SettingsPanel />
        </div>
        <div style={{ display: selectionCount === 0 ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <PageSettingsPanel />
        </div>
      </div>
    </div>
  )
}
