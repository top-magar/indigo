"use client"

import "../blocks"
import { useEffect, useCallback, useRef, useState, useTransition } from "react"
import { ChevronLeft, Undo2, Redo2, Save, Eye, EyeOff, Monitor, Tablet, Smartphone, Globe, Loader2, Clock, Search, ToggleLeft, X, Minus, Plus } from "lucide-react"
import { useEditorStore, type Section } from "../store"
import { saveSectionsAction, publishSectionsAction } from "../actions"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Sidebar } from "./sidebar"
import { Canvas } from "./canvas"
import { SettingsPanel } from "./settings-panel"
import { KeyboardShortcuts } from "./keyboard-shortcuts"
import { SelectionBreadcrumb } from "./breadcrumb"
import { VersionHistory } from "./version-history"
import { EditorV2Provider } from "../editor-context"
import { AutosaveIndicator } from "./autosave-indicator"
import { SeoPanel } from "./seo-panel"
import { CommandPalette } from "./command-palette"
import Link from "next/link"

interface EditorShellProps {
  tenantId: string
  pageId: string
  initialSections: Section[]
  initialTheme?: Record<string, unknown>
  initialUpdatedAt?: string
  seoInitial?: { title: string; description: string; ogImage: string }
}

export function EditorShell({ tenantId, pageId, initialSections, initialTheme, initialUpdatedAt, seoInitial }: EditorShellProps) {
  const { sections, selectedId, dirty, viewport, previewMode, theme, zoom, loadSections, updateTheme, markClean, setViewport, setPreviewMode, selectSection, setZoom } = useEditorStore()
  const loaded = useRef(false)
  const saveRef = useRef<() => Promise<void>>(undefined)
  const [publishing, startPublish] = useTransition()
  const [historyOpen, setHistoryOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [headerEnabled, setHeaderEnabled] = useState(true)
  const [footerEnabled, setFooterEnabled] = useState(true)
  const updatedAtRef = useRef(initialUpdatedAt)

  useEffect(() => {
    if (!loaded.current) {
      loadSections(initialSections)
      if (initialTheme) updateTheme(initialTheme)
      loaded.current = true
    }
  }, [initialSections, initialTheme, loadSections, updateTheme])

  const save = useCallback(async () => {
    const result = await saveSectionsAction(tenantId, pageId, sections, theme)
    if (result.success) { markClean(); updatedAtRef.current = new Date().toISOString() }
    else toast.error(`Save failed: ${result.error}`)
  }, [tenantId, pageId, sections, theme, markClean])

  saveRef.current = save

  // Autosave
  useEffect(() => {
    const timer = setInterval(() => { if (useEditorStore.getState().dirty) saveRef.current?.() }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Beacon save on tab close
  useEffect(() => {
    const handler = () => {
      if (useEditorStore.getState().dirty) {
        const s = useEditorStore.getState()
        navigator.sendBeacon?.("/api/editor/save", JSON.stringify({ tenantId, pageId, sections: s.sections, theme: s.theme, _v2: true }))
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [tenantId, pageId])

  // ⌘K command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen((v) => !v) } }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const publish = () => startPublish(async () => {
    await save()
    const result = await publishSectionsAction(tenantId, pageId)
    if (result.success) toast.success("Published!")
    else toast.error(`Publish failed: ${result.error}`)
  })

  const undo = () => useEditorStore.temporal.getState().undo()
  const redo = () => useEditorStore.temporal.getState().redo()
  const togglePreview = () => setPreviewMode(!previewMode)

  useEffect(() => { updateTheme({ headerEnabled, footerEnabled }) }, [headerEnabled, footerEnabled, updateTheme])

  return (
    <EditorV2Provider value={{ tenantId, pageId }}>
      <KeyboardShortcuts onSave={save} />

      <div className="flex h-screen flex-col">
        {/* ── Top bar ── */}
        <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur px-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Button variant="ghost" size="icon" asChild><Link href="/dashboard"><ChevronLeft className="h-4 w-4" /></Link></Button>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-semibold truncate">Page Editor</span>
            <AutosaveIndicator />
          </div>

          <ToggleGroup type="single" value={viewport} onValueChange={(v) => v && setViewport(v as "desktop" | "tablet" | "mobile")} variant="outline" size="sm">
            <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="desktop"><Monitor className="h-4 w-4" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Desktop</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="tablet"><Tablet className="h-4 w-4" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Tablet</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="mobile"><Smartphone className="h-4 w-4" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Mobile</TooltipContent></Tooltip>
          </ToggleGroup>

          <div className="flex items-center gap-1 flex-1 justify-end">
            <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button></SheetTrigger>
              <SheetContent><SheetHeader><SheetTitle>SEO Settings</SheetTitle></SheetHeader><SeoPanel initial={seoInitial ?? { title: "", description: "", ogImage: "" }} /></SheetContent>
            </Sheet>
            <Separator orientation="vertical" className="h-4" />
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={undo}><Undo2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Undo (⌘Z)</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={redo}><Redo2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Redo (⌘⇧Z)</TooltipContent></Tooltip>
            <Button variant="ghost" size="icon" onClick={() => setHistoryOpen(true)}><Clock className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={togglePreview}>{previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(zoom - 10)}><Minus className="h-3 w-3" /></Button>
              <button onClick={() => setZoom(100)} className="text-xs tabular-nums w-10 text-center hover:text-foreground text-muted-foreground">{zoom}%</button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(zoom + 10)}><Plus className="h-3 w-3" /></Button>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" onClick={save} disabled={!dirty}><Save className="h-4 w-4 mr-1" />Save</Button></TooltipTrigger><TooltipContent>Save (⌘S)</TooltipContent></Tooltip>
            <Button size="sm" onClick={publish} disabled={publishing}>
              {publishing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Globe className="h-4 w-4 mr-1" />}Publish
            </Button>
          </div>
        </header>

        {/* ── Three-panel layout: Left | Canvas | Right ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT PANEL — Sidebar */}
          {!previewMode && (
            <aside className="w-[260px] shrink-0 border-r bg-sidebar text-sidebar-foreground flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <Sidebar />
              </div>
              <div className="border-t p-3 space-y-2">
                <p className="text-[10px] font-medium text-sidebar-foreground/60 uppercase tracking-wider">Global Sections</p>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Header</Label>
                  <Switch checked={headerEnabled} onCheckedChange={setHeaderEnabled} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Footer</Label>
                  <Switch checked={footerEnabled} onCheckedChange={setFooterEnabled} />
                </div>
              </div>
            </aside>
          )}

          {/* CENTER — Canvas */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <Canvas />
            </div>
            <SelectionBreadcrumb />
          </main>

          {/* RIGHT PANEL — Settings (persistent, side-by-side with canvas) */}
          {!previewMode && selectedId && (
            <aside className="w-[320px] shrink-0 border-l bg-sidebar text-sidebar-foreground flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0">
                <span className="text-xs font-semibold">Section Settings</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => selectSection(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SettingsPanel />
              </div>
            </aside>
          )}
        </div>
      </div>

      <VersionHistory open={historyOpen} onClose={() => setHistoryOpen(false)} tenantId={tenantId} pageId={pageId} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onSave={save} onPublish={publish} onTogglePreview={togglePreview} />
    </EditorV2Provider>
  )
}
