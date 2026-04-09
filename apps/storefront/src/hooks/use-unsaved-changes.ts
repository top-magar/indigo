"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useConfirmDialog } from "./use-confirm-dialog";

export interface UseUnsavedChangesOptions {
  /**
   * Whether the form has unsaved changes
   */
  isDirty: boolean;
  /**
   * Title for the warning dialog
   * @default "Unsaved changes"
   */
  title?: string;
  /**
   * Description for the warning dialog
   * @default "You have unsaved changes. Do you want to save them before leaving?"
   */
  description?: string;
  /**
   * Label for the save/confirm button
   * @default "Save changes"
   */
  saveLabel?: string;
  /**
   * Label for the discard button
   * @default "Discard"
   */
  discardLabel?: string;
  /**
   * Callback when user chooses to save
   * If provided, the dialog will show Save/Discard options
   * If not provided, the dialog will show Leave/Stay options
   */
  onSave?: () => void | Promise<void>;
  /**
   * Callback when user chooses to discard changes
   */
  onDiscard?: () => void;
  /**
   * Whether to block browser close/refresh
   * @default true
   */
  blockBrowserClose?: boolean;
  /**
   * Whether to block Next.js router navigation
   * @default true
   */
  blockNavigation?: boolean;
  /**
   * Message shown in browser's native dialog (for close/refresh)
   * @default "You have unsaved changes. Are you sure you want to leave?"
   */
  browserMessage?: string;
}

export interface UseUnsavedChangesReturn {
  /**
   * Manually trigger the unsaved changes dialog
   * Returns true if user wants to proceed (discard), false if they want to stay
   */
  confirmNavigation: () => Promise<boolean>;
  /**
   * Check if navigation should be blocked and show dialog if needed
   * Returns true if navigation can proceed, false if blocked
   */
  checkUnsavedChanges: () => Promise<boolean>;
  /**
   * Wrap a navigation action to check for unsaved changes first
   */
  withUnsavedCheck: <T extends (...args: unknown[]) => void>(
    action: T
  ) => (...args: Parameters<T>) => Promise<void>;
}

/**
 * Hook for warning users about unsaved changes when navigating away or closing forms.
 * Integrates with Next.js router and browser beforeunload event.
 *
 * @example
 * ```tsx
 * // Basic usage with useFormDirty
 * const { isDirty, markClean } = useFormDirty({ initialData: product });
 *
 * const { checkUnsavedChanges } = useUnsavedChanges({
 *   isDirty,
 *   onSave: async () => {
 *     await saveProduct();
 *     markClean();
 *   },
 *   onDiscard: () => {
 *     reset();
 *   },
 * });
 *
 * // Manual navigation with check
 * const handleClose = async () => {
 *   const canProceed = await checkUnsavedChanges();
 *   if (canProceed) {
 *     router.push('/dashboard/products');
 *   }
 * };
 * ```
 *
 * @example
 * ```tsx
 * // With custom dialog text
 * useUnsavedChanges({
 *   isDirty: formState.isDirty,
 *   title: "Save product changes?",
 *   description: "You have unsaved changes to this product.",
 *   saveLabel: "Save product",
 *   discardLabel: "Discard changes",
 *   onSave: handleSave,
 * });
 * ```
 *
 * @example
 * ```tsx
 * // Wrap navigation actions
 * const { withUnsavedCheck } = useUnsavedChanges({ isDirty });
 *
 * const handleNavigate = withUnsavedCheck(() => {
 *   router.push('/dashboard');
 * });
 * ```
 */
export function useUnsavedChanges(
  options: UseUnsavedChangesOptions
): UseUnsavedChangesReturn {
  const {
    isDirty,
    title = "Unsaved changes",
    description = "You have unsaved changes. Do you want to save them before leaving?",
    saveLabel = "Save changes",
    discardLabel = "Discard",
    onSave,
    onDiscard,
    blockBrowserClose = true,
    blockNavigation = true,
    browserMessage = "You have unsaved changes. Are you sure you want to leave?",
  } = options;

  const { confirm } = useConfirmDialog();
  const pathname = usePathname();
  
  // Track if we're currently navigating (to prevent double dialogs)
  const isNavigatingRef = useRef(false);
  // Track the last pathname to detect navigation
  const lastPathnameRef = useRef(pathname);
  // Track if dialog is currently open
  const dialogOpenRef = useRef(false);

  // Browser beforeunload handler
  useEffect(() => {
    if (!blockBrowserClose || !isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = browserMessage;
      return browserMessage;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, blockBrowserClose, browserMessage]);

  // Confirm navigation dialog
  const confirmNavigation = useCallback(async (): Promise<boolean> => {
    if (!isDirty || dialogOpenRef.current) {
      return true;
    }

    dialogOpenRef.current = true;

    try {
      // If onSave is provided, show Save/Discard dialog
      if (onSave) {
        const shouldSave = await confirm({
          title,
          description,
          confirmLabel: saveLabel,
          cancelLabel: discardLabel,
          variant: "warning",
        });

        if (shouldSave) {
          // User chose to save
          await onSave();
          return true;
        } else {
          // User chose to discard
          onDiscard?.();
          return true;
        }
      } else {
        // No onSave provided, show Leave/Stay dialog
        const shouldLeave = await confirm({
          title,
          description: "You have unsaved changes that will be lost if you leave.",
          confirmLabel: "Leave",
          cancelLabel: "Stay",
          variant: "warning",
        });

        if (shouldLeave) {
          onDiscard?.();
          return true;
        }
        return false;
      }
    } finally {
      dialogOpenRef.current = false;
    }
  }, [isDirty, confirm, title, description, saveLabel, discardLabel, onSave, onDiscard]);

  // Check unsaved changes (alias for confirmNavigation)
  const checkUnsavedChanges = useCallback(async (): Promise<boolean> => {
    if (!isDirty) return true;
    return confirmNavigation();
  }, [isDirty, confirmNavigation]);

  // Wrap navigation actions with unsaved check
  const withUnsavedCheck = useCallback(
    <T extends (...args: unknown[]) => void>(action: T) => {
      return async (...args: Parameters<T>): Promise<void> => {
        const canProceed = await checkUnsavedChanges();
        if (canProceed) {
          action(...args);
        }
      };
    },
    [checkUnsavedChanges]
  );

  // Intercept Next.js router navigation using popstate
  useEffect(() => {
    if (!blockNavigation || !isDirty) return;

    const handlePopState = async (e: PopStateEvent) => {
      if (isNavigatingRef.current || dialogOpenRef.current) return;

      // Prevent the navigation temporarily
      e.preventDefault();
      
      // Push the current state back to prevent navigation
      window.history.pushState(null, "", window.location.href);

      isNavigatingRef.current = true;
      const canProceed = await confirmNavigation();
      isNavigatingRef.current = false;

      if (canProceed) {
        // Allow navigation by going back
        window.history.back();
      }
    };

    // Push initial state to enable popstate interception
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty, blockNavigation, confirmNavigation]);

  // Track pathname changes for detecting programmatic navigation
  useEffect(() => {
    lastPathnameRef.current = pathname;
  }, [pathname]);

  return {
    confirmNavigation,
    checkUnsavedChanges,
    withUnsavedCheck,
  };
}

/**
 * Simplified hook that just tracks dirty state and blocks navigation
 * without the full dialog customization options.
 * 
 * @example
 * ```tsx
 * const { isDirty, setField } = useFormDirty({ initialData });
 * useBlockUnsavedChanges(isDirty);
 * ```
 */
export function useBlockUnsavedChanges(
  isDirty: boolean,
  message?: string
): void {
  useUnsavedChanges({
    isDirty,
    blockBrowserClose: true,
    blockNavigation: true,
    browserMessage: message,
  });
}


