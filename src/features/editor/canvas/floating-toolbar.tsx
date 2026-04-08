"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { useCallback, useEffect, useRef, memo } from "react"
import { ArrowUp, ArrowDown, Copy, Trash2, GripVertical, EyeOff, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { moveNodeUp, moveNodeDown, duplicateNode, deleteNode, toggleHidden } from "../lib/node-actions"

export const FloatingToolbar = memo(function FloatingToolbar() {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)

  const { selectedId, selectedName, parentId, index, siblingCount, isDeletable, isHidden, toolbarComponent, actions, query } = useEditor((state) => {
    const [id] = state.events.selected
    if (!id || id === ROOT_NODE) return { selectedId: null as string | null, selectedName: "", parentId: null as string | null, index: -1, siblingCount: 0, isDeletable: true, isHidden: false, toolbarComponent: null as React.ComponentType | null }
    const n = state.nodes[id]
    if (!n) return { selectedId: null as string | null, selectedName: "", parentId: null as string | null, index: -1, siblingCount: 0, isDeletable: true, isHidden: false, toolbarComponent: null as React.ComponentType | null }
    const pid = n.data.parent ?? null
    const siblings = pid ? state.nodes[pid]?.data.nodes ?? [] : []
    // Check canDelete rule
    const deletable = n.rules?.canDrag !== undefined ? n.rules.canDrag(n, (state as any).helpers) !== false : true
    return {
      selectedId: id,
      selectedName: n.data.displayName || n.data.name || "",
      parentId: pid,
      index: siblings.indexOf(id),
      siblingCount: siblings.length,
      isDeletable: deletable,
      isHidden: !!n.data.hidden,
      toolbarComponent: (n.related?.toolbar ?? null) as React.ComponentType | null,
    }
  })

  // #7: Hide immediately on selection change, then reposition
  useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return
    if (!selectedId) { toolbar.style.display = "none"; return }

    // Hide first to prevent flicker at old position
    toolbar.style.display = "none"

    const updatePosition = () => {
      const el = document.querySelector(`[data-craft-node-id="${selectedId}"]`) as HTMLElement | null
      const canvas = document.querySelector("[data-editor-canvas]") as HTMLElement | null
      if (!el || !canvas || !toolbar) { toolbar.style.display = "none"; return }

      const elRect = el.getBoundingClientRect()
      const canvasRect = canvas.getBoundingClientRect()
      const toolbarH = toolbar.offsetHeight || 32

      // #1: No zoom division — toolbar is absolute in canvas space, getBoundingClientRect is screen space, both unzoomed
      const rawTop = elRect.top - canvasRect.top + canvas.scrollTop
      const rawBottom = elRect.bottom - canvasRect.top + canvas.scrollTop
      const rawCenterX = elRect.left - canvasRect.left + canvas.scrollLeft + elRect.width / 2

      const topAbove = rawTop - toolbarH - 8
      const topBelow = rawBottom + 8
      const top = topAbove < 8 ? topBelow : topAbove

      const canvasW = canvasRect.width
      const toolbarW = toolbar.offsetWidth || 160
      const halfW = toolbarW / 2
      const left = Math.max(halfW + 4, Math.min(rawCenterX, canvasW - halfW - 4))

      toolbar.style.display = "flex"
      toolbar.style.top = `${Math.max(4, top)}px`
      toolbar.style.left = `${left}px`
    }

    const throttledUpdate = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(updatePosition)
    }

    // Delay first render by 1 frame so toolbar measures correctly
    rafRef.current = requestAnimationFrame(updatePosition)

    const canvas = document.querySelector("[data-editor-canvas]")
    canvas?.addEventListener("scroll", throttledUpdate)
    window.addEventListener("resize", throttledUpdate)

    // #2: Observe only the element itself — no subtree
    const observer = new MutationObserver(throttledUpdate)
    const el = document.querySelector(`[data-craft-node-id="${selectedId}"]`)
    if (el) observer.observe(el, { attributes: true, attributeFilter: ["style", "class"] })

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas?.removeEventListener("scroll", throttledUpdate)
      window.removeEventListener("resize", throttledUpdate)
      observer.disconnect()
    }
  }, [selectedId])

  // #5: Use shared action helpers
  const handleMoveUp = useCallback(() => {
    if (selectedId && parentId) try { moveNodeUp(actions, selectedId, parentId, index) } catch {}
  }, [actions, selectedId, parentId, index])

  const handleMoveDown = useCallback(() => {
    if (selectedId && parentId) try { moveNodeDown(actions, selectedId, parentId, index, siblingCount) } catch {}
  }, [actions, selectedId, parentId, index, siblingCount])

  const handleDuplicate = useCallback(() => {
    if (selectedId && parentId) try { duplicateNode(actions, query, selectedId, parentId, index) } catch {}
  }, [actions, query, selectedId, parentId, index])

  const handleDelete = useCallback(() => {
    if (selectedId) try { deleteNode(actions, selectedId) } catch {}
  }, [actions, selectedId])

  const handleToggleHidden = useCallback(() => {
    if (selectedId) try { toggleHidden(actions, selectedId, isHidden) } catch {}
  }, [actions, selectedId, isHidden])

  // #3: Render block-specific toolbar component if defined
  const BlockToolbar = toolbarComponent

  return (
    <div ref={toolbarRef}
      className="floating-toolbar pointer-events-auto absolute z-50 items-center gap-0.5 rounded-md px-1 py-0.5"
      style={{ display: "none", transform: "translateX(-50%)", border: '1px solid var(--editor-border)', boxShadow: 'var(--editor-shadow-popover)' }}>
      <span className="flex items-center gap-1 px-2 text-[11px] font-semibold text-muted-foreground">
        <GripVertical className="h-3 w-3" />{selectedName}
      </span>
      <Separator orientation="vertical" className="h-4" />
      {/* #3: Block-specific actions */}
      {BlockToolbar && <><BlockToolbar /><Separator orientation="vertical" className="h-4" /></>}
      {/* #6: Keyboard shortcut hints in tooltips */}
      <TbBtn icon={ArrowUp} label="Move Up ⌘↑" onClick={handleMoveUp} disabled={index <= 0} />
      <TbBtn icon={ArrowDown} label="Move Down ⌘↓" onClick={handleMoveDown} disabled={index >= siblingCount - 1} />
      <Separator orientation="vertical" className="h-4" />
      <TbBtn icon={isHidden ? Eye : EyeOff} label={isHidden ? "Show" : "Hide"} onClick={handleToggleHidden} />
      <TbBtn icon={Copy} label="Duplicate ⌘D" onClick={handleDuplicate} />
      {/* #4: Respect canDelete — hide Delete for undeletable blocks */}
      {isDeletable && <TbBtn icon={Trash2} label="Delete ⌫" onClick={handleDelete} destructive />}
    </div>
  )
})

function TbBtn({ icon: Icon, label, onClick, disabled, destructive }: { icon: typeof ArrowUp; label: string; onClick: () => void; disabled?: boolean; destructive?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className={`h-7 w-7 ${destructive ? 'hover:bg-destructive/10 hover:text-destructive' : ''}`} onClick={onClick} disabled={disabled} aria-label={label}>
          <Icon className="h-3.5 w-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  )
}
