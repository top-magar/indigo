"use client";

import { MIcon } from "../../../ui/m-icon";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Section, IconToggle, type StyleProps } from "../shared";
import { cn } from "@/lib/utils";

function N({ icon, value, onChange, placeholder = "auto", tip, disabled, slider }: { icon: string; value: string; onChange: (v: string) => void; placeholder?: string; tip: string; disabled?: boolean; slider?: { min: number; max: number } }) {
  return (
    <Tooltip><TooltipTrigger asChild>
      <div className={cn("flex items-center gap-1.5 group", disabled && "opacity-30 pointer-events-none")}>
        {slider && (
          <input type="range" min={slider.min} max={slider.max} value={+value || 0} onChange={(e) => onChange(e.target.value)}
            className="flex-1 h-1 accent-primary cursor-pointer min-w-0 opacity-50 group-hover:opacity-100 transition-opacity" />
        )}
        <div className={cn("relative", slider ? "w-14 shrink-0" : "w-full")}>
          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] font-semibold text-muted-foreground/30 select-none uppercase tracking-wide">{icon}</span>
          <Input value={value} onChange={(e) => onChange(e.target.value)}
            className="h-6 text-[10px] pl-6 tabular-nums bg-sidebar hover:bg-sidebar-accent/50 focus:bg-sidebar-accent/50 transition-colors" placeholder={placeholder} />
        </div>
      </div>
    </TooltipTrigger><TooltipContent side="bottom" className="text-[10px] px-2 py-1">{tip}</TooltipContent></Tooltip>
  );
}

export { N }; // re-export for other menus

export function MeasuresMenu({ get, set }: StyleProps) {
  return (
    <TooltipProvider delayDuration={200}>
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
    </TooltipProvider>
  );
}
