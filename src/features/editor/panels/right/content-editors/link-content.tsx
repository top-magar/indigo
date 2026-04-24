"use client";

import { useState } from "react";
import { MIcon } from "../../../ui/m-icon";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/shared/utils";
import { getProjectPages } from "../../../lib/queries";
import { useEditor } from "../../../core/provider";

export function LinkPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { pageId } = useEditor();
  const [pages, setPages] = useState<{ name: string; slug: string; isHomepage: boolean | null }[]>([]);
  const [tab, setTab] = useState<'url' | 'page' | 'email' | 'phone'>('url');

  const loadPages = async () => {
    const r = await getProjectPages(pageId);
    setPages(r.map(p => ({ name: p.name, slug: p.slug, isHomepage: p.isHomepage })));
  };

  return (
    <Popover onOpenChange={(open) => { if (open) loadPages(); }}>
      <PopoverTrigger asChild>
        <button className="shrink-0 size-7 rounded-md border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <MIcon name="link" size={13} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        {/* Tabs */}
        <div className="flex border-b">
          {([['url', 'URL'], ['page', 'Page'], ['email', 'Email'], ['phone', 'Phone']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={cn("flex-1 py-2 text-[10px] font-medium transition-colors", tab === id ? "text-foreground border-b-2 border-primary" : "text-muted-foreground/70 hover:text-foreground")}>
              {label}
            </button>
          ))}
        </div>
        <div className="p-2.5">
          {tab === 'url' && (
            <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs font-mono" placeholder="https://..." autoFocus />
          )}
          {tab === 'page' && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {pages.map(p => (
                <button key={p.slug} onClick={() => onChange(`#page:${p.slug}`)}
                  className={cn("flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs transition-colors", value === `#page:${p.slug}` ? "bg-primary/10 text-primary" : "hover:bg-muted")}>
                  <MIcon name={p.isHomepage ? "home" : "description"} size={11} className="text-muted-foreground/40" />
                  <span className="flex-1 text-left truncate">{p.name}</span>
                </button>
              ))}
            </div>
          )}
          {tab === 'email' && (
            <Input value={value.replace('mailto:', '')} onChange={(e) => onChange(`mailto:${e.target.value}`)} className="h-7 text-xs" placeholder="hello@example.com" autoFocus />
          )}
          {tab === 'phone' && (
            <Input value={value.replace('tel:', '')} onChange={(e) => onChange(`tel:${e.target.value}`)} className="h-7 text-xs" placeholder="+1 555 123 4567" autoFocus />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
