"use client"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Layers, Plus, LayoutTemplate, FileText, Image as ImageIcon } from "lucide-react"
import { Navigator } from "../sidebar/navigator"
import { ComponentsPanel } from "../sidebar/components-panel"
import { TemplatesPanel } from "../sidebar/templates-panel"
import { PagesPanel } from "../sidebar/pages-panel"
import { AssetsPanel } from "../sidebar/assets-panel"

const TABS = [
  { value: "navigator", icon: Layers, label: "Navigator" },
  { value: "add", icon: Plus, label: "Add" },
  { value: "blocks", icon: LayoutTemplate, label: "Blocks" },
  { value: "pages", icon: FileText, label: "Pages" },
  { value: "assets", icon: ImageIcon, label: "Assets" },
] as const

export function LeftSidebar() {
  return (
    <Tabs defaultValue="navigator" className="w-[252px] border-r flex flex-col !gap-0">
      <TabsList variant="line" className="w-full justify-start rounded-none border-b px-1 h-9 shrink-0">
        {TABS.map(({ value, icon: Icon, label }) => (
          <TabsTrigger key={value} value={value} className="h-7 w-7 p-0">
            <Tooltip><TooltipTrigger asChild><span><Icon className="size-4" /></span></TooltipTrigger><TooltipContent side="bottom">{label}</TooltipContent></Tooltip>
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="flex-1 overflow-y-auto">
        <TabsContent value="navigator" className="mt-0"><Navigator /></TabsContent>
        <TabsContent value="add" className="mt-0"><ComponentsPanel /></TabsContent>
        <TabsContent value="blocks" className="mt-0"><TemplatesPanel /></TabsContent>
        <TabsContent value="pages" className="mt-0"><PagesPanel /></TabsContent>
        <TabsContent value="assets" className="mt-0"><AssetsPanel /></TabsContent>
      </div>
    </Tabs>
  )
}
