"use client"

import React from "react"
import { useEditor } from "@craftjs/core"
import { Copy, ClipboardPaste } from "lucide-react"
import { useStyleClipboard } from "../use-style-clipboard"
import { SizeControl } from "./size-control"
import { SpacingControl } from "./spacing-control"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

function CopyPasteButtons({ nodeId }: { nodeId: string }) {
  const { actions, query } = useEditor()
  const { copy, paste, hasClipboard } = useStyleClipboard()

  return (
    <div className="flex gap-0.5 ml-auto">
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
    </div>
  )
}

export function SettingsPanel() {
  const { selected } = useEditor((state) => {
    const [currentNodeId] = state.events.selected
    if (!currentNodeId) return { selected: null }
    const node = state.nodes[currentNodeId]
    return {
      selected: {
        id: currentNodeId,
        name: node.data.displayName || node.data.name,
        settings: node.related && node.related.settings,
      },
    }
  })

  if (!selected) return null

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: 'var(--editor-text)' }}>
      <div className="flex items-center gap-2 h-11 px-3 shrink-0">
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--editor-accent-light)' }}>
          <div className="w-2 h-2 rounded-sm" style={{ background: 'var(--editor-accent)' }} />
        </div>
        <span className="text-[13px] font-semibold">{selected.name}</span>
        <CopyPasteButtons nodeId={selected.id} />
      </div>
      <Separator />

      <ScrollArea className="flex-1">
        {selected.settings
          ? React.createElement(selected.settings)
          : <p className="px-3 py-4 text-xs" style={{ color: 'var(--editor-text-disabled)' }}>No settings for this block.</p>
        }
        <SizeControl />
        <SpacingControl />
      </ScrollArea>
    </div>
  )
}
