"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Cancel01Icon,
    Layers01Icon,
    Add01Icon,
    Delete02Icon,
    Loading03Icon,
    Search01Icon,
    GridIcon,
    TextIcon,
    Image01Icon,
    PlayIcon,
    Mail01Icon,
    StarIcon,
    LayoutTopIcon,
    ArrowExpand01Icon,
    MinusSignIcon,
    Comment01Icon,
    FloppyDiskIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BlockTemplate, PageBlock, BlockType } from "@/types/page-builder";
import { BLOCK_REGISTRY } from "@/lib/page-builder/block-registry";
import { saveBlockTemplate, deleteBlockTemplate } from "../actions";

interface SavedSectionsPanelProps {
    templates: BlockTemplate[];
    selectedBlock: PageBlock | null;
    onInsertTemplate: (block: PageBlock) => void;
    onClose: () => void;
}

// Block type icons
const BLOCK_ICONS: Record<string, typeof TextIcon> = {
    hero: LayoutTopIcon,
    banner: Image01Icon,
    text: TextIcon,
    "rich-text": TextIcon,
    "featured-products": StarIcon,
    "product-grid": GridIcon,
    "category-grid": GridIcon,
    "collection-showcase": GridIcon,
    image: Image01Icon,
    "image-gallery": Image01Icon,
    video: PlayIcon,
    newsletter: Mail01Icon,
    "contact-form": Mail01Icon,
    spacer: ArrowExpand01Icon,
    divider: MinusSignIcon,
    testimonials: Comment01Icon,
    countdown: StarIcon,
    faq: Comment01Icon,
    "logo-cloud": GridIcon,
    "announcement-bar": LayoutTopIcon,
    map: Image01Icon,
    html: TextIcon,
};

const getBlockIcon = (type: BlockType) => BLOCK_ICONS[type] || GridIcon;

export function SavedSectionsPanel({
    templates,
    selectedBlock,
    onInsertTemplate,
    onClose,
}: SavedSectionsPanelProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState("");
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

    const filteredTemplates = templates.filter(
        (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.block_type.toLowerCase().includes(search.toLowerCase())
    );

    const handleSaveTemplate = () => {
        if (!selectedBlock || !templateName.trim()) return;

        startTransition(async () => {
            const result = await saveBlockTemplate(templateName.trim(), selectedBlock);

            if (result.success) {
                toast.success("Section saved as template");
                setShowSaveDialog(false);
                setTemplateName("");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to save template");
            }
        });
    };

    const handleDeleteTemplate = (templateId: string) => {
        startTransition(async () => {
            const result = await deleteBlockTemplate(templateId);

            if (result.success) {
                toast.success("Template deleted");
                setDeleteTemplateId(null);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete template");
            }
        });
    };

    const handleInsertTemplate = (template: BlockTemplate) => {
        const newBlock: PageBlock = {
            ...template.block_data,
            id: crypto.randomUUID(),
        };
        onInsertTemplate(newBlock);
        toast.success(`${template.name} added to page`);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-chart-3/10 flex items-center justify-center">
                        <HugeiconsIcon icon={Layers01Icon} className="h-5 w-5 text-chart-3" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold">Saved Sections</h2>
                        <p className="text-xs text-muted-foreground">Reusable block templates</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                    <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                </Button>
            </div>

            {/* Save Current Block */}
            {selectedBlock && (
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => setShowSaveDialog(true)}
                    >
                        <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4" />
                        Save Current Block as Template
                    </Button>
                </div>
            )}

            {/* Search */}
            <div className="px-4 py-3 border-b border-border shrink-0">
                <div className="relative">
                    <HugeiconsIcon
                        icon={Search01Icon}
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    />
                    <Input
                        placeholder="Search templates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 pl-9 bg-muted/50 border-0 focus-visible:ring-1"
                    />
                </div>
            </div>

            {/* Templates List */}
            <ScrollArea className="flex-1">
                <div className="p-4">
                    {filteredTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                                <HugeiconsIcon icon={Layers01Icon} className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground">No saved sections</h3>
                            <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px]">
                                {search
                                    ? "No templates match your search"
                                    : "Save blocks as templates to reuse them across pages"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:border-chart-3/50 hover:bg-chart-3/5 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                        <HugeiconsIcon
                                            icon={getBlockIcon(template.block_type as BlockType)}
                                            className="h-5 w-5 text-muted-foreground"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{template.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {BLOCK_REGISTRY[template.block_type as BlockType]?.name || template.block_type}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleInsertTemplate(template)}
                                        >
                                            <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteTemplateId(template.id)}
                                        >
                                            <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Save Template Dialog */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Save as Template</DialogTitle>
                        <DialogDescription>
                            Save this block as a reusable template for future use.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="template-name">Template Name</Label>
                            <Input
                                id="template-name"
                                placeholder="e.g., Hero with CTA"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                            />
                        </div>
                        {selectedBlock && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center">
                                    <HugeiconsIcon
                                        icon={getBlockIcon(selectedBlock.type)}
                                        className="h-4 w-4 text-muted-foreground"
                                    />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">
                                        {BLOCK_REGISTRY[selectedBlock.type]?.name || selectedBlock.type}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Block type</div>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSaveDialog(false)} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveTemplate}
                            disabled={isPending || !templateName.trim()}
                            className="gap-2"
                        >
                            {isPending ? (
                                <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                            ) : (
                                <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4" />
                            )}
                            Save Template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTemplateId} onOpenChange={() => setDeleteTemplateId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this template? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteTemplateId && handleDeleteTemplate(deleteTemplateId)}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? (
                                <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
