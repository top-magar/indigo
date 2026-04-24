'use client';

import { create } from 'zustand';
import type { El } from './types';
import { addEl, updateEl, deleteEl, moveEl, reorderEl, cloneEl, findEl, defaultBody } from './tree-helpers';
import { useEditorStore } from './editor-store';

const MAX_HISTORY = 50;

export type Patch = { id: string; before: El | null; after: El | null }[];

type DocumentState = {
  elements: El[];
  dirty: boolean;
  patches: Patch[];
  currentIndex: number;
};

type DocumentActions = {
  addElement: (containerId: string, element: El, index?: number) => void;
  updateElement: (element: El) => void;
  updateElementLive: (element: El) => void;
  commitHistory: () => void;
  deleteElement: (id: string) => void;
  moveElement: (elId: string, targetContainerId: string, index?: number) => void;
  reorderElement: (elId: string, direction: 'up' | 'down') => void;
  duplicateElement: (elId: string, containerId: string) => void;
  setElements: (elements: El[]) => void;
  loadData: (elements: El[]) => void;
  undo: () => void;
  redo: () => void;
  setDirty: (dirty: boolean) => void;
};

// ─── Patch helpers ──────────────────────────────────────────

function flattenTree(tree: El[]): Map<string, El> {
  const map = new Map<string, El>();
  function walk(nodes: El[]) {
    for (const n of nodes) {
      map.set(n.id, n);
      if (Array.isArray(n.content)) walk(n.content);
    }
  }
  walk(tree);
  return map;
}

function createPatch(before: El[], after: El[]): Patch {
  const bMap = flattenTree(before);
  const aMap = flattenTree(after);
  const patch: Patch = [];
  const seen = new Set<string>();

  for (const [id, bEl] of bMap) {
    seen.add(id);
    const aEl = aMap.get(id);
    if (!aEl) {
      patch.push({ id, before: bEl, after: null });
    } else if (JSON.stringify(bEl) !== JSON.stringify(aEl)) {
      patch.push({ id, before: bEl, after: aEl });
    }
  }
  for (const [id, aEl] of aMap) {
    if (!seen.has(id)) {
      patch.push({ id, before: null, after: aEl });
    }
  }
  return patch;
}

function applyPatch(elements: El[], patch: Patch, direction: 'undo' | 'redo'): El[] {
  let tree = elements;

  // First pass: apply replacements (containers first — they carry structural changes)
  // Sort so that shallower elements (containers) are processed first isn't needed
  // because replaceEl replaces the matched node entirely including its subtree.
  for (const entry of patch) {
    const target = direction === 'undo' ? entry.before : entry.after;
    if (target !== null) tree = replaceEl(tree, target);
  }

  // Second pass: remove elements that should no longer exist
  for (const entry of patch) {
    const target = direction === 'undo' ? entry.before : entry.after;
    if (target === null) tree = deleteEl(tree, entry.id);
  }

  return tree;
}

function replaceEl(tree: El[], el: El): El[] {
  return tree.map(n => {
    if (n.id === el.id) return el;
    if (Array.isArray(n.content)) return { ...n, content: replaceEl(n.content, el) };
    return n;
  });
}

// ─── History push ───────────────────────────────────────────

function pushHistory(state: DocumentState, elements: El[]): Partial<DocumentState> {
  const patch = createPatch(state.elements, elements);
  if (patch.length === 0) return { elements, dirty: true };

  // Trim future patches (discard redo stack) and enforce max
  const kept = state.patches.slice(Math.max(0, state.currentIndex - MAX_HISTORY + 1), state.currentIndex);
  return {
    elements,
    dirty: true,
    patches: [...kept, patch],
    currentIndex: kept.length + 1,
  };
}

// ─── Store ──────────────────────────────────────────────────

export const useDocumentStore = create<DocumentState & DocumentActions>()((set, get) => ({
  elements: [defaultBody],
  dirty: false,
  patches: [],
  currentIndex: 0,

  addElement: (containerId, element, index) => set(s => pushHistory(s, addEl(s.elements, containerId, element, index))),

  updateElement: (element) => {
    set(s => pushHistory(s, updateEl(s.elements, element)));
    const sel = useEditorStore.getState().selected;
    if (sel?.id === element.id) useEditorStore.getState().select(element);
  },

  updateElementLive: (element) => {
    set(s => ({ elements: updateEl(s.elements, element), dirty: true }));
    const sel = useEditorStore.getState().selected;
    if (sel?.id === element.id) useEditorStore.getState().select(element);
  },

  commitHistory: () => set(s => pushHistory(s, s.elements)),

  deleteElement: (id) => {
    set(s => pushHistory(s, deleteEl(s.elements, id)));
    const sel = useEditorStore.getState().selected;
    if (sel?.id === id) useEditorStore.getState().select(null);
  },

  moveElement: (elId, targetContainerId, index) => set(s => pushHistory(s, moveEl(s.elements, elId, targetContainerId, index))),

  reorderElement: (elId, direction) => set(s => pushHistory(s, reorderEl(s.elements, elId, direction))),

  duplicateElement: (elId, containerId) => {
    const original = findEl(get().elements, elId);
    if (!original) return;
    set(s => pushHistory(s, addEl(s.elements, containerId, cloneEl(original))));
  },

  setElements: (elements) => set(s => pushHistory(s, elements)),

  loadData: (elements) => set({ elements, dirty: false, patches: [], currentIndex: 0 }),

  undo: () => {
    set(s => {
      if (s.currentIndex <= 0) return s;
      const patch = s.patches[s.currentIndex - 1];
      const elements = applyPatch(s.elements, patch, 'undo');
      return { elements, currentIndex: s.currentIndex - 1 };
    });
    const sel = useEditorStore.getState().selected;
    if (sel) { const found = findEl(get().elements, sel.id); useEditorStore.getState().select(found ?? null); }
  },

  redo: () => {
    set(s => {
      if (s.currentIndex >= s.patches.length) return s;
      const patch = s.patches[s.currentIndex];
      const elements = applyPatch(s.elements, patch, 'redo');
      return { elements, currentIndex: s.currentIndex + 1 };
    });
    const sel = useEditorStore.getState().selected;
    if (sel) { const found = findEl(get().elements, sel.id); useEditorStore.getState().select(found ?? null); }
  },

  setDirty: (dirty) => set({ dirty }),
}));
