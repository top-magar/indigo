"use client";

import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { MIcon } from "./ui/m-icon";
import { toast } from "sonner";
import { savePage, publishPage, updatePageSeo, getHeaderFooter } from "./lib/queries";
import type { El, EditorProps } from "./core/types";
import { getAncestorPath } from "./core/tree-helpers";
import { cn } from "@/lib/utils";
import Recursive from "./canvas/recursive";
import SnapDistances from "./canvas/overlays/snap-distances";
import PixelGrid from "./canvas/overlays/pixel-grid";
import GridEditor from "./canvas/overlays/grid-editor";
import Marquee from "./canvas/overlays/marquee";
import { EditorProvider, useEditor } from "./core/provider";
import { useDocumentStore } from "./core/document-store";
import { useEditorStore } from "./core/editor-store";
import EditorNavigation from "./toolbar/navigation";
import { LeftPanel, RightPanel } from "./panels";
import { DragOverlayProvider } from "./canvas/drag-overlay";
import { useCanvas } from "./canvas/use-canvas";
import { useShortcuts } from "./core/use-shortcuts";
import { downloadHTML, generateHTML } from "./export/html";
import ShortcutsOverlay from "./toolbar/shortcuts-overlay";

export default function Editor(props: EditorProps) {
  return <EditorProvider {...props}><EditorInner /></EditorProvider>;
}

function EditorInner() {
  const { state, dispatch, pageId, pageName, tenantId, activePageId } = useEditor();
  const elements = state.editor.elements;
  const selected = state.editor.selected;
  const device = state.editor.device;
  const preview = state.editor.preview;

  const dirty = state.editor.dirty;
  const setDirty = useDocumentStore.getState().setDirty;
  const [saving, setSaving] = useState(false);
  const [clipboard, setClipboard] = useState<El | null>(null);
  const [styleClipboard, setStyleClipboard] = useState<CSSProperties | null>(null);
  const [pageTitle, setPageTitle] = useState(pageName);
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [currentSubPageId, setCurrentSubPageId] = useState<string | null>(activePageId ?? null);
  const [headerEls, setHeaderEls] = useState<El[]>([]);
  const [footerEls, setFooterEls] = useState<El[]>([]);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const currentPageRef = useRef(currentSubPageId);
  currentPageRef.current = currentSubPageId;

  // Load header/footer for preview
  useEffect(() => {
    getHeaderFooter(pageId).then(({ header, footer }) => {
      if (header) setHeaderEls(header as El[]);
      if (footer) setFooterEls(footer as El[]);
    });
  }, [pageId]);

  const { canvasRef, zoom, setZoom, panning, altHeld, spaceRef, scroll, onCanvasPointerDown, cursor } = useCanvas();

  // Auto-save — reads fresh store state inside timeout to avoid stale closures
  useEffect(() => {
    if (!dirty || saving) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      const freshElements = useDocumentStore.getState().elements;
      setSaving(true);
      savePage({ id: pageId, name: pageTitle, content: JSON.stringify(freshElements), activePageId: currentPageRef.current })
        .then(() => { if (mountedRef.current) { setDirty(false); setSaving(false); } })
        .catch(() => { if (mountedRef.current) setSaving(false); });
    }, 5000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [dirty, saving, pageTitle, pageId, tenantId, setDirty]);

  const handleSave = async () => {
    try {
      await savePage({ id: pageId, name: pageTitle, content: JSON.stringify(elements), activePageId: currentSubPageId });
      toast.success("Saved"); setDirty(false);
    } catch { toast.error("Could not save"); }
  };

  const handlePublish = async () => {
    try {
      await savePage({ id: pageId, name: pageTitle, content: JSON.stringify(elements), activePageId: currentSubPageId });
      setDirty(false);
      await publishPage({ id: pageId, name: pageTitle });
      toast.success("Saved and published");
    } catch { toast.error("Could not publish"); }
  };

  const handleExportHTML = () => {
    downloadHTML(elements, { title: pageTitle, description: metaDescription, ogImage });
    toast.success("Exported as HTML");
  };

  const baseKeyDown = useShortcuts({ selected, elements, clipboard, setClipboard, styleClipboard, setStyleClipboard, dispatch, setDirty, setZoom, handleSave });
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "?" && !(e.target as HTMLElement).matches("input,textarea,[contenteditable]")) { setShowShortcuts(s => !s); return; }
    baseKeyDown(e);
  }, [baseKeyDown]);

  const body = elements[0];
  const deviceWidth = device === "Desktop" ? "100%" : device === "Tablet" ? 768 : 420;

  const seoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveSeo = useCallback((field: string, value: string) => {
    if (!currentSubPageId) return;
    if (seoTimer.current) clearTimeout(seoTimer.current);
    seoTimer.current = setTimeout(() => {
      updatePageSeo(currentSubPageId, { [field]: value });
    }, 1000);
  }, [currentSubPageId]);

  const handlePageSwitch = useCallback(async (page: { id: string; name: string; data: string | null }) => {
    // Save current page first if dirty
    const isDirty = useDocumentStore.getState().dirty;
    if (isDirty && currentPageRef.current) {
      const freshElements = useDocumentStore.getState().elements;
      await savePage({ id: pageId, name: pageTitle, content: JSON.stringify(freshElements), activePageId: currentPageRef.current });
      useDocumentStore.getState().setDirty(false);
    }
    // Switch page
    setCurrentSubPageId(page.id);
    currentPageRef.current = page.id;
    useEditorStore.getState().setCurrentPageId(page.id);
    setPageTitle(page.name);
    if (page.data) {
      try {
        const parsed = JSON.parse(page.data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: 'LOAD_DATA', payload: { elements: parsed } });
          return;
        }
      } catch { /* invalid */ }
    }
    dispatch({ type: 'LOAD_DATA', payload: { elements: [{ id: '__body', type: '__body', name: 'Body', styles: { display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', fontFamily: 'Inter, system-ui, sans-serif' }, content: [] }] } });
  }, [dispatch, pageId, pageTitle]);

  return (
    <DragOverlayProvider>
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground text-sm leading-snug outline-none antialiased" onKeyDown={handleKeyDown} tabIndex={0}>
      {!preview && (
        <EditorNavigation
          pageTitle={pageTitle} onPageTitleChange={(v) => { setPageTitle(v); setDirty(true); }}
          dirty={dirty} saving={saving} zoom={zoom}
          metaDescription={metaDescription} onMetaDescriptionChange={(v) => { setMetaDescription(v); setDirty(true); saveSeo('seoDescription', v); }}
          ogImage={ogImage} onOgImageChange={(v) => { setOgImage(v); setDirty(true); saveSeo('ogImage', v); }}
          onZoomIn={() => setZoom((z) => Math.min(200, z + 10))} onZoomOut={() => setZoom((z) => Math.max(25, z - 10))}
          onSave={handleSave} onExportHTML={handleExportHTML} onPublish={handlePublish}
        />
      )}

      <div className="flex flex-1 overflow-hidden min-h-0">
        {!preview && <LeftPanel onPageChange={handlePageSwitch} />}

        {!preview ? (
        <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
          <div ref={canvasRef} onPointerDown={onCanvasPointerDown} className={cn("overflow-auto h-full relative bg-muted", cursor)} onClick={() => !spaceRef.current && dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: null } })}>
            <div className="p-4">
            <div data-canvas className="mx-auto min-h-full bg-background shadow-[0_1px_3px_hsl(0_0%_0%/0.08),0_8px_24px_hsl(0_0%_0%/0.06)] transition-[max-width] duration-200 relative" style={{ maxWidth: deviceWidth, transform: `scale(${zoom / 100})`, transformOrigin: "top center", '--zoom': zoom / 100 } as React.CSSProperties}>
            {body && <Recursive element={body} />}
            {(() => {
              const isDragging = !!state.editor.dropTarget;
              const hasSel = !!selected;
              const isGrid = hasSel && selected.styles.display === "grid";
              return (<>
                {!isDragging && hasSel && altHeld && <SnapDistances altHeld={altHeld} />}
                {!isDragging && isGrid && <GridEditor />}
                <PixelGrid zoom={zoom} />
              </>);
            })()}
          </div>
          </div>
          <Marquee canvasRef={canvasRef} />
          </div>
        </div>
        ) : (
        <div className="flex-1 overflow-auto bg-background">
          <div className="mx-auto min-h-full flex flex-col" style={{ maxWidth: deviceWidth }}>
            {headerEls.map(el => <Recursive key={el.id} element={el} />)}
            {body && <Recursive element={body} />}
            {footerEls.map(el => <Recursive key={el.id} element={el} />)}
          </div>
        </div>
        )}

        {!preview && <RightPanel />}
      </div>

      {!preview && selected && (
        <div className="flex items-center gap-0.5 h-7 px-3 border-t border-sidebar-border bg-sidebar text-[10px] text-sidebar-foreground/50 shrink-0 overflow-x-auto">
          {getAncestorPath(elements, selected.id).map((el, i, arr) => (
            <span key={el.id} className="flex items-center gap-0.5 shrink-0">
              {i > 0 && <span className="text-sidebar-foreground/20">/</span>}
              <button className={cn("hover:text-sidebar-foreground transition-colors", i === arr.length - 1 && "text-sidebar-foreground font-medium")} onClick={() => dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: el } })}>{el.name}</button>
            </span>
          ))}
          <span className="ml-auto text-[9px] text-sidebar-foreground/30 tabular-nums shrink-0">{JSON.stringify(elements).split('"id"').length - 1} elements</span>
        </div>
      )}

      {preview && (
        <button onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })} className="fixed left-4 top-4 z-[100] flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
          <MIcon name="visibility_off" size={14} /> Exit Preview
        </button>
      )}
      {showShortcuts && <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />}
    </div>
    </DragOverlayProvider>
  );
}
