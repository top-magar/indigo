"use client";

import { useState } from "react";
import { MIcon } from "../../../ui/m-icon";
import { Input } from "@/components/ui/input";
import type { El } from "../../../core/types";
import { ContentField, fieldMeta } from "./text-content";

function EmptyState({ icon, text, sub }: { icon: string; text: string; sub: string }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted/30">
          <MIcon name={icon} size={18} className="text-muted-foreground/40" />
        </div>
        <p className="text-xs font-medium text-muted-foreground/40">{text}</p>
        <p className="text-[10px] text-muted-foreground/40 mt-1">{sub}</p>
      </div>
    </div>
  );
}

export function ContainerContent({ element, onUpdate }: { element: El; onUpdate: (el: El) => void }) {
  const [search, setSearch] = useState('');
  const content = element.content as El[];

  const groups: { el: El; fields: [string, string][] }[] = [];
  const collect = (els: El[]) => {
    for (const el of els) {
      if (Array.isArray(el.content)) collect(el.content);
      else if (el.content && Object.keys(el.content).length > 0) {
        groups.push({ el, fields: Object.entries(el.content as Record<string, string>) });
      }
    }
  };
  collect(content);

  if (groups.length === 0) return <EmptyState icon="dashboard_customize" text="Empty container" sub="Add elements to edit their content" />;

  const filtered = search ? groups.filter(g => g.el.name.toLowerCase().includes(search.toLowerCase()) || g.fields.some(([k]) => (fieldMeta[k]?.label || k).toLowerCase().includes(search.toLowerCase()))) : groups;

  return (
    <div className="flex-1 overflow-y-auto">
      {groups.length > 4 && (
        <div className="px-3 pt-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="h-7 text-[10px] bg-sidebar" placeholder="Search content..." />
        </div>
      )}
      {filtered.map(({ el, fields }) => {
        const leafContent = el.content as Record<string, string>;
        return (
          <div key={el.id} className="border-b border-sidebar-border/20">
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">{el.name}</p>
            </div>
            <div className="px-3 pb-3 space-y-2">
              {fields.map(([key, value]) => (
                <ContentField key={key} fieldKey={key} value={value}
                  onChange={(v) => onUpdate({ ...el, content: { ...leafContent, [key]: v } })} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { EmptyState };
