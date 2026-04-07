"use client"

import { useEffect } from "react"
import { useEditor } from "@craftjs/core"
import { Button } from "@/components/ui/button"
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

  // Auto-open when a block is selected
  useEffect(() => {
    if (selectionCount > 0 && !open) onToggle()
  }, [selectionCount]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ flexShrink: 0, position: 'relative', overflow: 'visible', height: '100%', pointerEvents: 'none' }}>
      {/* Ribbon tab */}
      <Button
        variant="outline"
        onClick={onToggle}
        title={open ? "Close panel" : "Open settings"}
        className="absolute top-2 -left-6 z-10 w-6 h-12 rounded-l-md rounded-r-none border border-r-0 bg-background hover:bg-background text-xs p-0 flex items-center justify-center cursor-pointer"
        style={{ pointerEvents: 'auto', color: 'var(--editor-icon-secondary)', transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.15s' }}
        onMouseEnter={(e) => { e.currentTarget.style.width = '30px'; e.currentTarget.style.left = '-30px' }}
        onMouseLeave={(e) => { e.currentTarget.style.width = '24px'; e.currentTarget.style.left = '-24px' }}
      >
        {open ? '›' : '‹'}
      </Button>

      {/* Panel content */}
      <div style={{
        pointerEvents: 'auto',
        width: open ? 280 : 0, height: '100%', display: 'flex', flexDirection: 'column',
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
