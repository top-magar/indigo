"use client"

import "../blocks"
import { useEffect, useCallback, useRef } from "react"
import { Undo2, Redo2, Save } from "lucide-react"
import { useEditorStore, type Section } from "../store"
import { saveSectionsAction } from "../actions"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./sidebar"
import { Canvas } from "./canvas"
import { SettingsPanel } from "./settings-panel"

interface EditorShellProps {
  tenantId: string
  pageId: string
  initialSections: Section[]
}

export function EditorShell({ tenantId, pageId, initialSections }: EditorShellProps) {
  const { sections, selectedId, dirty, loadSections, markClean } = useEditorStore()
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
      <div className="flex items-center gap-2 border-b px-4 py-2 shrink-0">
        <h1 className="text-sm font-semibold flex-1">Page Editor</h1>
        <Button variant="ghost" size="icon" onClick={undo}><Undo2 className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={redo}><Redo2 className="h-4 w-4" /></Button>
        <Button size="sm" onClick={save} disabled={!dirty}><Save className="h-4 w-4 mr-1" />Save</Button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r overflow-y-auto shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 overflow-y-auto">
          <Canvas />
        </div>
        {selectedId && (
          <div className="w-80 border-l overflow-y-auto shrink-0">
            <SettingsPanel />
          </div>
        )}
      </div>
    </div>
  )
}
