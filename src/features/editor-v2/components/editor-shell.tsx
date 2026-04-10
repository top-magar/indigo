"use client"

import "../blocks"
import { useEffect, useCallback, useRef, useTransition } from "react"
import { ChevronLeft, Undo2, Redo2, Save, Eye, EyeOff, Monitor, Tablet, Smartphone, Globe, Loader2 } from "lucide-react"
import { useEditorStore, type Section } from "../store"
import { saveSectionsAction, publishSectionsAction } from "../actions"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { Sidebar } from "./sidebar"
import { Canvas } from "./canvas"
import { SettingsPanel } from "./settings-panel"
import { KeyboardShortcuts } from "./keyboard-shortcuts"
import { SelectionBreadcrumb } from "./breadcrumb"
import Link from "next/link"

interface EditorShellProps {
  tenantId: string
  pageId: string
  initialSections: Section[]
  initialTheme?: Record<string, unknown>
}

export function EditorShell({ tenantId, pageId, initialSections, initialTheme }: EditorShellProps) {
  const { sections, selectedId, dirty, viewport, previewMode, theme, loadSections, updateTheme, markClean, setViewport, setPreviewMode } = useEditorStore()
  const loaded = useRef(false)
  const saveRef = useRef<() => Promise<void>>(undefined)
  const [publishing, startPublish] = useTransition()

  useEffect(() => {
    if (!loaded.current) {
      loadSections(initialSections)
      if (initialTheme) updateTheme(initialTheme)
      loaded.current = true
    }
  }, [initialSections, initialTheme, loadSections, updateTheme])

  const save = useCallback(async () => {
    const result = await saveSectionsAction(tenantId, pageId, sections, theme)
    if (result.success) {
      markClean()
    } else {
      toast.error(`Save failed: ${result.error}`)
    }
  }, [tenantId, pageId, sections, theme, markClean])

  saveRef.current = save

  // Autosave every 5s if dirty
  useEffect(() => {
    const timer = setInterval(() => {
      if (useEditorStore.getState().dirty) saveRef.current?.()
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Beacon save on tab close
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

  const publish = () => startPublish(async () => {
    await save()
    const result = await publishSectionsAction(tenantId, pageId)
    if (result.success) toast.success("Published!")
    else toast.error(`Publish failed: ${result.error}`)
  })

  const undo = () => useEditorStore.temporal.getState().undo()
  const redo = () => useEditorStore.temporal.getState().redo()

  return (
    <div className="flex flex-col h-screen bg-muted/30">
      <KeyboardShortcuts onSave={save} />

      {/* Top bar */}
      <div className="flex items-center gap-2 border-b bg-background px-4 py-2 shrink-0">
        <div className="flex items-center gap-2 flex-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-sm font-semibold">Page Editor</h1>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
            <span className={`h-1.5 w-1.5 rounded-full ${dirty ? "bg-orange-400" : "bg-green-400"}`} />
            {dirty ? "Unsaved" : "Saved"}
          </span>
        </div>

        <ToggleGroup type="single" value={viewport} onValueChange={(v) => v && setViewport(v as "desktop" | "tablet" | "mobile")} variant="outline" size="sm">
          <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="desktop"><Monitor className="h-4 w-4" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Desktop</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="tablet"><Tablet className="h-4 w-4" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Tablet</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="mobile"><Smartphone className="h-4 w-4" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Mobile</TooltipContent></Tooltip>
        </ToggleGroup>

        <div className="flex items-center gap-1 flex-1 justify-end">
          <Button variant="ghost" size="icon" onClick={undo}><Undo2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={redo}><Redo2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setPreviewMode(!previewMode)}>
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
    </div>
  )
}
