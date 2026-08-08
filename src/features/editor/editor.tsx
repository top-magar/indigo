"use client";

import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { toast } from "sonner";
import { updatePageSeo } from "./lib/queries";
import { publishSite, validatePublication } from "./lib/session-actions";
import type { El, EditorProps } from "./core/types";
import { getAncestorPath, countElements } from "./core/tree-helpers";
import { cn } from "@/shared/utils";
import Recursive from "./canvas/recursive";
import SnapDistances from "./canvas/overlays/snap-distances";
import PixelGrid from "./canvas/overlays/pixel-grid";
import GridEditor from "./canvas/overlays/grid-editor";
import { HoverStylesInjector } from "./canvas/hover-styles-injector";
import Marquee from "./canvas/overlays/marquee";
import { EditorProvider, useEditor } from "./core/provider";
import { useDocumentStore } from "./core/document-store";
import { useEditorStore } from "./core/editor-store";
import EditorNavigation from "./toolbar/navigation";
import { LeftPanel, RightPanel } from "./panels";
import { DragOverlayProvider } from "./canvas/drag-overlay";
import { useCanvas } from "./canvas/use-canvas";
import { useShortcuts } from "./core/use-shortcuts";
import { ThemeProvider } from "@/features/store/components/theme-provider";
import type { ThemeConfig } from "./lib/theme-utils";
import { downloadHTML } from "./export/html";
import ShortcutsOverlay from "./toolbar/shortcuts-overlay";
import { useRevisionAutosave } from "./core/use-revision-autosave";
import { usePageLease } from "./core/use-page-lease";
import { AddSectionDialog } from "./panels/left/add-section-dialog";
import { EditorCommandPalette } from "./toolbar/command-palette";
import { trackEditorEvent } from "./lib/editor-analytics";

export default function Editor(props: EditorProps) {
  return <EditorProvider {...props}><EditorInner /></EditorProvider>;
}

function EditorInner() {
  const { state, dispatch, pageId, activePageId, activePageName, activePageSlug, activePageSeoTitle, activePageSeoDescription, activePageOgImage, themeConfig, currency } = useEditor();
  const elements = state.editor.elements;
  const selected = state.editor.selected;
  const device = state.editor.device;

  const dirty = state.editor.dirty;
  const setDirty = useDocumentStore.getState().setDirty;
  const [clipboard, setClipboard] = useState<El | null>(null);
  const [styleClipboard, setStyleClipboard] = useState<CSSProperties | null>(null);
  const [pageTitle, setPageTitle] = useState(activePageName);
  const [pageSlug, setPageSlug] = useState(activePageSlug);
  const [seoTitle, setSeoTitle] = useState(activePageSeoTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(activePageSeoDescription ?? "");
  const [ogImage, setOgImage] = useState(activePageOgImage ?? "");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [currentSubPageId, setCurrentSubPageId] = useState<string | null>(activePageId ?? null);
  const { saveStatus, saveError, saveNow, retrySave } = useRevisionAutosave({
    projectId: pageId,
    pageId: currentSubPageId,
    pageName: pageTitle,
    pageSlug,
    seoTitle,
    seoDescription: metaDescription,
    ogImage,
    currency,
  });
  const lease = usePageLease(pageId, currentSubPageId);
  useEffect(() => { trackEditorEvent({ name: "editor_entered" }); }, []);

  const { canvasRef, canvasRefObj, zoom, setZoom, zoomIn, zoomOut, zoomReset, zoomToFit, zoomToRect, transform, transformCSS, spaceRef, onCanvasPointerDown, cursor } = useCanvas();

  const handlePreview = () => {
    if (!currentSubPageId) return;
    trackEditorEvent({ name: "storefront_previewed", viewport: device });
    window.open(`/editor/preview?project=${pageId}&page=${currentSubPageId}`, "_blank", "noopener,noreferrer");
  };

  const handleSave = async () => {
    if (lease.state.status === 'blocked') {
      toast.error(`This page is being edited by ${lease.state.holderName}`);
      return;
    }
    const saved = await saveNow();
    if (saved) toast.success("Changes saved");
    else toast.error(useDocumentStore.getState().saveError || "Couldn’t save");
  };

  const handlePublish = async () => {
    if (lease.state.status === 'blocked') {
      toast.error(`This page is being edited by ${lease.state.holderName}`);
      return;
    }
    const saved = await saveNow();
    if (!saved) {
      toast.error("Save the latest changes before publishing");
      return;
    }
    const validation = await validatePublication(pageId);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    if (!validation.ready) {
      trackEditorEvent({ name: "publication_validation_failed", issueCount: validation.issues.length });
      toast.error(validation.issues[0]?.message || "Resolve the publication checklist first");
      return;
    }
    const published = await publishSite(pageId);
    if (!published.ok) {
      toast.error(published.message);
      return;
    }
    toast.success(`Published version ${published.version}`);
    trackEditorEvent({ name: "site_published", version: published.version });
  };

  const handleExportHTML = () => {
    downloadHTML(elements, { title: pageTitle, description: metaDescription, ogImage });
    toast.success("Exported as HTML");
  };

  const baseKeyDown = useShortcuts({ selected, elements, clipboard, setClipboard, styleClipboard, setStyleClipboard, dispatch, setDirty, setZoom, handleSave, zoomReset, zoomToFit, zoomToRect });
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setShowCommands(true); return; }
    if (e.key === "?" && !(e.target as HTMLElement).matches("input,textarea,[contenteditable]")) { setShowShortcuts(s => !s); return; }
    baseKeyDown(e);
  }, [baseKeyDown]);

  const body = elements[0];
  const deviceWidth = device === "desktop" ? "100vw" : device === "tablet" ? 768 : 390;

  const seoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveSeo = useCallback((field: string, value: string) => {
    if (!currentSubPageId) return;
    if (seoTimer.current) clearTimeout(seoTimer.current);
    seoTimer.current = setTimeout(() => {
      updatePageSeo(currentSubPageId, { [field]: value });
    }, 1000);
  }, [currentSubPageId]);

  const handlePageSwitch = useCallback(async (page: { id: string; name: string; slug?: string; data: string | null; serverRevision?: number }) => {
    const saved = await saveNow();
    if (!saved) {
      toast.error("Retry saving before changing pages");
      return;
    }
    // Switch page
    setCurrentSubPageId(page.id);
    useEditorStore.getState().setCurrentPageId(page.id);
    setPageTitle(page.name);
    setPageSlug(page.slug ?? "");
    if (page.data) {
      try {
        const parsed = JSON.parse(page.data);
        const nextElements = Array.isArray(parsed) ? parsed : parsed?.schemaVersion === 2 ? parsed.root : null;
        if (Array.isArray(nextElements) && nextElements.length > 0) {
          useDocumentStore.getState().loadData(nextElements, page.serverRevision ?? 0);
          return;
        }
      } catch { /* invalid */ }
    }
    useDocumentStore.getState().loadData([{ id: '__body', type: '__body', name: 'Body', styles: { display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', fontFamily: 'Inter, system-ui, sans-serif' }, content: [] }], page.serverRevision ?? 0);
  }, [saveNow]);

  return (
    <DragOverlayProvider>
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground text-sm leading-snug outline-none antialiased" onKeyDown={handleKeyDown} tabIndex={0}>
      <EditorNavigation
          pageTitle={pageTitle} onPageTitleChange={(v) => { setPageTitle(v); setDirty(true); }}
          dirty={dirty} saving={saveStatus === 'saving'} zoom={zoom}
          seoTitle={seoTitle} onSeoTitleChange={(v) => { setSeoTitle(v); setDirty(true); saveSeo('seoTitle', v); }}
          metaDescription={metaDescription} onMetaDescriptionChange={(v) => { setMetaDescription(v); setDirty(true); saveSeo('seoDescription', v); }}
          ogImage={ogImage} onOgImageChange={(v) => { setOgImage(v); setDirty(true); saveSeo('ogImage', v); }}
          onZoomIn={zoomIn} onZoomOut={zoomOut} onZoomReset={zoomReset}
          onSave={handleSave} onPreview={handlePreview} onExportHTML={handleExportHTML} onPublish={handlePublish}
          onOpenCommand={() => setShowCommands(true)}
        />

      {(saveStatus === 'error' || saveStatus === 'conflict') && (
        <div role="status" className="flex h-9 shrink-0 items-center justify-center gap-2 border-b border-destructive/30 bg-destructive/10 px-4 text-xs text-destructive">
          <span>{saveError || (saveStatus === 'conflict' ? "This page was changed in another editor. Your local changes aren't saved yet." : "Couldn’t save")}</span>
          {saveStatus === 'error' && <button type="button" onClick={() => void retrySave()} className="h-7 rounded-md px-2 font-medium hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Retry</button>}
          {saveStatus === 'conflict' && (
            <>
              <button type="button" onClick={() => { downloadHTML(elements, { title: pageTitle, description: metaDescription, ogImage }); }} className="h-7 rounded-md border border-destructive/20 px-2 font-medium hover:bg-destructive/10">Download my copy</button>
              <button type="button" onClick={() => window.location.reload()} className="h-7 rounded-md px-2 font-medium hover:bg-destructive/10">Reload</button>
            </>
          )}
        </div>
      )}
      {lease.state.status === 'blocked' && (
        <div role="alert" className="flex min-h-10 shrink-0 items-center justify-center gap-3 border-b border-warning/40 bg-warning/10 px-4 text-xs text-foreground">
          <span><strong>{lease.state.holderName}</strong> is editing this page. Editing is paused to prevent overwritten work.</span>
          <button type="button" onClick={() => void lease.takeover()} className="h-8 rounded-md border bg-background px-3 font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Take over</button>
        </div>
      )}
      <div className="hidden min-h-9 shrink-0 items-center justify-center border-b bg-muted/40 px-4 text-xs text-muted-foreground max-xl:flex">
        Compact mode: content, section order, preview, save, and publish remain available. Layout editing requires a 1280px-wide window.
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        <LeftPanel onPageChange={handlePageSwitch} onAddSection={() => setShowLibrary(true)} />

        <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
          <div ref={canvasRef} onPointerDown={lease.state.status === 'blocked' ? undefined : onCanvasPointerDown} className={cn("overflow-hidden h-full relative bg-muted", cursor, lease.state.status === 'blocked' && "pointer-events-none opacity-70")} onClick={() => !spaceRef.current && dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: null } })}>
            <div style={{ transform: transformCSS, transformOrigin: "0 0", willChange: "transform" }}>
            {themeConfig ? (
              <ThemeProvider theme={themeConfig as ThemeConfig}>
                <div data-canvas className="bg-background shadow-[0_1px_3px_hsl(0_0%_0%/0.08),0_8px_24px_hsl(0_0%_0%/0.06)] transition-[max-width] duration-200 relative" style={{ width: deviceWidth, '--zoom': transform.z } as React.CSSProperties}>
                  <HoverStylesInjector elements={state.editor.elements} />
                  {body && <Recursive element={body} />}
                  {(() => {
                    const isDragging = !!state.editor.dropTarget;
                    const hasSel = !!selected;
                    const isGrid = hasSel && selected.styles.display === "grid";
                    return (<>
                      {!isDragging && hasSel && <SnapDistances />}
                      {!isDragging && isGrid && <GridEditor />}
                      <PixelGrid zoom={zoom} />
                    </>);
                  })()}
                </div>
              </ThemeProvider>
            ) : (
              <div data-canvas className="bg-background shadow-[0_1px_3px_hsl(0_0%_0%/0.08),0_8px_24px_hsl(0_0%_0%/0.06)] transition-[max-width] duration-200 relative" style={{ width: deviceWidth, '--zoom': transform.z } as React.CSSProperties}>
                <HoverStylesInjector elements={state.editor.elements} />
                {body && <Recursive element={body} />}
                {(() => {
                  const isDragging = !!state.editor.dropTarget;
                  const hasSel = !!selected;
                  const isGrid = hasSel && selected.styles.display === "grid";
                  return (<>
                    {!isDragging && hasSel && <SnapDistances />}
                    {!isDragging && isGrid && <GridEditor />}
                    <PixelGrid zoom={zoom} />
                  </>);
                })()}
              </div>
            )}
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
          <span className="ml-auto text-[10px] text-sidebar-foreground/20 tabular-nums shrink-0">{countElements(elements)} elements</span>
        </div>
      )}

      {showShortcuts && <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />}
      <AddSectionDialog open={showLibrary} onOpenChange={setShowLibrary} />
      <EditorCommandPalette open={showCommands} onOpenChange={setShowCommands} onPreview={handlePreview} onPublish={() => void handlePublish()} onSave={() => void handleSave()} onOpenLibrary={() => setShowLibrary(true)} />
    </div>
    </DragOverlayProvider>
  );
}
