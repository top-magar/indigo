"use client";

import { useState, useEffect } from "react";
import { MIcon } from "../../ui/m-icon";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { savePageTemplate, getPageTemplates, deletePageTemplate } from "../../lib/queries";
import { useEditor } from "../../core/provider";

export default function TemplatesTab() {
  const { state, dispatch, userId } = useEditor();
  const elements = state.editor.elements;
  const [templates, setTemplates] = useState<{ id: string; name: string; content: string }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    if (loaded) return;
    getPageTemplates()
      .then((t) => {
        setTemplates(t.map((x) => ({ id: x.id, name: x.name, content: x.content })));
        setLoaded(true);
      })
      .catch(() => {});
  }, [loaded]);

  const handleSave = async () => {
    if (!templateName.trim()) return;
    await savePageTemplate({ name: templateName.trim(), content: JSON.stringify(elements), userId: userId });
    setTemplateName("");
    setSaving(false);
    setLoaded(false);
    toast.success("Template saved");
  };

  const handleLoad = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length) {
        dispatch({ type: "COMMIT_HISTORY" });
        dispatch({ type: "SET_ELEMENTS", payload: { elements: parsed } });
        dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: null } });
        toast.success("Template loaded");
      }
    } catch { toast.error("Invalid template"); }
  };

  const handleDelete = async (id: string) => {
    await deletePageTemplate(id);
    setTemplates((t) => t.filter((x) => x.id !== id));
    toast.success("Template deleted");
  };

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {saving ? (
        <div className="mb-2 flex items-center gap-2">
          <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Template name…"
            className="h-8 text-xs" autoFocus onKeyDown={(e) => e.key === "Enter" && handleSave()} />
          <button onClick={handleSave} disabled={!templateName.trim()}
            className="shrink-0 h-8 px-3 rounded-md bg-foreground text-background text-xs font-medium disabled:opacity-30 hover:bg-foreground/90 transition-colors">Save</button>
          <button onClick={() => { setSaving(false); setTemplateName(""); }}
            className="shrink-0 h-8 px-2 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
        </div>
      ) : (
        <button onClick={() => setSaving(true)}
          className="mb-2 flex w-full items-center justify-center gap-2 rounded-md border border-sidebar-border bg-sidebar p-2 text-xs transition-colors hover:bg-sidebar-accent">
          <MIcon name="bookmark" size={14} /> Save Current Page
        </button>
      )}
      {templates.length === 0 && (
        <div className="py-8 text-center text-xs text-muted-foreground">No saved templates yet.</div>
      )}
      {templates.map((t) => (
        <div key={t.id} className="mb-1 flex items-center justify-between rounded-md border border-sidebar-border p-2">
          <button onClick={() => handleLoad(t.content)} className="flex-1 text-left">
            <div className="text-xs font-medium">{t.name}</div>
            
          </button>
          <button onClick={() => handleDelete(t.id)} className="shrink-0 p-1 text-destructive hover:text-destructive/80">
            <MIcon name="delete" size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
