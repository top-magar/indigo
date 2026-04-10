"use client"

import { useEditorStore } from "../store"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

const FONT_OPTIONS = ["Inter", "Playfair Display", "Poppins", "Montserrat"] as const

export function ThemePanel() {
  const { theme, updateTheme } = useEditorStore()

  const primaryColor = (theme.primaryColor as string) ?? "#3b82f6"
  const headingFont = (theme.headingFont as string) ?? "Inter"
  const bodyFont = (theme.bodyFont as string) ?? "Inter"
  const borderRadius = (theme.borderRadius as number) ?? 8

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-sidebar-foreground">Primary Color</Label>
        <div className="flex gap-2">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => updateTheme({ primaryColor: e.target.value })}
            className="h-8 w-8 rounded border cursor-pointer"
          />
          <Input
            value={primaryColor}
            onChange={(e) => updateTheme({ primaryColor: e.target.value })}
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-sidebar-foreground">Heading Font</Label>
        <Select value={headingFont} onValueChange={(v) => updateTheme({ headingFont: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-sidebar-foreground">Body Font</Label>
        <Select value={bodyFont} onValueChange={(v) => updateTheme({ bodyFont: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-sidebar-foreground">Border Radius</Label>
        <div className="flex items-center gap-3">
          <Slider
            min={0}
            max={24}
            value={[borderRadius]}
            onValueChange={([v]) => updateTheme({ borderRadius: v })}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-8 text-right">{borderRadius}px</span>
        </div>
      </div>
    </div>
  )
}
