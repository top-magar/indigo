"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    DragDropVerticalIcon,
    MoreHorizontalIcon,
    Copy01Icon,
    Delete02Icon,
    ViewIcon,
    ViewOffIcon,
    ArrowUp01Icon,
    ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { PageBlock, BlockType } from "@/types/page-builder";

interface SortableBlockProps {
    block: PageBlock;
    index: number;
    isSelected: boolean;
    isHovered: boolean;
    onSelect: () => void;
    onHover: () => void;
    onLeave: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onToggleVisibility: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    getBlockIcon: (type: BlockType) => typeof ViewIcon;
}

export function SortableBlock({
    block,
    index,
    isSelected,
    isHovered,
    onSelect,
    onHover,
    onLeave,
    onDuplicate,
    onDelete,
    onToggleVisibility,
    onMoveUp,
    onMoveDown,
    getBlockIcon,
}: SortableBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getBlockLabel = () => {
        if (block.type === "hero" && "content" in block) {
            return (block.content as { heading?: string }).heading?.slice(0, 24) || "Hero Section";
        }
        if (block.type === "text" && "content" in block) {
            return (block.content as { text?: string }).text?.slice(0, 24) || "Text Block";
        }
        if (block.type === "featured-products" && "content" in block) {
            return (block.content as { heading?: string }).heading?.slice(0, 24) || "Featured Products";
        }
        if (block.type === "banner" && "content" in block) {
            return (block.content as { heading?: string }).heading?.slice(0, 24) || "Banner";
        }
        return block.type.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group flex items-center gap-2 px-2 py-2 rounded-lg transition-all cursor-pointer",
                isSelected && "bg-primary/10 ring-1 ring-primary/30",
                isHovered && !isSelected && "bg-muted/80",
                isDragging && "opacity-50 shadow-xl ring-2 ring-primary",
                !block.visible && "opacity-50"
            )}
            onClick={onSelect}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab touch-none p-1 rounded-md hover:bg-muted active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
            >
                <HugeiconsIcon icon={DragDropVerticalIcon} className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Block Icon */}
            <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                isSelected ? "bg-primary/20" : "bg-muted"
            )}>
                <HugeiconsIcon 
                    icon={getBlockIcon(block.type)} 
                    className={cn(
                        "h-4 w-4 transition-colors",
                        isSelected ? "text-primary" : "text-muted-foreground"
                    )} 
                />
            </div>

            {/* Block Name */}
            <div className="flex-1 min-w-0">
                <span className={cn(
                    "text-sm font-medium truncate block",
                    !block.visible && "line-through"
                )}>
                    {getBlockLabel()}
                </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Visibility Toggle */}
                <button
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility();
                    }}
                >
                    <HugeiconsIcon
                        icon={block.visible ? ViewIcon : ViewOffIcon}
                        className="h-3.5 w-3.5 text-muted-foreground"
                    />
                </button>

                {/* More Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="p-1.5 rounded-md hover:bg-muted transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                            disabled={index === 0}
                        >
                            <HugeiconsIcon icon={ArrowUp01Icon} className="mr-2 h-4 w-4" />
                            Move up
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                        >
                            <HugeiconsIcon icon={ArrowDown01Icon} className="mr-2 h-4 w-4" />
                            Move down
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                        >
                            <HugeiconsIcon icon={Copy01Icon} className="mr-2 h-4 w-4" />
                            Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
                        >
                            <HugeiconsIcon icon={block.visible ? ViewOffIcon : ViewIcon} className="mr-2 h-4 w-4" />
                            {block.visible ? "Hide" : "Show"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="text-destructive focus:text-destructive"
                        >
                            <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
