"use client"

import React, { useEffect, useState, useRef, useMemo, memo } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEditorStore } from "../../store"
import { getBlock } from "../../registry"
import { cn } from "@/shared/utils"
import { GripVertical, Copy, ClipboardPaste, ArrowUp, ArrowDown, Trash2, CopyPlus, Paintbrush, Component, Globe, Code, Clipboard } from "lucide-react"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from "@/components/ui/context-menu"
import { SlotRenderer } from "./slot-renderer"
import type { Section } from "../../store"
import { toast } from "sonner"
import { buildSectionStyle, buildHoverCSS, mergePropsForViewport } from "../../build-style"

const ANIMATION_STYLES: Record<string, { from: React.CSSProperties; to: React.CSSProperties }> = {
  "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
  "slide-up": { from: { opacity: 0, transform: "translateY(30px)" }, to: { opacity: 1, transform: "translateY(0)" } },
  "slide-down": { from: { opacity: 0, transform: "translateY(-30px)" }, to: { opacity: 1, transform: "translateY(0)" } },
  "slide-left": { from: { opacity: 0, transform: "translateX(30px)" }, to: { opacity: 1, transform: "translateX(0)" } },
  "slide-right": { from: { opacity: 0, transform: "translateX(-30px)" }, to: { opacity: 1, transform: "translateX(0)" } },
  "zoom-in": { from: { opacity: 0, transform: "scale(0.9)" }, to: { opacity: 1, transform: "scale(1)" } },
  "zoom-out": { from: { opacity: 0, transform: "scale(1.1)" }, to: { opacity: 1, transform: "scale(1)" } },
}

const PROP_TO_CSS: Record<string, string> = {
  paddingTop: "padding-top", paddingBottom: "padding-bottom", paddingLeft: "padding-left", paddingRight: "padding-right",
  marginTop: "margin-top", marginBottom: "margin-bottom", maxWidth: "max-width", backgroundColor: "background-color",
  textColor: "color", fontSize: "font-size", textAlign: "text-align", borderRadius: "border-radius",
  borderWidth: "border-width", borderColor: "border-color", opacity: "opacity", gap: "gap",
}
const PX_CSS = new Set(["padding-top", "padding-bottom", "padding-left", "padding-right", "margin-top", "margin-bottom", "max-width", "font-size", "border-radius", "border-width", "gap"])

function sectionToCSS(props: Record<string, unknown>): string {
  const lines: string[] = []
  for (const [key, val] of Object.entries(props)) {
    if (!key.startsWith("_") || val === undefined || val === "" || val === 0 || val === "none") continue
    const cssProp = PROP_TO_CSS[key.slice(1)]
    if (!cssProp) continue
    lines.push(`  ${cssProp}: ${cssProp === "opacity" ? `${(val as number) / 100}` : `${val}${PX_CSS.has(cssProp) ? "px" : ""}`};`)
  }
  return lines.length ? `.section {\n${lines.join("\n")}\n}` : "/* no styles */"
}

function buildSlots(section: Section): Record<string, React.ReactNode> | undefined {
  if (!section.children) return undefined
  const slots: Record<string, React.ReactNode> = {}
  for (const [slotName, children] of Object.entries(section.children)) {
    slots[slotName] = <SlotRenderer parentId={section.id} slot={slotName} sections={children} />
  }
  return slots
}

class SectionErrorBoundary extends React.Component<{ sectionType: string; children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div className="p-4 border-2 border-red-400 bg-red-50 rounded text-xs text-red-700">
          <p className="font-semibold mb-1">⚠ {this.props.sectionType} crashed</p>
          <p className="truncate mb-2">{this.state.error.message.slice(0, 120)}</p>
          <button className="px-2 py-0.5 bg-red-500 text-white rounded text-[10px]" onClick={() => this.setState({ error: null })}>Retry</button>
        </div>
      )
    }
    return this.props.children
  }
}

export { SectionErrorBoundary }

export const SortableSection = memo(function SortableSection({ id, index, total, sectionType, section, viewport, isHidden }: { id: string; index: number; total: number; sectionType: string; section: Section; viewport: string; isHidden: boolean }) {
  const selectedIds = useEditorStore(s => s.selectedIds)
  const selectSection = useEditorStore(s => s.selectSection)
  const toggleSelect = useEditorStore(s => s.toggleSelect)
  const duplicateSection = useEditorStore(s => s.duplicateSection)
  const removeSection = useEditorStore(s => s.removeSection)
  const moveSection = useEditorStore(s => s.moveSection)
  const copyStyle = useEditorStore(s => s.copyStyle)
  const pasteStyle = useEditorStore(s => s.pasteStyle)
  const styleClipboard = useEditorStore(s => s.styleClipboard)
  const saveAsComponent = useEditorStore(s => s.saveAsComponent)
  const toggleGlobal = useEditorStore(s => s.toggleGlobal)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const elRef = useRef<HTMLDivElement>(null)
  const isSelected = selectedIds.includes(id)
  const [isVisible, setIsVisible] = useState(false)

  const animationType = (section.props._animation as string) || "none"
  const animDuration = (section.props._animationDuration as number) || 600
  const animDelay = (section.props._animationDelay as number) || 0
  const animEasing = (section.props._animationEasing as string) || "ease"
  const animDef = ANIMATION_STYLES[animationType]

  const sectionStyle = useMemo(() => buildSectionStyle(section.props, viewport), [section.props, viewport])
  const hoverCSS = useMemo(() => buildHoverCSS(id, section.props, viewport), [id, section.props, viewport])
  const block = getBlock(section.type)

  const vis = section.props._visibility as string | undefined
  const visMismatch = vis && vis !== "all" && vis !== viewport

  // Intersection Observer — trigger animation once
  useEffect(() => {
    const el = elRef.current
    if (!el || !animDef) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.disconnect() }
    }, { threshold: 0.15 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [animDef])

  const animStyle: React.CSSProperties | undefined = animDef
    ? {
        ...(isVisible ? animDef.to : animDef.from),
        transition: isVisible ? `all ${animDuration}ms ${animEasing} ${animDelay}ms` : undefined,
      }
    : undefined

  // Scroll into view when selected from sidebar
  useEffect(() => {
    if (isSelected && elRef.current) {
      elRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [isSelected])

  const isGlobal = !!section.props._global

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={(node) => { setNodeRef(node); (elRef as React.MutableRefObject<HTMLDivElement | null>).current = node }}
          style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, ...animStyle }}
          data-section-id={id}
          data-animate={animationType !== "none" ? animationType : undefined}
          className={cn(
            "group relative cursor-pointer transition-all duration-150",
            isSelected
              ? "outline outline-2 outline-blue-500 outline-offset-0"
              : "hover:outline hover:outline-1 hover:outline-blue-400/40"
          )}
          draggable={!isGlobal}
          onDragStart={(e) => { if (isGlobal) { e.preventDefault(); return } e.dataTransfer.setData('section-id', id); e.dataTransfer.effectAllowed = 'move' }}
          onClick={(e) => { e.stopPropagation(); (e.metaKey || e.ctrlKey) ? toggleSelect(id) : selectSection(id) }}
        >
          {/* Selected label */}
          {isSelected && (
            <span className="absolute -top-3 left-2 z-20 bg-blue-500 text-white text-[9px] leading-none font-medium rounded px-1.5 py-0.5 capitalize pointer-events-none">{isGlobal ? "🌐 " : ""}{sectionType}</span>
          )}
          {/* Hover label */}
          {!isSelected && (
            <span className="absolute -top-3 left-2 z-10 hidden group-hover:inline-block bg-gray-900/80 text-white text-[9px] leading-none rounded px-1.5 py-0.5 capitalize pointer-events-none">{isGlobal ? "🌐 " : ""}{sectionType}</span>
          )}
          {/* Drag handle */}
          <div {...attributes} {...listeners} className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex cursor-grab bg-background border rounded shadow-sm p-0.5">
            <GripVertical className="h-4 w-4 text-muted-foreground/60" />
          </div>
          {/* Section content — style + block in one div */}
          {block && (
            <div style={sectionStyle} className={cn(`hover-sec-${id}`, isHidden && "opacity-20", visMismatch && "opacity-30 border border-dashed border-muted-foreground/40")}>
              {hoverCSS && <style>{hoverCSS}</style>}
              <SectionErrorBoundary sectionType={section.type}>
                <block.component {...mergePropsForViewport(section.props, viewport)} _sectionId={id} _slots={buildSlots(section)} />
              </SectionErrorBoundary>
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => duplicateSection(id)}><CopyPlus className="h-3.5 w-3.5 mr-2" />Duplicate<ContextMenuShortcut>⌘D</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(useEditorStore.getState().sections.find(s => s.id === id)))}><Copy className="h-3.5 w-3.5 mr-2" />Copy</ContextMenuItem>
        <ContextMenuItem disabled><ClipboardPaste className="h-3.5 w-3.5 mr-2" />Paste Below</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => { selectSection(id); copyStyle() }}><Paintbrush className="h-3.5 w-3.5 mr-2" />Copy Style<ContextMenuShortcut>⌘⌥C</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuItem disabled={!styleClipboard} onClick={() => { if (!selectedIds.includes(id)) selectSection(id); pasteStyle() }}><Paintbrush className="h-3.5 w-3.5 mr-2" />Paste Style<ContextMenuShortcut>⌘⌥V</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuItem onClick={() => { navigator.clipboard.writeText(sectionToCSS(section.props)) }}><Code className="h-3.5 w-3.5 mr-2" />Copy as CSS</ContextMenuItem>
        <ContextMenuItem onClick={() => { const el = document.querySelector(`[data-section-id="${id}"]`); if (el) { navigator.clipboard.writeText(el.outerHTML); toast.success('HTML copied') } }}><Clipboard className="h-3.5 w-3.5 mr-2" />Copy as HTML</ContextMenuItem>
        <ContextMenuItem onClick={() => { const fill = section.props._backgroundColor as string; if (!fill) { toast.error('No fill color'); return }; const { sections, toggleSelect } = useEditorStore.getState(); const matching = sections.filter(s => s.props._backgroundColor === fill); matching.forEach(s => toggleSelect(s.id)); toast.success(`Selected ${matching.length} with same fill`) }}><Paintbrush className="h-3.5 w-3.5 mr-2" />Select Same Fill</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => { const name = prompt("Component name:"); if (name) saveAsComponent(id, name) }}><Component className="h-3.5 w-3.5 mr-2" />Save as Component</ContextMenuItem>
        <ContextMenuItem onClick={() => toggleGlobal(id)}><Globe className="h-3.5 w-3.5 mr-2" />{isGlobal ? "Remove Global" : "Make Global"}</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={index === 0} onClick={() => moveSection(index, index - 1)}><ArrowUp className="h-3.5 w-3.5 mr-2" />Move Up</ContextMenuItem>
        <ContextMenuItem disabled={index === total - 1} onClick={() => moveSection(index, index + 1)}><ArrowDown className="h-3.5 w-3.5 mr-2" />Move Down</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive" disabled={isGlobal} onClick={() => removeSection(id)}><Trash2 className="h-3.5 w-3.5 mr-2" />{isGlobal ? "Can't delete global" : "Delete"}<ContextMenuShortcut>⌫</ContextMenuShortcut></ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}, (prev, next) => {
  return prev.id === next.id && prev.index === next.index && prev.total === next.total && prev.sectionType === next.sectionType && prev.section === next.section && prev.viewport === next.viewport && prev.isHidden === next.isHidden
})
