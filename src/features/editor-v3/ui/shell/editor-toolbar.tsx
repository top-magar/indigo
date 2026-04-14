"use client"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Monitor, Tablet, Smartphone, Eye, FileText, FolderOpen, History, Columns3, Undo2, Redo2 } from "lucide-react"
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"

function ToolbarButton({ onClick, tooltip, children }: { onClick: () => void; tooltip: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 rounded-md focus-visible:ring-2 focus-visible:ring-ring" onClick={onClick}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-[11px]">{tooltip}</TooltipContent>
    </Tooltip>
  )
}

const BREAKPOINTS = [
  { id: "bp-base", icon: Monitor, label: "Desktop" },
  { id: "bp-tablet", icon: Tablet, label: "Tablet (768px)" },
  { id: "bp-mobile", icon: Smartphone, label: "Mobile (375px)" },
] as const

export function EditorToolbar({ projectId, onOpen, onSaveVersion, responsiveMode, onToggleResponsive, onPreview, onPublish }: {
  projectId?: string | null
  onOpen?: () => void
  onSaveVersion?: () => void
  responsiveMode: boolean
  onToggleResponsive: () => void
  onPreview: () => void
  onPublish: () => void
}) {
  const s = useStore()

  return (
    <div className="flex items-center justify-between px-4 h-12 border-b bg-background shrink-0">
      {/* Left: Logo + Page selector + Undo/Redo */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[12px] font-semibold tracking-tight text-foreground shrink-0">Indigo</span>
        <Separator orientation="vertical" className="h-5" />
        <Select value={s.currentPageId ?? ""} onValueChange={(v) => s.setPage(v)}>
          <SelectTrigger className="h-8 text-[11px] font-medium border-0 bg-transparent shadow-none px-2 gap-1.5 min-w-0 max-w-[160px] focus-visible:ring-2 focus-visible:ring-ring">
            <FileText className="size-3.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Select page" />
          </SelectTrigger>
          <SelectContent>
            {[...s.pages.values()].map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-[11px]">{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {projectId && <span className="text-[10px] text-emerald-600 font-medium px-2 py-0.5 bg-emerald-50 rounded-full shrink-0">Saved</span>}
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-0.5">
          <ToolbarButton onClick={() => useEditorV3Store.temporal.getState().undo()} tooltip="Undo (⌘Z)"><Undo2 className="size-4" /></ToolbarButton>
          <ToolbarButton onClick={() => useEditorV3Store.temporal.getState().redo()} tooltip="Redo (⌘⇧Z)"><Redo2 className="size-4" /></ToolbarButton>
        </div>
      </div>

      {/* Center: Breakpoints */}
      <ToggleGroup type="single" value={s.currentBreakpointId} onValueChange={(v) => { if (v) s.setBreakpoint(v) }} size="sm" className="bg-muted rounded-lg p-1 gap-0.5">
        {BREAKPOINTS.map(({ id, icon: Icon, label }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <ToggleGroupItem value={id} className="size-8 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm focus-visible:ring-2 focus-visible:ring-ring">
                <Icon className="size-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[11px]">{label}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>

      {/* Right: Actions + Publish */}
      <div className="flex items-center gap-1.5">
        {onOpen && <ToolbarButton onClick={onOpen} tooltip="Open project (⌘O)"><FolderOpen className="size-4" /></ToolbarButton>}
        {projectId && onSaveVersion && <ToolbarButton onClick={onSaveVersion} tooltip="Save version"><History className="size-4" /></ToolbarButton>}
        <ToolbarButton onClick={onToggleResponsive} tooltip="Responsive preview">
          <Columns3 className={`size-4 ${responsiveMode ? "text-primary" : ""}`} />
        </ToolbarButton>
        <Separator orientation="vertical" className="h-5 mx-1" />
        <Tooltip><TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 text-[11px] font-medium gap-1.5 rounded-md focus-visible:ring-2 focus-visible:ring-ring" onClick={onPreview}>
            <Eye className="size-4" />Preview
          </Button>
        </TooltipTrigger><TooltipContent side="bottom" className="text-[11px]">Preview in new tab</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild>
          <Button size="sm" className="h-8 text-[11px] font-medium gap-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring" onClick={onPublish}>
            Publish
          </Button>
        </TooltipTrigger><TooltipContent side="bottom" className="text-[11px]">Export as HTML</TooltipContent></Tooltip>
      </div>
    </div>
  )
}
