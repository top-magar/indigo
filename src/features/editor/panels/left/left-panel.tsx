"use client";

import { useState } from "react";
import { MIcon } from "../../ui/m-icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import ComponentsTab from "./components-tab";
import LayersTab from "./layers-tab";
import TemplatesTab from "./templates-tab";
import PagesTab from "./pages-tab";

type Tab = "pages" | "components" | "layers" | "templates";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "pages", label: "Pages", icon: "description" },
  { id: "components", label: "Components", icon: "dashboard" },
  { id: "layers", label: "Layers", icon: "layers" },
  { id: "templates", label: "Templates", icon: "bookmark" },
];

interface LeftPanelProps {
  onPageChange?: (page: { id: string; name: string; data: string | null }) => void;
}

export default function LeftPanel({ onPageChange }: LeftPanelProps) {
  const [active, setActive] = useState<Tab | null>("components");

  const toggle = (tab: Tab) => setActive((prev) => (prev === tab ? null : tab));

  return (
    <div className="flex h-full">
      {/* Icon rail */}
      <TooltipProvider delayDuration={200}>
        <div className="flex w-10 flex-col items-center gap-0.5 bg-neutral-900 py-2 border-r border-neutral-800">
          {tabs.map(({ id, label, icon }) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => toggle(id)}
                  className={cn(
                    "flex size-7 items-center justify-center rounded transition-colors",
                    active === id ? "bg-white/15 text-white" : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                  )}
                >
                  <MIcon name={icon} size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-[10px] bg-neutral-800 text-neutral-200 border-neutral-700">{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Panel content */}
      {active && (
        <div className="flex w-60 flex-col overflow-hidden bg-neutral-900 border-r border-neutral-800">
          <div className="flex h-9 items-center px-3 shrink-0">
            <span className="text-[11px] font-medium text-neutral-300 capitalize">{active}</span>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            {active === "pages" && onPageChange && <PagesTab onPageChange={onPageChange} />}
            {active === "components" && <ComponentsTab />}
            {active === "layers" && <LayersTab />}
            {active === "templates" && <TemplatesTab />}
          </div>
        </div>
      )}
    </div>
  );
}
