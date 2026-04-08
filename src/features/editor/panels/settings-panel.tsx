"use client"

import React, { useState } from "react"
import { useEditor } from "@craftjs/core"
import { Copy, ClipboardPaste, Settings2, FileText, Paintbrush } from "lucide-react"
import { useStyleClipboard } from "../hooks/use-style-clipboard"
import { SizeControl } from "../controls/size-control"
import { SpacingControl } from "../controls/spacing-control"
import { PanelShell } from "./panel-shell"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { TextField, TextAreaField } from "../controls/editor-fields"
import { LayoutSuggestions } from "../controls/layout-suggestions"

// Content field heuristics — props with these patterns are editable content
const CONTENT_PATTERNS = ["text", "heading", "title", "subtitle", "description", "label", "name", "message", "body", "cta", "button"]
const IMAGE_PATTERNS = ["image", "src", "url", "logo"]
const SKIP_KEYS = ["backgroundColor", "textColor", "ctaColor", "ctaTextColor", "accentColor", "overlayColor", "urgencyColor", "ctaHref", "ctaLink"]

function isContentField(key: string, value: unknown): boolean {
  if (typeof value !== "string") return false
  if (key.startsWith("_") || key.startsWith("hide")) return false
  if (SKIP_KEYS.includes(key)) return false
  const lower = key.toLowerCase()
  return CONTENT_PATTERNS.some((p) => lower.includes(p))
}

function isImageField(key: string, value: unknown): boolean {
  if (typeof value !== "string") return false
  if (key.startsWith("_")) return false
  const lower = key.toLowerCase()
  return IMAGE_PATTERNS.some((p) => lower.includes(p)) && !lower.includes("color")
}

function humanize(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim()
}

function QuickEditContent({ nodeId }: { nodeId: string }) {
  const { props, actions } = useEditor((state) => ({
    props: state.nodes[nodeId]?.data.props ?? {},
  }))

  const set = (key: string, val: string) => actions.setProp(nodeId, (p: Record<string, unknown>) => { p[key] = val })

  const contentFields = Object.entries(props).filter(([k, v]) => isContentField(k, v))
  const imageFields = Object.entries(props).filter(([k, v]) => isImageField(k, v))

  if (contentFields.length === 0 && imageFields.length === 0) {
    return <p className="px-3 py-6 text-xs text-muted-foreground text-center">No editable content in this block.</p>
  }

  return (
    <div className="flex flex-col gap-3 px-3 py-3">
      {contentFields.map(([key, value]) => {
        const v = value as string
        return v.length > 60
          ? <TextAreaField key={key} label={humanize(key)} value={v} onChange={(val) => set(key, val)} />
          : <TextField key={key} label={humanize(key)} value={v} onChange={(val) => set(key, val)} />
      })}
      {imageFields.map(([key, value]) => (
        <TextField key={key} label={humanize(key)} value={value as string} onChange={(val) => set(key, val)} placeholder="Image URL" />
      ))}
    </div>
  )
}

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
  const [mode, setMode] = useState<"design" | "content">("design")

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
      {/* Content / Design toggle */}
      <div className="flex mx-3 mb-2 rounded-md border overflow-hidden" style={{ borderColor: "var(--editor-border)" }}>
        <button onClick={() => setMode("content")}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 text-[12px] font-medium transition-colors"
          style={{ background: mode === "content" ? "var(--editor-accent-light, #e8f0fe)" : "transparent", color: mode === "content" ? "var(--editor-accent, #005bd3)" : "var(--editor-text-secondary)" }}>
          <FileText className="w-3.5 h-3.5" /> Content
        </button>
        <button onClick={() => setMode("design")}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 text-[12px] font-medium transition-colors"
          style={{ background: mode === "design" ? "var(--editor-accent-light, #e8f0fe)" : "transparent", color: mode === "design" ? "var(--editor-accent, #005bd3)" : "var(--editor-text-secondary)" }}>
          <Paintbrush className="w-3.5 h-3.5" /> Design
        </button>
      </div>

      {mode === "content" ? (
        <QuickEditContent nodeId={selected.id} />
      ) : (
        <>
          {selected.settings
            ? React.createElement(selected.settings)
            : <p className="px-3 py-4 text-xs text-muted-foreground">No settings for this block.</p>
          }
          <div className="px-3"><LayoutSuggestions /></div>
          <SizeControl />
          {!selected.hasOwnSpacing && <SpacingControl />}
        </>
      )}
    </PanelShell>
  )
}
