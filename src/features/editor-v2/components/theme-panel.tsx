"use client"

import { useEditorStore } from "../store"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const FONT_OPTIONS = ["Inter", "Playfair Display", "Poppins", "Montserrat"] as const

export function ThemePanel() {
  const { theme, updateTheme } = useEditorStore()

  const primaryColor = (theme.primaryColor as string) ?? "#3b82f6"
  const headingFont = (theme.headingFont as string) ?? "Inter"
  const bodyFont = (theme.bodyFont as string) ?? "Inter"
  const borderRadius = (theme.borderRadius as number) ?? 8

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="space-y-1.5">
        <Label className="text-xs">Primary Color</Label>
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

      <div className="space-y-1.5">
        <Label className="text-xs">Heading Font</Label>
        <Select value={headingFont} onValueChange={(v) => updateTheme({ headingFont: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Body Font</Label>
        <Select value={bodyFont} onValueChange={(v) => updateTheme({ bodyFont: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Border Radius</Label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={24}
            value={borderRadius}
            onChange={(e) => updateTheme({ borderRadius: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-8 text-right">{borderRadius}px</span>
        </div>
      </div>
    </div>
  )
}
