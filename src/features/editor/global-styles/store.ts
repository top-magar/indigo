/**
 * Global Styles Store
 * Zustand store for managing global design tokens
 */

import { create } from "zustand";
import type { GlobalStyles, GlobalStylesState, ThemePreset } from "./types";
import { getDefaultStyles, getPreset } from "./presets";

interface GlobalStylesStore extends GlobalStylesState {
  // Actions
  setStyles: (styles: GlobalStyles) => void;
  updateTypography: (updates: Partial<GlobalStyles["typography"]>) => void;
  updateColors: (updates: Partial<GlobalStyles["colors"]>) => void;
  updateSpacing: (updates: Partial<GlobalStyles["spacing"]>) => void;
  updateBorderRadius: (updates: Partial<GlobalStyles["borderRadius"]>) => void;
  updateShadows: (updates: Partial<GlobalStyles["shadows"]>) => void;
  applyPreset: (preset: ThemePreset) => void;
  resetToDefault: () => void;
  markClean: () => void;
}

const initialState: GlobalStylesState = {
  styles: getDefaultStyles(),
  isDirty: false,
  activePreset: "minimal",
};

export const useGlobalStylesStore = create<GlobalStylesStore>()((set) => ({
  ...initialState,

  setStyles: (styles) => {
    set({ styles, isDirty: true, activePreset: "custom" });
  },

  updateTypography: (updates) => {
    set((state) => ({
      styles: {
        ...state.styles,
        typography: {
          ...state.styles.typography,
          ...updates,
        },
      },
      isDirty: true,
      activePreset: "custom",
    }));
  },

  updateColors: (updates) => {
    set((state) => ({
      styles: {
        ...state.styles,
        colors: {
          ...state.styles.colors,
          ...updates,
        },
      },
      isDirty: true,
      activePreset: "custom",
    }));
  },

  updateSpacing: (updates) => {
    set((state) => ({
      styles: {
        ...state.styles,
        spacing: {
          ...state.styles.spacing,
          ...updates,
        },
      },
      isDirty: true,
      activePreset: "custom",
    }));
  },

  updateBorderRadius: (updates) => {
    set((state) => ({
      styles: {
        ...state.styles,
        borderRadius: {
          ...state.styles.borderRadius,
          ...updates,
        },
      },
      isDirty: true,
      activePreset: "custom",
    }));
  },

  updateShadows: (updates) => {
    set((state) => ({
      styles: {
        ...state.styles,
        shadows: {
          ...state.styles.shadows,
          ...updates,
        },
      },
      isDirty: true,
      activePreset: "custom",
    }));
  },

  applyPreset: (preset) => {
    set({
      styles: getPreset(preset),
      isDirty: true,
      activePreset: preset,
    });
  },

  resetToDefault: () => {
    set({
      styles: getDefaultStyles(),
      isDirty: false,
      activePreset: "minimal",
    });
  },

  markClean: () => {
    set({ isDirty: false });
  },
}));

// Selectors
export const selectGlobalStyles = (state: GlobalStylesStore) => state.styles;
export const selectIsDirty = (state: GlobalStylesStore) => state.isDirty;
export const selectActivePreset = (state: GlobalStylesStore) => state.activePreset;
export const selectTypography = (state: GlobalStylesStore) => state.styles.typography;
export const selectColors = (state: GlobalStylesStore) => state.styles.colors;
