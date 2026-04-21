"use client";

import { useState, useEffect } from "react";
import { MIcon } from "../../ui/m-icon";
import { cn } from "@/lib/utils";
import { useEditor } from "../../core/provider";
import SettingsTab from "./settings-tab";

const typeIcons: Record<string, string> = {
  __body: "public", container: "check_box_outline_blank", section: "view_agenda",
  row: "view_column", column: "view_stream", hero: "featured_video",
  header: "web_asset", footer: "call_to_action", card: "crop_portrait",
  grid: "grid_view", text: "text_fields", heading: "title", subheading: "text_format",
  button: "smart_button", link: "link", image: "image", video: "videocam",
  divider: "horizontal_rule", spacer: "space_bar", navbar: "menu",
};

export default function RightPanel() {
  const { state, dispatch } = useEditor();
  const selected = state.editor.selected;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { if (selected) setCollapsed(false); }, [selected]);

  const commitHistory = () => dispatch({ type: 'COMMIT_HISTORY' });

  return (
    <div className={cn("flex h-full transition-[width] duration-200", collapsed ? "w-0" : "w-64")} onBlur={commitHistory}>
      {collapsed ? (
        <button onClick={() => setCollapsed(false)} className="absolute right-2 top-12 z-10 flex size-6 items-center justify-center rounded bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors shadow-lg border border-neutral-700">
          <MIcon name="chevron_left" size={14} />
        </button>
      ) : (
        <div className="flex w-64 flex-col overflow-hidden bg-neutral-900 border-l border-neutral-800">
          {/* Header */}
          <div className="flex h-9 items-center gap-2 px-3 shrink-0">
            {selected ? (
              <>
                <MIcon name={typeIcons[selected.type] ?? "widgets"} size={13} className="text-blue-400 shrink-0" />
                <span className="text-[11px] font-medium text-neutral-200 truncate flex-1">{selected.name}</span>
                <span className="text-[9px] text-neutral-600 font-mono">{selected.type}</span>
              </>
            ) : (
              <span className="text-[11px] text-neutral-500 flex-1">Design</span>
            )}
            <button onClick={() => setCollapsed(true)} className="flex size-5 items-center justify-center rounded text-neutral-600 hover:text-neutral-300 transition-colors shrink-0">
              <MIcon name="chevron_right" size={12} />
            </button>
          </div>

          {selected ? (
            <SettingsTab />
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <MIcon name="ads_click" size={28} className="text-neutral-700 mx-auto mb-2" />
                <p className="text-[10px] text-neutral-600">Select an element</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
