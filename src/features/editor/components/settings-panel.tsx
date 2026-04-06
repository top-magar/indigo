"use client"

import React from "react"
import { useEditor } from "@craftjs/core"
import { Copy, ClipboardPaste, Settings2 } from "lucide-react"
import { useStyleClipboard } from "../use-style-clipboard"
import { SizeControl } from "./size-control"
import { SpacingControl } from "./spacing-control"
import { PanelShell } from "./panel-shell"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

function CopyPasteButtons({ nodeId }: { nodeId: string }) {
  const { actions, query } = useEditor()
  const { copy, paste, hasClipboard } = useStyleClipboard()

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { copy(query.node(nodeId).get().data.props ?? {}) }}>
            <Copy className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy style (⌘⇧C)</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!hasClipboard} onClick={() => paste((cb) => actions.setProp(nodeId, cb))}>
            <ClipboardPaste className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Paste style (⌘⇧V)</TooltipContent>
      </Tooltip>
    </>
  )
}

export function SettingsPanel() {
  const { selected } = useEditor((state) => {
    const [currentNodeId] = state.events.selected
    if (!currentNodeId) return { selected: null }
    const node = state.nodes[currentNodeId]
    const props = node.data.props ?? {}
    return {
      selected: {
        id: currentNodeId,
        name: node.data.displayName || node.data.name,
        settings: node.related && node.related.settings,
        hasOwnSpacing: "paddingTop" in props || "paddingBottom" in props,
      },
    }
  })

  if (!selected) return null

  return (
    <PanelShell title={selected.name} icon={Settings2} actions={<CopyPasteButtons nodeId={selected.id} />}>
      {selected.settings
        ? React.createElement(selected.settings)
        : <p className="px-3 py-4 text-xs text-muted-foreground">No settings for this block.</p>
      }
      <SizeControl />
      {!selected.hasOwnSpacing && <SpacingControl />}
    </PanelShell>
  )
}
