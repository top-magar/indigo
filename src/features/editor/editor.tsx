"use client";

import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { MIcon } from "./ui/m-icon";
import { toast } from "sonner";
import { savePage, publishPage, updatePageSeo } from "./lib/queries";
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
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const currentPageRef = useRef(currentSubPageId);
  currentPageRef.current = currentSubPageId;

  const { canvasRef, canvasRefObj, zoom, setZoom, zoomIn, zoomOut, zoomReset, zoomToFit, zoomToRect, transform, transformCSS, panning, altHeld, spaceRef, onCanvasPointerDown, cursor } = useCanvas();

  const handlePreview = () => {
    const html = generateHTML(elements, { title: pageTitle, description: metaDescription, ogImage });
    const blob = new Blob([html], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  // Auto-save — debounced 2s after last change, retry with backoff, save on unmount
  const pageTitleRef = useRef(pageTitle);
  pageTitleRef.current = pageTitle;
  const savingRef = useRef(false);
  const retryCount = useRef(0);

  const doSave = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const freshElements = useDocumentStore.getState().elements;
      await savePage({ id: pageId, name: pageTitleRef.current, content: JSON.stringify(freshElements), activePageId: currentPageRef.current });
      if (mountedRef.current) setDirty(false);
      retryCount.current = 0;
    } catch {
      retryCount.current++;
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  }, [pageId, setDirty]);

  useEffect(() => {
    if (!dirty || savingRef.current) return;
    const delay = retryCount.current > 0 ? Math.min(30000, 2000 * 2 ** retryCount.current) : 2000;
    autoSaveTimer.current = setTimeout(doSave, delay);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [dirty, doSave]);

  // Save on unmount (navigate away)
  useEffect(() => () => {
    if (useDocumentStore.getState().dirty) {
      const els = useDocumentStore.getState().elements;
      savePage({ id: pageId, name: pageTitleRef.current, content: JSON.stringify(els), activePageId: currentPageRef.current });
    }
  }, [pageId]);

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

  const baseKeyDown = useShortcuts({ selected, elements, clipboard, setClipboard, styleClipboard, setStyleClipboard, dispatch, setDirty, setZoom, handleSave, zoomReset, zoomToFit, zoomToRect });
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
      <EditorNavigation
          pageTitle={pageTitle} onPageTitleChange={(v) => { setPageTitle(v); setDirty(true); }}
          dirty={dirty} saving={saving} zoom={zoom}
          metaDescription={metaDescription} onMetaDescriptionChange={(v) => { setMetaDescription(v); setDirty(true); saveSeo('seoDescription', v); }}
          ogImage={ogImage} onOgImageChange={(v) => { setOgImage(v); setDirty(true); saveSeo('ogImage', v); }}
          onZoomIn={zoomIn} onZoomOut={zoomOut} onZoomReset={zoomReset}
          onSave={handleSave} onPreview={handlePreview} onExportHTML={handleExportHTML} onPublish={handlePublish}
        />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <LeftPanel onPageChange={handlePageSwitch} />

        <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
          <div ref={canvasRef} onPointerDown={onCanvasPointerDown} className={cn("overflow-hidden h-full relative bg-muted", cursor)} onClick={() => !spaceRef.current && dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: null } })}>
            <div style={{ transform: transformCSS, transformOrigin: "0 0", willChange: "transform" }}>
            <div data-canvas className="bg-background shadow-[0_1px_3px_hsl(0_0%_0%/0.08),0_8px_24px_hsl(0_0%_0%/0.06)] transition-[max-width] duration-200 relative" style={{ width: deviceWidth, '--zoom': transform.z } as React.CSSProperties}>
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
          <Marquee canvasRef={canvasRefObj} />
          </div>
        </div>

        <RightPanel />
      </div>

      {selected && (
        <div className="flex items-center gap-1 h-7 px-3 border-t border-sidebar-border bg-sidebar text-[10px] text-sidebar-foreground/40 shrink-0 overflow-x-auto relative z-10">
          {getAncestorPath(elements, selected.id).map((el, i, arr) => (
            <span key={el.id} className="flex items-center gap-1 shrink-0">
              {i > 0 && <span className="text-sidebar-foreground/20">/</span>}
              <button className={cn("hover:text-sidebar-foreground transition-colors", i === arr.length - 1 && "text-sidebar-foreground font-medium")} onClick={() => dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: el } })}>{el.name}</button>
            </span>
          ))}
          <span className="ml-auto text-[9px] text-sidebar-foreground/20 tabular-nums shrink-0">{JSON.stringify(elements).split('"id"').length - 1} elements</span>
        </div>
      )}

      {showShortcuts && <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />}
    </div>
    </DragOverlayProvider>
  );
}
