"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  KeyboardIcon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/shared/utils";
import type { KeyboardShortcutsModalProps, Shortcut, ShortcutCategory } from "./types";

/**
 * Format a key for display
 * Converts "mod" to platform-specific symbol, etc.
 */
function formatKeyForDisplay(key: string): string {
  const isMac =
    typeof window !== "undefined" &&
    (navigator.userAgent.includes("Mac") || navigator.platform.includes("Mac"));

  const keyMap: Record<string, string> = {
    mod: isMac ? "⌘" : "Ctrl",
    meta: isMac ? "⌘" : "Win",
    ctrl: isMac ? "⌃" : "Ctrl",
    control: isMac ? "⌃" : "Ctrl",
    alt: isMac ? "⌥" : "Alt",
    option: "⌥",
    shift: "⇧",
    enter: "↵",
    return: "↵",
    escape: "Esc",
    backspace: "⌫",
    delete: "Del",
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
    space: "Space",
    tab: "Tab",
  };

  const lowerKey = key.toLowerCase();
  return keyMap[lowerKey] || key.toUpperCase();
}

/**
 * Render keyboard keys with proper styling
 */
function ShortcutKeys({
  keys,
  isSequence,
}: {
  keys: string[];
  isSequence?: boolean;
}) {
  return (
    <KbdGroup className="gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <Kbd>{formatKeyForDisplay(key)}</Kbd>
          {isSequence && index < keys.length - 1 && (
            <span className="text-muted-foreground text-[0.5rem] mx-0.5">then</span>
          )}
        </React.Fragment>
      ))}
    </KbdGroup>
  );
}

/**
 * Single shortcut item row
 */
function ShortcutItem({ shortcut }: { shortcut: Shortcut }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors duration-100">
      <div className="flex items-center gap-2 min-w-0">
        {shortcut.icon && (
          <HugeiconsIcon
            icon={shortcut.icon}
            className="size-3.5 text-muted-foreground shrink-0"
          />
        )}
        <span className="text-xs truncate">{shortcut.label}</span>
      </div>
      <ShortcutKeys keys={shortcut.keys} isSequence={shortcut.isSequence} />
    </div>
  );
}

/**
 * Category section with shortcuts
 */
function CategorySection({
  category,
  searchQuery,
}: {
  category: ShortcutCategory;
  searchQuery: string;
}) {
  // Filter shortcuts based on search
  const filteredShortcuts = React.useMemo(() => {
    if (!searchQuery.trim()) return category.shortcuts;

    const query = searchQuery.toLowerCase();
    return category.shortcuts.filter(
      (shortcut) =>
        shortcut.label.toLowerCase().includes(query) ||
        shortcut.description?.toLowerCase().includes(query) ||
        shortcut.keys.some((key) => key.toLowerCase().includes(query))
    );
  }, [category.shortcuts, searchQuery]);

  if (filteredShortcuts.length === 0) return null;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-2 py-1">
        {category.icon && (
          <HugeiconsIcon
            icon={category.icon}
            className="size-3.5 text-muted-foreground"
          />
        )}
        <h3 className="text-[0.625rem] font-medium text-muted-foreground uppercase tracking-wider">
          {category.label}
        </h3>
      </div>
      <div className="space-y-0.5">
        {filteredShortcuts.map((shortcut) => (
          <ShortcutItem key={shortcut.id} shortcut={shortcut} />
        ))}
      </div>
    </div>
  );
}

/**
 * Keyboard Shortcuts Help Modal
 *
 * A GitHub-style keyboard shortcuts overlay that displays all available
 * shortcuts organized by category. Triggered by pressing "?" key.
 *
 * Features:
 * - Search/filter shortcuts
 * - Organized by categories
 * - Responsive design
 * - Platform-aware key display (⌘ on Mac, Ctrl on Windows)
 * - Fast animations (< 200ms)
 *
 * @example
 * ```tsx
 * import { KeyboardShortcutsModal } from "@/components/dashboard/keyboard-shortcuts";
 * import { useKeyboardShortcutsHelp } from "@/shared/hooks/use-keyboard-shortcuts";
 * import { defaultShortcutsConfig } from "@/components/dashboard/keyboard-shortcuts";
 *
 * function MyComponent() {
 *   const [open, setOpen] = useKeyboardShortcutsHelp();
 *
 *   return (
 *     <KeyboardShortcutsModal
 *       open={open}
 *       onOpenChange={setOpen}
 *       categories={defaultShortcutsConfig.categories}
 *     />
 *   );
 * }
 * ```
 */
export function KeyboardShortcutsModal({
  open,
  onOpenChange,
  categories,
  title = "Keyboard Shortcuts",
  description = "Use these shortcuts to navigate and perform actions quickly.",
  className,
}: KeyboardShortcutsModalProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Reset search when modal closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  // Focus search input when modal opens
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Sort categories by priority
  const sortedCategories = React.useMemo(
    () => [...categories].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99)),
    [categories]
  );

  // Check if any shortcuts match the search
  const hasResults = React.useMemo(() => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return categories.some((category) =>
      category.shortcuts.some(
        (shortcut) =>
          shortcut.label.toLowerCase().includes(query) ||
          shortcut.description?.toLowerCase().includes(query) ||
          shortcut.keys.some((key) => key.toLowerCase().includes(query))
      )
    );
  }, [categories, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-lg p-0 gap-0 overflow-hidden",
          className
        )}
        showCloseButton={true}
      >
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={KeyboardIcon}
              className="size-4 text-muted-foreground"
            />
            <DialogTitle className="text-sm font-medium">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="px-4 py-3 border-b border-border/50">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
            />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search shortcuts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {/* Shortcuts list */}
        <ScrollArea className="max-h-[60vh]">
          <div className="p-4 space-y-4">
            {hasResults ? (
              sortedCategories.map((category) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  searchQuery={searchQuery}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="size-8 text-muted-foreground/50 mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  No shortcuts found for &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border/50 bg-muted/30">
          <div className="flex items-center justify-between text-[0.625rem] text-muted-foreground">
            <span className="flex items-center gap-1">
              Press <Kbd>?</Kbd> to toggle this help
            </span>
            <span className="flex items-center gap-1">
              <Kbd>Esc</Kbd> to close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
