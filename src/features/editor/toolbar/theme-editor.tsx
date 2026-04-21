"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Palette } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getThemeConfig, saveThemeConfig, type ThemeConfig } from "../lib/queries";

const fonts = ["Inter", "DM Sans", "Poppins", "Roboto", "Lato", "Montserrat", "Playfair Display", "Merriweather", "Space Grotesk", "Outfit"];

interface ThemeEditorProps { projectId: string }

export function ThemeEditor({ projectId }: ThemeEditorProps) {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { getThemeConfig(projectId).then(setTheme); }, [projectId]);

  const update = useCallback((key: keyof ThemeConfig, value: string) => {
    setTheme(t => t ? { ...t, [key]: value } : t);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { saveThemeConfig(projectId, { [key]: value }); }, 500);
  }, [projectId]);

  if (!theme) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 h-7 px-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Palette className="size-3.5" />
          <span>Theme</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <p className="text-xs font-semibold mb-3">Site Theme</p>
        <div className="space-y-3">
          {/* Colors */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground">Colors</p>
            {([["primaryColor", "Primary"], ["backgroundColor", "Background"], ["textColor", "Text"]] as const).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <input type="color" value={theme[key]} onChange={(e) => update(key, e.target.value)} className="size-6 rounded border cursor-pointer" />
                <span className="text-[11px] flex-1">{label}</span>
                <Input value={theme[key]} onChange={(e) => update(key, e.target.value)} className="h-6 w-20 text-[10px] font-mono" />
              </div>
            ))}
          </div>

          {/* Fonts */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground">Fonts</p>
            {([["headingFont", "Headings"], ["bodyFont", "Body"]] as const).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[11px] w-16">{label}</span>
                <select value={theme[key]} onChange={(e) => update(key, e.target.value)} className="flex-1 h-6 rounded border bg-transparent text-[11px] px-1 outline-none">
                  {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Border radius */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] w-16">Radius</span>
            <Input value={theme.borderRadius} onChange={(e) => update("borderRadius", e.target.value)} className="h-6 flex-1 text-[10px]" placeholder="8px" />
          </div>

          {/* Mode */}
          <div className="flex gap-1 rounded-md border p-0.5">
            {(["light", "dark"] as const).map(m => (
              <button key={m} onClick={() => update("mode", m)}
                className={cn("flex-1 h-6 rounded text-[11px] font-medium transition-all capitalize", theme.mode === m ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
