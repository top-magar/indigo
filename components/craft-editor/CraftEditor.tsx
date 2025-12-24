"use client";

import { useCallback, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Editor, Frame, Element, useEditor } from "@craftjs/core";
import { Layers } from "@craftjs/layers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    EyeIcon,
    FloppyDiskIcon,
    Upload01Icon,
    Undo02Icon,
    Redo02Icon,
    Loading03Icon,
    Layers01Icon,
    GridIcon,
    SmartPhone01Icon,
    Tablet01Icon,
    ComputerIcon,
    Settings01Icon,
    TextIcon,
    Image01Icon,
    LayoutTopIcon,
    StarIcon,
    MinusSignIcon,
    ArrowExpand01Icon,
    PlusSignIcon,
    Delete02Icon,
    Search01Icon,
    PlayIcon,
    Mail01Icon,
    Megaphone01Icon,
    UserMultiple02Icon,
    ChartHistogramIcon,
    HelpCircleIcon,
    Award01Icon,
    Notification01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
    Section,
    Container,
    Grid,
    Flex,
    Text,
    Button as CraftButton,
    Image,
    Divider,
    Spacer,
    Hero,
    Banner,
    ProductGrid,
    Newsletter,
    Video,
} from "./components";
import {
    AnnouncementBar,
    HeroSplit,
    HeroCentered,
    FeatureGrid,
    TestimonialCarousel,
    CTABanner,
    NewsletterSection,
    LogoCloud,
    StatsSection,
    FAQSection,
} from "./templates";
import type { StorePage } from "@/types/page-builder";
import { updateStorePage } from "@/app/dashboard/store-editor/actions";

interface CraftEditorProps {
    page: StorePage;
    products: Array<{ id: string; name: string; slug: string; price: number; images: Array<{ url: string }> }>;
    storeSlug: string;
    initialData?: string;
}

type PreviewDevice = "desktop" | "tablet" | "mobile";

const DEVICE_CONFIG: Record<PreviewDevice, { width: string; label: string }> = {
    desktop: { width: "100%", label: "Desktop" },
    tablet: { width: "768px", label: "Tablet" },
    mobile: { width: "375px", label: "Mobile" },
};

const COMPONENT_ICONS: Record<string, typeof TextIcon> = {
    Section: LayoutTopIcon,
    Container: GridIcon,
    Grid: GridIcon,
    Flex: ArrowExpand01Icon,
    Text: TextIcon,
    Button: PlusSignIcon,
    Image: Image01Icon,
    Divider: MinusSignIcon,
    Spacer: ArrowExpand01Icon,
    Hero: LayoutTopIcon,
    Banner: Image01Icon,
    ProductGrid: StarIcon,
    Newsletter: Mail01Icon,
    Video: PlayIcon,
    // Templates
    AnnouncementBar: Notification01Icon,
    HeroSplit: LayoutTopIcon,
    HeroCentered: LayoutTopIcon,
    FeatureGrid: GridIcon,
    Testimonials: UserMultiple02Icon,
    CTABanner: Megaphone01Icon,
    NewsletterSection: Mail01Icon,
    LogoCloud: Award01Icon,
    Stats: ChartHistogramIcon,
    FAQ: HelpCircleIcon,
};

const BLOCK_CATEGORIES = [
    {
        name: "Templates",
        icon: StarIcon,
        blocks: [
            { name: "Announcement Bar", component: AnnouncementBar },
            { name: "Hero Split", component: HeroSplit },
            { name: "Hero Centered", component: HeroCentered },
            { name: "Feature Grid", component: FeatureGrid },
            { name: "Testimonials", component: TestimonialCarousel },
            { name: "CTA Banner", component: CTABanner },
            { name: "Newsletter Section", component: NewsletterSection },
            { name: "Logo Cloud", component: LogoCloud },
            { name: "Stats", component: StatsSection },
            { name: "FAQ", component: FAQSection },
        ],
    },
    {
        name: "Sections",
        icon: LayoutTopIcon,
        blocks: [
            { name: "Hero", component: Hero },
            { name: "Banner", component: Banner },
            { name: "Product Grid", component: ProductGrid },
            { name: "Newsletter", component: Newsletter },
        ],
    },
    {
        name: "Layout",
        icon: GridIcon,
        blocks: [
            { name: "Section", component: Section },
            { name: "Container", component: Container },
            { name: "Grid", component: Grid },
            { name: "Flex", component: Flex },
        ],
    },
    {
        name: "Content",
        icon: TextIcon,
        blocks: [
            { name: "Text", component: Text },
            { name: "Button", component: CraftButton },
            { name: "Image", component: Image },
            { name: "Divider", component: Divider },
            { name: "Spacer", component: Spacer },
        ],
    },
    {
        name: "Media",
        icon: PlayIcon,
        blocks: [
            { name: "Video", component: Video },
        ],
    },
];

export function CraftEditor({ page, products, storeSlug, initialData }: CraftEditorProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
    const [leftPanelTab, setLeftPanelTab] = useState<"blocks" | "layers">("blocks");
    const [blockSearch, setBlockSearch] = useState("");

    return (
        <TooltipProvider delayDuration={0}>
            <Editor
                resolver={{
                    Section,
                    Container,
                    Grid,
                    Flex,
                    Text,
                    Button: CraftButton,
                    Image,
                    Divider,
                    Spacer,
                    Hero,
                    Banner,
                    ProductGrid,
                    Newsletter,
                    Video,
                    // Templates
                    AnnouncementBar,
                    HeroSplit,
                    HeroCentered,
                    FeatureGrid,
                    TestimonialCarousel,
                    CTABanner,
                    NewsletterSection,
                    LogoCloud,
                    StatsSection,
                    FAQSection,
                }}
                enabled={true}
                onRender={RenderNode}
            >
                <EditorContent
                    page={page}
                    products={products}
                    storeSlug={storeSlug}
                    initialData={initialData}
                    isPending={isPending}
                    startTransition={startTransition}
                    previewDevice={previewDevice}
                    setPreviewDevice={setPreviewDevice}
                    leftPanelTab={leftPanelTab}
                    setLeftPanelTab={setLeftPanelTab}
                    blockSearch={blockSearch}
                    setBlockSearch={setBlockSearch}
                    router={router}
                />
            </Editor>
        </TooltipProvider>
    );
}

function RenderNode({ render }: { render: React.ReactNode }) {
    return <>{render}</>;
}

interface EditorContentProps {
    page: StorePage;
    products: Array<{ id: string; name: string; slug: string; price: number; images: Array<{ url: string }> }>;
    storeSlug: string;
    initialData?: string;
    isPending: boolean;
    startTransition: (callback: () => void) => void;
    previewDevice: PreviewDevice;
    setPreviewDevice: (device: PreviewDevice) => void;
    leftPanelTab: "blocks" | "layers";
    setLeftPanelTab: (tab: "blocks" | "layers") => void;
    blockSearch: string;
    setBlockSearch: (search: string) => void;
    router: ReturnType<typeof useRouter>;
}

function EditorContent({
    page,
    products,
    storeSlug,
    initialData,
    isPending,
    startTransition,
    previewDevice,
    setPreviewDevice,
    leftPanelTab,
    setLeftPanelTab,
    blockSearch,
    setBlockSearch,
    router,
}: EditorContentProps) {
    const { actions, query, enabled, canUndo, canRedo } = useEditor((state, query) => ({
        enabled: state.options.enabled,
        canUndo: query.history.canUndo(),
        canRedo: query.history.canRedo(),
    }));

    const [hasChanges, setHasChanges] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load initial data
    useEffect(() => {
        if (initialData && !isLoaded) {
            try {
                actions.deserialize(initialData);
                setIsLoaded(true);
            } catch (error) {
                console.error("Failed to load saved page data:", error);
                setIsLoaded(true);
            }
        } else {
            setIsLoaded(true);
        }
    }, [initialData, actions, isLoaded]);

    const handleSave = useCallback(async (publish = false) => {
        const json = query.serialize();
        
        startTransition(async () => {
            const result = await updateStorePage(page.id, {
                craft_data: json,
                status: publish ? "published" : page.status,
            });

            if (result.success) {
                setHasChanges(false);
                toast.success(publish ? "Page published!" : "Changes saved");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to save");
            }
        });
    }, [query, page.id, page.status, startTransition, router]);

    // Filter blocks by search
    const filteredCategories = BLOCK_CATEGORIES.map(category => ({
        ...category,
        blocks: category.blocks.filter(block =>
            block.name.toLowerCase().includes(blockSearch.toLowerCase())
        ),
    })).filter(category => category.blocks.length > 0);

    return (
        <div className="fixed inset-0 flex flex-col bg-muted/30">
            {/* Header */}
            <header className="h-14 flex items-center justify-between px-4 bg-background border-b border-border z-50">
                <div className="flex items-center gap-3">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                                <Link href="/dashboard/store-editor">
                                    <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Back to Pages</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="h-6" />

                    <div className="flex items-center gap-2">
                        <span className="font-medium">{page.title}</span>
                        <Badge
                            variant="secondary"
                            className={cn(
                                "text-[10px] px-1.5 h-5",
                                page.status === "published"
                                    ? "bg-chart-2/15 text-chart-2"
                                    : "bg-chart-4/15 text-chart-4"
                            )}
                        >
                            {page.status}
                        </Badge>
                        {hasChanges && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-chart-4 animate-pulse" />
                                Unsaved
                            </span>
                        )}
                    </div>
                </div>

                {/* Device Preview */}
                <div className="absolute left-1/2 -translate-x-1/2">
                    <div className="flex items-center bg-muted rounded-lg p-1">
                        {(["desktop", "tablet", "mobile"] as const).map((device) => (
                            <Tooltip key={device}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setPreviewDevice(device)}
                                        className={cn(
                                            "h-8 w-8 flex items-center justify-center rounded-md transition-all",
                                            previewDevice === device
                                                ? "bg-background shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <HugeiconsIcon
                                            icon={device === "desktop" ? ComputerIcon : device === "tablet" ? Tablet01Icon : SmartPhone01Icon}
                                            className="h-4 w-4"
                                        />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>{DEVICE_CONFIG[device].label}</TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={() => actions.history.undo()}
                                    disabled={!canUndo}
                                >
                                    <HugeiconsIcon icon={Undo02Icon} className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Undo</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={() => actions.history.redo()}
                                    disabled={!canRedo}
                                >
                                    <HugeiconsIcon icon={Redo02Icon} className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Redo</TooltipContent>
                        </Tooltip>
                    </div>

                    <Separator orientation="vertical" className="h-6" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={!enabled ? "secondary" : "ghost"}
                                size="sm"
                                className="h-9 gap-2"
                                onClick={() => actions.setOptions((options) => (options.enabled = !options.enabled))}
                            >
                                <HugeiconsIcon icon={EyeIcon} className="h-4 w-4" />
                                Preview
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle Preview</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="h-6" />

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9"
                        onClick={() => handleSave(false)}
                        disabled={isPending}
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
                        className="h-9"
                        onClick={() => handleSave(true)}
                        disabled={isPending}
                    >
                        <HugeiconsIcon icon={Upload01Icon} className="h-4 w-4 mr-1.5" />
                        Publish
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <aside className="w-[280px] bg-background border-r border-border flex flex-col shrink-0">
                    <div className="h-12 flex items-center border-b border-border px-2 gap-1">
                        <button
                            onClick={() => setLeftPanelTab("blocks")}
                            className={cn(
                                "flex-1 h-8 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
                                leftPanelTab === "blocks"
                                    ? "bg-muted text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <HugeiconsIcon icon={GridIcon} className="h-4 w-4" />
                            Blocks
                        </button>
                        <button
                            onClick={() => setLeftPanelTab("layers")}
                            className={cn(
                                "flex-1 h-8 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
                                leftPanelTab === "layers"
                                    ? "bg-muted text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <HugeiconsIcon icon={Layers01Icon} className="h-4 w-4" />
                            Layers
                        </button>
                    </div>

                    <ScrollArea className="flex-1">
                        {leftPanelTab === "blocks" ? (
                            <div className="p-3 space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <HugeiconsIcon icon={Search01Icon} className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={blockSearch}
                                        onChange={(e) => setBlockSearch(e.target.value)}
                                        placeholder="Search blocks..."
                                        className="pl-8 h-9"
                                    />
                                </div>

                                {filteredCategories.map((category) => (
                                    <div key={category.name}>
                                        <div className="flex items-center gap-2 mb-2 px-1">
                                            <HugeiconsIcon icon={category.icon} className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                {category.name}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {category.blocks.map((block) => (
                                                <DraggableBlock
                                                    key={block.name}
                                                    name={block.name}
                                                    component={block.component}
                                                    products={products}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-2">
                                <Layers expandRootOnLoad />
                            </div>
                        )}
                    </ScrollArea>
                </aside>

                {/* Canvas */}
                <main
                    className="flex-1 overflow-auto"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)`,
                        backgroundSize: "24px 24px",
                    }}
                >
                    <div className="flex justify-center p-8 pb-24">
                        <div
                            className="bg-background shadow-2xl rounded-xl overflow-hidden ring-1 ring-border/50 transition-all"
                            style={{
                                width: DEVICE_CONFIG[previewDevice].width,
                                maxWidth: previewDevice === "desktop" ? "1400px" : DEVICE_CONFIG[previewDevice].width,
                                minHeight: "80vh",
                            }}
                        >
                            {/* Browser Frame */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border/50">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                                    <div className="w-3 h-3 rounded-full bg-chart-4/60" />
                                    <div className="w-3 h-3 rounded-full bg-chart-2/60" />
                                </div>
                                <div className="flex-1 max-w-md mx-auto">
                                    <div className="px-3 py-1.5 rounded-md bg-background/80 border border-border/50 text-xs text-muted-foreground text-center">
                                        {storeSlug}.yourstore.com/{page.slug}
                                    </div>
                                </div>
                            </div>

                            {/* Page Content */}
                            <Frame>
                                <Element
                                    is={Section}
                                    canvas
                                    padding={{ top: 0, right: 0, bottom: 0, left: 0 }}
                                    backgroundColor="white"
                                    minHeight={600}
                                    maxWidth="full"
                                />
                            </Frame>
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Settings */}
                <SettingsPanel />
            </div>
        </div>
    );
}

interface DraggableBlockProps {
    name: string;
    component: React.ComponentType<Record<string, unknown>>;
    products?: Array<{ id: string; name: string; slug: string; price: number; images: Array<{ url: string }> }>;
}

function DraggableBlock({ name, component: Component, products }: DraggableBlockProps) {
    const { connectors } = useEditor();
    const icon = COMPONENT_ICONS[name.replace(" ", "")] || GridIcon;

    const getDefaultProps = () => {
        if (name === "Product Grid") {
            return { products };
        }
        return {};
    };

    return (
        <div
            ref={(ref) => {
                if (ref) connectors.create(ref, <Component {...getDefaultProps()} />);
            }}
            className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all cursor-grab active:cursor-grabbing"
        >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <HugeiconsIcon icon={icon} className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs font-medium">{name}</span>
        </div>
    );
}

function SettingsPanel() {
    const { selected, actions } = useEditor((state) => {
        const [currentNodeId] = state.events.selected;
        let selected: {
            id: string;
            name: string;
            settings: React.ComponentType | undefined;
            isDeletable: boolean;
        } | undefined;

        if (currentNodeId) {
            selected = {
                id: currentNodeId,
                name: state.nodes[currentNodeId].data.displayName || state.nodes[currentNodeId].data.name,
                settings: state.nodes[currentNodeId].related?.settings as React.ComponentType | undefined,
                isDeletable: currentNodeId !== "ROOT",
            };
        }

        return { selected };
    });

    if (!selected) {
        return (
            <aside className="w-[300px] bg-background border-l border-border flex flex-col shrink-0">
                <div className="flex-1 flex items-center justify-center text-center p-6">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                            <HugeiconsIcon icon={Settings01Icon} className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">No element selected</p>
                        <p className="text-xs text-muted-foreground mt-1">Click on an element to edit its properties</p>
                    </div>
                </div>
            </aside>
        );
    }

    return (
        <aside className="w-[300px] bg-background border-l border-border flex flex-col shrink-0">
            <div className="h-12 flex items-center justify-between px-4 border-b border-border">
                <span className="text-sm font-medium">{selected.name}</span>
                <div className="flex items-center gap-1">
                    {selected.isDeletable && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => actions.delete(selected.id)}
                                >
                                    <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4">
                    {selected.settings && (() => {
                        const SettingsComponent = selected.settings;
                        return <SettingsComponent />;
                    })()}
                </div>
            </ScrollArea>
        </aside>
    );
}
