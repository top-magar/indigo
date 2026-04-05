"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { useCallback, useEffect, useState, useRef } from "react"
import { ArrowUp, ArrowDown, Copy, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

export function FloatingToolbar() {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  const { selectedId, selectedName, parentId, index, siblingCount, actions, query } = useEditor((state) => {
    const [nodeId] = state.events.selected
    if (!nodeId || nodeId === ROOT_NODE) return { selectedId: null, selectedName: "", parentId: null, index: -1, siblingCount: 0 }
    const node = state.nodes[nodeId]
    const pid = node?.data.parent ?? null
    const siblings = pid ? state.nodes[pid]?.data.nodes ?? [] : []
    return { selectedId: nodeId, selectedName: node?.data.displayName || node?.data.name || "", parentId: pid, index: siblings.indexOf(nodeId), siblingCount: siblings.length }
  })

  useEffect(() => {
    if (!selectedId) { setPos(null); return }
    const updatePosition = () => {
      const el = document.querySelector(`[data-craft-node-id="${selectedId}"]`) as HTMLElement | null
      const canvas = document.querySelector("[data-editor-canvas]") as HTMLElement | null
      if (!el || !canvas) { setPos(null); return }
      const elRect = el.getBoundingClientRect()
      const canvasRect = canvas.getBoundingClientRect()
      setPos({ top: elRect.top - canvasRect.top - 40, left: elRect.left - canvasRect.left + elRect.width / 2 })
    }
    updatePosition()
    const canvas = document.querySelector("[data-editor-canvas]")
    canvas?.addEventListener("scroll", updatePosition)
    window.addEventListener("resize", updatePosition)
    const observer = new MutationObserver(updatePosition)
    const el = document.querySelector(`[data-craft-node-id="${selectedId}"]`)
    if (el) observer.observe(el, { attributes: true, childList: true, subtree: true })
    return () => { canvas?.removeEventListener("scroll", updatePosition); window.removeEventListener("resize", updatePosition); observer.disconnect() }
  }, [selectedId])

  const handleMoveUp = useCallback(() => { if (selectedId && parentId && index > 0) try { actions.move(selectedId, parentId, index - 1) } catch {} }, [actions, selectedId, parentId, index])
  const handleMoveDown = useCallback(() => { if (selectedId && parentId && index < siblingCount - 1) try { actions.move(selectedId, parentId, index + 2) } catch {} }, [actions, selectedId, parentId, index, siblingCount])
  const handleDuplicate = useCallback(() => { if (selectedId && parentId) try { actions.addNodeTree(query.node(selectedId).toNodeTree(), parentId, index + 1) } catch {} }, [actions, query, selectedId, parentId, index])
  const handleDelete = useCallback(() => { if (selectedId) actions.delete(selectedId) }, [actions, selectedId])

  if (!selectedId || !pos) return null

  return (
    <div ref={ref} className="floating-toolbar pointer-events-auto absolute z-50 flex items-center gap-0.5 rounded-md px-1 py-0.5"
      style={{ top: Math.max(4, pos.top), left: pos.left, transform: "translateX(-50%)", background: 'var(--editor-surface)', border: '1px solid var(--editor-border)', boxShadow: 'var(--editor-shadow-popover)' }}>
      <span className="flex items-center gap-1 px-2 text-[11px] font-semibold" style={{ color: 'var(--editor-text-secondary)' }}>
        <GripVertical className="h-3 w-3" />{selectedName}
      </span>
      <Separator orientation="vertical" className="h-4" />
      <TbBtn icon={ArrowUp} label="Move Up" onClick={handleMoveUp} disabled={index <= 0} />
      <TbBtn icon={ArrowDown} label="Move Down" onClick={handleMoveDown} disabled={index >= siblingCount - 1} />
      <Separator orientation="vertical" className="h-4" />
      <TbBtn icon={Copy} label="Duplicate" onClick={handleDuplicate} />
      <TbBtn icon={Trash2} label="Delete" onClick={handleDelete} destructive />
    </div>
  )
}

function TbBtn({ icon: Icon, label, onClick, disabled, destructive }: { icon: typeof ArrowUp; label: string; onClick: () => void; disabled?: boolean; destructive?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className={`h-7 w-7 ${destructive ? 'hover:bg-destructive/10 hover:text-destructive' : ''}`} onClick={onClick} disabled={disabled}>
          <Icon className="h-3.5 w-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
