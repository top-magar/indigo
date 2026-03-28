"use client"

import React from "react"
import { useEditor } from "@craftjs/core"
import { Settings2, MousePointerClick } from "lucide-react"
import { SpacingControl } from "./spacing-control"
import { SizeControl } from "./size-control"
import { BreakpointIndicator } from "./responsive-settings"
import { AnimationControl } from "./animation-control"

export function SettingsPanel() {
  const { selected, selectedName, settingsComponent } = useEditor((state) => {
    const [currentNodeId] = state.events.selected
    if (!currentNodeId) return { selected: false }

    const node = state.nodes[currentNodeId]
    return {
      selected: true,
      selectedName: node.data.displayName || node.data.name,
      settingsComponent: node.related?.settings,
    }
  })

  if (!selected)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">No selection</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground/60">Click a block on the canvas to edit</p>
        </div>
      </div>
    )

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
          <Settings2 className="h-4 w-4 text-primary" />
        </div>
        <p className="text-[12px] font-semibold text-foreground">{selectedName}</p>
      </div>

      {/* Breakpoint indicator */}
      <div className="px-4 pt-3">
        <BreakpointIndicator />
      </div>

      {/* Universal size control */}
      <div className="border-b border-border/50 px-4 py-3">
        <SizeControl />
      </div>

      {/* Universal spacing control */}
      <div className="border-b border-border/50 px-4 py-3">
        <SpacingControl />
      </div>

      {/* Animation control */}
      <div className="border-b border-border/50 px-4 py-3">
        <AnimationControl />
      </div>

      {/* Block-specific settings */}
      <div className="p-4">
        {settingsComponent ? React.createElement(settingsComponent) : (
          <p className="text-[11px] text-muted-foreground">No settings available for this block.</p>
        )}
      </div>
    </div>
  )
}
