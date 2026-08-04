'use client';

import { create } from 'zustand';
import type { El, Device } from './types';

type EditorUIState = {
  selected: El | null;
  hovered: string | null;
  dropTarget: string | null;
  device: Device;
  preview: boolean;
  zoom: number;
  currentPageId: string | null;
  editingState: 'default' | 'hover';
};

type EditorUIActions = {
  select: (element: El | null) => void;
  hover: (id: string | null) => void;
  setDropTarget: (id: string | null) => void;
  setDevice: (device: Device) => void;
  togglePreview: () => void;
  setZoom: (zoom: number) => void;
  setCurrentPageId: (id: string | null) => void;
  setEditingState: (state: 'default' | 'hover') => void;
};

export const useEditorStore = create<EditorUIState & EditorUIActions>()((set) => ({
  selected: null,
  hovered: null,
  dropTarget: null,
  device: 'desktop',
  preview: false,
  zoom: 100,
  currentPageId: null,
  editingState: 'default',

  select: (element) => set({ selected: element }),
  hover: (id) => set({ hovered: id }),
  setDropTarget: (id) => set({ dropTarget: id }),
  setDevice: (device) => set({ device }),
  togglePreview: () => set(s => ({ preview: !s.preview })),
  setZoom: (zoom) => set({ zoom }),
  setCurrentPageId: (id) => set({ currentPageId: id }),
  setEditingState: (state) => set({ editingState: state }),
}));
