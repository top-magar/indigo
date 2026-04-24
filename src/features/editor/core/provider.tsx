'use client';

import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import type { El, Device, EditorProps } from './types';
import { useDocumentStore } from './document-store';
import { useEditorStore } from './editor-store';
import { findEl } from './tree-helpers';

// ─── Legacy action type (for compatibility) ─────────────────

type EditorAction =
  | { type: 'ADD_ELEMENT'; payload: { containerId: string; element: El; index?: number } }
  | { type: 'UPDATE_ELEMENT'; payload: { element: El } }
  | { type: 'UPDATE_ELEMENT_LIVE'; payload: { element: El } }
  | { type: 'COMMIT_HISTORY' }
  | { type: 'DELETE_ELEMENT'; payload: { id: string } }
  | { type: 'MOVE_ELEMENT'; payload: { elId: string; targetContainerId: string; index?: number } }
  | { type: 'REORDER_ELEMENT'; payload: { elId: string; direction: 'up' | 'down' } }
  | { type: 'DUPLICATE_ELEMENT'; payload: { elId: string; containerId: string } }
  | { type: 'CHANGE_CLICKED_ELEMENT'; payload: { element: El | null } }
  | { type: 'CHANGE_DEVICE'; payload: { device: Device } }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'SET_HOVERED'; payload: { id: string | null } }
  | { type: 'SET_DROP_TARGET'; payload: { id: string | null } }
  | { type: 'LOAD_DATA'; payload: { elements: El[] } }
  | { type: 'SET_ELEMENTS'; payload: { elements: El[] } }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export type { EditorAction };

// ─── Legacy state shape (for compatibility) ─────────────────

type EditorState = {
  elements: El[];
  selected: El | null;
  device: Device;
  preview: boolean;
  hovered: string | null;
  dropTarget: string | null;
  dirty: boolean;
  clipboard: El | null;
  zoom: number;
};

type HistoryState = { patchCount: number; currentIndex: number };
type EditorStore = { editor: EditorState; history: HistoryState };
export type { EditorState, HistoryState, EditorStore };

// ─── Context (page-level props only) ────────────────────────

type EditorContextValue = {
  pageId: string;
  pageName: string;
  tenantId: string;
  userId: string;
  activePageId: string | null;
  activePageName: string;
  themeConfig: Record<string, string> | null;
};

const EditorContext = createContext<EditorContextValue | null>(null);

// ─── Compatibility hook — maps Zustand to old API ───────────

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');

  const elements = useDocumentStore(s => s.elements);
  const dirty = useDocumentStore(s => s.dirty);
  const patchCount = useDocumentStore(s => s.patches.length);
  const currentIndex = useDocumentStore(s => s.currentIndex);

  const selected = useEditorStore(s => s.selected);
  const hovered = useEditorStore(s => s.hovered);
  const dropTarget = useEditorStore(s => s.dropTarget);
  const device = useEditorStore(s => s.device);
  const preview = useEditorStore(s => s.preview);
  const zoom = useEditorStore(s => s.zoom);

  const doc = useDocumentStore.getState();
  const ui = useEditorStore.getState();

  const dispatch = useCallback((action: EditorAction) => {
    switch (action.type) {
      case 'ADD_ELEMENT': doc.addElement(action.payload.containerId, action.payload.element, action.payload.index); break;
      case 'UPDATE_ELEMENT': doc.updateElement(action.payload.element); break;
      case 'UPDATE_ELEMENT_LIVE': doc.updateElementLive(action.payload.element); break;
      case 'COMMIT_HISTORY': doc.commitHistory(); break;
      case 'DELETE_ELEMENT': doc.deleteElement(action.payload.id); break;
      case 'MOVE_ELEMENT': doc.moveElement(action.payload.elId, action.payload.targetContainerId, action.payload.index); break;
      case 'REORDER_ELEMENT': doc.reorderElement(action.payload.elId, action.payload.direction); break;
      case 'DUPLICATE_ELEMENT': doc.duplicateElement(action.payload.elId, action.payload.containerId); break;
      case 'CHANGE_CLICKED_ELEMENT': ui.select(action.payload.element); break;
      case 'CHANGE_DEVICE': ui.setDevice(action.payload.device); break;
      case 'TOGGLE_PREVIEW': ui.togglePreview(); break;
      case 'SET_HOVERED': ui.hover(action.payload.id); break;
      case 'SET_DROP_TARGET': ui.setDropTarget(action.payload.id); break;
      case 'LOAD_DATA': doc.loadData(action.payload.elements); break;
      case 'SET_ELEMENTS': doc.setElements(action.payload.elements); break;
      case 'UNDO': {
        doc.undo();
        const el = useEditorStore.getState().selected;
        if (el) { const found = findEl(useDocumentStore.getState().elements, el.id); ui.select(found ?? null); }
        break;
      }
      case 'REDO': {
        doc.redo();
        const el = useEditorStore.getState().selected;
        if (el) { const found = findEl(useDocumentStore.getState().elements, el.id); ui.select(found ?? null); }
        break;
      }
    }
  }, [doc, ui]);

  const state: EditorStore = useMemo(() => ({
    editor: { elements, selected, device, preview, hovered, dropTarget, dirty, clipboard: null, zoom },
    history: { patchCount, currentIndex },
  }), [elements, selected, device, preview, hovered, dropTarget, dirty, zoom, patchCount, currentIndex]);

  return { state, dispatch, ...ctx };
}

// ─── Provider ───────────────────────────────────────────────

type EditorProviderProps = EditorProps & { children: React.ReactNode };

export function EditorProvider({ children, pageId, pageName, tenantId, userId, initialContent, activePageId, activePageName, themeConfig }: EditorProviderProps) {
  useEffect(() => {
    if (initialContent) {
      try {
        const parsed = JSON.parse(initialContent);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const root = parsed[0];
          if (root && typeof root.id === 'string' && typeof root.type === 'string' && root.styles) {
            useDocumentStore.getState().loadData(parsed as El[]);
            return;
          }
        }
      } catch { /* invalid JSON */ }
    }
    // No valid content — create default body
    const body: El = {
      id: '__body',
      type: '__body',
      name: 'Body',
      styles: { display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', fontFamily: 'Inter, system-ui, sans-serif' },
      content: [],
    };
    useDocumentStore.getState().loadData([body]);
  }, [initialContent]);

  // Initialize currentPageId in store
  useEffect(() => {
    useEditorStore.getState().setCurrentPageId(activePageId ?? null);
  }, [activePageId]);

  const ctx = useMemo(() => ({ pageId, pageName, tenantId, userId, activePageId: activePageId ?? null, activePageName: activePageName ?? 'Home', themeConfig: themeConfig ?? null }), [pageId, pageName, tenantId, userId, activePageId, activePageName, themeConfig]);

  return <EditorContext.Provider value={ctx}>{children}</EditorContext.Provider>;
}
