"use client"

import "../blocks"
import { useEffect, useCallback, useRef } from "react"
import { ChevronLeft, Undo2, Redo2, Save, Eye, EyeOff, Monitor, Tablet, Smartphone, Globe } from "lucide-react"
import { useEditorStore, type Section } from "../store"
import { saveSectionsAction } from "../actions"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Sidebar } from "./sidebar"
import { Canvas } from "./canvas"
import { SettingsPanel } from "./settings-panel"
import { KeyboardShortcuts } from "./keyboard-shortcuts"
import Link from "next/link"

interface EditorShellProps {
  tenantId: string
  pageId: string
  initialSections: Section[]
}

export function EditorShell({ tenantId, pageId, initialSections }: EditorShellProps) {
  const { sections, selectedId, dirty, viewport, previewMode, loadSections, markClean, setViewport, setPreviewMode } = useEditorStore()
  const loaded = useRef(false)

  useEffect(() => {
    if (!loaded.current) {
      loadSections(initialSections)
      loaded.current = true
    }
  }, [initialSections, loadSections])

  const save = useCallback(async () => {
    await saveSectionsAction(tenantId, pageId, sections)
    markClean()
  }, [tenantId, pageId, sections, markClean])

  useEffect(() => {
    if (!dirty) return
    const timer = setInterval(save, 5000)
    return () => clearInterval(timer)
  }, [dirty, save])

  const undo = () => useEditorStore.temporal.getState().undo()
  const redo = () => useEditorStore.temporal.getState().redo()

  return (
    <div className="flex flex-col h-screen">
      <KeyboardShortcuts onSave={save} />
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b px-4 py-2 shrink-0">
        {/* Left: back + title */}
        <div className="flex items-center gap-2 flex-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-sm font-semibold">Page Editor</h1>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
            <span className={`h-1.5 w-1.5 rounded-full ${dirty ? 'bg-orange-400' : 'bg-green-400'}`} />
            {dirty ? 'Unsaved' : 'Saved'}
          </span>
        </div>

        {/* Center: viewport toggle */}
        <ToggleGroup type="single" value={viewport} onValueChange={(v) => v && setViewport(v as 'desktop' | 'tablet' | 'mobile')} variant="outline" size="sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="desktop"><Monitor className="h-4 w-4" /></ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Desktop</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="tablet"><Tablet className="h-4 w-4" /></ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Tablet</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem value="mobile"><Smartphone className="h-4 w-4" /></ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Mobile</TooltipContent>
          </Tooltip>
        </ToggleGroup>

        {/* Right: undo/redo, preview, save, publish */}
        <div className="flex items-center gap-1 flex-1 justify-end">
          <Button variant="ghost" size="icon" onClick={undo}><Undo2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={redo}><Redo2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={save} disabled={!dirty}><Save className="h-4 w-4 mr-1" />Save</Button>
          <Button size="sm"><Globe className="h-4 w-4 mr-1" />Publish</Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {!previewMode && (
          <div className="w-64 border-r overflow-y-auto shrink-0">
            <Sidebar />
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          <Canvas />
        </div>
        {!previewMode && selectedId && (
          <div className="w-80 border-l overflow-y-auto shrink-0">
            <SettingsPanel />
          </div>
        )}
      </div>
    </div>
  )
}
