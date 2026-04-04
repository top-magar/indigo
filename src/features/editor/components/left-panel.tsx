"use client"

import { type ReactNode } from "react"
import { Plus, Layers, FileText, Palette, Image, HelpCircle } from "lucide-react"

type TabId = "add" | "layers" | "pages" | "theme" | "assets"

const tabs: { id: TabId; icon: typeof Plus; label: string }[] = [
  { id: "add", icon: Plus, label: "Add Section" },
  { id: "layers", icon: Layers, label: "Layers" },
  { id: "pages", icon: FileText, label: "Pages" },
  { id: "theme", icon: Palette, label: "Theme" },
  { id: "assets", icon: Image, label: "Assets" },
]

interface LeftPanelProps {
  activeTab: TabId | null
  onTabChange: (tab: TabId | null) => void
  children: Record<Exclude<TabId, "add">, ReactNode>
}

export function LeftPanel({ activeTab, onTabChange, children }: LeftPanelProps) {
  const expanded = activeTab !== null

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Icon Rail */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: 44, padding: '8px 0', gap: 2, flexShrink: 0,
        borderRight: expanded ? 'none' : '1px solid var(--editor-border)',
        background: 'var(--editor-surface)',
      }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "add") { onTabChange(tab.id); return }
                onTabChange(active ? null : tab.id)
              }}
              title={tab.label}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: 6, border: 'none',
                cursor: 'pointer', transition: 'all 0.15s',
                background: active ? 'var(--editor-accent-light, rgba(59,130,246,0.1))' : 'transparent',
                color: active ? 'var(--editor-accent, #3b82f6)' : 'var(--editor-icon-secondary)',
              }}
            >
              <tab.icon style={{ width: 18, height: 18 }} />
            </button>
          )
        })}

        <div style={{ flex: 1 }} />

        <button
          onClick={() => window.open("https://docs.example.com", "_blank")}
          title="Help"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 6, border: 'none',
            cursor: 'pointer', background: 'transparent',
            color: 'var(--editor-icon-secondary)',
          }}
        >
          <HelpCircle style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* Content Panel — only visible when a tab is active */}
      {expanded && activeTab !== "add" && (
        <div style={{
          width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', background: 'var(--editor-surface)',
          borderRight: '1px solid var(--editor-border)',
        }}>
          {children[activeTab]}
        </div>
      )}
    </div>
  )
}

export type { TabId }
