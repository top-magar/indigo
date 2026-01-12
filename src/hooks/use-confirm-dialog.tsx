"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2 } from "lucide-react";

type ConfirmVariant = "destructive" | "warning" | "default";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  itemName?: string; // For showing "Delete {itemName}?" pattern
}

interface ConfirmDialogState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

const variantConfig: Record<ConfirmVariant, { icon: typeof AlertTriangle; iconClass: string; actionVariant: "default" | "destructive" }> = {
  destructive: {
    icon: Trash2,
    iconClass: "bg-destructive/10 text-destructive",
    actionVariant: "destructive",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "bg-chart-4/10 text-chart-4",
    actionVariant: "default",
  },
  default: {
    icon: AlertTriangle,
    iconClass: "bg-muted text-muted-foreground",
    actionVariant: "default",
  },
};

const ConfirmDialogContext = React.createContext<{
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  confirmDelete: (itemName: string, itemType?: string) => Promise<boolean>;
} | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ConfirmDialogState>({
    isOpen: false,
    title: "",
    description: "",
    resolve: null,
  });

  const confirm = React.useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        ...options,
        resolve,
      });
    });
  }, []);

  const confirmDelete = React.useCallback(
    (itemName: string, itemType: string = "item"): Promise<boolean> => {
      return confirm({
        title: `Delete ${itemType}?`,
        description: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        variant: "destructive",
        itemName,
      });
    },
    [confirm]
  );

  const handleConfirm = () => {
    state.resolve?.(true);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  const config = variantConfig[state.variant || "default"];

  return (
    <ConfirmDialogContext.Provider value={{ confirm, confirmDelete }}>
      {children}
      <AlertDialog open={state.isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className={config.iconClass}>
              <config.icon className="size-4" />
            </AlertDialogMedia>
            <AlertDialogTitle>{state.title}</AlertDialogTitle>
            <AlertDialogDescription>{state.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {state.cancelLabel || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              variant={config.actionVariant}
            >
              {state.confirmLabel || "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = React.useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirmDialog must be used within a ConfirmDialogProvider");
  }
  return context;
}

// Convenience hooks for common patterns
export function useConfirmDelete() {
  const { confirmDelete } = useConfirmDialog();
  return confirmDelete;
}
