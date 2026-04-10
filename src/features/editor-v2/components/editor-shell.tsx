"use client"

import "../blocks"
import { useEffect, useCallback, useRef, useState, useTransition } from "react"
import { ChevronLeft, Undo2, Redo2, Save, Eye, EyeOff, Monitor, Tablet, Smartphone, Globe, Loader2, Clock, Search, ToggleLeft } from "lucide-react"
import { useEditorStore, type Section } from "../store"
import { saveSectionsAction, publishSectionsAction } from "../actions"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
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
  const { sections, selectedId, dirty, viewport, previewMode, theme, loadSections, updateTheme, markClean, setViewport, setPreviewMode } = useEditorStore()
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
    // Conflict detection: fetch current updatedAt before saving
    if (updatedAtRef.current) {
      try {
        const res = await fetch(`/api/editor/check?pageId=${pageId}&tenantId=${tenantId}`)
        if (res.ok) {
          const { updatedAt } = await res.json() as { updatedAt: string }
          if (updatedAt && updatedAt !== updatedAtRef.current) {
            toast.warning("This page was modified elsewhere. Please refresh to avoid overwriting changes.")
            return
          }
        }
      } catch { /* proceed with save if check fails */ }
    }
    const result = await saveSectionsAction(tenantId, pageId, sections, theme)
    if (result.success) {
      markClean()
      updatedAtRef.current = new Date().toISOString()
    } else {
      toast.error(`Save failed: ${result.error}`)
    }
  }, [tenantId, pageId, sections, theme, markClean])

  saveRef.current = save

  useEffect(() => {
    const timer = setInterval(() => {
      if (useEditorStore.getState().dirty) saveRef.current?.()
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handler = () => {
      if (useEditorStore.getState().dirty) {
        const s = useEditorStore.getState()
        navigator.sendBeacon?.("/api/editor/save", JSON.stringify({
          tenantId, pageId, sections: s.sections, theme: s.theme, _v2: true,
        }))
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [tenantId, pageId])

  // ⌘K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen((v) => !v) }
    }
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

  // Sync global sections toggle to store
  useEffect(() => {
    updateTheme({ headerEnabled, footerEnabled })
  }, [headerEnabled, footerEnabled, updateTheme])

  return (
    <EditorV2Provider value={{ tenantId, pageId }}>
    <div className="flex flex-col h-screen bg-muted/30">
      <KeyboardShortcuts onSave={save} />

      {/* Top bar: left | center | right */}
      <div className="flex items-center border-b bg-background px-4 py-2 shrink-0">
        {/* Left: back + title + autosave */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-sm font-semibold truncate">Page Editor</h1>
          <AutosaveIndicator />
        </div>

        {/* Center: viewport toggle */}
        <ToggleGroup type="single" value={viewport} onValueChange={(v) => v && setViewport(v as "desktop" | "tablet" | "mobile")} variant="outline" size="sm">
          <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="desktop"><Monitor className="h-4 w-4" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Desktop</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="tablet"><Tablet className="h-4 w-4" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Tablet</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="mobile"><Smartphone className="h-4 w-4" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Mobile</TooltipContent></Tooltip>
        </ToggleGroup>

        {/* Right: actions */}
        <div className="flex items-center gap-1 flex-1 justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>SEO Settings</SheetTitle></SheetHeader>
              <SeoPanel initial={seoInitial ?? { title: "", description: "", ogImage: "" }} />
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="icon" onClick={undo}><Undo2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={redo}><Redo2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setHistoryOpen(true)}><Clock className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={togglePreview}>
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={save} disabled={!dirty}><Save className="h-4 w-4 mr-1" />Save</Button>
          <Button size="sm" onClick={publish} disabled={publishing}>
            {publishing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Globe className="h-4 w-4 mr-1" />}
            Publish
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {!previewMode && (
          <div className="w-64 border-r bg-background overflow-y-auto shrink-0">
            <Sidebar />
            {/* Global sections toggle */}
            <div className="border-t p-3 space-y-3">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><ToggleLeft className="size-3.5" />Global Sections</p>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Header</Label>
                <Switch checked={headerEnabled} onCheckedChange={setHeaderEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Footer</Label>
                <Switch checked={footerEnabled} onCheckedChange={setFooterEnabled} />
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          <Canvas />
        </div>
        {!previewMode && selectedId && (
          <div className="w-80 border-l bg-background overflow-y-auto shrink-0">
            <SettingsPanel />
          </div>
        )}
      </div>
      <SelectionBreadcrumb />
      <VersionHistory open={historyOpen} onClose={() => setHistoryOpen(false)} tenantId={tenantId} pageId={pageId} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onSave={save} onPublish={publish} onTogglePreview={togglePreview} />
    </div>
    </EditorV2Provider>
  )
}
