"use client";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowUp01Icon,
    ArrowDown01Icon,
    Copy01Icon,
    Delete02Icon,
    ViewIcon,
    ViewOffIcon,
    Settings01Icon,
    DragDropVerticalIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { PageBlock } from "@/types/page-builder";
import { BLOCK_REGISTRY } from "@/lib/page-builder/block-registry";

interface BlockToolbarProps {
    block: PageBlock;
    isFirst: boolean;
    isLast: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onToggleVisibility: () => void;
    onOpenSettings: () => void;
}

export function BlockToolbar({
    block,
    isFirst,
    isLast,
    onMoveUp,
    onMoveDown,
    onDuplicate,
    onDelete,
    onToggleVisibility,
    onOpenSettings,
}: BlockToolbarProps) {
    const blockName = BLOCK_REGISTRY[block.type]?.name || block.type;

    return (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-background border border-border shadow-lg">
            {/* Block Name */}
            <div className="flex items-center gap-1.5 px-2 border-r border-border mr-1">
                <HugeiconsIcon icon={DragDropVerticalIcon} className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">{blockName}</span>
            </div>

            {/* Move Actions */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onMoveUp}
                        disabled={isFirst}
                    >
                        <HugeiconsIcon icon={ArrowUp01Icon} className="h-3.5 w-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Move Up</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onMoveDown}
                        disabled={isLast}
                    >
                        <HugeiconsIcon icon={ArrowDown01Icon} className="h-3.5 w-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Move Down</TooltipContent>
            </Tooltip>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Visibility */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onToggleVisibility}
                    >
                        <HugeiconsIcon 
                            icon={block.visible ? ViewIcon : ViewOffIcon} 
                            className={cn("h-3.5 w-3.5", !block.visible && "text-muted-foreground")} 
                        />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                    {block.visible ? "Hide Block" : "Show Block"}
                </TooltipContent>
            </Tooltip>

            {/* Duplicate */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onDuplicate}
                    >
                        <HugeiconsIcon icon={Copy01Icon} className="h-3.5 w-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Duplicate (⌘D)</TooltipContent>
            </Tooltip>

            {/* Settings */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onOpenSettings}
                    >
                        <HugeiconsIcon icon={Settings01Icon} className="h-3.5 w-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Edit Settings</TooltipContent>
            </Tooltip>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Delete */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={onDelete}
                    >
                        <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Delete (Del)</TooltipContent>
            </Tooltip>
        </div>
    );
}