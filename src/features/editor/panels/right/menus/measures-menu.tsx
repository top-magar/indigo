"use client";

import { MIcon } from "../../../ui/m-icon";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Section, IconToggle, type StyleProps } from "../shared";
import { cn } from "@/lib/utils";

function N({ icon, value, onChange, placeholder = "auto", tip, disabled, slider }: { icon: string; value: string; onChange: (v: string) => void; placeholder?: string; tip: string; disabled?: boolean; slider?: { min: number; max: number; gradient?: string } }) {
  const pct = slider ? ((+value || 0) - slider.min) / (slider.max - slider.min) * 100 : 0;
  return (
    <Tooltip><TooltipTrigger asChild>
      <div className={cn("flex items-center gap-2 group", disabled && "opacity-30 pointer-events-none")}>
        {slider && (
          <div className="flex-1 min-w-0 relative h-5 flex items-center cursor-pointer"
            onPointerDown={(e) => {
              const el = e.currentTarget.querySelector("input") as HTMLInputElement;
              if (el) { const r = e.currentTarget.getBoundingClientRect(); const x = Math.round(((e.clientX - r.left) / r.width) * (slider.max - slider.min) + slider.min); onChange(String(Math.max(slider.min, Math.min(slider.max, x)))); }
            }}>
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-sidebar-border overflow-hidden">
              <div className="h-full rounded-full transition-[width]" style={{ width: `${pct}%`, background: slider.gradient || "hsl(var(--primary))" }} />
            </div>
            <div className="absolute size-3 rounded-full bg-white border-2 border-primary shadow-sm transition-[left] pointer-events-none" style={{ left: `calc(${pct}% - 6px)` }} />
            <input type="range" min={slider.min} max={slider.max} value={+value || 0} onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-full opacity-0 cursor-pointer" />
          </div>
        )}
        <div className={cn("relative", slider ? "w-14 shrink-0" : "w-full")}>
          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 select-none">
            {icon.length > 2 ? <MIcon name={icon} size={12} /> : <span className="text-[10px] font-semibold uppercase tracking-wide">{icon}</span>}
          </span>
          <Input value={value} onChange={(e) => onChange(e.target.value)}
            className="h-7 text-[10px] pl-6 tabular-nums bg-sidebar hover:bg-sidebar-accent/50 focus:bg-sidebar-accent/50 transition-colors" placeholder={placeholder} />
        </div>
      </div>
    </TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">{tip}</TooltipContent></Tooltip>
  );
}

export { N }; // re-export for other menus

export function MeasuresMenu({ get, set }: StyleProps) {
  return (
    <Section title="Size" icon="straighten">
      <div className="space-y-2">
        <IconToggle
          value={get("width") === "fit-content" ? "hug" : get("width") === "100%" || get("flex") === "1" ? "fill" : "fixed"}
          options={[
            { value: "hug", label: "Hug content", icon: <MIcon name="fit_screen" size={14} /> },
            { value: "fill", label: "Fill container", icon: <MIcon name="expand" size={14} /> },
            { value: "fixed", label: "Fixed size", icon: <MIcon name="width" size={14} /> },
          ]}
          onChange={(v) => { if (v === "hug") { set("width", "fit-content"); set("flex", ""); } else if (v === "fill") { set("width", "100%"); set("flex", ""); } else { set("width", "auto"); set("flex", ""); } }}
        />
        <div className="grid grid-cols-2 gap-1">
          <N icon="W" value={get("width")} onChange={(v) => set("width", v)} tip="Width" />
          <N icon="H" value={get("height")} onChange={(v) => set("height", v)} tip="Height" />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <N icon="↕" value={get("minHeight")} onChange={(v) => set("minHeight", v)} placeholder="—" tip="Min Height" />
          <N icon="↔" value={get("maxWidth")} onChange={(v) => set("maxWidth", v)} placeholder="—" tip="Max Width" />
        </div>
      </div>
    </Section>
  );
}
