"use client";

import { useState, useEffect } from "react";
import { v4 } from "uuid";
import { MIcon } from "../../ui/m-icon";
import { componentGroups } from "../../core/registry";
import { useDragOverlay } from "../../canvas/drag-overlay";
import { getSavedComponents, deleteSavedComponent } from "../../lib/queries";
import type { El } from "../../core/types";
import { toast } from "sonner";

const icons: Record<string, string> = {
  section: "view_agenda", container: "check_box_outline_blank", row: "view_column",
  column: "view_stream", grid: "grid_view", header: "web_asset", card: "crop_portrait",
  divider: "horizontal_rule", spacer: "space_bar", heading: "title", subheading: "text_format",
  text: "text_fields", list: "format_list_bulleted", quote: "format_quote", badge: "verified",
  code: "code", icon: "star", image: "image", video: "videocam", gallery: "photo_library",
  link: "link", button: "smart_button", map: "location_on", embed: "code", socialIcons: "share",
  accordion: "expand_more", tabs: "tab", countdown: "timer", navbar: "menu", footer: "call_to_action",
  contactForm: "contact_mail", paymentForm: "credit_card", hero: "featured_video", cta: "campaign",
  testimonial: "format_quote", pricing: "payments", features: "auto_awesome", stats: "bar_chart",
};

const groupIcons: Record<string, string> = {
  Layout: "dashboard", Basic: "text_fields", Media: "perm_media", Sections: "view_agenda",
  "E-Commerce": "storefront", Marketing: "campaign", Navigation: "menu_open",
  Interactive: "touch_app", Forms: "dynamic_form", Saved: "bookmark",
};

/** Recursively assign new IDs to an element tree so pasted copies are unique */
function reId(el: El): El {
  return { ...el, id: v4(), content: Array.isArray(el.content) ? el.content.map(reId) : el.content };
}

export default function ComponentsTab() {
  const { start } = useDragOverlay();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<{ id: string; name: string; element: string }[]>([]);

  useEffect(() => { getSavedComponents().then(setSaved).catch(() => {}); }, []);

  const q = query.toLowerCase().trim();
  const groups = componentGroups();

  const onDrag = (type: string, label: string, e: React.DragEvent) => {
    e.dataTransfer.setData("componentType", type);
    start(label, e);
  };

  const onDragSaved = (item: { name: string; element: string }, e: React.DragEvent) => {
    try {
      const el = reId(JSON.parse(item.element) as El);
      e.dataTransfer.setData("componentType", "__saved");
      e.dataTransfer.setData("savedElement", JSON.stringify(el));
      start(item.name, e);
    } catch { /* skip */ }
  };

  const handleDeleteSaved = async (id: string) => {
    await deleteSavedComponent(id);
    setSaved(s => s.filter(c => c.id !== id));
    toast.success("Component deleted");
  };

  const filteredSaved = q ? saved.filter(s => s.name.toLowerCase().includes(q)) : saved;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Search */}
      <div className="px-3 pt-2 pb-1">
        <div className="relative">
          <MIcon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search components..."
            className="h-8 w-full rounded-lg border border-sidebar-border/50 bg-sidebar pl-8 pr-8 text-xs outline-none placeholder:text-muted-foreground/40 focus:border-foreground/20 focus:bg-sidebar-accent/30 transition-colors" />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors">
              <MIcon name="close" size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {/* Saved Components */}
        {filteredSaved.length > 0 && (
          <div className="mt-1">
            <button onClick={() => setCollapsed(p => ({ ...p, Saved: !p.Saved }))}
              className="flex w-full items-center gap-2 h-7 px-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors group">
              <MIcon name={collapsed.Saved ? "chevron_right" : "expand_more"} size={12} className="text-sidebar-foreground/40" />
              <MIcon name="bookmark" size={13} className="text-sidebar-foreground/70" />
              <span>Saved</span>
              <span className="ml-auto text-[10px] font-normal text-sidebar-foreground/40 tabular-nums">{filteredSaved.length}</span>
            </button>
            {!collapsed.Saved && (
              <div className="grid grid-cols-3 gap-1 px-0.5 pb-1">
                {filteredSaved.map((item) => (
                  <div key={item.id} draggable onDragStart={(e) => onDragSaved(item, e)}
                    className="relative flex flex-col items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 p-2 cursor-grab hover:border-primary/40 active:cursor-grabbing active:scale-95 transition-all group/saved">
                    <MIcon name="widgets" size={18} className="text-primary/60" />
                    <span className="text-[10px] font-medium text-sidebar-foreground/70 truncate w-full text-center leading-tight">{item.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSaved(item.id); }}
                      className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive/80 text-white items-center justify-center text-[10px] hidden group-hover/saved:flex">
                      <MIcon name="close" size={8} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Built-in Groups */}
        {groups.map((group) => {
          const items = q ? group.items.filter(i => i.label.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)) : group.items;
          if (!items.length) return null;
          const open = q || !collapsed[group.label];

          return (
            <div key={group.label} className="mt-1">
              <button onClick={() => !q && setCollapsed(p => ({ ...p, [group.label]: !p[group.label] }))}
                className="flex w-full items-center gap-2 h-7 px-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors group">
                <MIcon name={open ? "expand_more" : "chevron_right"} size={12} className="text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70 transition-colors" />
                <MIcon name={groupIcons[group.label] ?? "widgets"} size={13} className="text-sidebar-foreground/70" />
                <span>{group.label}</span>
                <span className="ml-auto text-[10px] font-normal text-sidebar-foreground/40 tabular-nums">{items.length}</span>
              </button>

              {open && (
                <div className="grid grid-cols-3 gap-1 px-0.5 pb-1">
                  {items.map(({ type, label }) => (
                    <div key={type} draggable onDragStart={(e) => onDrag(type, label, e)}
                      className="flex flex-col items-center gap-1 rounded-lg border border-transparent bg-sidebar p-2 cursor-grab hover:border-sidebar-border/50 hover:bg-sidebar-accent/40 active:cursor-grabbing active:scale-95 transition-all">
                      <MIcon name={icons[type] ?? "widgets"} size={18} className="text-sidebar-foreground/70" />
                      <span className="text-[10px] font-medium text-sidebar-foreground/70 truncate w-full text-center leading-tight">{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {q && !filteredSaved.length && groups.every(g => !g.items.some(i => i.label.toLowerCase().includes(q) || i.type.toLowerCase().includes(q))) && (
          <div className="py-12 text-center">
            <MIcon name="search_off" size={28} className="text-sidebar-foreground/25 mx-auto mb-2" />
            <p className="text-[10px] text-sidebar-foreground/40">No results for &ldquo;{query}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}
