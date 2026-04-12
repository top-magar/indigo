"use client"

import "../../blocks"
import React, { useEffect, useState, useCallback, useRef } from "react"
import { DndContext, DragOverlay, closestCenter, type DragStartEvent, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useEditorStore } from "../../store"
import { getBlock } from "../../registry"
import { cn } from "@/shared/utils"
import { Plus, LayoutDashboard, Image, ShoppingBag, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BlockModeProvider } from "../../blocks/data-context"
import type { Section } from "../../store"
import { useSidebarState } from "../../sidebar-state"
import { SortableSection } from "./sortable-section"
import { BreakpointBar } from "./breakpoint-bar"
import { InspectOverlay } from "./inspect-overlay"

const VIEWPORT_WIDTHS = { desktop: "100%", tablet: "768px", mobile: "375px" } as const

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

function DropZone({ onAdd }: { onAdd: () => void }) {
  const [visible, setVisible] = useState(false)
  return (
    <div
      className="relative h-3 -my-0.5 z-5"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {visible && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="flex-1 h-px bg-blue-300" />
          <button
            onClick={onAdd}
            aria-label="Insert section here"
            className="mx-1.5 h-4 w-4 rounded-full bg-blue-500/80 text-white flex items-center justify-center hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 transition-colors"
          >
            <Plus className="h-2.5 w-2.5" />
          </button>
          <div className="flex-1 h-px bg-blue-300" />
        </div>
      )}
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

export function Canvas() {
  const sections = useEditorStore(s => s.sections)
  const selectedId = useEditorStore(s => s.selectedId)
  const selectSection = useEditorStore(s => s.selectSection)
  const addSection = useEditorStore(s => s.addSection)
  const insertSection = useEditorStore(s => s.insertSection)
  const moveSection = useEditorStore(s => s.moveSection)
  const viewport = useEditorStore(s => s.viewport)
  const zoom = useEditorStore(s => s.zoom)
  const showGrid = useEditorStore(s => s.showGrid)
  const addComment = useEditorStore(s => s.addComment)
  const resolveComment = useEditorStore(s => s.resolveComment)
  const deleteComment = useEditorStore(s => s.deleteComment)

  // Subscribe to individual theme primitives — avoids re-render when unrelated theme fields change
  const primaryColor = useEditorStore(s => (s.theme.primaryColor as string) ?? "#3b82f6")
  const secondaryColor = useEditorStore(s => (s.theme.secondaryColor as string) ?? "#8b5cf6")
  const accentColor = useEditorStore(s => (s.theme.accentColor as string) ?? "#06b6d4")
  const bgColor = useEditorStore(s => (s.theme.backgroundColor as string) ?? "#ffffff")
  const surfaceColor = useEditorStore(s => (s.theme.surfaceColor as string) ?? "#f8fafc")
  const textColor = useEditorStore(s => (s.theme.textColor as string) ?? "#0f172a")
  const mutedColor = useEditorStore(s => (s.theme.mutedColor as string) ?? "#64748b")
  const headingFont = useEditorStore(s => (s.theme.headingFont as string) ?? "Inter")
  const bodyFont = useEditorStore(s => (s.theme.bodyFont as string) ?? "Inter")
  const headingWeight = useEditorStore(s => (s.theme.headingWeight as string) ?? "700")
  const baseSize = useEditorStore(s => (s.theme.baseSize as number) ?? 16)
  const lineHeight = useEditorStore(s => (s.theme.lineHeight as number) ?? 1.6)
  const letterSpacing = useEditorStore(s => (s.theme.letterSpacing as number) ?? 0)
  const borderRadius = useEditorStore(s => (s.theme.borderRadius as number) ?? 8)
  const buttonStyle = useEditorStore(s => (s.theme.buttonStyle as string) ?? "rounded")
  const sectionSpacing = useEditorStore(s => (s.theme.sectionSpacing as number) ?? 0)
  const containerWidth = useEditorStore(s => (s.theme.containerWidth as number) ?? 1200)
  const themeMode = useEditorStore(s => (s.theme.mode as string) ?? "light")
  const darkBg = useEditorStore(s => (s.theme.darkBg as string) ?? "#0f172a")
  const darkText = useEditorStore(s => (s.theme.darkText as string) ?? "#f1f5f9")
  const darkSurface = useEditorStore(s => (s.theme.darkSurface as string) ?? "#1e293b")

  // Subscribe to hiddenSections size — avoids re-render on Set reference change when size is same
  const hiddenSectionsRef = useRef(useEditorStore.getState().hiddenSections)
  const hiddenSectionsSize = useEditorStore(s => s.hiddenSections.size)
  useEffect(() => {
    hiddenSectionsRef.current = useEditorStore.getState().hiddenSections
  }, [hiddenSectionsSize])

  // Subscribe to comments length — only re-render when comments are added/removed
  const commentsLength = useEditorStore(s => s.comments.length)
  const commentsRef = useRef(useEditorStore.getState().comments)
  useEffect(() => {
    commentsRef.current = useEditorStore.getState().comments
  }, [commentsLength])
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

  const isDark = themeMode === "dark"
  const effectiveBg = isDark ? darkBg : bgColor
  const effectiveText = isDark ? darkText : textColor
  const effectiveSurface = isDark ? darkSurface : surfaceColor

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

  const [fileDragOver, setFileDragOver] = useState(false)

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault()
      e.dataTransfer.dropEffect = "copy"
      setFileDragOver(true)
      return
    }
    if (!e.dataTransfer.types.includes("application/x-block-type")) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    setDropIndex(calcDropIndex(e))
  }, [calcDropIndex])

  const handleCanvasDrop = useCallback(async (e: React.DragEvent) => {
    if (e.dataTransfer.files.length > 0) {
      e.preventDefault()
      setFileDragOver(false)
      const file = e.dataTransfer.files[0]
      if (!file.type.startsWith("image/")) return
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const { url } = await res.json()
      addSection({ id: crypto.randomUUID(), type: "image", props: { ...(getBlock("image")?.defaultProps ?? {}), src: url } })
      return
    }
    const blockType = e.dataTransfer.getData("application/x-block-type")
    if (!blockType) return
    e.preventDefault()
    const idx = calcDropIndex(e)
    insertSection(blockType, idx)
    setDropIndex(null)
  }, [calcDropIndex, insertSection, addSection])

  const handleCanvasDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setDropIndex(null)
    setFileDragOver(false)
  }, [])

  const activeDragType = activeDragId ? sections.find((s) => s.id === activeDragId)?.type : null

  const canvasBg = { backgroundColor: "#e5e5e5", backgroundImage: "radial-gradient(circle, #ddd 0.4px, transparent 0.4px)", backgroundSize: "20px 20px" }

  return (
    <div
      ref={scrollRef}
      className="relative h-full overflow-y-auto overscroll-contain p-4 pb-16"
      style={{ ...canvasBg, cursor: spaceHeld ? (panRef.current.active ? "grabbing" : "grab") : undefined }}
      onClick={(e) => { if (e.target === e.currentTarget) { selectSection(null) } }}
      onDoubleClick={(e) => {
        if (e.target !== e.currentTarget) return
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const text = prompt("Add comment:")
        if (text) addComment(e.clientX - rect.left + (e.currentTarget as HTMLElement).scrollLeft, e.clientY - rect.top + (e.currentTarget as HTMLElement).scrollTop, text)
      }}
      onMouseDown={(e) => { if (spaceHeld && scrollRef.current) { panRef.current = { active: true, startX: e.clientX, startY: e.clientY, scrollX: scrollRef.current.scrollLeft, scrollY: scrollRef.current.scrollTop } } }}
      onDragOver={handleCanvasDragOver}
      onDrop={handleCanvasDrop}
      onDragLeave={handleCanvasDragLeave}
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
        {<BreakpointBar viewport={viewport} containerWidth={containerWidth} />}
        <DeviceFrame viewport={viewport}>
        <div className={cn("@container bg-white min-h-[200px] relative", viewport === "desktop" && "shadow-sm")}>
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none z-10" style={{
            backgroundImage: 'linear-gradient(rgba(255,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
        )}
        <BlockModeProvider value={{ mode: "editor", slug: "" }}>
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
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => useSidebarState.getState().openAddPanel()}><FolderOpen className="h-3.5 w-3.5" />Browse All</Button>
            </div>
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
                      <DropZone onAdd={() => useSidebarState.getState().openAddPanel(i)} />
                      <SortableSection id={s.id} index={i} total={sections.length} sectionType={s.type} section={s} viewport={viewport} isHidden={hiddenSectionsRef.current.has(s.id)} />
                    </React.Fragment>
                  )
                })}
                {dropIndex === sections.length && <div className="h-0.5 bg-blue-500 mx-4 rounded-full" />}
                <DropZone onAdd={() => useSidebarState.getState().openAddPanel(sections.length)} />
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
      {commentsRef.current.map((c, i) => (
        <div key={c.id} className="absolute z-20" style={{ left: c.x, top: c.y }}>
          <button
            onClick={(e) => { e.stopPropagation(); setActiveCommentId(activeCommentId === c.id ? null : c.id) }}
            aria-label={`Comment ${i + 1}: ${c.resolved ? "resolved" : "unresolved"}`}
            className={cn("h-5 w-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow focus-visible:ring-2 focus-visible:ring-offset-1", c.resolved ? "bg-green-500 focus-visible:ring-green-400" : "bg-yellow-500 focus-visible:ring-yellow-400")}
          >{i + 1}</button>
          {activeCommentId === c.id && (
            <div className="absolute top-6 left-0 bg-background border rounded shadow-lg p-2 text-xs w-48 z-30" role="dialog" aria-label={`Comment ${i + 1}`} onClick={(e) => e.stopPropagation()}>
              <p className="mb-1">{c.text}</p>
              <span className="text-[9px] text-muted-foreground mb-1.5 block">{c.resolved ? "✓ Resolved" : "● Unresolved"}</span>
              <div className="flex gap-1">
                {!c.resolved && <button onClick={() => resolveComment(c.id)} className="text-[10px] text-green-600 hover:underline">Resolve</button>}
                <button onClick={() => { deleteComment(c.id); setActiveCommentId(null) }} className="text-[10px] text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
      {/* File drop overlay */}
      {fileDragOver && (
        <div className="absolute inset-0 z-40 bg-blue-500/10 border-2 border-dashed border-blue-500 flex items-center justify-center">
          <span className="bg-blue-500 text-white text-sm font-medium rounded-lg px-4 py-2 shadow-lg">Drop image to add</span>
        </div>
      )}
      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur text-[10px] text-muted-foreground rounded px-1.5 py-0.5 shadow-sm">{zoom}%</div>
      <InspectOverlay containerRef={scrollRef} />
    </div>
  )
}
