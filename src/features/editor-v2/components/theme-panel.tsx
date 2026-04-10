"use client"

import { useEditorStore } from "../store"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

const FONT_OPTIONS = ["Inter", "Playfair Display", "Poppins", "Montserrat"] as const

function SectionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 pb-3 border-b border-border/50 last:border-b-0">
      <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{label}</span>
      {children}
    </div>
  )
}

export function ThemePanel() {
  const { theme, updateTheme } = useEditorStore()

  const primaryColor = (theme.primaryColor as string) ?? "#3b82f6"
  const headingFont = (theme.headingFont as string) ?? "Inter"
  const bodyFont = (theme.bodyFont as string) ?? "Inter"
  const borderRadius = (theme.borderRadius as number) ?? 8
  const headerEnabled = (theme.headerEnabled as boolean) ?? true
  const footerEnabled = (theme.footerEnabled as boolean) ?? true

  return (
    <div className="flex flex-col gap-3 p-3">
      <SectionGroup label="Colors">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-sidebar-foreground">Primary Color</Label>
          <div className="flex items-center gap-2">
            <div
              className="relative h-6 w-6 rounded-full ring-1 ring-border overflow-hidden flex-shrink-0"
              style={{ backgroundImage: "conic-gradient(#ccc 25%, #fff 25% 50%, #ccc 50% 75%, #fff 75%)", backgroundSize: "6px 6px" }}
            >
              <div className="absolute inset-0 rounded-full" style={{ backgroundColor: primaryColor }} />
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
            <Input
              value={primaryColor}
              onChange={(e) => updateTheme({ primaryColor: e.target.value })}
              className="h-7 text-xs font-mono"
            />
          </div>
        </div>
      </SectionGroup>

      <SectionGroup label="Typography">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-sidebar-foreground">Heading Font</Label>
          <Select value={headingFont} onValueChange={(v) => updateTheme({ headingFont: v })}>
            <SelectTrigger className="h-7 w-full text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-sidebar-foreground">Body Font</Label>
          <Select value={bodyFont} onValueChange={(v) => updateTheme({ bodyFont: v })}>
            <SelectTrigger className="h-7 w-full text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </SectionGroup>

      <SectionGroup label="Shape">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-sidebar-foreground">Border Radius</Label>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground">0</span>
            <Slider
              min={0}
              max={24}
              value={[borderRadius]}
              onValueChange={([v]) => updateTheme({ borderRadius: v })}
              className="flex-1"
            />
            <span className="text-[10px] text-muted-foreground">24</span>
          </div>
          <span className="text-xs text-muted-foreground text-right">{borderRadius}px</span>
        </div>
      </SectionGroup>

      <SectionGroup label="Global Sections">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Header</Label>
          <Switch checked={headerEnabled} onCheckedChange={(v) => updateTheme({ headerEnabled: v })} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Footer</Label>
          <Switch checked={footerEnabled} onCheckedChange={(v) => updateTheme({ footerEnabled: v })} />
        </div>
      </SectionGroup>
    </div>
  )
}
