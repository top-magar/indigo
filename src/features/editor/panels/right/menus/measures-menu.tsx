"use client";

import { MIcon } from "../../../ui/m-icon";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Section, IconToggle, type StyleProps } from "../shared";
import { cn } from "@/shared/utils";

function N({ icon, value, onChange, placeholder = "auto", tip, disabled, slider }: { icon: string; value: string; onChange: (v: string) => void; placeholder?: string; tip: string; disabled?: boolean; slider?: { min: number; max: number; gradient?: string } }) {
  const pct = slider ? ((+value || 0) - slider.min) / (slider.max - slider.min) * 100 : 0;
  return (
    <Tooltip><TooltipTrigger asChild>
      <div className={cn("flex items-center gap-1 group", disabled && "opacity-30 pointer-events-none")}>
        {/* Icon — always first */}
        <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground/70 select-none">
          {icon.length > 2 ? <MIcon name={icon} size={11} /> : <span className="text-[10px] font-semibold uppercase">{icon}</span>}
        </span>
        {slider ? (<>
          {/* Slider */}
          <div className="flex-1 min-w-0 relative h-4 flex items-center cursor-pointer"
            onPointerDown={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const x = Math.round(((e.clientX - r.left) / r.width) * (slider.max - slider.min) + slider.min);
              onChange(String(Math.max(slider.min, Math.min(slider.max, x))));
            }}>
            <div className="absolute inset-x-0 h-1 rounded-full bg-sidebar-border overflow-hidden">
              <div className="h-full rounded-full transition-[width]" style={{ width: `${pct}%`, background: slider.gradient || "hsl(var(--primary))" }} />
            </div>
            <div className="absolute size-3 rounded-full bg-primary border-2 border-white shadow transition-[left] pointer-events-none" style={{ left: `calc(${pct}% - 6px)` }} />
            <input type="range" min={slider.min} max={slider.max} value={+value || 0} onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-full opacity-0 cursor-pointer" />
          </div>
          {/* Value input */}
          <Input value={value} onChange={(e) => onChange(e.target.value)}
            className="h-5 w-9 shrink-0 text-[10px] text-center tabular-nums bg-sidebar hover:bg-sidebar-accent/50 focus:bg-sidebar-accent/50 transition-colors" placeholder={placeholder} />
        </>) : (
          /* No slider — icon inside input */
          <div className="relative flex-1">
            <Input value={value} onChange={(e) => onChange(e.target.value)}
              className="h-7 text-[10px] pl-1 tabular-nums bg-sidebar hover:bg-sidebar-accent/50 focus:bg-sidebar-accent/50 transition-colors" placeholder={placeholder} />
          </div>
        )}
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
