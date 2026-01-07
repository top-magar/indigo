"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  ShoppingCart01Icon,
  Package01Icon,
  UserMultipleIcon,
  Settings01Icon,
  Add01Icon,
  SearchIcon,
  ArrowRight01Icon,
  AnalyticsUpIcon,
  Layers01Icon,
  TagsIcon,
  Store01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/shared/utils";

// Types
export interface CommandPaletteCommand {
  id: string;
  label: string;
  description?: string;
  icon?: typeof Home01Icon;
  shortcut?: string[];
  keywords?: string[];
  group: string;
  onSelect: () => void;
  disabled?: boolean;
}

export interface CommandPaletteGroup {
  id: string;
  label: string;
  priority?: number;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: CommandPaletteCommand[];
  groups?: CommandPaletteGroup[];
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

// Highlight matching text in search results
function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-primary/20 text-foreground rounded-xs px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

// Keyboard shortcut display
function ShortcutKeys({ keys }: { keys: string[] }) {
  return (
    <KbdGroup>
      {keys.map((key, index) => (
        <Kbd key={index}>{formatKey(key)}</Kbd>
      ))}
    </KbdGroup>
  );
}

// Format key for display (e.g., "mod" -> "⌘" on Mac)
function formatKey(key: string): string {
  const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  
  const keyMap: Record<string, string> = {
    mod: isMac ? "⌘" : "Ctrl",
    ctrl: isMac ? "⌃" : "Ctrl",
    alt: isMac ? "⌥" : "Alt",
    shift: "⇧",
    enter: "↵",
    escape: "Esc",
    backspace: "⌫",
    delete: "Del",
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
  };

  return keyMap[key.toLowerCase()] || key.toUpperCase();
}

// Default groups with priority ordering
const defaultGroups: CommandPaletteGroup[] = [
  { id: "navigation", label: "Navigation", priority: 1 },
  { id: "actions", label: "Actions", priority: 2 },
  { id: "settings", label: "Settings", priority: 3 },
];

export function CommandPalette({
  open,
  onOpenChange,
  commands,
  groups = defaultGroups,
  placeholder = "Type a command or search...",
  emptyMessage = "No results found.",
  className,
}: CommandPaletteProps) {
  const [search, setSearch] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Reset search when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  // Focus input when dialog opens
  React.useEffect(() => {
    if (open) {
      // Small delay to ensure dialog is rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Group commands by their group property
  const groupedCommands = React.useMemo(() => {
    const grouped = new Map<string, CommandPaletteCommand[]>();
    
    // Sort groups by priority
    const sortedGroups = [...groups].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
    
    // Initialize groups in order
    sortedGroups.forEach((group) => {
      grouped.set(group.id, []);
    });

    // Add commands to their groups
    commands.forEach((command) => {
      const groupCommands = grouped.get(command.group);
      if (groupCommands) {
        groupCommands.push(command);
      } else {
        // Create group if it doesn't exist
        grouped.set(command.group, [command]);
      }
    });

    return grouped;
  }, [commands, groups]);

  // Get group label
  const getGroupLabel = (groupId: string): string => {
    const group = groups.find((g) => g.id === groupId);
    return group?.label || groupId;
  };

  // Handle command selection
  const handleSelect = (command: CommandPaletteCommand) => {
    if (command.disabled) return;
    onOpenChange(false);
    command.onSelect();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "overflow-hidden p-0 sm:max-w-lg",
          className
        )}
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>
            Search for commands and navigate the dashboard
          </DialogDescription>
        </DialogHeader>
        <Command
          className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0"
          shouldFilter={true}
        >
          <CommandInput
            ref={inputRef}
            placeholder={placeholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-80">
            <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <HugeiconsIcon
                  icon={SearchIcon}
                  className="size-8 text-muted-foreground/50"
                />
                <span>{emptyMessage}</span>
              </div>
            </CommandEmpty>
            {Array.from(groupedCommands.entries()).map(([groupId, groupCommands], index) => {
              if (groupCommands.length === 0) return null;
              
              return (
                <React.Fragment key={groupId}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup heading={getGroupLabel(groupId)}>
                    {groupCommands.map((command) => (
                      <CommandItem
                        key={command.id}
                        value={`${command.label} ${command.description || ""} ${command.keywords?.join(" ") || ""}`}
                        onSelect={() => handleSelect(command)}
                        disabled={command.disabled}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {command.icon && (
                            <HugeiconsIcon
                              icon={command.icon}
                              className="size-4 shrink-0 text-muted-foreground"
                            />
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="truncate">
                              <HighlightedText text={command.label} query={search} />
                            </span>
                            {command.description && (
                              <span className="text-muted-foreground text-[0.625rem] truncate">
                                {command.description}
                              </span>
                            )}
                          </div>
                        </div>
                        {command.shortcut && command.shortcut.length > 0 && (
                          <CommandShortcut>
                            <ShortcutKeys keys={command.shortcut} />
                          </CommandShortcut>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </React.Fragment>
              );
            })}
          </CommandList>
          {/* Footer with keyboard hints */}
          <div className="border-t border-border/50 px-3 py-2 flex items-center justify-between text-[0.625rem] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <Kbd>↵</Kbd>
                <span>Select</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Kbd>Esc</Kbd>
              <span>Close</span>
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

// Export icon constants for use in command definitions
export const CommandIcons = {
  Home: Home01Icon,
  Orders: ShoppingCart01Icon,
  Products: Package01Icon,
  Customers: UserMultipleIcon,
  Settings: Settings01Icon,
  Add: Add01Icon,
  Search: SearchIcon,
  Navigate: ArrowRight01Icon,
  Analytics: AnalyticsUpIcon,
  Inventory: Layers01Icon,
  Categories: TagsIcon,
  Store: Store01Icon,
  Logout: Logout01Icon,
} as const;
