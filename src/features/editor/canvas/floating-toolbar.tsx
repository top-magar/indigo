"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { useCallback, useEffect, useRef, memo } from "react"
import { ArrowUp, ArrowDown, Copy, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { useViewportZoomContext } from "../hooks/use-viewport-zoom"

export const FloatingToolbar = memo(function FloatingToolbar() {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const { zoom } = useViewportZoomContext()

  // Return flat primitives so Craft.js shallow comparison prevents unnecessary re-renders
  const { selectedId, selectedName, parentId, index, siblingCount, actions, query } = useEditor((state) => {
    const [id] = state.events.selected
    if (!id || id === ROOT_NODE) return { selectedId: null as string | null, selectedName: "", parentId: null as string | null, index: -1, siblingCount: 0 }
    const n = state.nodes[id]
    const pid = n?.data.parent ?? null
    const siblings = pid ? state.nodes[pid]?.data.nodes ?? [] : []
    return { selectedId: id, selectedName: n?.data.displayName || n?.data.name || "", parentId: pid, index: siblings.indexOf(id), siblingCount: siblings.length }
  })

  // Position tracking with rAF throttle, zoom correction, bounds clamping, measured height
  useEffect(() => {
    const toolbar = toolbarRef.current
    if (!selectedId || !toolbar) { toolbar?.style.setProperty("display", "none"); return }

    const updatePosition = () => {
      const el = document.querySelector(`[data-craft-node-id="${selectedId}"]`) as HTMLElement | null
      const canvas = document.querySelector("[data-editor-canvas]") as HTMLElement | null
      if (!el || !canvas || !toolbar) { toolbar?.style.setProperty("display", "none"); return }

      const elRect = el.getBoundingClientRect()
      const canvasRect = canvas.getBoundingClientRect()
      const toolbarH = toolbar.offsetHeight || 32
      const z = zoom || 1

      // Convert screen coords to canvas-relative, accounting for zoom
      const rawTop = (elRect.top - canvasRect.top + canvas.scrollTop) / z
      const rawBottom = (elRect.bottom - canvasRect.top + canvas.scrollTop) / z
      const rawCenterX = (elRect.left - canvasRect.left + canvas.scrollLeft + elRect.width / 2) / z

      const topAbove = rawTop - toolbarH - 8
      const topBelow = rawBottom + 8
      const top = topAbove < 8 ? topBelow : topAbove

      // Horizontal clamp — keep toolbar within canvas
      const canvasW = canvasRect.width / z
      const toolbarW = toolbar.offsetWidth || 160
      const halfW = toolbarW / 2
      const left = Math.max(halfW + 4, Math.min(rawCenterX, canvasW - halfW - 4))

      toolbar.style.setProperty("display", "flex")
      toolbar.style.setProperty("top", `${Math.max(4, top)}px`)
      toolbar.style.setProperty("left", `${left}px`)
    }

    const throttledUpdate = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(updatePosition)
    }

    // Initial position
    updatePosition()

    const canvas = document.querySelector("[data-editor-canvas]")
    canvas?.addEventListener("scroll", throttledUpdate)
    window.addEventListener("resize", throttledUpdate)
    const observer = new MutationObserver(throttledUpdate)
    const el = document.querySelector(`[data-craft-node-id="${selectedId}"]`)
    if (el) observer.observe(el, { attributes: true, childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas?.removeEventListener("scroll", throttledUpdate)
      window.removeEventListener("resize", throttledUpdate)
      observer.disconnect()
    }
  }, [selectedId, zoom])

  const handleMoveUp = useCallback(() => {
    if (selectedId && parentId && index > 0) try { actions.move(selectedId, parentId, index - 1) } catch (e) { console.warn("FloatingToolbar: move up failed", e) }
  }, [actions, selectedId, parentId, index])

  const handleMoveDown = useCallback(() => {
    if (selectedId && parentId && index < siblingCount - 1) try { actions.move(selectedId, parentId, index + 2) } catch (e) { console.warn("FloatingToolbar: move down failed", e) }
  }, [actions, selectedId, parentId, index, siblingCount])

  const handleDuplicate = useCallback(() => {
    if (selectedId && parentId) try { actions.addNodeTree(query.node(selectedId).toNodeTree(), parentId, index + 1) } catch (e) { console.warn("FloatingToolbar: duplicate failed", e) }
  }, [actions, query, selectedId, parentId, index])

  const handleDelete = useCallback(() => {
    if (selectedId) try { actions.delete(selectedId) } catch (e) { console.warn("FloatingToolbar: delete failed", e) }
  }, [actions, selectedId])

  return (
    <div ref={toolbarRef}
      className="floating-toolbar pointer-events-auto absolute z-50 items-center gap-0.5 rounded-md px-1 py-0.5"
      style={{ display: selectedId ? "flex" : "none", transform: "translateX(-50%)", border: '1px solid var(--editor-border)', boxShadow: 'var(--editor-shadow-popover)' }}>
      <span className="flex items-center gap-1 px-2 text-[11px] font-semibold text-muted-foreground">
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
})

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
