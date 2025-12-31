"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Delete01Icon, 
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Loading01Icon,
} from "@hugeicons/core-free-icons";

interface SavebarProps {
  /** Whether the savebar is visible */
  show?: boolean;
  /** Whether the form is currently saving */
  isSaving?: boolean;
  /** Whether the form has validation errors */
  hasErrors?: boolean;
  /** Callback when discard is clicked */
  onDiscard?: () => void;
  /** Callback when save is clicked */
  onSave?: () => void;
  /** Callback when delete is clicked */
  onDelete?: () => void;
  /** Custom labels */
  labels?: {
    discard?: string;
    save?: string;
    delete?: string;
    saving?: string;
  };
  /** Additional content */
  children?: ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * Sticky save bar that appears at the bottom of forms when there are unsaved changes
 * Inspired by Saleor's Savebar pattern
 * 
 * @example
 * ```tsx
 * const { isDirty, reset, markClean } = useFormDirty({ initialData: product });
 * 
 * const handleSave = async () => {
 *   await saveProduct();
 *   markClean();
 * };
 * 
 * return (
 *   <form>
 *     <ProductForm />
 *     
 *     <Savebar
 *       show={isDirty}
 *       onDiscard={reset}
 *       onSave={handleSave}
 *       onDelete={() => setShowDeleteDialog(true)}
 *     />
 *   </form>
 * );
 * ```
 */
export function Savebar({
  show = true,
  isSaving = false,
  hasErrors = false,
  onDiscard,
  onSave,
  onDelete,
  labels = {},
  children,
  className,
}: SavebarProps) {
  const {
    discard = "Discard",
    save = "Save",
    delete: deleteLabel = "Delete",
    saving = "Saving...",
  } = labels;

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "animate-in slide-in-from-bottom-2 duration-200",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4 px-6">
        {/* Left side - Delete button */}
        <div className="flex items-center gap-2">
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={isSaving}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4 mr-2" />
              {deleteLabel}
            </Button>
          )}
        </div>

        {/* Center - Custom content */}
        {children && (
          <div className="flex-1 flex items-center justify-center">
            {children}
          </div>
        )}

        {/* Right side - Discard and Save */}
        <div className="flex items-center gap-2">
          {onDiscard && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDiscard}
              disabled={isSaving}
            >
              <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 mr-2" />
              {discard}
            </Button>
          )}
          {onSave && (
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={isSaving || hasErrors}
            >
              {isSaving ? (
                <>
                  <HugeiconsIcon 
                    icon={Loading01Icon} 
                    className="w-4 h-4 mr-2 animate-spin" 
                  />
                  {saving}
                </>
              ) : (
                <>
                  <HugeiconsIcon 
                    icon={CheckmarkCircle02Icon} 
                    className="w-4 h-4 mr-2" 
                  />
                  {save}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Container for custom savebar actions
 */
export function SavebarActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {children}
    </div>
  );
}

/**
 * Spacer to push content to the right
 */
export function SavebarSpacer() {
  return <div className="flex-1" />;
}

Savebar.displayName = "Savebar";
SavebarActions.displayName = "SavebarActions";
SavebarSpacer.displayName = "SavebarSpacer";
