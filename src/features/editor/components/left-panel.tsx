"use client"

import { type ReactNode } from "react"
import { Plus, Layers, FileText, Palette, Image, HelpCircle } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

type TabId = "add" | "layers" | "pages" | "theme" | "assets"

const tabs: { id: TabId; icon: typeof Plus; label: string }[] = [
  { id: "add", icon: Plus, label: "Add Section" },
  { id: "layers", icon: Layers, label: "Layers" },
  { id: "pages", icon: FileText, label: "Pages" },
  { id: "theme", icon: Palette, label: "Site Styles" },
  { id: "assets", icon: Image, label: "Assets" },
]

interface LeftPanelProps { activeTab: TabId | null; onTabChange: (tab: TabId | null) => void; children: Record<TabId, ReactNode> }

function RailButton({ icon: Icon, label, active, onClick }: { icon: typeof Plus; label: string; active: boolean; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClick}
          style={{ background: active ? 'var(--editor-chrome-hover)' : undefined, color: active ? 'var(--editor-chrome-text)' : 'var(--editor-chrome-text-secondary)' }}>
          <Icon className="w-[18px] h-[18px]" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>{label}</TooltipContent>
    </Tooltip>
  )
}

export function LeftPanel({ activeTab, onTabChange, children }: LeftPanelProps) {
  return (
    <div className="flex h-full">
      <div className="flex flex-col items-center w-11 py-2 gap-0.5 shrink-0 border-r" style={{ borderColor: 'var(--editor-chrome-border)', background: 'var(--editor-chrome-bg)' }}>
        {tabs.map((tab) => (
          <RailButton key={tab.id} icon={tab.icon} label={tab.label} active={activeTab === tab.id}
            onClick={() => onTabChange(activeTab === tab.id ? null : tab.id)} />
        ))}
        <div className="flex-1" />
        <RailButton icon={HelpCircle} label="Help" active={false} onClick={() => window.open("https://docs.example.com", "_blank")} />
      </div>

      {activeTab && (
        <div className="w-[260px] shrink-0 flex flex-col min-h-0 overflow-hidden" style={{ background: 'var(--editor-surface)' }}>
          {children[activeTab]}
        </div>
      )}
    </div>
  )
}

export type { TabId }
