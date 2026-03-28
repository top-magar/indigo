"use client"

import { Layers, useLayer } from "@craftjs/layers"
import { useEditor, ROOT_NODE } from "@craftjs/core"
import { ChevronRight, ChevronDown, Eye, EyeOff } from "lucide-react"
import { cn } from "@/shared/utils"
import { craftRef } from "../craft-ref"

export function LayersPanel() {
  return (
    <div className="flex flex-col">
      <div className="px-4 pb-2 pt-4">
        <h2 className="text-[12px] font-semibold text-foreground">Layers</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Full element tree</p>
      </div>
      <div className="flex-1 overflow-y-auto px-1">
        <Layers expandRootOnLoad renderLayer={CustomLayer} />
      </div>
    </div>
  )
}

/**
 * Custom layer renderer for @craftjs/layers.
 * Single useLayer call with collector to avoid double subscription.
 */
function CustomLayer({ children }: { children?: React.ReactNode }) {
  const {
    id,
    depth,
    children: childIds,
    connectors: { layer, drag, layerHeader },
    actions: { toggleLayer },
    expanded,
    hovered,
    selected,
  } = useLayer((l) => ({
    expanded: l.expanded,
    hovered: l.event.hovered,
    selected: l.event.selected,
  }))

  const { displayName, hidden, actions: editorActions } = useEditor((state) => {
    const node = state.nodes[id]
    return {
      displayName: node?.data?.displayName || node?.data?.name || "Unknown",
      hidden: !!node?.data?.hidden,
    }
  })

  const hasChildren = childIds.length > 0
  const isRoot = id === ROOT_NODE

  return (
    <div ref={craftRef(layer)} className="craft-layer-node">
      <div
        ref={craftRef(layerHeader)}
        className={cn(
          "group flex items-center gap-0.5 rounded px-2 py-1 cursor-pointer transition-colors",
          selected ? "bg-primary/10 text-foreground" : hovered ? "bg-accent/40" : "hover:bg-accent/30",
          hidden && "opacity-40"
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        {/* Expand toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleLayer() }}
          aria-label={expanded ? "Collapse" : "Expand"}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded",
            hasChildren ? "hover:bg-accent" : "invisible"
          )}
        >
          {hasChildren && (expanded
            ? <ChevronDown className="h-3 w-3 text-muted-foreground" />
            : <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
        </button>

        {/* Drag handle + name */}
        <div ref={craftRef(drag)} className="flex flex-1 items-center gap-1 truncate">
          <span className={cn(
            "truncate text-[11px]",
            selected ? "font-semibold" : "font-medium",
            "text-foreground/80"
          )}>
            {displayName}
          </span>
        </div>

        {/* Visibility toggle */}
        {!isRoot && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              editorActions.setHidden(id, !hidden)
            }}
            className="rounded p-0.5 text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 hover:text-foreground"
            title={hidden ? "Show" : "Hide"}
          >
            {hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Children rendered by @craftjs/layers */}
      {children}
    </div>
  )
}
