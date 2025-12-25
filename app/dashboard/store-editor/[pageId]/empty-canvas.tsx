"use client";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Add01Icon,
    LayoutTopIcon,
    StarIcon,
    GridIcon,
    TextIcon,
    Image01Icon,
    Mail01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { BlockType } from "@/types/page-builder";

interface EmptyCanvasProps {
    onAddBlock: (type: BlockType) => void;
    onOpenBlockPanel: () => void;
}

const QUICK_START_BLOCKS: Array<{ type: BlockType; name: string; icon: typeof LayoutTopIcon; description: string }> = [
    { type: "hero", name: "Hero", icon: LayoutTopIcon, description: "Large banner section" },
    { type: "featured-products", name: "Products", icon: StarIcon, description: "Showcase products" },
    { type: "text", name: "Text", icon: TextIcon, description: "Add text content" },
    { type: "banner", name: "Banner", icon: Image01Icon, description: "Promotional banner" },
    { type: "newsletter", name: "Newsletter", icon: Mail01Icon, description: "Email signup" },
    { type: "category-grid", name: "Categories", icon: GridIcon, description: "Category grid" },
];

export function EmptyCanvas({ onAddBlock, onOpenBlockPanel }: EmptyCanvasProps) {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-8">
            {/* Illustration */}
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-primary/20 to-chart-2/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/30 to-chart-2/30 flex items-center justify-center">
                        <HugeiconsIcon icon={Add01Icon} className="h-8 w-8 text-primary" />
                    </div>
                </div>
                {/* Decorative dots */}
                <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-chart-1/50" />
                <div className="absolute -bottom-1 -left-3 w-2 h-2 rounded-full bg-chart-2/50" />
                <div className="absolute top-1/2 -right-6 w-2 h-2 rounded-full bg-chart-3/50" />
            </div>

            {/* Text */}
            <h3 className="text-xl font-semibold mb-2">Start building your page</h3>
            <p className="text-muted-foreground mb-8 max-w-md">
                Add blocks to create your page layout. Choose from pre-built sections or start with basic elements.
            </p>

            {/* Quick Start Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 max-w-lg">
                {QUICK_START_BLOCKS.map((block) => (
                    <button
                        key={block.type}
                        onClick={() => onAddBlock(block.type)}
                        className={cn(
                            "group flex flex-col items-center gap-2 p-4 rounded-xl border border-border",
                            "bg-background hover:border-primary/50 hover:bg-primary/5 transition-all"
                        )}
                    >
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <HugeiconsIcon
                                icon={block.icon}
                                className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors"
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">{block.name}</p>
                            <p className="text-[10px] text-muted-foreground">{block.description}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Browse All Button */}
            <Button variant="outline" onClick={onOpenBlockPanel} className="gap-2">
                <HugeiconsIcon icon={GridIcon} className="h-4 w-4" />
                Browse All Blocks
            </Button>
        </div>
    );
}