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
import { Separator } from "@/components/ui/separator"

import {
  SidebarProvider,
  Sidebar as MiraSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
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
  const [settingsOpen, setSettingsOpen] = useState(false)
  const updatedAtRef = useRef(initialUpdatedAt)

  useEffect(() => {
    if (!loaded.current) {
      loadSections(initialSections)
      if (initialTheme) updateTheme(initialTheme)
      loaded.current = true
    }
  }, [initialSections, initialTheme, loadSections, updateTheme])

  const save = useCallback(async () => {
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen((v) => !v) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Open settings sheet when a section is selected
  useEffect(() => {
    if (selectedId && !previewMode) setSettingsOpen(true)
    else setSettingsOpen(false)
  }, [selectedId, previewMode])

  const publish = () => startPublish(async () => {
    await save()
    const result = await publishSectionsAction(tenantId, pageId)
    if (result.success) toast.success("Published!")
    else toast.error(`Publish failed: ${result.error}`)
  })

  const undo = () => useEditorStore.temporal.getState().undo()
  const redo = () => useEditorStore.temporal.getState().redo()
  const togglePreview = () => setPreviewMode(!previewMode)

  useEffect(() => {
    updateTheme({ headerEnabled, footerEnabled })
  }, [headerEnabled, footerEnabled, updateTheme])

  return (
    <EditorV2Provider value={{ tenantId, pageId }}>
      <KeyboardShortcuts onSave={save} />

      <SidebarProvider>
        {/* Left panel — Mira Sidebar */}
        {!previewMode && (
          <MiraSidebar collapsible="icon" className="border-r">
            <SidebarHeader className="p-2">
              <Sidebar />
            </SidebarHeader>

            <SidebarFooter className="p-2">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70">
                  <ToggleLeft className="size-3.5 mr-1.5" />
                  Global Sections
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="space-y-2 px-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Header</Label>
                      <Switch checked={headerEnabled} onCheckedChange={setHeaderEnabled} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Footer</Label>
                      <Switch checked={footerEnabled} onCheckedChange={setFooterEnabled} />
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarFooter>

            <SidebarRail />
          </MiraSidebar>
        )}

        {/* Main content area */}
        <SidebarInset>
          {/* Top bar — matches dashboard header style */}
          <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
            {/* Left: sidebar trigger + back + title + autosave */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {!previewMode && <SidebarTrigger />}
              {!previewMode && <Separator orientation="vertical" className="h-4" />}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard"><ChevronLeft className="h-4 w-4" /></Link>
              </Button>
              <span className="text-sm font-semibold truncate">Page Editor</span>
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
              <Separator orientation="vertical" className="h-4" />
              <Button variant="ghost" size="icon" onClick={undo}><Undo2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={redo}><Redo2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setHistoryOpen(true)}><Clock className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={togglePreview}>
                {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <Button variant="outline" size="sm" onClick={save} disabled={!dirty}><Save className="h-4 w-4 mr-1" />Save</Button>
              <Button size="sm" onClick={publish} disabled={publishing}>
                {publishing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Globe className="h-4 w-4 mr-1" />}
                Publish
              </Button>
            </div>
          </header>

          {/* Canvas */}
          <div className="flex-1 overflow-y-auto bg-muted/30">
            <Canvas />
          </div>

          {/* Breadcrumb footer */}
          <SelectionBreadcrumb />
        </SidebarInset>

        {/* Right panel — Settings Sheet */}
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetContent side="right" className="w-80 p-0 bg-sidebar text-sidebar-foreground">
            <SheetHeader className="px-4 py-3 border-b">
              <SheetTitle className="text-sm">Section Settings</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto h-[calc(100%-3.5rem)]">
              <SettingsPanel />
            </div>
          </SheetContent>
        </Sheet>
      </SidebarProvider>

      <VersionHistory open={historyOpen} onClose={() => setHistoryOpen(false)} tenantId={tenantId} pageId={pageId} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onSave={save} onPublish={publish} onTogglePreview={togglePreview} />
    </EditorV2Provider>
  )
}
