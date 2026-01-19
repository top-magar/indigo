"use client";

import { useState, useCallback } from "react";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  X,
  Info,
} from "lucide-react";
import {
  type BulkActionType,
  type BulkActionResult,
  type BulkActionProgress,
} from "./bulk-action-types";

/** Item to be displayed in the affected items list */
export interface AffectedItem {
  id: string;
  label: string;
  description?: string;
}

/** Golden ratio modal sizes (1:1.618 aspect ratio) */
export type BulkActionDialogSize = "sm" | "md" | "lg";

const sizeClasses: Record<BulkActionDialogSize, string> = {
  sm: "w-80 max-h-[518px]",      // 320px × 518px
  md: "w-[480px] max-h-[776px]", // 480px × 776px
  lg: "w-[640px] max-h-[1036px]", // 640px × 1036px
};

interface BulkActionDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** The action being performed */
  actionType: BulkActionType;
  /** Title for the dialog */
  title: string;
  /** Description of what will happen */
  description?: string;
  /** Items that will be affected */
  affectedItems: AffectedItem[];
  /** Whether this is a destructive action */
  destructive?: boolean;
  /** Custom warning message */
  warningMessage?: string;
  /** Callback to execute the action */
  onConfirm: () => Promise<BulkActionResult>;
  /** Label for the confirm button */
  confirmLabel?: string;
  /** Label for the cancel button */
  cancelLabel?: string;
  /** Size variant using golden ratio proportions */
  size?: BulkActionDialogSize;
  /** Additional class names */
  className?: string;
}

type DialogState = "confirm" | "processing" | "complete";

/**
 * Confirmation dialog for bulk operations
 * Shows affected items, progress during operation, and results after completion
 *
 * @example
 * ```tsx
 * <BulkActionDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   actionType={BulkActionType.DELETE}
 *   title="Delete Products"
 *   description="Are you sure you want to delete these products?"
 *   affectedItems={selectedProducts.map(p => ({ id: p.id, label: p.name }))}
 *   destructive
 *   warningMessage="This action cannot be undone."
 *   onConfirm={handleDelete}
 * />
 * ```
 */
export function BulkActionDialog(props: BulkActionDialogProps) {
  const {
    open,
    onOpenChange,
    title,
    description,
    affectedItems,
    destructive = false,
    warningMessage,
    onConfirm,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    size = "md",
    className,
  } = props;
  const [state, setState] = useState<DialogState>("confirm");
  const [progress, setProgress] = useState<BulkActionProgress>({
    current: 0,
    total: affectedItems.length,
    percentage: 0,
    status: "Preparing...",
    isProcessing: false,
    isComplete: false,
    isCancelled: false,
  });
  const [result, setResult] = useState<BulkActionResult | null>(null);

  const handleConfirm = useCallback(async () => {
    setState("processing");
    setProgress((prev) => ({
      ...prev,
      isProcessing: true,
      status: "Processing...",
    }));

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newCurrent = Math.min(prev.current + 1, prev.total);
        const newPercentage = Math.round((newCurrent / prev.total) * 100);
        return {
          ...prev,
          current: newCurrent,
          percentage: newPercentage,
          status: `Processing ${newCurrent} of ${prev.total}...`,
        };
      });
    }, 100);

    try {
      const actionResult = await onConfirm();
      clearInterval(progressInterval);
      setResult(actionResult);
      setProgress((prev) => ({
        ...prev,
        current: prev.total,
        percentage: 100,
        status: actionResult.success ? "Complete" : "Completed with errors",
        isProcessing: false,
        isComplete: true,
      }));
      setState("complete");
    } catch (error) {
      clearInterval(progressInterval);
      setResult({
        success: false,
        successCount: 0,
        failedCount: affectedItems.length,
        totalCount: affectedItems.length,
        message: error instanceof Error ? error.message : "An error occurred",
      });
      setProgress((prev) => ({
        ...prev,
        status: "Failed",
        isProcessing: false,
        isComplete: true,
      }));
      setState("complete");
    }
  }, [onConfirm, affectedItems.length]);

  const handleClose = useCallback(() => {
    if (state === "processing") return; // Prevent closing during processing
    onOpenChange(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setState("confirm");
      setProgress({
        current: 0,
        total: affectedItems.length,
        percentage: 0,
        status: "Preparing...",
        isProcessing: false,
        isComplete: false,
        isCancelled: false,
      });
      setResult(null);
    }, 200);
  }, [state, onOpenChange, affectedItems.length]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(sizeClasses[size], "p-[26px]", className)}
        showCloseButton={state !== "processing"}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && state === "confirm" && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {/* Confirmation State */}
        {state === "confirm" && (
          <ConfirmationContent
            affectedItems={affectedItems}
            destructive={destructive}
            warningMessage={warningMessage}
          />
        )}

        {/* Processing State */}
        {state === "processing" && (
          <ProcessingContent progress={progress} />
        )}

        {/* Complete State */}
        {state === "complete" && result && (
          <CompletionContent result={result} />
        )}

        <DialogFooter>
          {state === "confirm" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                {cancelLabel}
              </Button>
              <Button
                variant={destructive ? "destructive" : "default"}
                onClick={handleConfirm}
              >
                {confirmLabel}
              </Button>
            </>
          )}
          {state === "complete" && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Confirmation content showing affected items and warnings */
function ConfirmationContent({
  affectedItems,
  destructive,
  warningMessage,
}: {
  affectedItems: AffectedItem[];
  destructive: boolean;
  warningMessage?: string;
}) {
  return (
    <div className="space-y-[26px]">
      {/* Warning for destructive actions */}
      {destructive && warningMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{warningMessage}</AlertDescription>
        </Alert>
      )}

      {/* Affected items list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Affected items</span>
          <Badge variant="secondary">{affectedItems.length}</Badge>
        </div>
        <ScrollArea className="h-[200px] rounded-md border p-2">
          <div className="space-y-2">
            {affectedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

/** Processing content showing progress */
function ProcessingContent({ progress }: { progress: BulkActionProgress }) {
  return (
    <div className="space-y-[26px] py-[26px]">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
      <div className="space-y-2">
        <Progress value={progress.percentage} className="h-2" />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{progress.status}</span>
          <span>{progress.percentage}%</span>
        </div>
      </div>
    </div>
  );
}

/** Completion content showing results */
function CompletionContent({ result }: { result: BulkActionResult }) {
  const isFullSuccess = result.success && result.failedCount === 0;
  const isPartialSuccess = result.successCount > 0 && result.failedCount > 0;

  return (
    <div className="space-y-[26px] py-[26px]">
      {/* Success/Error Icon */}
      <div className="flex items-center justify-center">
        {isFullSuccess ? (
          <div className="rounded-full bg-[var(--ds-green-100)] p-3">
            <CheckCircle2
              className="h-8 w-8 text-[color:var(--ds-green-700)]"
            />
          </div>
        ) : (
          <div className="rounded-full bg-[var(--ds-red-100)] p-3">
            <X
              className="h-8 w-8 text-[color:var(--ds-red-700)]"
            />
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">
          {isFullSuccess
            ? "Operation completed successfully"
            : isPartialSuccess
            ? "Operation completed with some errors"
            : "Operation failed"}
        </p>
        {result.message && (
          <p className="text-xs text-muted-foreground">{result.message}</p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <CheckCircle2
            className="h-4 w-4 text-[color:var(--ds-green-700)]"
          />
          <span>{result.successCount} succeeded</span>
        </div>
        {result.failedCount > 0 && (
          <div className="flex items-center gap-1.5">
            <X
              className="h-4 w-4 text-[color:var(--ds-red-700)]"
            />
            <span>{result.failedCount} failed</span>
          </div>
        )}
      </div>

      {/* Error details */}
      {result.errors && result.errors.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription>
            <ScrollArea className="h-[100px] mt-2">
              <ul className="text-xs space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index}>
                    <span className="font-medium">{error.itemId}:</span>{" "}
                    {error.message}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

BulkActionDialog.displayName = "BulkActionDialog";
