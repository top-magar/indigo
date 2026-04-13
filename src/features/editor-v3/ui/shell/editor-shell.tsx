"use client"
import { useCallback, useState } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { EditorToolbar } from "./editor-toolbar"
import { LeftSidebar } from "./left-sidebar"
import { RightSidebar } from "./right-sidebar"
import { BottomBar } from "./bottom-bar"
import { CommandPalette } from "./command-palette"
import { IframeCanvas } from "../canvas/iframe-canvas"
import { ResponsivePreview } from "../canvas/responsive-preview"
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"
import { useKeyboardShortcuts } from "./keyboard-shortcuts"
import { useGoogleFonts } from "../hooks/use-google-fonts"
import { publishFromStore, publishAllPages } from "../../publish"
import { createZip } from "../../zip"

export function EditorShell({ projectId, onSaveNew, onOpen, onSaveVersion, onRestoreVersion }: {
  projectId?: string | null
  onSaveNew?: () => void
  onOpen?: () => void
  onSaveVersion?: () => void
  onRestoreVersion?: () => void
}) {
  useKeyboardShortcuts()
  const s = useStore()
  const [iframeDoc, setIframeDoc] = useState<Document | null>(null)
  useGoogleFonts(iframeDoc)
  const onDocReady = useCallback((doc: Document) => setIframeDoc(doc), [])
  const [responsiveMode, setResponsiveMode] = useState(false)

  const handleExport = useCallback(() => {
    const html = publishFromStore(useEditorV3Store.getState())
    if (!html) return
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "page.html"; a.click()
    URL.revokeObjectURL(url)
  }, [])

  const handlePreview = useCallback(() => {
    const html = publishFromStore(useEditorV3Store.getState())
    if (!html) return
    const win = window.open("", "_blank")
    if (win) { win.document.write(html); win.document.close() }
  }, [])

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <CommandPalette />
        <EditorToolbar
          projectId={projectId} onOpen={onOpen} onSaveVersion={onSaveVersion}
          responsiveMode={responsiveMode} onToggleResponsive={() => setResponsiveMode(!responsiveMode)}
          onPreview={handlePreview} onPublish={handleExport}
        />
        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />
          {responsiveMode ? <ResponsivePreview /> : <IframeCanvas onDocReady={onDocReady} />}
          <RightSidebar />
        </div>
        <BottomBar />
      </div>
    </TooltipProvider>
  )
}
