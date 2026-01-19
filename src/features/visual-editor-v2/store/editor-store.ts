/**
 * Visual Editor V2 - Main Editor Store
 * 
 * Zustand store for the visual editor state management.
 * Handles pages, elements, selection, and history.
 */

import { create } from 'zustand';
import { produce } from 'immer';
import type { 
  VisualElement, 
  Breakpoint,
  BreakpointOverride,
} from '../types/element';
import type { Page } from '../types/page';

// ============================================================================
// CANVAS STATE
// ============================================================================

export interface CanvasTransform {
  x: number;  // Pan X
  y: number;  // Pan Y
  k: number;  // Zoom scale (1 = 100%)
}

export interface SelectionBox {
  active: boolean;
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export interface Guide {
  type: 'horizontal' | 'vertical';
  position: number;
  elementId?: string;
}

// ============================================================================
// EDITOR STATE
// ============================================================================

export interface EditorState {
  // Current page
  page: Page | null;
  
  // Canvas state
  canvas: {
    transform: CanvasTransform;
    selectionBox: SelectionBox;
    guides: Guide[];
    snappingEnabled: boolean;
    showGrid: boolean;
    gridSize: number;
    showRulers: boolean;
  };
  
  // Selection
  selectedElementIds: string[];
  hoveredElementId: string | null;
  
  // Drag state
  isDragging: boolean;
  draggedElementId: string | null;
  
  // Resize state
  isResizing: boolean;
  resizeHandle: string | null;
  
  // Current breakpoint
  activeBreakpoint: Breakpoint;
  
  // Editor mode
  mode: 'edit' | 'preview' | 'code';
  
  // Panels
  panels: {
    layers: boolean;
    properties: boolean;
    components: boolean;
    ai: boolean;
  };
  
  // History
  history: {
    past: Page[];
    future: Page[];
  };
  
  // Status
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
}

// ============================================================================
// EDITOR ACTIONS
// ============================================================================

export interface EditorActions {
  // Page operations
  setPage: (page: Page) => void;
  updatePage: (updates: Partial<Page>) => void;
  
  // Element operations
  addElement: (element: VisualElement, parentId?: string, index?: number) => void;
  updateElement: (elementId: string, updates: Partial<VisualElement>) => void;
  deleteElement: (elementId: string) => void;
  duplicateElement: (elementId: string) => void;
  moveElement: (elementId: string, newParentId: string, index?: number) => void;
  
  // Selection
  selectElement: (elementId: string | null, mode?: 'replace' | 'add' | 'toggle') => void;
  selectElements: (elementIds: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Hover
  setHoveredElement: (elementId: string | null) => void;
  
  // Canvas
  setTransform: (transform: CanvasTransform) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetZoom: () => void;
  setSnapping: (enabled: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setShowRulers: (show: boolean) => void;
  
  // Breakpoint
  setActiveBreakpoint: (breakpoint: Breakpoint) => void;
  updateBreakpointOverride: (
    elementId: string, 
    breakpoint: Breakpoint, 
    override: Partial<BreakpointOverride>
  ) => void;
  
  // Mode
  setMode: (mode: 'edit' | 'preview' | 'code') => void;
  
  // Panels
  togglePanel: (panel: keyof EditorState['panels']) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  
  // Clipboard
  copyElements: () => void;
  cutElements: () => void;
  pasteElements: () => void;
  
  // Status
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setLastSavedAt: (date: Date) => void;
}

export type EditorStore = EditorState & EditorActions;


// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: EditorState = {
  page: null,
  
  canvas: {
    transform: { x: 0, y: 0, k: 1 },
    selectionBox: { active: false, start: { x: 0, y: 0 }, end: { x: 0, y: 0 } },
    guides: [],
    snappingEnabled: true,
    showGrid: false,
    gridSize: 8,
    showRulers: true,
  },
  
  selectedElementIds: [],
  hoveredElementId: null,
  
  isDragging: false,
  draggedElementId: null,
  
  isResizing: false,
  resizeHandle: null,
  
  activeBreakpoint: 'desktop',
  
  mode: 'edit',
  
  panels: {
    layers: true,
    properties: true,
    components: true,
    ai: false,
  },
  
  history: {
    past: [],
    future: [],
  },
  
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
};

const MAX_HISTORY = 50;

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useEditorStoreV2 = create<EditorStore>()((set, get) => ({
  ...initialState,

  // ==========================================================================
  // PAGE OPERATIONS
  // ==========================================================================

  setPage: (page) => {
    set({
      page,
      selectedElementIds: [],
      hoveredElementId: null,
      history: { past: [], future: [] },
      isDirty: false,
    });
  },

  updatePage: (updates) => {
    set(produce((state: EditorState) => {
      if (state.page) {
        Object.assign(state.page, updates);
        state.page.updatedAt = new Date();
        state.isDirty = true;
      }
    }));
  },

  // ==========================================================================
  // ELEMENT OPERATIONS
  // ==========================================================================

  addElement: (element, parentId, index) => {
    const { page, pushHistory } = get();
    if (!page) return;

    pushHistory();

    set(produce((state: EditorState) => {
      if (!state.page) return;

      // Add element to elements map
      state.page.elements[element.id] = element;

      // Determine parent
      const targetParentId = parentId || state.page.rootElementId;
      const parent = state.page.elements[targetParentId];

      if (parent) {
        // Update element's parent reference
        state.page.elements[element.id].parentId = targetParentId;

        // Add to parent's children
        if (index !== undefined && index >= 0) {
          parent.children.splice(index, 0, element.id);
        } else {
          parent.children.push(element.id);
        }
      }

      state.page.updatedAt = new Date();
      state.isDirty = true;
    }));
  },

  updateElement: (elementId, updates) => {
    const { page, pushHistory } = get();
    if (!page || !page.elements[elementId]) return;

    pushHistory();

    set(produce((state: EditorState) => {
      if (!state.page) return;

      const element = state.page.elements[elementId];
      if (element) {
        // Deep merge updates
        Object.assign(element, updates);
        state.page.updatedAt = new Date();
        state.isDirty = true;
      }
    }));
  },

  deleteElement: (elementId) => {
    const { page, pushHistory } = get();
    if (!page || !page.elements[elementId]) return;
    if (elementId === page.rootElementId) return; // Can't delete root

    pushHistory();

    set(produce((state: EditorState) => {
      if (!state.page) return;

      const element = state.page.elements[elementId];
      if (!element) return;

      // Recursively delete children
      const deleteRecursive = (id: string) => {
        const el = state.page!.elements[id];
        if (el) {
          el.children.forEach(deleteRecursive);
          delete state.page!.elements[id];
        }
      };

      // Remove from parent's children
      if (element.parentId) {
        const parent = state.page.elements[element.parentId];
        if (parent) {
          parent.children = parent.children.filter(id => id !== elementId);
        }
      }

      // Delete element and its children
      deleteRecursive(elementId);

      // Clear selection if deleted element was selected
      state.selectedElementIds = state.selectedElementIds.filter(id => id !== elementId);

      state.page.updatedAt = new Date();
      state.isDirty = true;
    }));
  },

  duplicateElement: (elementId) => {
    const { page, pushHistory, addElement } = get();
    if (!page || !page.elements[elementId]) return;

    const element = page.elements[elementId];
    if (!element.parentId) return; // Can't duplicate root

    pushHistory();

    // Deep clone element and children
    const cloneElement = (el: VisualElement, newParentId: string | null): VisualElement => {
      const newId = `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const cloned: VisualElement = {
        ...el,
        id: newId,
        name: `${el.name} Copy`,
        parentId: newParentId,
        children: [],
      };

      // Clone children
      el.children.forEach(childId => {
        const child = page.elements[childId];
        if (child) {
          const clonedChild = cloneElement(child, newId);
          cloned.children.push(clonedChild.id);
          // Add cloned child to page
          set(produce((state: EditorState) => {
            if (state.page) {
              state.page.elements[clonedChild.id] = clonedChild;
            }
          }));
        }
      });

      return cloned;
    };

    const cloned = cloneElement(element, element.parentId);
    
    // Add to parent after original
    set(produce((state: EditorState) => {
      if (!state.page) return;

      state.page.elements[cloned.id] = cloned;

      const parent = state.page.elements[element.parentId!];
      if (parent) {
        const index = parent.children.indexOf(elementId);
        parent.children.splice(index + 1, 0, cloned.id);
      }

      state.selectedElementIds = [cloned.id];
      state.page.updatedAt = new Date();
      state.isDirty = true;
    }));
  },

  moveElement: (elementId, newParentId, index) => {
    const { page, pushHistory } = get();
    if (!page || !page.elements[elementId] || !page.elements[newParentId]) return;
    if (elementId === page.rootElementId) return;

    pushHistory();

    set(produce((state: EditorState) => {
      if (!state.page) return;

      const element = state.page.elements[elementId];
      if (!element) return;

      // Remove from old parent
      if (element.parentId) {
        const oldParent = state.page.elements[element.parentId];
        if (oldParent) {
          oldParent.children = oldParent.children.filter(id => id !== elementId);
        }
      }

      // Add to new parent
      const newParent = state.page.elements[newParentId];
      if (newParent) {
        element.parentId = newParentId;
        if (index !== undefined && index >= 0) {
          newParent.children.splice(index, 0, elementId);
        } else {
          newParent.children.push(elementId);
        }
      }

      state.page.updatedAt = new Date();
      state.isDirty = true;
    }));
  },

  // ==========================================================================
  // SELECTION
  // ==========================================================================

  selectElement: (elementId, mode = 'replace') => {
    set(produce((state: EditorState) => {
      if (elementId === null) {
        state.selectedElementIds = [];
        return;
      }

      switch (mode) {
        case 'replace':
          state.selectedElementIds = [elementId];
          break;
        case 'add':
          if (!state.selectedElementIds.includes(elementId)) {
            state.selectedElementIds.push(elementId);
          }
          break;
        case 'toggle':
          const index = state.selectedElementIds.indexOf(elementId);
          if (index >= 0) {
            state.selectedElementIds.splice(index, 1);
          } else {
            state.selectedElementIds.push(elementId);
          }
          break;
      }
    }));
  },

  selectElements: (elementIds) => {
    set({ selectedElementIds: elementIds });
  },

  clearSelection: () => {
    set({ selectedElementIds: [] });
  },

  selectAll: () => {
    const { page } = get();
    if (!page) return;

    const allIds = Object.keys(page.elements).filter(id => id !== page.rootElementId);
    set({ selectedElementIds: allIds });
  },

  setHoveredElement: (elementId) => {
    set({ hoveredElementId: elementId });
  },

  // ==========================================================================
  // CANVAS
  // ==========================================================================

  setTransform: (transform) => {
    set(produce((state: EditorState) => {
      state.canvas.transform = transform;
    }));
  },

  zoomIn: () => {
    set(produce((state: EditorState) => {
      state.canvas.transform.k = Math.min(state.canvas.transform.k * 1.25, 4);
    }));
  },

  zoomOut: () => {
    set(produce((state: EditorState) => {
      state.canvas.transform.k = Math.max(state.canvas.transform.k / 1.25, 0.1);
    }));
  },

  zoomToFit: () => {
    // TODO: Calculate based on page bounds
    set(produce((state: EditorState) => {
      state.canvas.transform = { x: 0, y: 0, k: 0.5 };
    }));
  },

  resetZoom: () => {
    set(produce((state: EditorState) => {
      state.canvas.transform = { x: 0, y: 0, k: 1 };
    }));
  },

  setSnapping: (enabled) => {
    set(produce((state: EditorState) => {
      state.canvas.snappingEnabled = enabled;
    }));
  },

  setShowGrid: (show) => {
    set(produce((state: EditorState) => {
      state.canvas.showGrid = show;
    }));
  },

  setShowRulers: (show) => {
    set(produce((state: EditorState) => {
      state.canvas.showRulers = show;
    }));
  },

  // ==========================================================================
  // BREAKPOINT
  // ==========================================================================

  setActiveBreakpoint: (breakpoint) => {
    set({ activeBreakpoint: breakpoint });
  },

  updateBreakpointOverride: (elementId, breakpoint, override) => {
    const { page, pushHistory } = get();
    if (!page || !page.elements[elementId]) return;

    pushHistory();

    set(produce((state: EditorState) => {
      if (!state.page) return;

      const element = state.page.elements[elementId];
      if (element) {
        if (!element.breakpointOverrides[breakpoint]) {
          element.breakpointOverrides[breakpoint] = {};
        }
        Object.assign(element.breakpointOverrides[breakpoint]!, override);
        state.page.updatedAt = new Date();
        state.isDirty = true;
      }
    }));
  },

  // ==========================================================================
  // MODE
  // ==========================================================================

  setMode: (mode) => {
    set({ mode });
  },

  // ==========================================================================
  // PANELS
  // ==========================================================================

  togglePanel: (panel) => {
    set(produce((state: EditorState) => {
      state.panels[panel] = !state.panels[panel];
    }));
  },

  // ==========================================================================
  // HISTORY
  // ==========================================================================

  pushHistory: () => {
    const { page, history } = get();
    if (!page) return;

    set(produce((state: EditorState) => {
      // Deep clone current page
      const snapshot = JSON.parse(JSON.stringify(page));
      state.history.past.push(snapshot);
      
      // Limit history size
      if (state.history.past.length > MAX_HISTORY) {
        state.history.past.shift();
      }
      
      // Clear future on new action
      state.history.future = [];
    }));
  },

  undo: () => {
    const { page, history } = get();
    if (!page || history.past.length === 0) return;

    set(produce((state: EditorState) => {
      const previous = state.history.past.pop();
      if (previous && state.page) {
        // Save current to future
        state.history.future.push(JSON.parse(JSON.stringify(state.page)));
        // Restore previous
        state.page = previous;
        state.isDirty = true;
      }
    }));
  },

  redo: () => {
    const { page, history } = get();
    if (!page || history.future.length === 0) return;

    set(produce((state: EditorState) => {
      const next = state.history.future.pop();
      if (next && state.page) {
        // Save current to past
        state.history.past.push(JSON.parse(JSON.stringify(state.page)));
        // Restore next
        state.page = next;
        state.isDirty = true;
      }
    }));
  },

  // ==========================================================================
  // CLIPBOARD
  // ==========================================================================

  copyElements: () => {
    // TODO: Implement clipboard
  },

  cutElements: () => {
    // TODO: Implement clipboard
  },

  pasteElements: () => {
    // TODO: Implement clipboard
  },

  // ==========================================================================
  // STATUS
  // ==========================================================================

  setDirty: (dirty) => {
    set({ isDirty: dirty });
  },

  setSaving: (saving) => {
    set({ isSaving: saving });
  },

  setLastSavedAt: (date) => {
    set({ lastSavedAt: date, isDirty: false });
  },
}));
