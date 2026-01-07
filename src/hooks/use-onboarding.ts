"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

// Storage keys
const STORAGE_KEYS = {
  DISMISSED_TIPS: "indigo_onboarding_dismissed_tips",
  SETUP_PROGRESS: "indigo_onboarding_setup_progress",
  WELCOME_SHOWN: "indigo_onboarding_welcome_shown",
  TOUR_COMPLETED: "indigo_onboarding_tour_completed",
} as const;

// Onboarding tip identifiers
export type OnboardingTipId =
  | "add-product-button"
  | "sidebar-navigation"
  | "analytics-overview"
  | "quick-actions"
  | "settings-menu"
  | "storefront-editor"
  | "order-management"
  | "customer-list"
  | "inventory-tracking"
  | "payment-setup";

// Setup step identifiers
export type SetupStepId =
  | "add-product"
  | "setup-payments"
  | "customize-store"
  | "setup-shipping"
  | "launch-store";

export interface OnboardingState {
  dismissedTips: OnboardingTipId[];
  completedSteps: SetupStepId[];
  welcomeShown: boolean;
  tourCompleted: boolean;
}

export interface UseOnboardingReturn {
  // State
  state: OnboardingState;
  isLoading: boolean;
  
  // Tips management
  isTipDismissed: (tipId: OnboardingTipId) => boolean;
  dismissTip: (tipId: OnboardingTipId) => void;
  resetTips: () => void;
  
  // Setup progress
  isStepCompleted: (stepId: SetupStepId) => boolean;
  completeStep: (stepId: SetupStepId) => void;
  uncompleteStep: (stepId: SetupStepId) => void;
  resetProgress: () => void;
  
  // Progress calculation
  progressPercentage: number;
  completedCount: number;
  totalSteps: number;
  
  // Welcome modal
  showWelcome: boolean;
  markWelcomeShown: () => void;
  resetWelcome: () => void;
  
  // Tour
  isTourCompleted: boolean;
  completeTour: () => void;
  resetTour: () => void;
  
  // Full reset
  resetAll: () => void;
}

const DEFAULT_STATE: OnboardingState = {
  dismissedTips: [],
  completedSteps: [],
  welcomeShown: false,
  tourCompleted: false,
};

const ALL_SETUP_STEPS: SetupStepId[] = [
  "add-product",
  "setup-payments",
  "customize-store",
  "setup-shipping",
  "launch-store",
];

/**
 * Hook to manage onboarding state for new merchants
 * Persists state to localStorage for cross-session persistence
 */
export function useOnboarding(): UseOnboardingReturn {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const dismissedTips = localStorage.getItem(STORAGE_KEYS.DISMISSED_TIPS);
      const setupProgress = localStorage.getItem(STORAGE_KEYS.SETUP_PROGRESS);
      const welcomeShown = localStorage.getItem(STORAGE_KEYS.WELCOME_SHOWN);
      const tourCompleted = localStorage.getItem(STORAGE_KEYS.TOUR_COMPLETED);

      setState({
        dismissedTips: dismissedTips ? JSON.parse(dismissedTips) : [],
        completedSteps: setupProgress ? JSON.parse(setupProgress) : [],
        welcomeShown: welcomeShown === "true",
        tourCompleted: tourCompleted === "true",
      });
    } catch (error) {
      console.error("Failed to load onboarding state:", error);
      setState(DEFAULT_STATE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist state changes to localStorage
  const persistState = useCallback((newState: Partial<OnboardingState>) => {
    setState((prev) => {
      const updated = { ...prev, ...newState };
      
      try {
        if (newState.dismissedTips !== undefined) {
          localStorage.setItem(
            STORAGE_KEYS.DISMISSED_TIPS,
            JSON.stringify(updated.dismissedTips)
          );
        }
        if (newState.completedSteps !== undefined) {
          localStorage.setItem(
            STORAGE_KEYS.SETUP_PROGRESS,
            JSON.stringify(updated.completedSteps)
          );
        }
        if (newState.welcomeShown !== undefined) {
          localStorage.setItem(
            STORAGE_KEYS.WELCOME_SHOWN,
            String(updated.welcomeShown)
          );
        }
        if (newState.tourCompleted !== undefined) {
          localStorage.setItem(
            STORAGE_KEYS.TOUR_COMPLETED,
            String(updated.tourCompleted)
          );
        }
      } catch (error) {
        console.error("Failed to persist onboarding state:", error);
      }
      
      return updated;
    });
  }, []);

  // Tips management
  const isTipDismissed = useCallback(
    (tipId: OnboardingTipId) => state.dismissedTips.includes(tipId),
    [state.dismissedTips]
  );

  const dismissTip = useCallback(
    (tipId: OnboardingTipId) => {
      if (!state.dismissedTips.includes(tipId)) {
        persistState({
          dismissedTips: [...state.dismissedTips, tipId],
        });
      }
    },
    [state.dismissedTips, persistState]
  );

  const resetTips = useCallback(() => {
    persistState({ dismissedTips: [] });
  }, [persistState]);

  // Setup progress management
  const isStepCompleted = useCallback(
    (stepId: SetupStepId) => state.completedSteps.includes(stepId),
    [state.completedSteps]
  );

  const completeStep = useCallback(
    (stepId: SetupStepId) => {
      if (!state.completedSteps.includes(stepId)) {
        persistState({
          completedSteps: [...state.completedSteps, stepId],
        });
      }
    },
    [state.completedSteps, persistState]
  );

  const uncompleteStep = useCallback(
    (stepId: SetupStepId) => {
      persistState({
        completedSteps: state.completedSteps.filter((id) => id !== stepId),
      });
    },
    [state.completedSteps, persistState]
  );

  const resetProgress = useCallback(() => {
    persistState({ completedSteps: [] });
  }, [persistState]);

  // Progress calculation
  const progressPercentage = useMemo(() => {
    if (ALL_SETUP_STEPS.length === 0) return 0;
    return Math.round(
      (state.completedSteps.length / ALL_SETUP_STEPS.length) * 100
    );
  }, [state.completedSteps]);

  const completedCount = state.completedSteps.length;
  const totalSteps = ALL_SETUP_STEPS.length;

  // Welcome modal management
  const showWelcome = !state.welcomeShown && !isLoading;

  const markWelcomeShown = useCallback(() => {
    persistState({ welcomeShown: true });
  }, [persistState]);

  const resetWelcome = useCallback(() => {
    persistState({ welcomeShown: false });
  }, [persistState]);

  // Tour management
  const isTourCompleted = state.tourCompleted;

  const completeTour = useCallback(() => {
    persistState({ tourCompleted: true });
  }, [persistState]);

  const resetTour = useCallback(() => {
    persistState({ tourCompleted: false });
  }, [persistState]);

  // Full reset
  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.DISMISSED_TIPS);
      localStorage.removeItem(STORAGE_KEYS.SETUP_PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.WELCOME_SHOWN);
      localStorage.removeItem(STORAGE_KEYS.TOUR_COMPLETED);
    } catch (error) {
      console.error("Failed to clear onboarding storage:", error);
    }
    setState(DEFAULT_STATE);
  }, []);

  return {
    state,
    isLoading,
    isTipDismissed,
    dismissTip,
    resetTips,
    isStepCompleted,
    completeStep,
    uncompleteStep,
    resetProgress,
    progressPercentage,
    completedCount,
    totalSteps,
    showWelcome,
    markWelcomeShown,
    resetWelcome,
    isTourCompleted,
    completeTour,
    resetTour,
    resetAll,
  };
}

/**
 * Hook to check if a specific tip should be shown
 * Convenience wrapper around useOnboarding for single tip checks
 */
export function useOnboardingTip(tipId: OnboardingTipId) {
  const { isTipDismissed, dismissTip, isLoading } = useOnboarding();
  
  return {
    shouldShow: !isLoading && !isTipDismissed(tipId),
    dismiss: () => dismissTip(tipId),
    isLoading,
  };
}
