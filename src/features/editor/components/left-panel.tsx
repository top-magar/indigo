"use client"

import { type ReactNode, useState } from "react"
import { Plus, Layers, FileText, Palette, Image, HelpCircle } from "lucide-react"

type TabId = "add" | "layers" | "pages" | "theme" | "assets"

const tabs: { id: TabId; icon: typeof Plus; label: string }[] = [
  { id: "add", icon: Plus, label: "Add Section" },
  { id: "layers", icon: Layers, label: "Layers" },
  { id: "pages", icon: FileText, label: "Pages" },
  { id: "theme", icon: Palette, label: "Site Styles" },
  { id: "assets", icon: Image, label: "Assets" },
]

interface LeftPanelProps {
  activeTab: TabId | null
  onTabChange: (tab: TabId | null) => void
  children: Record<Exclude<TabId, "add">, ReactNode>
}

function RailButton({ icon: Icon, label, active, onClick }: { icon: typeof Plus; label: string; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 6, border: 'none',
          cursor: 'pointer', transition: 'all 0.15s',
          background: active ? 'var(--editor-accent-light, rgba(59,130,246,0.1))' : 'transparent',
          color: active ? 'var(--editor-accent, #3b82f6)' : 'var(--editor-icon-secondary)',
        }}
      >
        <Icon style={{ width: 18, height: 18 }} />
      </button>
      {hovered && (
        <div style={{
          position: 'absolute', left: 40, top: '50%', transform: 'translateY(-50%)',
          padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500,
          whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 50,
          background: 'var(--editor-tooltip-bg, #1f2937)', color: 'var(--editor-tooltip-text, #fff)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          {label}
        </div>
      )}
    </div>
  )
}

export function LeftPanel({ activeTab, onTabChange, children }: LeftPanelProps) {
  const expanded = activeTab !== null

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Icon Rail */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: 44, padding: '8px 0', gap: 2, flexShrink: 0,
        borderRight: '1px solid var(--editor-border)',
        background: 'var(--editor-surface)',
      }}>
        {tabs.map((tab) => (
          <RailButton
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => {
              if (tab.id === "add") { onTabChange(tab.id); return }
              onTabChange(activeTab === tab.id ? null : tab.id)
            }}
          />
        ))}

        <div style={{ flex: 1 }} />

        <RailButton
          icon={HelpCircle}
          label="Help"
          active={false}
          onClick={() => window.open("https://docs.example.com", "_blank")}
        />
      </div>

      {/* Content Panel */}
      {expanded && activeTab !== "add" && (
        <div style={{
          width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', background: 'var(--editor-surface)',
        }}>
          {children[activeTab]}
        </div>
      )}
    </div>
  )
}

export type { TabId }
