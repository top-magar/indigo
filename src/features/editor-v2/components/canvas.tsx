"use client"

import "../blocks"
import React, { useEffect, useState, useCallback, useRef, useMemo, memo } from "react"
import { DndContext, DragOverlay, closestCenter, type DragStartEvent, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useEditorStore } from "../store"
import { getBlock, getAllBlocks } from "../registry"
import { cn } from "@/shared/utils"
import { Plus, GripVertical, Copy, ClipboardPaste, ArrowUp, ArrowDown, Trash2, CopyPlus, LayoutDashboard, Image, ShoppingBag, FolderOpen, Search, Paintbrush, Component, MessageCircle, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from "@/components/ui/context-menu"
import { SlotRenderer } from "./slot-renderer"
import { BlockModeProvider } from "../blocks/data-context"
import type { Section } from "../store"
import { designedSections } from "../designed-sections"

const VIEWPORT_WIDTHS = { desktop: "100%", tablet: "768px", mobile: "375px" } as const

const SHADOW_MAP: Record<string, string> = { sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 4px 6px rgba(0,0,0,0.07)", lg: "0 10px 15px rgba(0,0,0,0.1)", xl: "0 20px 25px rgba(0,0,0,0.1)" }

function buildHoverCSS(id: string, props: Record<string, unknown>, viewport: string): string | null {
  const g = (key: string) => getStyleProp(props, key, viewport)
  const bg = g("hoverBg") as string
  const scale = g("hoverScale") as number
  const shadow = g("hoverShadow") as string
  const opacity = g("hoverOpacity") as number
  const transition = (g("hoverTransition") as number) ?? 300
  const hasHover = bg || (scale && scale !== 1) || (shadow && shadow !== "none") || (opacity != null && opacity !== 100)
  if (!hasHover) return null
  const rules: string[] = []
  if (bg) rules.push(`background-color: ${bg} !important`)
  if (scale && scale !== 1) rules.push(`transform: scale(${scale})`)
  if (shadow && shadow !== "none") rules.push(`box-shadow: ${SHADOW_MAP[shadow] ?? "none"}`)
  if (opacity != null && opacity !== 100) rules.push(`opacity: ${opacity / 100}`)
  return `.hover-sec-${id}{transition:all ${transition}ms ease}.hover-sec-${id}:hover{${rules.join(";")}}`
}

function getStyleProp(props: Record<string, unknown>, key: string, viewport: string): unknown {
  if (viewport !== "desktop") {
    const ov = props[`_${viewport}_${key}`]
    if (ov !== undefined && ov !== "") return ov
  }
  return props[`_${key}`]
}

function buildSectionStyle(props: Record<string, unknown>, viewport: string): React.CSSProperties {
  const g = (key: string) => getStyleProp(props, key, viewport)
  const bgImage = g("backgroundImage") as string
  const bgOverlay = (g("backgroundOverlay") as number) ?? 0
  const shadow = g("shadow") as string
  const shadowX = g("shadowX") as number
  const shadowColor = (g("shadowColor") as string) || "rgba(0,0,0,0.1)"
  const customShadow = shadowX != null && shadowX !== 0
    ? `${shadowX}px ${(g("shadowY") as number) ?? 4}px ${(g("shadowBlur") as number) ?? 10}px ${(g("shadowSpread") as number) ?? 0}px ${shadowColor}`
    : undefined
  const gradient = g("gradient") as string
  const gradientFrom = (g("gradientFrom") as string) || "#3b82f6"
  const gradientTo = (g("gradientTo") as string) || "#8b5cf6"
  const gradientAngle = (g("gradientAngle") as number) ?? 135

  let backgroundImage: string | undefined
  if (gradient === "linear") {
    backgroundImage = `linear-gradient(${gradientAngle}deg, ${gradientFrom}, ${gradientTo})`
  } else if (gradient === "radial") {
    backgroundImage = `radial-gradient(circle, ${gradientFrom}, ${gradientTo})`
  } else if (bgImage) {
    backgroundImage = `${bgOverlay ? `linear-gradient(rgba(0,0,0,${bgOverlay / 100}),rgba(0,0,0,${bgOverlay / 100})),` : ""}url(${bgImage})`
  }

  const rotate = (g("rotate") as number) ?? 0
  const scale = (g("scale") as number) ?? 1
  const translateX = (g("translateX") as number) ?? 0
  const translateY = (g("translateY") as number) ?? 0
  const hasTransform = rotate !== 0 || scale !== 1 || translateX !== 0 || translateY !== 0

  const backdropBlur = g("backdropBlur") as number
  const backdropSaturate = (g("backdropSaturate") as number) ?? 100
  const hasBackdrop = backdropBlur || backdropSaturate !== 100

  const overflowVal = (g("overflow") as string) || "visible"

  return {
    // Size
    width: (g("width") as number) || undefined,
    height: (g("height") as number) || undefined,
    minHeight: (g("minHeight") as number) || undefined,
    aspectRatio: ((g("aspectRatio") as string) && (g("aspectRatio") as string) !== "auto") ? (g("aspectRatio") as string) : undefined,
    overflow: overflowVal as React.CSSProperties["overflow"],
    // Auto Layout (flex)
    display: (g("autoLayout") as string) === "enabled" ? "flex" : undefined,
    flexDirection: (g("autoLayout") as string) === "enabled" ? ((g("flexDirection") as React.CSSProperties["flexDirection"]) || "column") : undefined,
    gap: (g("autoLayout") as string) === "enabled" ? ((g("gap") as number) ?? undefined) : undefined,
    alignItems: (g("autoLayout") as string) === "enabled" ? ((g("alignItems") as string) || undefined) : undefined,
    justifyContent: (g("autoLayout") as string) === "enabled" ? ((g("justifyContent") as string) || undefined) : undefined,
    flexWrap: (g("autoLayout") as string) === "enabled" ? ((g("flexWrap") as React.CSSProperties["flexWrap"]) || undefined) : undefined,
    // Spacing
    paddingTop: (g("paddingTop") as number) || undefined, paddingBottom: (g("paddingBottom") as number) || undefined,
    paddingLeft: (g("paddingLeft") as number) || undefined, paddingRight: (g("paddingRight") as number) || undefined,
    marginTop: (g("marginTop") as number) || undefined, marginBottom: (g("marginBottom") as number) || undefined,
    marginLeft: (g("marginLeft") as number) || undefined, marginRight: (g("marginRight") as number) || undefined,
    maxWidth: (g("maxWidth") as number) || undefined, marginInline: (g("maxWidth") as number) ? "auto" : undefined,
    backgroundColor: gradient && gradient !== "none" ? undefined : (g("backgroundColor") as string) || undefined,
    backgroundImage,
    backgroundSize: bgImage && !gradient ? ((g("backgroundSize") as string) || "cover") : undefined, backgroundPosition: bgImage && !gradient ? "center" : undefined,
    color: (g("textColor") as string) || undefined, fontSize: (g("fontSize") as number) || undefined,
    textAlign: (g("textAlign") as React.CSSProperties["textAlign"]) || undefined, borderRadius: (g("borderRadius") as number) || undefined,
    borderWidth: (g("borderWidth") as number) || undefined, borderColor: (g("borderColor") as string) || undefined,
    borderStyle: (g("borderWidth") as number) ? "solid" : undefined, opacity: (g("opacity") as number) != null ? (g("opacity") as number) / 100 : undefined,
    boxShadow: customShadow || (shadow && shadow !== "none" ? SHADOW_MAP[shadow] : undefined),
    filter: (g("blur") as number) ? `blur(${g("blur")}px)` : undefined,
    backdropFilter: hasBackdrop ? `blur(${backdropBlur ?? 0}px) saturate(${backdropSaturate}%)` : undefined,
    WebkitBackdropFilter: hasBackdrop ? `blur(${backdropBlur ?? 0}px) saturate(${backdropSaturate}%)` : undefined,
    transform: hasTransform ? `rotate(${rotate}deg) scale(${scale}) translate(${translateX}px, ${translateY}px)` : undefined,
    cursor: ((g("cursor") as string) && (g("cursor") as string) !== "auto") ? (g("cursor") as React.CSSProperties["cursor"]) : undefined,
    // Docking
    ...(() => {
      const dockH = (g("dockH") as string) || "none"
      const dockV = (g("dockV") as string) || "none"
      return {
        ...(dockH === "left" && { marginRight: "auto" }),
        ...(dockH === "center" && { marginLeft: "auto", marginRight: "auto" }),
        ...(dockH === "right" && { marginLeft: "auto" }),
        ...(dockH === "stretch" && { width: "100%" }),
        ...(dockV === "top" && { alignSelf: "flex-start" as const }),
        ...(dockV === "center" && { alignSelf: "center" as const }),
        ...(dockV === "bottom" && { alignSelf: "flex-end" as const }),
        ...(dockV === "stretch" && { alignSelf: "stretch" as const }),
      }
    })(),
    // CSS Grid (opt-in: only when _gridCols > 1 or _gridRows > 1)
    ...(() => {
      const gridCols = (g("gridCols") as number) || 1
      const gridRows = (g("gridRows") as number) || 1
      const isGrid = gridCols > 1 || gridRows > 1
      if (!isGrid) return {}
      const gridGap = (g("gridGap") as number) ?? 16
      const gridColSizes = (g("gridColSizes") as string) || `repeat(${gridCols}, 1fr)`
      const gridRowSizes = (g("gridRowSizes") as string) || `repeat(${gridRows}, auto)`
      return {
        display: "grid" as const,
        gridTemplateColumns: gridColSizes,
        gridTemplateRows: gridRows > 1 ? gridRowSizes : undefined,
        gap: `${gridGap}px`,
      }
    })(),
    // Grid cell placement (for children inside a grid parent)
    gridColumn: (g("gridColumn") as string) || undefined,
    gridRow: (g("gridRow") as string) || undefined,
    backgroundAttachment: (g("parallax") as string) === "on" ? "fixed" : undefined,
    position: (g("position") as React.CSSProperties["position"]) || undefined,
    top: ((g("position") as string) === "sticky" || (g("position") as string) === "fixed") ? ((g("positionTop") as number) ?? 0) : undefined,
    zIndex: ((g("position") as string) === "sticky" || (g("position") as string) === "fixed") ? ((g("zIndex") as number) ?? 10) : undefined,
  }
}

function useGoogleFonts(fonts: string[]) {
  useEffect(() => {
    const unique = [...new Set(fonts.filter((f) => f && f !== "Inter"))]
    if (unique.length === 0) return
    const id = "editor-google-fonts"
    let link = document.getElementById(id) as HTMLLinkElement | null
    const href = `https://fonts.googleapis.com/css2?${unique.map((f) => `family=${f.replace(/ /g, "+")}`).join("&")}&display=swap`
    if (link) { link.href = href } else {
      link = document.createElement("link"); link.id = id; link.rel = "stylesheet"; link.href = href; document.head.appendChild(link)
    }
  }, [fonts])
}

const ANIMATION_STYLES: Record<string, { from: React.CSSProperties; to: React.CSSProperties }> = {
  "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
  "slide-up": { from: { opacity: 0, transform: "translateY(30px)" }, to: { opacity: 1, transform: "translateY(0)" } },
  "slide-down": { from: { opacity: 0, transform: "translateY(-30px)" }, to: { opacity: 1, transform: "translateY(0)" } },
  "slide-left": { from: { opacity: 0, transform: "translateX(30px)" }, to: { opacity: 1, transform: "translateX(0)" } },
  "slide-right": { from: { opacity: 0, transform: "translateX(-30px)" }, to: { opacity: 1, transform: "translateX(0)" } },
  "zoom-in": { from: { opacity: 0, transform: "scale(0.9)" }, to: { opacity: 1, transform: "scale(1)" } },
  "zoom-out": { from: { opacity: 0, transform: "scale(1.1)" }, to: { opacity: 1, transform: "scale(1)" } },
}

const SortableSection = memo(function SortableSection({ id, index, total, sectionType, section, viewport, isHidden }: { id: string; index: number; total: number; sectionType: string; section: Section; viewport: string; isHidden: boolean }) {
  const { selectedIds, selectSection, toggleSelect, duplicateSection, removeSection, moveSection, copyStyle, pasteStyle, styleClipboard, saveAsComponent, toggleGlobal } = useEditorStore()
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
              <block.component {...mergePropsForViewport(section.props, viewport)} _sectionId={id} _slots={buildSlots(section)} />
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

function DropZone({ onAdd }: { onAdd: () => void }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative h-3 -my-0.5 z-5" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {visible && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="flex-1 h-px bg-blue-300" />
          <button onClick={onAdd} className="mx-1.5 h-4 w-4 rounded-full bg-blue-500/80 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"><Plus className="h-2.5 w-2.5" /></button>
          <div className="flex-1 h-px bg-blue-300" />
        </div>
      )}
    </div>
  )
}

const BREAKPOINTS = [375, 768, 1024, 1280] as const

function BreakpointBar({ viewport, containerWidth }: { viewport: string; containerWidth: number }) {
  const width = viewport === "desktop" ? containerWidth : viewport === "tablet" ? 768 : 375
  const active = BREAKPOINTS.findLast((bp) => width >= bp) ?? 375
  return (
    <div className="flex items-center justify-center gap-3 py-1 text-[9px] text-muted-foreground/60">
      <span>{width}px</span>
      {BREAKPOINTS.map((bp) => (
        <span key={bp} className={cn(bp === active ? "text-foreground font-medium" : "opacity-50")}>{bp}</span>
      ))}
    </div>
  )
}

function DeviceFrame({ viewport, children }: { viewport: string; children: React.ReactNode }) {
  if (viewport === "desktop") return <>{children}</>
  const rounded = viewport === "mobile" ? "rounded-xl" : "rounded-lg"
  return (
    <div className={cn("overflow-hidden border border-gray-200 shadow-md", rounded)}>
      <div className="h-6 bg-gray-100 flex items-center gap-1.5 px-2.5">
        <div className="h-2 w-2 rounded-full bg-red-400/70" />
        <div className="h-2 w-2 rounded-full bg-yellow-400/70" />
        <div className="h-2 w-2 rounded-full bg-green-400/70" />
        <div className="flex-1 mx-4 h-3 bg-gray-200/80 rounded-full" />
      </div>
      {children}
    </div>
  )
}

function buildSlots(section: Section): Record<string, React.ReactNode> | undefined {
  if (!section.children) return undefined
  const slots: Record<string, React.ReactNode> = {}
  for (const [slotName, children] of Object.entries(section.children)) {
    slots[slotName] = <SlotRenderer parentId={section.id} slot={slotName} sections={children} />
  }
  return slots
}

/** Memoizes buildSectionStyle per section to avoid recalculating CSS on every render */
function SectionContent({ section, viewport, isHidden }: { section: Section; viewport: string; isHidden: boolean }) {
  const block = getBlock(section.type)
  const style = useMemo(() => buildSectionStyle(section.props, viewport), [section.props, viewport])
  const hoverCSS = useMemo(() => buildHoverCSS(section.id, section.props, viewport), [section.id, section.props, viewport])
  if (!block) return null
  const Component = block.component
  return (
    <div style={style} className={cn(`hover-sec-${section.id}`, isHidden && "opacity-20")}>
      {hoverCSS && <style>{hoverCSS}</style>}
      <Component {...mergePropsForViewport(section.props, viewport)} _sectionId={section.id} _slots={buildSlots(section)} />
    </div>
  )
}

export function Canvas() {
  const { sections, selectedId, selectSection, addSection, insertSection, moveSection, viewport, theme, zoom, previewMode, hiddenSections, comments, addComment, resolveComment, deleteComment } = useEditorStore()
  const [addMenuAt, setAddMenuAt] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)
  const canvasContentRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [spaceHeld, setSpaceHeld] = useState(false)
  const panRef = useRef({ active: false, startX: 0, startY: 0, scrollX: 0, scrollY: 0 })

  // Hand tool: space+drag to pan
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.code === "Space" && !(e.target as HTMLElement).matches("input,textarea,select,[contenteditable]")) { e.preventDefault(); setSpaceHeld(true) } }
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === "Space") { setSpaceHeld(false); panRef.current.active = false } }
    const onMouseMove = (e: MouseEvent) => {
      if (!panRef.current.active || !scrollRef.current) return
      scrollRef.current.scrollLeft = panRef.current.scrollX - (e.clientX - panRef.current.startX)
      scrollRef.current.scrollTop = panRef.current.scrollY - (e.clientY - panRef.current.startY)
    }
    const onMouseUp = () => { panRef.current.active = false }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp) }
  }, [])

  const primaryColor = (theme.primaryColor as string) ?? "#3b82f6"
  const secondaryColor = (theme.secondaryColor as string) ?? "#8b5cf6"
  const accentColor = (theme.accentColor as string) ?? "#06b6d4"
  const bgColor = (theme.backgroundColor as string) ?? "#ffffff"
  const surfaceColor = (theme.surfaceColor as string) ?? "#f8fafc"
  const textColor = (theme.textColor as string) ?? "#0f172a"
  const mutedColor = (theme.mutedColor as string) ?? "#64748b"
  const headingFont = (theme.headingFont as string) ?? "Inter"
  const bodyFont = (theme.bodyFont as string) ?? "Inter"
  const headingWeight = (theme.headingWeight as string) ?? "700"
  const baseSize = (theme.baseSize as number) ?? 16
  const lineHeight = (theme.lineHeight as number) ?? 1.6
  const letterSpacing = (theme.letterSpacing as number) ?? 0
  const borderRadius = (theme.borderRadius as number) ?? 8
  const buttonStyle = (theme.buttonStyle as string) ?? "rounded"
  const sectionSpacing = (theme.sectionSpacing as number) ?? 0
  const containerWidth = (theme.containerWidth as number) ?? 1200

  const isDark = (theme.mode as string) === "dark"
  const effectiveBg = isDark ? ((theme.darkBg as string) ?? "#0f172a") : bgColor
  const effectiveText = isDark ? ((theme.darkText as string) ?? "#f1f5f9") : textColor
  const effectiveSurface = isDark ? ((theme.darkSurface as string) ?? "#1e293b") : surfaceColor

  useGoogleFonts([headingFont, bodyFont])

  const handleDragStart = (e: DragStartEvent) => { setActiveDragId(e.active.id as string) }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = sections.findIndex((s) => s.id === active.id)
    const newIdx = sections.findIndex((s) => s.id === over.id)
    if (oldIdx !== -1 && newIdx !== -1) moveSection(oldIdx, newIdx)
  }

  const insertAt = useCallback((index: number, type: string) => {
    addSection(type)
    setTimeout(() => {
      const store = useEditorStore.getState()
      const lastIdx = store.sections.length - 1
      if (lastIdx > index) store.moveSection(lastIdx, index)
    }, 0)
    setAddMenuAt(null)
  }, [addSection])

  const calcDropIndex = useCallback((e: React.DragEvent) => {
    const container = canvasContentRef.current
    if (!container) return sections.length
    const sectionEls = container.querySelectorAll("[data-section-idx]")
    for (const el of sectionEls) {
      const rect = el.getBoundingClientRect()
      if (e.clientY < rect.top + rect.height / 2) {
        return Number(el.getAttribute("data-section-idx"))
      }
    }
    return sections.length
  }, [sections.length])

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes("application/x-block-type")) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    setDropIndex(calcDropIndex(e))
  }, [calcDropIndex])

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    const blockType = e.dataTransfer.getData("application/x-block-type")
    if (!blockType) return
    e.preventDefault()
    const idx = calcDropIndex(e)
    insertSection(blockType, idx)
    setDropIndex(null)
  }, [calcDropIndex, insertSection])

  const handleCanvasDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setDropIndex(null)
  }, [])

  const activeDragType = activeDragId ? sections.find((s) => s.id === activeDragId)?.type : null

  const canvasBg = previewMode ? { backgroundColor: "#f5f5f5" } : { backgroundColor: "#e5e5e5", backgroundImage: "radial-gradient(circle, #ddd 0.4px, transparent 0.4px)", backgroundSize: "20px 20px" }

  return (
    <div
      ref={scrollRef}
      className="relative h-full overflow-y-auto overscroll-contain p-4 pb-16"
      style={{ ...canvasBg, cursor: spaceHeld ? (panRef.current.active ? "grabbing" : "grab") : undefined }}
      onClick={(e) => { if (e.target === e.currentTarget && !previewMode) { selectSection(null); setAddMenuAt(null) } }}
      onDoubleClick={(e) => {
        if (previewMode || e.target !== e.currentTarget) return
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const text = prompt("Add comment:")
        if (text) addComment(e.clientX - rect.left + (e.currentTarget as HTMLElement).scrollLeft, e.clientY - rect.top + (e.currentTarget as HTMLElement).scrollTop, text)
      }}
      onMouseDown={(e) => { if (spaceHeld && scrollRef.current) { panRef.current = { active: true, startX: e.clientX, startY: e.clientY, scrollX: scrollRef.current.scrollLeft, scrollY: scrollRef.current.scrollTop } } }}
      onDragOver={previewMode ? undefined : handleCanvasDragOver}
      onDrop={previewMode ? undefined : handleCanvasDrop}
      onDragLeave={previewMode ? undefined : handleCanvasDragLeave}
    >
      <div
        className={cn("mx-auto transition-all duration-300 ease-in-out min-h-[200px]")}
        style={{
          maxWidth: viewport === "desktop" ? `${containerWidth}px` : VIEWPORT_WIDTHS[viewport],
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top center",
          "--store-color-primary": primaryColor,
          "--store-color-secondary": secondaryColor,
          "--store-color-accent": accentColor,
          "--store-color-bg": effectiveBg,
          "--store-color-surface": effectiveSurface,
          "--store-color-text": effectiveText,
          "--store-color-muted": mutedColor,
          "--store-font-heading": `"${headingFont}", sans-serif`,
          "--store-font-body": `"${bodyFont}", sans-serif`,
          "--store-heading-weight": headingWeight,
          "--store-base-size": `${baseSize}px`,
          "--store-line-height": String(lineHeight),
          "--store-letter-spacing": `${letterSpacing}px`,
          "--store-radius": `${borderRadius}px`,
          "--store-btn-radius": buttonStyle === "pill" ? "9999px" : buttonStyle === "sharp" ? "0px" : `${borderRadius}px`,
          "--store-section-spacing": `${sectionSpacing}px`,
          "--store-container-width": `${containerWidth}px`,
          backgroundColor: effectiveBg,
          color: effectiveText,
          fontFamily: `"${bodyFont}", sans-serif`,
          fontSize: `${baseSize}px`,
          lineHeight: String(lineHeight),
          letterSpacing: `${letterSpacing}px`,
        } as React.CSSProperties}
      >
        {/* Device frame wraps viewport for tablet/mobile */}
        {!previewMode && <BreakpointBar viewport={viewport} containerWidth={containerWidth} />}
        <DeviceFrame viewport={viewport}>
        <div className={cn("bg-white min-h-[200px]", viewport === "desktop" && "shadow-sm")}>
        <BlockModeProvider value={{ mode: previewMode ? "live" : "editor", slug: "" }}>
        {sections.length === 0 ? (
          /* Clean empty state */
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <LayoutDashboard className="h-10 w-10 opacity-10" />
            <div className="text-center">
              <p className="text-sm font-medium">Start building</p>
              <p className="text-xs text-muted-foreground/70">Add sections to create your page</p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addSection("hero")}><Image className="h-3.5 w-3.5" />Hero</Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addSection("product-grid")}><ShoppingBag className="h-3.5 w-3.5" />Product Grid</Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAddMenuAt(0)}><FolderOpen className="h-3.5 w-3.5" />Browse All</Button>
            </div>
          </div>
        ) : previewMode ? (
          <div className="flex flex-col">
            {sections.map((s) => {
              const block = getBlock(s.type)
              if (!block) return null
              const vis = s.props._visibility as string | undefined
              if (vis && vis !== "all" && vis !== viewport) return null
              return (
                <SectionContent key={s.id} section={s} viewport={viewport} isHidden={hiddenSections.has(s.id)} />
              )
            })}
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col" ref={canvasContentRef} style={{ gap: `${sectionSpacing}px` }}>
                {sections.map((s, i) => {
                  const block = getBlock(s.type)
                  if (!block) return null
                  return (
                    <React.Fragment key={s.id}>
                      {dropIndex === i && <div className="h-0.5 bg-blue-500 mx-4 rounded-full" />}
                      {addMenuAt === i && (
                        <AddBlockMenu onSelect={(type) => insertAt(i, type)} onClose={() => setAddMenuAt(null)} />
                      )}
                      <SortableSection id={s.id} index={i} total={sections.length} sectionType={s.type} section={s} viewport={viewport} isHidden={hiddenSections.has(s.id)} />
                    </React.Fragment>
                  )
                })}
                {dropIndex === sections.length && <div className="h-0.5 bg-blue-500 mx-4 rounded-full" />}
                {addMenuAt === sections.length && (
                  <AddBlockMenu onSelect={(type) => { addSection(type); setAddMenuAt(null) }} onClose={() => setAddMenuAt(null)} />
                )}
              </div>
            </SortableContext>
            {/* Drag overlay */}
            <DragOverlay>
              {activeDragType ? (
                <div className="px-4 py-2 bg-background/90 border rounded shadow-lg text-xs font-medium capitalize backdrop-blur">
                  {activeDragType}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
        </BlockModeProvider>
        </div>
        </DeviceFrame>
      </div>
      {/* Comment pins */}
      {!previewMode && comments.map((c, i) => (
        <div key={c.id} className="absolute z-20" style={{ left: c.x, top: c.y }}>
          <button
            onClick={(e) => { e.stopPropagation(); setActiveCommentId(activeCommentId === c.id ? null : c.id) }}
            className={cn("h-5 w-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow", c.resolved ? "bg-green-500" : "bg-yellow-500")}
          >{i + 1}</button>
          {activeCommentId === c.id && (
            <div className="absolute top-6 left-0 bg-background border rounded shadow-lg p-2 text-xs w-48 z-30" onClick={(e) => e.stopPropagation()}>
              <p className="mb-1.5">{c.text}</p>
              <div className="flex gap-1">
                {!c.resolved && <button onClick={() => resolveComment(c.id)} className="text-[10px] text-green-600 hover:underline">Resolve</button>}
                <button onClick={() => { deleteComment(c.id); setActiveCommentId(null) }} className="text-[10px] text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur text-[10px] text-muted-foreground rounded px-1.5 py-0.5 shadow-sm">{zoom}%</div>
      {/* Preview mode badge */}
      {previewMode && (
        <div className="absolute top-3 right-3 bg-blue-500/90 text-white text-[10px] font-medium rounded-full px-2.5 py-1 shadow-sm backdrop-blur">
          Preview Mode
        </div>
      )}
    </div>
  )
}

function mergePropsForViewport(props: Record<string, unknown>, viewport: string): Record<string, unknown> {
  if (viewport === "desktop") return props
  const overrides = props[`_props_${viewport}`]
  if (overrides && typeof overrides === "object") return { ...props, ...(overrides as Record<string, unknown>) }
  return props
}

const CATEGORY_ORDER = ["designed", "sections", "basic", "layout", "ecommerce"] as const
const CATEGORY_LABELS: Record<string, string> = { designed: "Designed", sections: "Sections", basic: "Basic", layout: "Layout", ecommerce: "Ecommerce" }

function AddBlockMenu({ onSelect, onClose }: { onSelect: (type: string) => void; onClose: () => void }) {
  const blocks = getAllBlocks()
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { addSection } = useEditorStore()

  useEffect(() => { inputRef.current?.focus() }, [])

  const filtered = [...blocks].filter(([name]) => name.toLowerCase().includes(query.toLowerCase()))

  // Group by category
  const grouped = new Map<string, [string, (typeof blocks extends Map<string, infer V> ? V : never)][]>()
  for (const entry of filtered) {
    const cat = entry[1].category || "basic"
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(entry)
  }

  const filteredDesigned = designedSections.filter((ds) => ds.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="relative z-20 mx-4 my-1 p-2 bg-background border rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium">Add Block</span>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
      </div>
      <div className="relative mb-2">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search blocks…"
          className="w-full h-7 text-xs pl-7 pr-2 border rounded bg-muted/50 outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="max-h-56 overflow-y-auto">
        {filteredDesigned.length > 0 && (
          <div className="mb-2">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-1 mb-1">{CATEGORY_LABELS["designed"]}</div>
            <div className="grid grid-cols-4 gap-1">
              {filteredDesigned.map((ds) => (
                <button key={ds.id} onClick={() => { addSection(ds.build()); onClose() }} className="flex flex-col items-center gap-1 p-2 rounded hover:bg-accent text-xs">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="truncate w-full text-center text-[10px]">{ds.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {CATEGORY_ORDER.map((cat) => {
          const items = grouped.get(cat)
          if (!items?.length) return null
          return (
            <div key={cat} className="mb-2">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-1 mb-1">{CATEGORY_LABELS[cat]}</div>
              <div className="grid grid-cols-4 gap-1">
                {items.map(([name, reg]) => {
                  const Icon = reg.icon
                  return (
                    <button key={name} onClick={() => onSelect(name)} className="flex flex-col items-center gap-1 p-2 rounded hover:bg-accent text-xs">
                      <Icon className="h-4 w-4" />
                      <span className="truncate w-full text-center capitalize">{name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <span className="text-xs text-muted-foreground text-center py-2 block">No blocks found</span>}
      </div>
    </div>
  )
}
