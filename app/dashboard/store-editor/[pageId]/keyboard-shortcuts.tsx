"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { KeyboardIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface ShortcutGroup {
    title: string;
    shortcuts: Array<{
        keys: string[];
        description: string;
    }>;
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
    {
        title: "General",
        shortcuts: [
            { keys: ["⌘", "S"], description: "Save changes" },
            { keys: ["⌘", "Z"], description: "Undo" },
            { keys: ["⌘", "⇧", "Z"], description: "Redo" },
            { keys: ["Esc"], description: "Deselect / Exit preview" },
        ],
    },
    {
        title: "Block Actions",
        shortcuts: [
            { keys: ["Delete"], description: "Delete selected block" },
            { keys: ["⌘", "D"], description: "Duplicate selected block" },
            { keys: ["↑"], description: "Select previous block" },
            { keys: ["↓"], description: "Select next block" },
        ],
    },
    {
        title: "Canvas",
        shortcuts: [
            { keys: ["⌘", "+"], description: "Zoom in" },
            { keys: ["⌘", "-"], description: "Zoom out" },
            { keys: ["⌘", "0"], description: "Reset zoom to 100%" },
            { keys: ["⌘", "Scroll"], description: "Zoom with mouse wheel" },
        ],
    },
];

function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <kbd className={cn(
            "inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md",
            "bg-muted border border-border text-xs font-medium text-muted-foreground",
            "shadow-[0_1px_0_1px_rgba(0,0,0,0.05)]",
            className
        )}>
            {children}
        </kbd>
    );
}

export function KeyboardShortcutsDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <HugeiconsIcon icon={KeyboardIcon} className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={KeyboardIcon} className="h-5 w-5" />
                        Keyboard Shortcuts
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {SHORTCUT_GROUPS.map((group) => (
                        <div key={group.title}>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                {group.title}
                            </h3>
                            <div className="space-y-2">
                                {group.shortcuts.map((shortcut, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-1.5"
                                    >
                                        <span className="text-sm">{shortcut.description}</span>
                                        <div className="flex items-center gap-1">
                                            {shortcut.keys.map((key, keyIndex) => (
                                                <Kbd key={keyIndex}>{key}</Kbd>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                        Press <Kbd>?</Kbd> anytime to show this dialog
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function KeyboardShortcutsHint() {
    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border shadow-lg text-xs text-muted-foreground">
                <span>Press</span>
                <Kbd>?</Kbd>
                <span>for shortcuts</span>
            </div>
        </div>
    );
}