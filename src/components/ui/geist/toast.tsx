"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { cn } from "@/shared/utils";

// ============================================================================
// Types
// ============================================================================

export type ToastType = "default" | "success" | "warning" | "error";
export type ToastPlacement = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export interface ToastAction {
  name: string;
  handler: () => void;
  /** If true, clicking the action won't dismiss the toast */
  passive?: boolean;
}

export interface ToastOptions {
  /** Toast message content */
  text: string | React.ReactNode;
  /** Toast type for styling */
  type?: ToastType;
  /** Auto-dismiss delay in ms (default: 2000, 0 for persistent) */
  delay?: number;
  /** Unique identifier (auto-generated if not provided) */
  id?: string;
  /** Action buttons */
  actions?: ToastAction[];
  /** Toast placement on screen */
  placement?: ToastPlacement;
}

export interface Toast extends Required<Omit<ToastOptions, "actions">> {
  actions?: ToastAction[];
  createdAt: number;
}

export interface ToastContextValue {
  toasts: Toast[];
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ============================================================================
// Variants
// ============================================================================

const toastContainerVariants = cva(
  "fixed z-[9999] flex flex-col gap-2 p-4 pointer-events-none",
  {
    variants: {
      placement: {
        topLeft: "top-0 left-0 items-start",
        topRight: "top-0 right-0 items-end",
        bottomLeft: "bottom-0 left-0 items-start",
        bottomRight: "bottom-0 right-0 items-end",
      },
    },
    defaultVariants: {
      placement: "bottomRight",
    },
  }
);

const toastVariants = cva(
  [
    "pointer-events-auto",
    "flex items-center gap-3",
    "px-4 py-3",
    "bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-100)]",
    "border border-[var(--ds-gray-alpha-400)] dark:border-[var(--ds-gray-700)]",
    "rounded-lg",
    "shadow-[0_4px_12px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
    "animate-in fade-in-0 slide-in-from-bottom-2",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-2",
    "min-w-[280px] max-w-[420px]",
  ],
  {
    variants: {
      type: {
        default: "",
        success: "border-l-[3px] border-l-[var(--ds-green-700)]",
        warning: "border-l-[3px] border-l-[var(--ds-amber-700)]",
        error: "border-l-[3px] border-l-[var(--ds-red-700)]",
      },
    },
    defaultVariants: {
      type: "default",
    },
  }
);

const toastIconVariants = cva("shrink-0 size-5", {
  variants: {
    type: {
      default: "text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-500)]",
      success: "text-[var(--ds-green-700)] dark:text-[var(--ds-green-600)]",
      warning: "text-[var(--ds-amber-700)] dark:text-[var(--ds-amber-600)]",
      error: "text-[var(--ds-red-700)] dark:text-[var(--ds-red-600)]",
    },
  },
  defaultVariants: {
    type: "default",
  },
});

const toastContentVariants = cva(
  "flex-1 min-w-0 text-sm text-[var(--ds-gray-1000)] dark:text-[var(--ds-gray-1000)]"
);

const toastActionVariants = cva(
  [
    "shrink-0 px-3 py-1.5 text-xs font-medium rounded-md",
    "transition-colors focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-[var(--ds-blue-700)] focus-visible:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--ds-gray-1000)] text-[var(--ds-background-100)]",
          "hover:bg-[var(--ds-gray-900)]",
          "dark:bg-[var(--ds-gray-100)] dark:text-[var(--ds-gray-1000)]",
          "dark:hover:bg-[var(--ds-gray-200)]",
        ],
        secondary: [
          "border border-[var(--ds-gray-400)] dark:border-[var(--ds-gray-700)]",
          "bg-transparent text-[var(--ds-gray-1000)]",
          "hover:bg-[var(--ds-gray-100)] dark:hover:bg-[var(--ds-gray-200)]",
        ],
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

const toastDismissVariants = cva(
  [
    "shrink-0 size-6 inline-flex items-center justify-center rounded-md",
    "text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-500)]",
    "hover:text-[var(--ds-gray-1000)] dark:hover:text-[var(--ds-gray-300)]",
    "hover:bg-[var(--ds-gray-100)] dark:hover:bg-[var(--ds-gray-200)]",
    "transition-colors focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-[var(--ds-blue-700)] focus-visible:ring-offset-2",
  ]
);

// ============================================================================
// Context
// ============================================================================

const ToastContext = React.createContext<ToastContextValue | null>(null);

// ============================================================================
// Hook
// ============================================================================

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// ============================================================================
// Utility
// ============================================================================

let toastCounter = 0;

function generateToastId(): string {
  return `toast-${++toastCounter}-${Date.now()}`;
}

const typeIcons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  default: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

// ============================================================================
// Components
// ============================================================================

export interface ToastItemProps extends React.HTMLAttributes<HTMLDivElement> {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem = React.forwardRef<HTMLDivElement, ToastItemProps>(
  ({ toast, onDismiss, className, ...props }, ref) => {
    const [isExiting, setIsExiting] = React.useState(false);
    const Icon = typeIcons[toast.type];

    const handleDismiss = React.useCallback(() => {
      setIsExiting(true);
      // Wait for exit animation
      setTimeout(() => onDismiss(toast.id), 150);
    }, [onDismiss, toast.id]);

    // Auto-dismiss
    React.useEffect(() => {
      if (toast.delay > 0) {
        const timer = setTimeout(handleDismiss, toast.delay);
        return () => clearTimeout(timer);
      }
    }, [toast.delay, handleDismiss]);

    const handleActionClick = (action: ToastAction) => {
      action.handler();
      if (!action.passive) {
        handleDismiss();
      }
    };

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="polite"
        data-state={isExiting ? "closed" : "open"}
        className={cn(toastVariants({ type: toast.type }), className)}
        {...props}
      >
        <Icon className={cn(toastIconVariants({ type: toast.type }))} aria-hidden="true" />
        
        <div className={cn(toastContentVariants())}>
          {toast.text}
        </div>

        {toast.actions && toast.actions.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {toast.actions.map((action, index) => (
              <button
                key={action.name}
                type="button"
                onClick={() => handleActionClick(action)}
                className={cn(
                  toastActionVariants({
                    variant: index === 0 ? "primary" : "secondary",
                  })
                )}
              >
                {action.name}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          className={cn(toastDismissVariants())}
          aria-label="Dismiss toast"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  }
);
ToastItem.displayName = "ToastItem";

export interface ToastContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastContainerVariants> {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ToastContainer = React.forwardRef<HTMLDivElement, ToastContainerProps>(
  ({ toasts, onDismiss, placement, className, ...props }, ref) => {
    if (toasts.length === 0) return null;

    return (
      <div
        ref={ref}
        className={cn(toastContainerVariants({ placement }), className)}
        {...props}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    );
  }
);
ToastContainer.displayName = "ToastContainer";

// ============================================================================
// Provider
// ============================================================================

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Default placement for all toasts */
  defaultPlacement?: ToastPlacement;
  /** Default delay for all toasts (ms) */
  defaultDelay?: number;
  /** Maximum number of toasts to show at once */
  maxToasts?: number;
}

export function ToastProvider({
  children,
  defaultPlacement = "bottomRight",
  defaultDelay = 2000,
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback(
    (options: ToastOptions): string => {
      const id = options.id || generateToastId();
      const newToast: Toast = {
        id,
        text: options.text,
        type: options.type || "default",
        delay: options.delay ?? defaultDelay,
        placement: options.placement || defaultPlacement,
        actions: options.actions,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Limit number of toasts
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts);
        }
        return updated;
      });

      return id;
    },
    [defaultDelay, defaultPlacement, maxToasts]
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = React.useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue = React.useMemo<ToastContextValue>(
    () => ({ toasts, toast, dismiss, dismissAll }),
    [toasts, toast, dismiss, dismissAll]
  );

  // Group toasts by placement
  const toastsByPlacement = React.useMemo(() => {
    const grouped: Record<ToastPlacement, Toast[]> = {
      topLeft: [],
      topRight: [],
      bottomLeft: [],
      bottomRight: [],
    };
    toasts.forEach((t) => {
      grouped[t.placement].push(t);
    });
    return grouped;
  }, [toasts]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Render containers for each placement that has toasts */}
      {(Object.entries(toastsByPlacement) as [ToastPlacement, Toast[]][]).map(
        ([placement, placementToasts]) =>
          placementToasts.length > 0 && (
            <ToastContainer
              key={placement}
              placement={placement}
              toasts={placementToasts}
              onDismiss={dismiss}
            />
          )
      )}
    </ToastContext.Provider>
  );
}

// ============================================================================
// Exports
// ============================================================================

export {
  ToastItem,
  ToastContainer,
  toastVariants,
  toastContainerVariants,
  toastIconVariants,
  toastContentVariants,
  toastActionVariants,
  toastDismissVariants,
};
