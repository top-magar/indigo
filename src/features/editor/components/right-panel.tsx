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

  useEffect(() => {
    if (selectionCount > 0 && !open) onToggle()
  }, [selectionCount]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex shrink-0" style={{ height: '100%' }}>
      {/* Ribbon toggle — always visible, part of layout flow, never overlaps canvas */}
      <div className="flex items-start shrink-0 border-l" style={{ borderColor: 'var(--editor-border)' }}>
        <Button
          variant="ghost"
          onClick={onToggle}
          title={open ? "Close panel" : "Open settings"}
          className="w-5 h-12 mt-2 rounded-none text-xs p-0 flex items-center justify-center cursor-pointer"
          style={{ color: 'var(--editor-icon-secondary)' }}
        >
          {open ? '›' : '‹'}
        </Button>
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
