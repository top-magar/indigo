"use client"

import "../blocks"
import { useEffect, useCallback, useRef, useState, useTransition } from "react"
import { ChevronLeft, Undo2, Redo2, Save, Eye, EyeOff, Monitor, Tablet, Smartphone, Globe, Loader2, X } from "lucide-react"
import { useEditorStore, type Section } from "../store"
import { saveSectionsAction, publishSectionsAction } from "../actions"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Sidebar } from "./sidebar"
import { Canvas } from "./canvas"
import { SettingsPanel } from "./settings-panel"
import { KeyboardShortcuts } from "./keyboard-shortcuts"
import { SelectionBreadcrumb } from "./breadcrumb"
import { VersionHistory } from "./version-history"
import { EditorV2Provider } from "../editor-context"
import { AutosaveIndicator } from "./autosave-indicator"
import { CommandPalette } from "./command-palette"
import Link from "next/link"

interface EditorShellProps {
  tenantId: string
  pageId: string
  pageName?: string
  initialSections: Section[]
  initialTheme?: Record<string, unknown>
  initialUpdatedAt?: string
  seoInitial?: { title: string; description: string; ogImage: string }
}

export function EditorShell({ tenantId, pageId, pageName, initialSections, initialTheme, initialUpdatedAt, seoInitial }: EditorShellProps) {
  const { sections, selectedId, dirty, viewport, previewMode, theme, panelsMinimized, loadSections, updateTheme, markClean, setViewport, setPreviewMode, selectSection, togglePanels } = useEditorStore()
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

  // ⌘K command palette + Shift+\ toggle panels
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen((v) => !v) }
      if (e.shiftKey && e.key === "\\") { e.preventDefault(); togglePanels() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [togglePanels])

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

  const showPanels = !previewMode && !panelsMinimized

  return (
    <EditorV2Provider value={{ tenantId, pageId }}>
      <KeyboardShortcuts onSave={save} />

      <div className="flex h-screen overflow-hidden">
        {/* LEFT PANEL — 240px */}
        {showPanels && (
          <aside className="w-[240px] shrink-0 border-r bg-sidebar text-sidebar-foreground flex flex-col overflow-hidden">
            {/* Page name + autosave header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" asChild><Link href="/dashboard"><ChevronLeft className="h-3.5 w-3.5" /></Link></Button></TooltipTrigger><TooltipContent>Back to Dashboard</TooltipContent></Tooltip>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold truncate">{pageName || "Untitled Page"}</span>
                <AutosaveIndicator />
              </div>
            </div>
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
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto">
            <Canvas />
          </div>
          <SelectionBreadcrumb />
        </main>

        {/* RIGHT PANEL — 280px */}
        {showPanels && selectedId && (
          <aside className="w-[280px] shrink-0 border-l bg-sidebar text-sidebar-foreground flex flex-col overflow-hidden">
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

      {/* BOTTOM FLOATING TOOLBAR */}
      {!panelsMinimized && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-xl bg-background/95 backdrop-blur shadow-lg border px-2 py-1.5">
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" asChild><Link href="/dashboard"><ChevronLeft className="h-3.5 w-3.5" /></Link></Button></TooltipTrigger><TooltipContent>Back</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo}><Undo2 className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent>Undo (⌘Z)</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo}><Redo2 className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent>Redo (⌘⇧Z)</TooltipContent></Tooltip>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <ToggleGroup type="single" value={viewport} onValueChange={(v) => v && setViewport(v as "desktop" | "tablet" | "mobile")} variant="outline" size="default">
            <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="desktop" className="h-7 w-7 p-0"><Monitor className="h-3.5 w-3.5" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Desktop</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="tablet" className="h-7 w-7 p-0"><Tablet className="h-3.5 w-3.5" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Tablet</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="mobile" className="h-7 w-7 p-0"><Smartphone className="h-3.5 w-3.5" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Mobile</TooltipContent></Tooltip>
          </ToggleGroup>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={togglePreview}>{previewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</Button></TooltipTrigger><TooltipContent>{previewMode ? "Exit Preview" : "Preview (⌘P)"}</TooltipContent></Tooltip>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={save} disabled={!dirty}><Save className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent>Save (⌘S)</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <Button size="icon" className="h-7 w-7" onClick={publish} disabled={publishing}>
              {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
            </Button>
          </TooltipTrigger><TooltipContent>Publish</TooltipContent></Tooltip>
        </div>
      )}

      <VersionHistory open={historyOpen} onClose={() => setHistoryOpen(false)} tenantId={tenantId} pageId={pageId} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onSave={save} onPublish={publish} onTogglePreview={togglePreview} />
    </EditorV2Provider>
  )
}
