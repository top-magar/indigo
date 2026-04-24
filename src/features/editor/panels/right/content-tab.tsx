"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { El } from "../../core/types";
import { ContentField, fieldMeta, BindingSection, ContainerContent, EmptyState } from "./content-editors";

export default function ContentTab({ selected, onUpdate }: { selected: El; onUpdate: (el: El) => void }) {
  const content = selected.content;
  const isContainer = Array.isArray(content);
  const entries = !isContainer ? Object.entries(content as Record<string, string>) : [];
  const [search, setSearch] = useState('');

  if (entries.length > 0) {
    const filtered = search ? entries.filter(([k]) => (fieldMeta[k]?.label || k).toLowerCase().includes(search.toLowerCase())) : entries;
    return (
      <div className="flex-1 overflow-y-auto">
        <BindingSection selected={selected} onUpdate={onUpdate} />
        {entries.length > 3 && (
          <div className="px-3 pt-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} className="h-7 text-[10px] bg-sidebar" placeholder="Search fields..." />
          </div>
        )}
        <div className="divide-y divide-sidebar-border/20">
          {filtered.map(([key, val]) => (
            <div key={key} className="px-3 py-3">
              <ContentField fieldKey={key} value={val}
                onChange={(v) => onUpdate({ ...selected, content: { ...(content as Record<string, string>), [key]: v } })} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isContainer) {
    return <ContainerContent element={selected} onUpdate={onUpdate} />;
  }

  return <EmptyState icon="block" text="No editable content" sub="Use the Design tab to style this element" />;
}
