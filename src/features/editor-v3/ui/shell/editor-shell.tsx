"use client"
import { useCallback, useState } from "react"
import { Layers, Plus, Settings, Paintbrush, Palette, Monitor, Tablet, Smartphone, Undo2, Redo2, LayoutTemplate, Download, FolderDown, Eye, FileText, Image as ImageIcon } from "lucide-react"
import { IframeCanvas } from "../canvas/iframe-canvas"
import { Navigator } from "../sidebar/navigator"
import { ComponentsPanel } from "../sidebar/components-panel"
import { TemplatesPanel } from "../sidebar/templates-panel"
import { PagesPanel } from "../sidebar/pages-panel"
import { AssetsPanel } from "../sidebar/assets-panel"
import { SettingsPanel } from "../panels/settings-panel"
import { StylePanel } from "../panels/style-panel"
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"
import { useKeyboardShortcuts } from "./keyboard-shortcuts"
import { useGoogleFonts } from "../hooks/use-google-fonts"
import { publishFromStore, publishAllPages } from "../../publish"
import { createZip } from "../../zip"

import { Save, FolderOpen } from "lucide-react"
import { SeoPanel } from "../panels/seo-panel"
import { TokensPanel } from "../panels/tokens-panel"

type LeftTab = "navigator" | "components" | "templates" | "pages" | "assets"
type RightTab = "settings" | "styles" | "tokens"

export function EditorShell({ projectId, onSaveNew, onOpen }: {
  projectId?: string | null
  onSaveNew?: () => void
  onOpen?: () => void
}) {
  useKeyboardShortcuts()
  const s = useStore()
  const [leftTab, setLeftTab] = useState<LeftTab>("navigator")
  const [rightTab, setRightTab] = useState<RightTab>("settings")
  const [iframeDoc, setIframeDoc] = useState<Document | null>(null)
  useGoogleFonts(iframeDoc)
  const onDocReady = useCallback((doc: Document) => setIframeDoc(doc), [])

  const undo = () => useEditorV3Store.temporal.getState().undo()
  const redo = () => useEditorV3Store.temporal.getState().redo()

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900">
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-gray-50">
        <div className="flex items-center gap-1">
          <button onClick={undo} className="p-1.5 rounded hover:bg-gray-200" title="Undo"><Undo2 className="w-4 h-4" /></button>
          <button onClick={redo} className="p-1.5 rounded hover:bg-gray-200" title="Redo"><Redo2 className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          {onOpen && <button onClick={onOpen} className="p-1.5 rounded hover:bg-gray-200" title="Open project"><FolderOpen className="w-4 h-4" /></button>}
          {onSaveNew && !projectId && <button onClick={onSaveNew} className="p-1.5 rounded hover:bg-gray-200" title="Save to cloud"><Save className="w-4 h-4" /></button>}
          {projectId && <span className="text-[10px] text-green-600 ml-1">● Saved</span>}
        </div>
        <div className="flex items-center gap-1">
          {([["bp-base", Monitor], ["bp-tablet", Tablet], ["bp-mobile", Smartphone]] as const).map(([id, Icon]) => (
            <button key={id} onClick={() => s.setBreakpoint(id)} className={`p-1.5 rounded ${s.currentBreakpointId === id ? "bg-gray-200" : "hover:bg-gray-100"}`}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const html = publishFromStore(useEditorV3Store.getState())
            if (!html) return
            const blob = new Blob([html], { type: "text/html" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a"); a.href = url; a.download = "page.html"; a.click()
            URL.revokeObjectURL(url)
          }} className="flex items-center gap-1 px-2.5 py-1 text-xs rounded hover:bg-gray-200" title="Export HTML">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={() => {
            const pages = publishAllPages(useEditorV3Store.getState())
            if (pages.size === 0) return
            const zip = createZip(pages)
            const url = URL.createObjectURL(zip)
            const a = document.createElement("a"); a.href = url; a.download = "site.zip"; a.click()
            URL.revokeObjectURL(url)
          }} className="flex items-center gap-1 px-2.5 py-1 text-xs rounded hover:bg-gray-200" title="Export all pages as zip">
            <FolderDown className="w-3.5 h-3.5" /> All
          </button>
          <button onClick={() => {
            const html = publishFromStore(useEditorV3Store.getState())
            if (!html) return
            const win = window.open("", "_blank")
            if (win) { win.document.write(html); win.document.close() }
          }} className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600" title="Preview">
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <span className="text-xs text-gray-400">Editor V3</span>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-60 border-r flex flex-col">
          <div className="flex border-b">
            <button onClick={() => setLeftTab("navigator")} className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs ${leftTab === "navigator" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}>
              <Layers className="w-3 h-3" /> Navigator
            </button>
            <button onClick={() => setLeftTab("components")} className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs ${leftTab === "components" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}>
              <Plus className="w-3 h-3" /> Add
            </button>
            <button onClick={() => setLeftTab("templates")} className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs ${leftTab === "templates" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}>
              <LayoutTemplate className="w-3 h-3" /> Blocks
            </button>
            <button onClick={() => setLeftTab("pages")} className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs ${leftTab === "pages" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}>
              <FileText className="w-3 h-3" /> Pages
            </button>
            <button onClick={() => setLeftTab("assets")} className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs ${leftTab === "assets" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}>
              <ImageIcon className="w-3 h-3" /> Assets
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {leftTab === "navigator" && <Navigator />}
            {leftTab === "components" && <ComponentsPanel />}
            {leftTab === "templates" && <TemplatesPanel />}
            {leftTab === "pages" && <PagesPanel />}
            {leftTab === "assets" && <AssetsPanel />}
          </div>
        </div>
        <IframeCanvas onDocReady={onDocReady} />
        <div className="w-72 border-l flex flex-col">
          <div className="flex border-b">
            <button onClick={() => setRightTab("settings")} className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs ${rightTab === "settings" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}>
              <Settings className="w-3 h-3" /> Settings
            </button>
            <button onClick={() => setRightTab("styles")} className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs ${rightTab === "styles" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}>
              <Paintbrush className="w-3 h-3" /> Styles
            </button>
            <button onClick={() => setRightTab("tokens")} className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs ${rightTab === "tokens" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}>
              <Palette className="w-3 h-3" /> Tokens
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {rightTab === "settings" && <><SettingsPanel /><div className="border-t" /><SeoPanel /></>}
            {rightTab === "styles" && <StylePanel />}
            {rightTab === "tokens" && <TokensPanel />}
          </div>
        </div>
      </div>
    </div>
  )
}
