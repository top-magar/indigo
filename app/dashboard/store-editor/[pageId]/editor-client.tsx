"use client";

import { useState, useCallback, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    Add01Icon,
    EyeIcon,
    Settings01Icon,
    FloppyDiskIcon,
    Upload01Icon,
    SmartPhone01Icon,
    Tablet01Icon,
    ComputerIcon,
    Undo02Icon,
    Redo02Icon,
    Loading03Icon,
    GridIcon,
    Layers01Icon,
    Search01Icon,
    TextIcon,
    Image01Icon,
    PlayIcon,
    Mail01Icon,
    StarIcon,
    LayoutTopIcon,
    ArrowExpand01Icon,
    MinusSignIcon,
    Copy01Icon,
    Delete02Icon,
    ViewIcon,
    ViewOffIcon,
    SidebarLeft01Icon,
    SidebarRight01Icon,
    PlusSignIcon,
    Cancel01Icon,
    PaintBrushIcon,
    BookmarkIcon,
    Comment01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

import type { StorePage, PageBlock, BlockType } from "@/types/page-builder";
import { BLOCK_REGISTRY, createBlock, getBlocksByCategory } from "@/lib/page-builder/block-registry";
import { updateStorePage } from "../actions";
import { SortableBlock } from "./sortable-block";
import { BlockEditor } from "./block-editor";
import { BlockPreview } from "./block-preview";
import { PageSettingsPanel } from "./page-settings-panel";
import { ThemeEditorPanel } from "./theme-editor-panel";
import { SavedSectionsPanel } from "./saved-sections-panel";
import { LivePreviewPanel } from "./live-preview-panel";
import type { StoreTheme, BlockTemplate } from "@/types/page-builder";

interface EditorClientProps {
    page: StorePage;
    products: Array<{ id: string; name: string; slug: string; price: number; images: unknown[] }>;
    categories: Array<{ id: string; name: string; slug: string }>;
    collections: Array<{ id: string; name: string; slug: string }>;
    storeSlug: string;
    theme?: StoreTheme | null;
    blockTemplates?: BlockTemplate[];
}

type PreviewDevice = "desktop" | "tablet" | "mobile";

const DEVICE_CONFIG: Record<PreviewDevice, { width: string; maxWidth: string; label: string }> = {
    desktop: { width: "100%", maxWidth: "1400px", label: "Desktop" },
    tablet: { width: "768px", maxWidth: "768px", label: "Tablet" },
    mobile: { width: "375px", maxWidth: "375px", label: "Mobile" },
};

const ZOOM_PRESETS = [50, 75, 100, 125, 150, 200];

// Block category icons
const CATEGORY_ICONS: Record<string, typeof TextIcon> = {
    "Layout": LayoutTopIcon,
    "Content": TextIcon,
    "Products": GridIcon,
    "Media": Image01Icon,
    "Forms": Mail01Icon,
    "Social": StarIcon,
};

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

export function EditorClient({ page, products, categories, collections, storeSlug, theme, blockTemplates = [] }: EditorClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const canvasRef = useRef<HTMLDivElement>(null);
    
    // Panel states
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [activeLeftTab, setActiveLeftTab] = useState<"layers" | "blocks" | "templates">("layers");
    const [showThemeEditor, setShowThemeEditor] = useState(false);
    const [showLivePreview, setShowLivePreview] = useState(false);
    
    // Editor state
    const [blocks, setBlocks] = useState<PageBlock[]>(page.blocks || []);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
    const [zoom, setZoom] = useState(100);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [showSettingsPanel, setShowSettingsPanel] = useState(false);
    const [blockSearch, setBlockSearch] = useState("");
    const [addBlockPopoverOpen, setAddBlockPopoverOpen] = useState(false);
    
    // Undo/Redo
    const [undoStack, setUndoStack] = useState<PageBlock[][]>([]);
    const [redoStack, setRedoStack] = useState<PageBlock[][]>([]);

    const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
    const blocksByCategory = getBlocksByCategory();

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

            if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
                e.preventDefault();
                handleRedo();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault();
                handleSave(false);
            }
            if ((e.key === "Delete" || e.key === "Backspace") && selectedBlockId) {
                e.preventDefault();
                deleteBlock(selectedBlockId);
            }
            if ((e.metaKey || e.ctrlKey) && e.key === "d" && selectedBlockId) {
                e.preventDefault();
                duplicateBlock(selectedBlockId);
            }
            if (e.key === "Escape") {
                setSelectedBlockId(null);
                setIsPreviewMode(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedBlockId, undoStack, redoStack, blocks]);

    // Mouse wheel zoom
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -5 : 5;
                setZoom((prev) => Math.min(200, Math.max(50, prev + delta)));
            }
        };

        canvas.addEventListener("wheel", handleWheel, { passive: false });
        return () => canvas.removeEventListener("wheel", handleWheel);
    }, []);

    // Undo/Redo helpers
    const saveToUndoStack = useCallback(() => {
        setUndoStack((prev) => [...prev.slice(-49), blocks]);
        setRedoStack([]);
    }, [blocks]);

    const updateBlocks = useCallback((newBlocks: PageBlock[]) => {
        saveToUndoStack();
        setBlocks(newBlocks);
        setHasUnsavedChanges(true);
    }, [saveToUndoStack]);

    const handleUndo = useCallback(() => {
        if (undoStack.length === 0) return;
        const previousBlocks = undoStack[undoStack.length - 1];
        setRedoStack((prev) => [...prev, blocks]);
        setUndoStack((prev) => prev.slice(0, -1));
        setBlocks(previousBlocks);
        setHasUnsavedChanges(true);
    }, [undoStack, blocks]);

    const handleRedo = useCallback(() => {
        if (redoStack.length === 0) return;
        const nextBlocks = redoStack[redoStack.length - 1];
        setUndoStack((prev) => [...prev, blocks]);
        setRedoStack((prev) => prev.slice(0, -1));
        setBlocks(nextBlocks);
        setHasUnsavedChanges(true);
    }, [redoStack, blocks]);

    // Drag handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = blocks.findIndex((b) => b.id === active.id);
            const newIndex = blocks.findIndex((b) => b.id === over.id);
            updateBlocks(arrayMove(blocks, oldIndex, newIndex));
        }
    };

    // Block operations
    const addBlock = (type: BlockType) => {
        const newBlock = createBlock(type);
        updateBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
        setRightPanelOpen(true);
        setAddBlockPopoverOpen(false);
        toast.success(`${BLOCK_REGISTRY[type]?.name || type} added`);
    };

    const duplicateBlock = (blockId: string) => {
        const block = blocks.find((b) => b.id === blockId);
        if (!block) return;
        
        const newBlock = { ...block, id: crypto.randomUUID() };
        const index = blocks.findIndex((b) => b.id === blockId);
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        updateBlocks(newBlocks);
        setSelectedBlockId(newBlock.id);
        toast.success("Block duplicated");
    };

    const deleteBlock = (blockId: string) => {
        updateBlocks(blocks.filter((b) => b.id !== blockId));
        if (selectedBlockId === blockId) {
            setSelectedBlockId(null);
            setRightPanelOpen(false);
        }
        toast.success("Block deleted");
    };

    const updateBlock = (blockId: string, updates: Partial<PageBlock>) => {
        updateBlocks(
            blocks.map((b) => (b.id === blockId ? { ...b, ...updates } as PageBlock : b))
        );
    };

    const toggleBlockVisibility = (blockId: string) => {
        updateBlocks(
            blocks.map((b) => (b.id === blockId ? { ...b, visible: !b.visible } : b))
        );
    };

    const moveBlock = (blockId: string, direction: "up" | "down") => {
        const index = blocks.findIndex((b) => b.id === blockId);
        if (index === -1) return;
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === blocks.length - 1) return;
        
        const newIndex = direction === "up" ? index - 1 : index + 1;
        updateBlocks(arrayMove(blocks, index, newIndex));
    };

    // Save
    const handleSave = async (publish = false) => {
        startTransition(async () => {
            const result = await updateStorePage(page.id, {
                blocks,
                status: publish ? "published" : page.status,
            });

            if (result.success) {
                setHasUnsavedChanges(false);
                toast.success(publish ? "Page published!" : "Changes saved");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to save");
            }
        });
    };

    // Filter blocks
    const filteredBlocksByCategory = Object.entries(blocksByCategory).reduce((acc, [category, categoryBlocks]) => {
        const filtered = categoryBlocks.filter(
            (block) =>
                block.name.toLowerCase().includes(blockSearch.toLowerCase()) ||
                block.description.toLowerCase().includes(blockSearch.toLowerCase())
        );
        if (filtered.length > 0) acc[category] = filtered;
        return acc;
    }, {} as Record<string, typeof blocksByCategory[string]>);

    const getBlockIcon = (type: BlockType) => BLOCK_ICONS[type] || GridIcon;

    return (
        <TooltipProvider delayDuration={0}>
            <div className="fixed inset-0 flex flex-col bg-muted/30 overflow-hidden">

                {/* ═══════════════════════════════════════════════════════════════
                    HEADER - Clean, minimal top bar
                ═══════════════════════════════════════════════════════════════ */}
                <header className="h-14 flex items-center justify-between px-3 bg-background border-b border-border z-50">
                    {/* Left Section */}
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                                    <Link href="/dashboard/store-editor">
                                        <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Back to Pages</TooltipContent>
                        </Tooltip>

                        <div className="h-6 w-px bg-border" />

                        {/* Page Info */}
                        <div className="flex items-center gap-2 px-2">
                            <span className="font-medium text-sm">{page.title}</span>
                            <Badge 
                                variant="secondary"
                                className={cn(
                                    "text-[10px] px-1.5 py-0 h-5 font-medium",
                                    page.status === "published" 
                                        ? "bg-chart-2/15 text-chart-2 border-chart-2/20" 
                                        : "bg-chart-4/15 text-chart-4 border-chart-4/20"
                                )}
                            >
                                {page.status}
                            </Badge>
                            {hasUnsavedChanges && (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <span className="w-1.5 h-1.5 rounded-full bg-chart-4 animate-pulse" />
                                    Unsaved
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Center Section - Device Preview */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
                        <div className="flex items-center bg-muted rounded-lg p-1">
                            {(["desktop", "tablet", "mobile"] as const).map((device) => (
                                <Tooltip key={device}>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => setPreviewDevice(device)}
                                            className={cn(
                                                "h-8 w-8 flex items-center justify-center rounded-md transition-all",
                                                previewDevice === device 
                                                    ? "bg-background shadow-sm text-foreground" 
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <HugeiconsIcon 
                                                icon={device === "desktop" ? ComputerIcon : device === "tablet" ? Tablet01Icon : SmartPhone01Icon} 
                                                className="h-4 w-4" 
                                            />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">{DEVICE_CONFIG[device].label}</TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2">
                        {/* Undo/Redo */}
                        <div className="flex items-center">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                        onClick={handleUndo}
                                        disabled={undoStack.length === 0}
                                    >
                                        <HugeiconsIcon icon={Undo02Icon} className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Undo (⌘Z)</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                        onClick={handleRedo}
                                        disabled={redoStack.length === 0}
                                    >
                                        <HugeiconsIcon icon={Redo02Icon} className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Redo (⌘⇧Z)</TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="h-6 w-px bg-border" />

                        {/* Preview */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={isPreviewMode ? "secondary" : "ghost"}
                                    size="sm"
                                    className="h-9 gap-2"
                                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                                >
                                    <HugeiconsIcon icon={EyeIcon} className="h-4 w-4" />
                                    Preview
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Toggle Preview Mode</TooltipContent>
                        </Tooltip>

                        {/* Live Preview */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={showLivePreview ? "secondary" : "ghost"}
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={() => setShowLivePreview(!showLivePreview)}
                                >
                                    <HugeiconsIcon icon={ArrowExpand01Icon} className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Live Preview</TooltipContent>
                        </Tooltip>

                        {/* Theme Editor */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={() => setShowThemeEditor(true)}
                                >
                                    <HugeiconsIcon icon={PaintBrushIcon} className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Theme Editor</TooltipContent>
                        </Tooltip>

                        {/* Settings */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={() => setShowSettingsPanel(true)}
                                >
                                    <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Page Settings</TooltipContent>
                        </Tooltip>

                        <div className="h-6 w-px bg-border" />

                        {/* Save & Publish */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9"
                            onClick={() => handleSave(false)}
                            disabled={isPending || !hasUnsavedChanges}
                        >
                            {isPending ? (
                                <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4 mr-1.5" />
                                    Save
                                </>
                            )}
                        </Button>
                        <Button
                            size="sm"
                            className="h-9 bg-primary hover:bg-primary/90"
                            onClick={() => handleSave(true)}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <HugeiconsIcon icon={Upload01Icon} className="h-4 w-4 mr-1.5" />
                                    Publish
                                </>
                            )}
                        </Button>
                    </div>
                </header>


                {/* ═══════════════════════════════════════════════════════════════
                    MAIN CONTENT AREA
                ═══════════════════════════════════════════════════════════════ */}
                <div className="flex-1 flex overflow-hidden">
                    {/* ─────────────────────────────────────────────────────────────
                        LEFT SIDEBAR
                    ───────────────────────────────────────────────────────────── */}
                    <aside
                        className={cn(
                            "bg-background border-r border-border flex flex-col transition-all duration-300 ease-out shrink-0 overflow-hidden",
                            leftPanelOpen ? "w-[280px]" : "w-0"
                        )}
                    >
                        {/* Sidebar Tabs */}
                        <div className="h-12 flex items-center border-b border-border px-2 gap-1 shrink-0">
                            <button
                                onClick={() => setActiveLeftTab("layers")}
                                className={cn(
                                    "flex-1 h-8 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
                                    activeLeftTab === "layers" 
                                        ? "bg-muted text-foreground" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <HugeiconsIcon icon={Layers01Icon} className="h-4 w-4" />
                                Layers
                            </button>
                            <button
                                onClick={() => setActiveLeftTab("blocks")}
                                className={cn(
                                    "flex-1 h-8 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
                                    activeLeftTab === "blocks" 
                                        ? "bg-muted text-foreground" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <HugeiconsIcon icon={GridIcon} className="h-4 w-4" />
                                Blocks
                            </button>
                            <button
                                onClick={() => setActiveLeftTab("templates")}
                                className={cn(
                                    "flex-1 h-8 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
                                    activeLeftTab === "templates" 
                                        ? "bg-muted text-foreground" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <HugeiconsIcon icon={BookmarkIcon} className="h-4 w-4" />
                                Saved
                            </button>
                        </div>

                        {/* Layers Tab */}
                        {activeLeftTab === "layers" && (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <ScrollArea className="flex-1">
                                    <div className="p-3">
                                        {blocks.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                                                    <HugeiconsIcon icon={Layers01Icon} className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground">No layers yet</p>
                                                <p className="text-xs text-muted-foreground/70 mt-1">Add blocks to start building</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-4"
                                                    onClick={() => setActiveLeftTab("blocks")}
                                                >
                                                    <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-1.5" />
                                                    Add Block
                                                </Button>
                                            </div>
                                        ) : (
                                            <SortableContext
                                                items={blocks.map((b) => b.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="space-y-1">
                                                    {blocks.map((block, index) => (
                                                        <SortableBlock
                                                            key={block.id}
                                                            block={block}
                                                            index={index}
                                                            isSelected={selectedBlockId === block.id}
                                                            isHovered={hoveredBlockId === block.id}
                                                            onSelect={() => {
                                                                setSelectedBlockId(block.id);
                                                                setRightPanelOpen(true);
                                                            }}
                                                            onHover={() => setHoveredBlockId(block.id)}
                                                            onLeave={() => setHoveredBlockId(null)}
                                                            onDuplicate={() => duplicateBlock(block.id)}
                                                            onDelete={() => deleteBlock(block.id)}
                                                            onToggleVisibility={() => toggleBlockVisibility(block.id)}
                                                            onMoveUp={() => moveBlock(block.id, "up")}
                                                            onMoveDown={() => moveBlock(block.id, "down")}
                                                            getBlockIcon={getBlockIcon}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        )}
                                    </div>
                                </ScrollArea>
                                <DragOverlay>
                                    {activeId ? (
                                        <div className="px-3 py-2 rounded-lg bg-background border border-chart-1 shadow-xl text-sm font-medium">
                                            {BLOCK_REGISTRY[blocks.find((b) => b.id === activeId)?.type || "text"]?.name}
                                        </div>
                                    ) : null}
                                </DragOverlay>
                            </DndContext>
                        )}

                        {/* Blocks Tab */}
                        {activeLeftTab === "blocks" && (
                            <>
                                <div className="p-3 border-b border-border shrink-0">
                                    <div className="relative">
                                        <HugeiconsIcon
                                            icon={Search01Icon}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                        />
                                        <Input
                                            placeholder="Search blocks..."
                                            value={blockSearch}
                                            onChange={(e) => setBlockSearch(e.target.value)}
                                            className="h-9 pl-9 bg-muted/50 border-0 focus-visible:ring-1"
                                        />
                                    </div>
                                </div>
                                <ScrollArea className="flex-1">
                                    <div className="p-3 space-y-4">
                                        {Object.entries(filteredBlocksByCategory).map(([category, categoryBlocks]) => (
                                            <div key={category}>
                                                <div className="flex items-center gap-2 mb-2 px-1">
                                                    <HugeiconsIcon 
                                                        icon={CATEGORY_ICONS[category] || GridIcon} 
                                                        className="h-3.5 w-3.5 text-muted-foreground" 
                                                    />
                                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                        {category}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {categoryBlocks.map((block) => (
                                                        <button
                                                            key={block.type}
                                                            onClick={() => addBlock(block.type)}
                                                            className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-background hover:border-chart-1/50 hover:bg-chart-1/5 transition-all text-center"
                                                        >
                                                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-chart-1/10 transition-colors">
                                                                <HugeiconsIcon
                                                                    icon={getBlockIcon(block.type)}
                                                                    className="h-5 w-5 text-muted-foreground group-hover:text-chart-1 transition-colors"
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium">{block.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </>
                        )}

                        {/* Templates Tab */}
                        {activeLeftTab === "templates" && (
                            <SavedSectionsPanel
                                templates={blockTemplates}
                                selectedBlock={selectedBlock || null}
                                onInsertTemplate={(block) => {
                                    updateBlocks([...blocks, block]);
                                    setSelectedBlockId(block.id);
                                    setRightPanelOpen(true);
                                }}
                                onClose={() => setActiveLeftTab("layers")}
                            />
                        )}
                    </aside>


                    {/* ─────────────────────────────────────────────────────────────
                        CANVAS AREA
                    ───────────────────────────────────────────────────────────── */}
                    <main 
                        ref={canvasRef}
                        className="flex-1 overflow-auto relative"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)`,
                            backgroundSize: "24px 24px",
                        }}
                    >
                        {/* Canvas Controls */}
                        <div className="sticky top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 bg-muted/80 backdrop-blur-sm border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                                        >
                                            <HugeiconsIcon icon={SidebarLeft01Icon} className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Toggle Left Panel</TooltipContent>
                                </Tooltip>
                            </div>

                            {/* Zoom Controls */}
                            <div className="flex items-center gap-1 bg-background rounded-lg border border-border p-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setZoom((z) => Math.max(50, z - 25))}
                                    disabled={zoom <= 50}
                                >
                                    <HugeiconsIcon icon={MinusSignIcon} className="h-3 w-3" />
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-7 w-14 text-xs font-medium">
                                            {zoom}%
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="center">
                                        {ZOOM_PRESETS.map((level) => (
                                            <DropdownMenuItem key={level} onClick={() => setZoom(level)}>
                                                {level}%
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setZoom(100)}>
                                            Reset to 100%
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setZoom((z) => Math.min(200, z + 25))}
                                    disabled={zoom >= 200}
                                >
                                    <HugeiconsIcon icon={PlusSignIcon} className="h-3 w-3" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setRightPanelOpen(!rightPanelOpen)}
                                            disabled={!selectedBlock}
                                        >
                                            <HugeiconsIcon icon={SidebarRight01Icon} className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Toggle Right Panel</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>

                        {/* Page Frame */}
                        <div className="flex justify-center p-8 pb-24">
                            <div
                                className={cn(
                                    "bg-background shadow-2xl rounded-xl transition-all duration-300 origin-top relative overflow-hidden",
                                    "ring-1 ring-border/50"
                                )}
                                style={{
                                    width: DEVICE_CONFIG[previewDevice].width,
                                    maxWidth: DEVICE_CONFIG[previewDevice].maxWidth,
                                    minHeight: "80vh",
                                    transform: `scale(${zoom / 100})`,
                                    transformOrigin: "top center",
                                }}
                            >
                                {/* Device Frame Header */}
                                <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border/50 backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-destructive/60" />
                                            <div className="w-3 h-3 rounded-full bg-chart-4/60" />
                                            <div className="w-3 h-3 rounded-full bg-chart-2/60" />
                                        </div>
                                    </div>
                                    <div className="flex-1 max-w-md mx-4">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/80 border border-border/50 text-xs text-muted-foreground">
                                            <span className="truncate">{storeSlug}.yourstore.com/{page.slug}</span>
                                        </div>
                                    </div>
                                    <div className="w-16" />
                                </div>

                                {/* Page Content */}
                                <div className="min-h-[60vh]">
                                    {blocks.length === 0 ? (
                                        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-8">
                                            <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mb-6">
                                                <HugeiconsIcon icon={Add01Icon} className="h-10 w-10 text-muted-foreground/50" />
                                            </div>
                                            <h3 className="text-xl font-semibold">Start building your page</h3>
                                            <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
                                                Add blocks from the sidebar or click below to get started
                                            </p>
                                            <Button onClick={() => setActiveLeftTab("blocks")} className="gap-2">
                                                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
                                                Add Your First Block
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            {blocks
                                                .filter((block) => block.visible || !isPreviewMode)
                                                .map((block) => (
                                                    <BlockPreview
                                                        key={block.id}
                                                        block={block}
                                                        isSelected={selectedBlockId === block.id && !isPreviewMode}
                                                        isHovered={hoveredBlockId === block.id && !isPreviewMode}
                                                        isPreviewMode={isPreviewMode}
                                                        onSelect={() => {
                                                            if (!isPreviewMode) {
                                                                setSelectedBlockId(block.id);
                                                                setRightPanelOpen(true);
                                                            }
                                                        }}
                                                        onHover={() => !isPreviewMode && setHoveredBlockId(block.id)}
                                                        onLeave={() => setHoveredBlockId(null)}
                                                        products={products}
                                                        categories={categories}
                                                        collections={collections}
                                                        storeSlug={storeSlug}
                                                    />
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Floating Add Block Button */}
                        {blocks.length > 0 && !isPreviewMode && (
                            <Popover open={addBlockPopoverOpen} onOpenChange={setAddBlockPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        size="lg"
                                        className="fixed bottom-6 left-1/2 -translate-x-1/2 shadow-xl rounded-full h-12 px-6 gap-2 z-30"
                                    >
                                        <HugeiconsIcon icon={PlusSignIcon} className="h-5 w-5" />
                                        Add Block
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0" align="center" side="top" sideOffset={12}>
                                    <div className="p-3 border-b border-border">
                                        <div className="relative">
                                            <HugeiconsIcon
                                                icon={Search01Icon}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                            />
                                            <Input
                                                placeholder="Search blocks..."
                                                value={blockSearch}
                                                onChange={(e) => setBlockSearch(e.target.value)}
                                                className="h-9 pl-9 bg-muted/50 border-0"
                                            />
                                        </div>
                                    </div>
                                    <ScrollArea className="h-[300px]">
                                        <div className="p-2 space-y-3">
                                            {Object.entries(filteredBlocksByCategory).map(([category, categoryBlocks]) => (
                                                <div key={category}>
                                                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                        {category}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        {categoryBlocks.map((block) => (
                                                            <button
                                                                key={block.type}
                                                                onClick={() => addBlock(block.type)}
                                                                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                                                            >
                                                                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                                                                    <HugeiconsIcon
                                                                        icon={getBlockIcon(block.type)}
                                                                        className="h-4 w-4 text-muted-foreground"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm font-medium">{block.name}</div>
                                                                    <div className="text-xs text-muted-foreground truncate">{block.description}</div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </PopoverContent>
                            </Popover>
                        )}
                    </main>


                    {/* ─────────────────────────────────────────────────────────────
                        RIGHT SIDEBAR - Properties Panel
                    ───────────────────────────────────────────────────────────── */}
                    <aside
                        className={cn(
                            "bg-background border-l border-border flex flex-col transition-all duration-300 ease-out shrink-0 overflow-hidden",
                            rightPanelOpen && selectedBlock ? "w-[320px]" : "w-0"
                        )}
                    >
                        {selectedBlock && (
                            <>
                                {/* Panel Header */}
                                <div className="h-12 flex items-center justify-between px-4 border-b border-border shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                                            <HugeiconsIcon 
                                                icon={getBlockIcon(selectedBlock.type)} 
                                                className="h-4 w-4 text-muted-foreground" 
                                            />
                                        </div>
                                        <span className="text-sm font-medium">
                                            {BLOCK_REGISTRY[selectedBlock.type]?.name || "Block"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => toggleBlockVisibility(selectedBlock.id)}
                                                >
                                                    <HugeiconsIcon 
                                                        icon={selectedBlock.visible ? ViewIcon : ViewOffIcon} 
                                                        className="h-4 w-4" 
                                                    />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{selectedBlock.visible ? "Hide" : "Show"}</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => duplicateBlock(selectedBlock.id)}
                                                >
                                                    <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Duplicate</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                                    onClick={() => deleteBlock(selectedBlock.id)}
                                                >
                                                    <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete</TooltipContent>
                                        </Tooltip>
                                        <div className="w-px h-4 bg-border mx-1" />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => {
                                                setSelectedBlockId(null);
                                                setRightPanelOpen(false);
                                            }}
                                        >
                                            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Block Editor */}
                                <BlockEditor
                                    block={selectedBlock}
                                    onUpdate={(updates: Partial<PageBlock>) => updateBlock(selectedBlock.id, updates)}
                                    onClose={() => {
                                        setSelectedBlockId(null);
                                        setRightPanelOpen(false);
                                    }}
                                    products={products}
                                    categories={categories}
                                    collections={collections}
                                    darkMode={false}
                                />
                            </>
                        )}
                    </aside>
                </div>

                {/* Page Settings Dialog */}
                {showSettingsPanel && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-background rounded-2xl border border-border w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <PageSettingsPanel
                                page={page}
                                onClose={() => setShowSettingsPanel(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Theme Editor Dialog */}
                {showThemeEditor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-background rounded-2xl border border-border w-full max-w-xl max-h-[85vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <ThemeEditorPanel
                                theme={theme || null}
                                onClose={() => setShowThemeEditor(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Live Preview Panel */}
                {showLivePreview && (
                    <div className="fixed inset-0 z-50 bg-background">
                        <LivePreviewPanel
                            storeSlug={storeSlug}
                            pageSlug={page.slug}
                            blocks={blocks}
                            onClose={() => setShowLivePreview(false)}
                        />
                    </div>
                )}

                {/* Unsaved Changes Dialog */}
                <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
                            <AlertDialogDescription>
                                You have unsaved changes. Do you want to save before leaving?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleSave(false)}>
                                Save changes
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </TooltipProvider>
    );
}
