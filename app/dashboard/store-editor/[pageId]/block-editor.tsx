"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import type { PageBlock, HeroBlock, FeaturedProductsBlock, BannerBlock, TextBlock } from "@/types/page-builder";
import { BLOCK_REGISTRY } from "@/lib/page-builder/block-registry";

interface BlockEditorProps {
    block: PageBlock;
    onUpdate: (updates: Partial<PageBlock>) => void;
    onClose: () => void;
    products: Array<{ id: string; name: string }>;
    categories: Array<{ id: string; name: string }>;
    collections: Array<{ id: string; name: string }>;
    darkMode?: boolean;
}

export function BlockEditor({ block, onUpdate, onClose, products, categories, collections, darkMode = false }: BlockEditorProps) {
    const blockDef = BLOCK_REGISTRY[block.type];

    const updateContent = (key: string, value: unknown) => {
        onUpdate({
            content: { ...(block as { content: Record<string, unknown> }).content, [key]: value },
        } as Partial<PageBlock>);
    };

    const updateSettings = (key: string, value: unknown) => {
        onUpdate({
            settings: { ...block.settings, [key]: value },
        });
    };

    const updateButton = (buttonKey: string, field: string, value: string) => {
        const content = (block as { content: Record<string, unknown> }).content;
        const currentButton = content[buttonKey] as Record<string, unknown> || {};
        onUpdate({
            content: {
                ...content,
                [buttonKey]: { ...currentButton, [field]: value },
            },
        } as Partial<PageBlock>);
    };

    // Style classes - using design tokens
    const inputClass = "";
    const labelClass = "";
    const selectClass = "";

    return (
        <ScrollArea className="flex-1">
            <Tabs defaultValue="content" className="p-3">
                <TabsList className="grid w-full grid-cols-2 h-8">
                    <TabsTrigger 
                        value="content" 
                        className="text-xs"
                    >
                        Content
                    </TabsTrigger>
                    <TabsTrigger 
                        value="style" 
                        className="text-xs"
                    >
                        Style
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-3 space-y-3">
                    {/* Hero Block Editor */}
                    {block.type === "hero" && (
                        <HeroBlockEditor
                            block={block as HeroBlock}
                            updateContent={updateContent}
                            updateButton={updateButton}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Featured Products Block Editor */}
                    {block.type === "featured-products" && (
                        <FeaturedProductsEditor
                            block={block as FeaturedProductsBlock}
                            updateContent={updateContent}
                            products={products}
                            collections={collections}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Product Grid Editor */}
                    {block.type === "product-grid" && (
                        <ProductGridEditor
                            block={block}
                            updateContent={updateContent}
                            categories={categories}
                            collections={collections}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Banner Block Editor */}
                    {block.type === "banner" && (
                        <BannerBlockEditor
                            block={block as BannerBlock}
                            updateContent={updateContent}
                            updateButton={updateButton}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Text Block Editor */}
                    {block.type === "text" && (
                        <TextBlockEditor
                            block={block as TextBlock}
                            updateContent={updateContent}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Rich Text Editor */}
                    {block.type === "rich-text" && (
                        <RichTextEditor
                            block={block}
                            updateContent={updateContent}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Category Grid Editor */}
                    {block.type === "category-grid" && (
                        <CategoryGridEditor
                            block={block}
                            updateContent={updateContent}
                            categories={categories}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Collection Showcase Editor */}
                    {block.type === "collection-showcase" && (
                        <CollectionShowcaseEditor
                            block={block}
                            updateContent={updateContent}
                            collections={collections}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Spacer Editor */}
                    {block.type === "spacer" && (
                        <SpacerEditor 
                            block={block} 
                            updateContent={updateContent} 
                            labelClass={labelClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Divider Editor */}
                    {block.type === "divider" && (
                        <DividerEditor
                            block={block}
                            updateContent={updateContent}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Newsletter Editor */}
                    {block.type === "newsletter" && (
                        <NewsletterEditor 
                            block={block} 
                            updateContent={updateContent}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Testimonials Editor */}
                    {block.type === "testimonials" && (
                        <TestimonialsEditor
                            block={block}
                            updateContent={updateContent}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Countdown Editor */}
                    {block.type === "countdown" && (
                        <CountdownEditor
                            block={block}
                            updateContent={updateContent}
                            updateButton={updateButton}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Contact Form Editor */}
                    {block.type === "contact-form" && (
                        <ContactFormEditor
                            block={block}
                            updateContent={updateContent}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Map Editor */}
                    {block.type === "map" && (
                        <MapEditor
                            block={block}
                            updateContent={updateContent}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* HTML Editor */}
                    {block.type === "html" && (
                        <HTMLEditor
                            block={block}
                            updateContent={updateContent}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Logo Cloud Editor */}
                    {block.type === "logo-cloud" && (
                        <LogoCloudEditor
                            block={block}
                            updateContent={updateContent}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* FAQ Editor */}
                    {block.type === "faq" && (
                        <FAQEditor
                            block={block}
                            updateContent={updateContent}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Announcement Bar Editor */}
                    {block.type === "announcement-bar" && (
                        <AnnouncementBarEditor
                            block={block}
                            updateContent={updateContent}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Image Editor */}
                    {block.type === "image" && (
                        <ImageEditor
                            block={block}
                            updateContent={updateContent}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Image Gallery Editor */}
                    {block.type === "image-gallery" && (
                        <ImageGalleryEditor
                            block={block}
                            updateContent={updateContent}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}

                    {/* Video Editor */}
                    {block.type === "video" && (
                        <VideoEditor
                            block={block}
                            updateContent={updateContent}
                            inputClass={inputClass}
                            labelClass={labelClass}
                            selectClass={selectClass}
                            darkMode={darkMode}
                        />
                    )}
                </TabsContent>

                <TabsContent value="style" className="mt-3 space-y-3">
                    <StyleEditor
                        settings={block.settings}
                        updateSettings={updateSettings}
                        inputClass={inputClass}
                        labelClass={labelClass}
                        selectClass={selectClass}
                        darkMode={darkMode}
                    />
                </TabsContent>
            </Tabs>
        </ScrollArea>
    );
}

// Common props interface
interface EditorProps {
    inputClass: string;
    labelClass: string;
    selectClass: string;
    darkMode: boolean;
}

// Hero Block Editor
function HeroBlockEditor({
    block,
    updateContent,
    updateButton,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: HeroBlock;
    updateContent: (key: string, value: unknown) => void;
    updateButton: (buttonKey: string, field: string, value: string) => void;
} & EditorProps) {
    return (
        <Accordion type="multiple" defaultValue={["text", "buttons"]} className="w-full">
            <AccordionItem value="text" className="border-b border-border">
                <AccordionTrigger className={cn("text-xs py-2", labelClass)}>Text Content</AccordionTrigger>
                <AccordionContent className="space-y-3 pb-3">
                    <div className="space-y-1.5">
                        <Label className={cn("text-xs", labelClass)}>Heading</Label>
                        <Input
                            value={block.content.heading}
                            onChange={(e) => updateContent("heading", e.target.value)}
                            placeholder="Enter heading..."
                            className={cn("h-8 text-sm", inputClass)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={cn("text-xs", labelClass)}>Subheading</Label>
                        <Input
                            value={block.content.subheading || ""}
                            onChange={(e) => updateContent("subheading", e.target.value)}
                            placeholder="Enter subheading..."
                            className={cn("h-8 text-sm", inputClass)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={cn("text-xs", labelClass)}>Description</Label>
                        <Textarea
                            value={block.content.description || ""}
                            onChange={(e) => updateContent("description", e.target.value)}
                            placeholder="Enter description..."
                            rows={2}
                            className={cn("text-sm resize-none", inputClass)}
                        />
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="layout" className="border-b border-border">
                <AccordionTrigger className={cn("text-xs py-2", labelClass)}>Layout</AccordionTrigger>
                <AccordionContent className="space-y-3 pb-3">
                    <div className="space-y-1.5">
                        <Label className={cn("text-xs", labelClass)}>Alignment</Label>
                        <Select value={block.content.layout} onValueChange={(v) => updateContent("layout", v)}>
                            <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="">
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                                <SelectItem value="split">Split</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className={cn("text-xs", labelClass)}>Height</Label>
                        <Select value={block.content.height} onValueChange={(v) => updateContent("height", v)}>
                            <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="">
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                                <SelectItem value="full">Full Screen</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="buttons" className="border-b border-border">
                <AccordionTrigger className={cn("text-xs py-2", labelClass)}>Buttons</AccordionTrigger>
                <AccordionContent className="space-y-3 pb-3">
                    <div className="space-y-2 rounded-md border border-border p-2">
                        <Label className={cn("text-[10px] font-medium uppercase", labelClass)}>Primary Button</Label>
                        <Input
                            value={block.content.primaryButton?.text || ""}
                            onChange={(e) => updateButton("primaryButton", "text", e.target.value)}
                            placeholder="Button text"
                            className={cn("h-7 text-xs", inputClass)}
                        />
                        <Input
                            value={block.content.primaryButton?.link || ""}
                            onChange={(e) => updateButton("primaryButton", "link", e.target.value)}
                            placeholder="/products"
                            className={cn("h-7 text-xs", inputClass)}
                        />
                    </div>
                    <div className="space-y-2 rounded-md border border-border p-2">
                        <Label className={cn("text-[10px] font-medium uppercase", labelClass)}>Secondary Button</Label>
                        <Input
                            value={block.content.secondaryButton?.text || ""}
                            onChange={(e) => updateButton("secondaryButton", "text", e.target.value)}
                            placeholder="Button text (optional)"
                            className={cn("h-7 text-xs", inputClass)}
                        />
                        <Input
                            value={block.content.secondaryButton?.link || ""}
                            onChange={(e) => updateButton("secondaryButton", "link", e.target.value)}
                            placeholder="/about"
                            className={cn("h-7 text-xs", inputClass)}
                        />
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="background" className="border-b border-border">
                <AccordionTrigger className={cn("text-xs py-2", labelClass)}>Background</AccordionTrigger>
                <AccordionContent className="space-y-3 pb-3">
                    <div className="space-y-1.5">
                        <Label className={cn("text-xs", labelClass)}>Image URL</Label>
                        <Input
                            value={block.content.backgroundImage || ""}
                            onChange={(e) => updateContent("backgroundImage", e.target.value)}
                            placeholder="https://..."
                            className={cn("h-8 text-sm", inputClass)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className={cn("text-xs", labelClass)}>Overlay: {block.content.overlayOpacity || 0}%</Label>
                        <Slider
                            value={[block.content.overlayOpacity || 0]}
                            onValueChange={([v]) => updateContent("overlayOpacity", v)}
                            max={100}
                            step={5}
                            className={darkMode ? "[&_[role=slider]]:bg-white" : ""}
                        />
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

// Featured Products Editor
function FeaturedProductsEditor({
    block,
    updateContent,
    collections,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: FeaturedProductsBlock;
    updateContent: (key: string, value: unknown) => void;
    products: Array<{ id: string; name: string }>;
    collections: Array<{ id: string; name: string }>;
} & EditorProps) {
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Heading</Label>
                <Input
                    value={block.content.heading || ""}
                    onChange={(e) => updateContent("heading", e.target.value)}
                    placeholder="Section heading"
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Subheading</Label>
                <Input
                    value={block.content.subheading || ""}
                    onChange={(e) => updateContent("subheading", e.target.value)}
                    placeholder="Section subheading"
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Source</Label>
                <Select value={block.content.source} onValueChange={(v) => updateContent("source", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="latest">Latest Products</SelectItem>
                        <SelectItem value="bestselling">Best Selling</SelectItem>
                        <SelectItem value="collection">From Collection</SelectItem>
                        <SelectItem value="manual">Manual Selection</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {block.content.source === "collection" && (
                <div className="space-y-1.5">
                    <Label className={cn("text-xs", labelClass)}>Collection</Label>
                    <Select value={block.content.collectionId || ""} onValueChange={(v) => updateContent("collectionId", v)}>
                        <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                            <SelectValue placeholder="Select collection" />
                        </SelectTrigger>
                        <SelectContent className="">
                            {collections.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                    <Label className={cn("text-xs", labelClass)}>Products</Label>
                    <Select value={String(block.content.limit)} onValueChange={(v) => updateContent("limit", parseInt(v))}>
                        <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="">
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="6">6</SelectItem>
                            <SelectItem value="8">8</SelectItem>
                            <SelectItem value="12">12</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className={cn("text-xs", labelClass)}>Columns</Label>
                    <Select value={String(block.content.columns)} onValueChange={(v) => updateContent("columns", parseInt(v))}>
                        <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="">
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs", labelClass)}>Show Price</Label>
                    <Switch checked={block.content.showPrice} onCheckedChange={(v) => updateContent("showPrice", v)} />
                </div>
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs", labelClass)}>Show Add to Cart</Label>
                    <Switch checked={block.content.showAddToCart} onCheckedChange={(v) => updateContent("showAddToCart", v)} />
                </div>
            </div>
        </div>
    );
}

// Banner Block Editor
function BannerBlockEditor({
    block,
    updateContent,
    updateButton,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: BannerBlock;
    updateContent: (key: string, value: unknown) => void;
    updateButton: (buttonKey: string, field: string, value: string) => void;
} & EditorProps) {
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Image URL</Label>
                <Input
                    value={block.content.image}
                    onChange={(e) => updateContent("image", e.target.value)}
                    placeholder="https://..."
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Heading</Label>
                <Input
                    value={block.content.heading || ""}
                    onChange={(e) => updateContent("heading", e.target.value)}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Description</Label>
                <Textarea
                    value={block.content.description || ""}
                    onChange={(e) => updateContent("description", e.target.value)}
                    rows={2}
                    className={cn("text-sm resize-none", inputClass)}
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                    <Label className={cn("text-xs", labelClass)}>Position</Label>
                    <Select value={block.content.textPosition} onValueChange={(v) => updateContent("textPosition", v)}>
                        <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="">
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className={cn("text-xs", labelClass)}>Height</Label>
                    <Select value={block.content.height} onValueChange={(v) => updateContent("height", v)}>
                        <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="">
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2 rounded-md border border-border p-2">
                <Label className={cn("text-[10px] font-medium uppercase", labelClass)}>Button</Label>
                <Input
                    value={block.content.button?.text || ""}
                    onChange={(e) => updateButton("button", "text", e.target.value)}
                    placeholder="Button text"
                    className={cn("h-7 text-xs", inputClass)}
                />
                <Input
                    value={block.content.button?.link || ""}
                    onChange={(e) => updateButton("button", "link", e.target.value)}
                    placeholder="/products"
                    className={cn("h-7 text-xs", inputClass)}
                />
            </div>
        </div>
    );
}

// Text Block Editor
function TextBlockEditor({
    block,
    updateContent,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: TextBlock;
    updateContent: (key: string, value: unknown) => void;
} & EditorProps) {
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Text Content</Label>
                <Textarea
                    value={block.content.text}
                    onChange={(e) => updateContent("text", e.target.value)}
                    rows={4}
                    placeholder="Enter your text..."
                    className={cn("text-sm resize-none", inputClass)}
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                    <Label className={cn("text-xs", labelClass)}>Alignment</Label>
                    <Select value={block.content.alignment} onValueChange={(v) => updateContent("alignment", v)}>
                        <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="">
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className={cn("text-xs", labelClass)}>Size</Label>
                    <Select value={block.content.size} onValueChange={(v) => updateContent("size", v)}>
                        <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="">
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

// Category Grid Editor
function CategoryGridEditor({
    block,
    updateContent,
    categories,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
    categories: Array<{ id: string; name: string }>;
} & EditorProps) {
    const content = (block as { content: Record<string, unknown> }).content;
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Heading</Label>
                <Input
                    value={(content.heading as string) || ""}
                    onChange={(e) => updateContent("heading", e.target.value)}
                    placeholder="Section heading"
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                    <Label className={cn("text-xs", labelClass)}>Columns</Label>
                    <Select value={String(content.columns || 3)} onValueChange={(v) => updateContent("columns", parseInt(v))}>
                        <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="">
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="6">6</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className={cn("text-xs", labelClass)}>Style</Label>
                    <Select value={(content.style as string) || "card"} onValueChange={(v) => updateContent("style", v)}>
                        <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="">
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="overlay">Overlay</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs", labelClass)}>Show All</Label>
                    <Switch checked={(content.showAll as boolean) ?? true} onCheckedChange={(v) => updateContent("showAll", v)} />
                </div>
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs", labelClass)}>Show Count</Label>
                    <Switch checked={(content.showProductCount as boolean) ?? true} onCheckedChange={(v) => updateContent("showProductCount", v)} />
                </div>
            </div>
        </div>
    );
}

// Spacer Editor
function SpacerEditor({
    block,
    updateContent,
    labelClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
    labelClass: string;
    darkMode: boolean;
}) {
    const content = (block as { content: Record<string, unknown> }).content;
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Desktop: {content.height as number || 64}px</Label>
                <Slider
                    value={[(content.height as number) || 64]}
                    onValueChange={([v]) => updateContent("height", v)}
                    min={8}
                    max={200}
                    step={8}
                    className={darkMode ? "[&_[role=slider]]:bg-white" : ""}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Mobile: {content.mobileHeight as number || 32}px</Label>
                <Slider
                    value={[(content.mobileHeight as number) || 32]}
                    onValueChange={([v]) => updateContent("mobileHeight", v)}
                    min={8}
                    max={100}
                    step={8}
                    className={darkMode ? "[&_[role=slider]]:bg-white" : ""}
                />
            </div>
        </div>
    );
}

// Newsletter Editor
function NewsletterEditor({
    block,
    updateContent,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
} & EditorProps) {
    const content = (block as { content: Record<string, unknown> }).content;
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Heading</Label>
                <Input
                    value={(content.heading as string) || ""}
                    onChange={(e) => updateContent("heading", e.target.value)}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Description</Label>
                <Textarea
                    value={(content.description as string) || ""}
                    onChange={(e) => updateContent("description", e.target.value)}
                    rows={2}
                    className={cn("text-sm resize-none", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Placeholder</Label>
                <Input
                    value={(content.placeholder as string) || ""}
                    onChange={(e) => updateContent("placeholder", e.target.value)}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Button Text</Label>
                <Input
                    value={(content.buttonText as string) || ""}
                    onChange={(e) => updateContent("buttonText", e.target.value)}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Layout</Label>
                <Select value={(content.layout as string) || "inline"} onValueChange={(v) => updateContent("layout", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="inline">Inline</SelectItem>
                        <SelectItem value="stacked">Stacked</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

// Style Editor
function StyleEditor({
    settings,
    updateSettings,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    settings: PageBlock["settings"];
    updateSettings: (key: string, value: unknown) => void;
} & EditorProps) {
    const padding = settings.padding || { top: 0, right: 0, bottom: 0, left: 0 };

    const updatePadding = (side: string, value: number) => {
        updateSettings("padding", { ...padding, [side]: value });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className={cn("text-xs font-medium", labelClass)}>Padding</Label>
                <div className="grid grid-cols-2 gap-2">
                    {["top", "bottom", "left", "right"].map((side) => (
                        <div key={side} className="space-y-1">
                            <Label className={cn("text-[10px] text-gray-500 capitalize")}>{side}</Label>
                            <Input
                                type="number"
                                value={padding[side as keyof typeof padding]}
                                onChange={(e) => updatePadding(side, parseInt(e.target.value) || 0)}
                                min={0}
                                className={cn("h-7 text-xs", inputClass)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Background</Label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={settings.backgroundColor || "#ffffff"}
                        onChange={(e) => updateSettings("backgroundColor", e.target.value)}
                        className="h-8 w-12 p-1 cursor-pointer"
                    />
                    <Input
                        value={settings.backgroundColor || ""}
                        onChange={(e) => updateSettings("backgroundColor", e.target.value)}
                        placeholder="transparent"
                        className={cn("h-8 text-sm flex-1", inputClass)}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Max Width</Label>
                <Select value={settings.maxWidth || "container"} onValueChange={(v) => updateSettings("maxWidth", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="full">Full Width</SelectItem>
                        <SelectItem value="container">Container</SelectItem>
                        <SelectItem value="narrow">Narrow</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Border Radius</Label>
                <Select value={settings.borderRadius || "none"} onValueChange={(v) => updateSettings("borderRadius", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="md">Medium</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>CSS Class</Label>
                <Input
                    value={settings.customClasses || ""}
                    onChange={(e) => updateSettings("customClasses", e.target.value)}
                    placeholder="my-custom-class"
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>

            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>ID</Label>
                <Input
                    value={settings.customId || ""}
                    onChange={(e) => updateSettings("customId", e.target.value)}
                    placeholder="my-section"
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
        </div>
    );
}

// Product Grid Editor
function ProductGridEditor({
    block,
    updateContent,
    categories,
    collections,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
    categories: Array<{ id: string; name: string }>;
    collections: Array<{ id: string; name: string }>;
} & EditorProps) {
    const content = (block as { content: Record<string, unknown> }).content;
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Heading</Label>
                <Input
                    value={(content.heading as string) || ""}
                    onChange={(e) => updateContent("heading", e.target.value)}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Source</Label>
                <Select value={(content.source as string) || "all"} onValueChange={(v) => updateContent("source", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="all">All Products</SelectItem>
                        <SelectItem value="category">By Category</SelectItem>
                        <SelectItem value="collection">By Collection</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {content.source === "category" && (
                <div className="space-y-1.5">
                    <Label className={cn("text-xs", labelClass)}>Category</Label>
                    <Select value={(content.categoryId as string) || ""} onValueChange={(v) => updateContent("categoryId", v)}>
                        <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="">
                            {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            {content.source === "collection" && (
                <div className="space-y-1.5">
                    <Label className={cn("text-xs", labelClass)}>Collection</Label>
                    <Select value={(content.collectionId as string) || ""} onValueChange={(v) => updateContent("collectionId", v)}>
                        <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                            <SelectValue placeholder="Select collection" />
                        </SelectTrigger>
                        <SelectContent className="">
                            {collections.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                    <Label className={cn("text-xs", labelClass)}>Limit</Label>
                    <Select value={String(content.limit || 12)} onValueChange={(v) => updateContent("limit", parseInt(v))}>
                        <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="">
                            <SelectItem value="8">8</SelectItem>
                            <SelectItem value="12">12</SelectItem>
                            <SelectItem value="16">16</SelectItem>
                            <SelectItem value="24">24</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className={cn("text-xs", labelClass)}>Columns</Label>
                    <Select value={String(content.columns || 4)} onValueChange={(v) => updateContent("columns", parseInt(v))}>
                        <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="">
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs", labelClass)}>Show Filters</Label>
                    <Switch checked={(content.showFilters as boolean) ?? true} onCheckedChange={(v) => updateContent("showFilters", v)} />
                </div>
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs", labelClass)}>Show Sorting</Label>
                    <Switch checked={(content.showSorting as boolean) ?? true} onCheckedChange={(v) => updateContent("showSorting", v)} />
                </div>
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs", labelClass)}>Show Pagination</Label>
                    <Switch checked={(content.showPagination as boolean) ?? true} onCheckedChange={(v) => updateContent("showPagination", v)} />
                </div>
            </div>
        </div>
    );
}

// Collection Showcase Editor
function CollectionShowcaseEditor({
    block,
    updateContent,
    collections,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
    collections: Array<{ id: string; name: string }>;
} & EditorProps) {
    const content = (block as { content: Record<string, unknown> }).content;
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Collection</Label>
                <Select value={(content.collectionId as string) || ""} onValueChange={(v) => updateContent("collectionId", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue placeholder="Select collection" />
                    </SelectTrigger>
                    <SelectContent className="">
                        {collections.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Heading</Label>
                <Input
                    value={(content.heading as string) || ""}
                    onChange={(e) => updateContent("heading", e.target.value)}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Layout</Label>
                <Select value={(content.layout as string) || "grid"} onValueChange={(v) => updateContent("layout", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="grid">Grid</SelectItem>
                        <SelectItem value="carousel">Carousel</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Product Limit</Label>
                <Select value={String(content.productLimit || 4)} onValueChange={(v) => updateContent("productLimit", parseInt(v))}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center justify-between pt-2">
                <Label className={cn("text-xs", labelClass)}>Show Description</Label>
                <Switch checked={(content.showDescription as boolean) ?? true} onCheckedChange={(v) => updateContent("showDescription", v)} />
            </div>
        </div>
    );
}

// Rich Text Editor
function RichTextEditor({
    block,
    updateContent,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
} & EditorProps) {
    const content = (block as { content: Record<string, unknown> }).content;
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>HTML Content</Label>
                <Textarea
                    value={(content.html as string) || ""}
                    onChange={(e) => updateContent("html", e.target.value)}
                    rows={8}
                    placeholder="<p>Your content here...</p>"
                    className={cn("text-sm font-mono resize-none", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Alignment</Label>
                <Select value={(content.alignment as string) || "left"} onValueChange={(v) => updateContent("alignment", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

// Divider Editor
function DividerEditor({
    block,
    updateContent,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
} & EditorProps) {
    const content = (block as { content: Record<string, unknown> }).content;
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Style</Label>
                <Select value={(content.style as string) || "solid"} onValueChange={(v) => updateContent("style", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="dashed">Dashed</SelectItem>
                        <SelectItem value="dotted">Dotted</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Width</Label>
                <Select value={(content.width as string) || "full"} onValueChange={(v) => updateContent("width", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="short">Short</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Thickness: {(content.thickness as number) || 1}px</Label>
                <Slider
                    value={[(content.thickness as number) || 1]}
                    onValueChange={([v]) => updateContent("thickness", v)}
                    min={1}
                    max={8}
                    step={1}
                    className={darkMode ? "[&_[role=slider]]:bg-white" : ""}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Color</Label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={(content.color as string) || "#e5e7eb"}
                        onChange={(e) => updateContent("color", e.target.value)}
                        className="h-8 w-12 p-1 cursor-pointer"
                    />
                    <Input
                        value={(content.color as string) || ""}
                        onChange={(e) => updateContent("color", e.target.value)}
                        placeholder="#e5e7eb"
                        className={cn("h-8 text-sm flex-1", inputClass)}
                    />
                </div>
            </div>
        </div>
    );
}

// Testimonials Editor
function TestimonialsEditor({
    block,
    updateContent,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
} & EditorProps) {
    const content = (block as { content: Record<string, unknown> }).content;
    const testimonials = (content.testimonials as Array<{ id: string; quote: string; author: string; role?: string; rating?: number }>) || [];

    const addTestimonial = () => {
        updateContent("testimonials", [
            ...testimonials,
            { id: crypto.randomUUID(), quote: "", author: "", role: "", rating: 5 },
        ]);
    };

    const updateTestimonial = (index: number, field: string, value: unknown) => {
        const updated = [...testimonials];
        updated[index] = { ...updated[index], [field]: value };
        updateContent("testimonials", updated);
    };

    const removeTestimonial = (index: number) => {
        updateContent("testimonials", testimonials.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Heading</Label>
                <Input
                    value={(content.heading as string) || ""}
                    onChange={(e) => updateContent("heading", e.target.value)}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Layout</Label>
                <Select value={(content.layout as string) || "carousel"} onValueChange={(v) => updateContent("layout", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="carousel">Carousel</SelectItem>
                        <SelectItem value="grid">Grid</SelectItem>
                        <SelectItem value="single">Single</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center justify-between">
                <Label className={cn("text-xs", labelClass)}>Show Rating</Label>
                <Switch checked={(content.showRating as boolean) ?? true} onCheckedChange={(v) => updateContent("showRating", v)} />
            </div>
            <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs font-medium", labelClass)}>Testimonials</Label>
                    <Button size="sm" variant="ghost" onClick={addTestimonial} className="h-6 px-2 text-xs">
                        <HugeiconsIcon icon={Add01Icon} className="h-3 w-3 mr-1" /> Add
                    </Button>
                </div>
                {testimonials.map((t, i) => (
                    <div key={t.id} className={cn("space-y-2 p-2 rounded border", darkMode ? "border-[#444]" : "border-gray-200")}>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500">#{i + 1}</span>
                            <Button size="sm" variant="ghost" onClick={() => removeTestimonial(i)} className="h-5 w-5 p-0">
                                <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3 text-red-500" />
                            </Button>
                        </div>
                        <Textarea
                            value={t.quote}
                            onChange={(e) => updateTestimonial(i, "quote", e.target.value)}
                            placeholder="Quote..."
                            rows={2}
                            className={cn("text-xs resize-none", inputClass)}
                        />
                        <Input
                            value={t.author}
                            onChange={(e) => updateTestimonial(i, "author", e.target.value)}
                            placeholder="Author name"
                            className={cn("h-7 text-xs", inputClass)}
                        />
                        <Input
                            value={t.role || ""}
                            onChange={(e) => updateTestimonial(i, "role", e.target.value)}
                            placeholder="Role (optional)"
                            className={cn("h-7 text-xs", inputClass)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Countdown Editor
function CountdownEditor({
    block,
    updateContent,
    updateButton,
    inputClass,
    labelClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
    updateButton: (buttonKey: string, field: string, value: string) => void;
} & Omit<EditorProps, "selectClass">) {
    const content = (block as { content: Record<string, unknown> }).content;
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Heading</Label>
                <Input
                    value={(content.heading as string) || ""}
                    onChange={(e) => updateContent("heading", e.target.value)}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Description</Label>
                <Textarea
                    value={(content.description as string) || ""}
                    onChange={(e) => updateContent("description", e.target.value)}
                    rows={2}
                    className={cn("text-sm resize-none", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>End Date</Label>
                <Input
                    type="datetime-local"
                    value={(content.endDate as string)?.slice(0, 16) || ""}
                    onChange={(e) => updateContent("endDate", new Date(e.target.value).toISOString())}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Expired Message</Label>
                <Input
                    value={(content.expiredMessage as string) || ""}
                    onChange={(e) => updateContent("expiredMessage", e.target.value)}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs", labelClass)}>Days</Label>
                    <Switch checked={(content.showDays as boolean) ?? true} onCheckedChange={(v) => updateContent("showDays", v)} />
                </div>
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs", labelClass)}>Hours</Label>
                    <Switch checked={(content.showHours as boolean) ?? true} onCheckedChange={(v) => updateContent("showHours", v)} />
                </div>
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs", labelClass)}>Minutes</Label>
                    <Switch checked={(content.showMinutes as boolean) ?? true} onCheckedChange={(v) => updateContent("showMinutes", v)} />
                </div>
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs", labelClass)}>Seconds</Label>
                    <Switch checked={(content.showSeconds as boolean) ?? true} onCheckedChange={(v) => updateContent("showSeconds", v)} />
                </div>
            </div>
            <div className="space-y-2 rounded-md border border-border p-2 mt-2">
                <Label className={cn("text-[10px] font-medium uppercase", labelClass)}>Button (Optional)</Label>
                <Input
                    value={((content.button as Record<string, string>)?.text) || ""}
                    onChange={(e) => updateButton("button", "text", e.target.value)}
                    placeholder="Button text"
                    className={cn("h-7 text-xs", inputClass)}
                />
                <Input
                    value={((content.button as Record<string, string>)?.link) || ""}
                    onChange={(e) => updateButton("button", "link", e.target.value)}
                    placeholder="/products"
                    className={cn("h-7 text-xs", inputClass)}
                />
            </div>
        </div>
    );
}

// Contact Form Editor
function ContactFormEditor({
    block,
    updateContent,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
} & EditorProps) {
    const content = (block as { content: Record<string, unknown> }).content;
    const fields = (content.fields as Array<{ id: string; type: string; label: string; placeholder?: string; required: boolean }>) || [];

    const addField = () => {
        updateContent("fields", [
            ...fields,
            { id: crypto.randomUUID(), type: "text", label: "", placeholder: "", required: false },
        ]);
    };

    const updateField = (index: number, key: string, value: unknown) => {
        const updated = [...fields];
        updated[index] = { ...updated[index], [key]: value };
        updateContent("fields", updated);
    };

    const removeField = (index: number) => {
        updateContent("fields", fields.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Heading</Label>
                <Input
                    value={(content.heading as string) || ""}
                    onChange={(e) => updateContent("heading", e.target.value)}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Description</Label>
                <Textarea
                    value={(content.description as string) || ""}
                    onChange={(e) => updateContent("description", e.target.value)}
                    rows={2}
                    className={cn("text-sm resize-none", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Submit Button Text</Label>
                <Input
                    value={(content.submitText as string) || ""}
                    onChange={(e) => updateContent("submitText", e.target.value)}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Success Message</Label>
                <Input
                    value={(content.successMessage as string) || ""}
                    onChange={(e) => updateContent("successMessage", e.target.value)}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs font-medium", labelClass)}>Form Fields</Label>
                    <Button size="sm" variant="ghost" onClick={addField} className="h-6 px-2 text-xs">
                        <HugeiconsIcon icon={Add01Icon} className="h-3 w-3 mr-1" /> Add
                    </Button>
                </div>
                {fields.map((f, i) => (
                    <div key={f.id} className={cn("space-y-2 p-2 rounded border", darkMode ? "border-[#444]" : "border-gray-200")}>
                        <div className="flex justify-between items-center">
                            <Select value={f.type} onValueChange={(v) => updateField(i, "type", v)}>
                                <SelectTrigger className={cn("h-6 text-xs w-24", selectClass)}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="">
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">Phone</SelectItem>
                                    <SelectItem value="textarea">Textarea</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button size="sm" variant="ghost" onClick={() => removeField(i)} className="h-5 w-5 p-0">
                                <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3 text-red-500" />
                            </Button>
                        </div>
                        <Input
                            value={f.label}
                            onChange={(e) => updateField(i, "label", e.target.value)}
                            placeholder="Label"
                            className={cn("h-7 text-xs", inputClass)}
                        />
                        <div className="flex items-center justify-between">
                            <Label className={cn("text-[10px]", labelClass)}>Required</Label>
                            <Switch checked={f.required} onCheckedChange={(v) => updateField(i, "required", v)} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Map Editor
function MapEditor({
    block,
    updateContent,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
} & EditorProps) {
    const content = (block as { content: Record<string, unknown> }).content;
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Address</Label>
                <Textarea
                    value={(content.address as string) || ""}
                    onChange={(e) => updateContent("address", e.target.value)}
                    rows={2}
                    placeholder="123 Main St, City, Country"
                    className={cn("text-sm resize-none", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Height: {(content.height as number) || 400}px</Label>
                <Slider
                    value={[(content.height as number) || 400]}
                    onValueChange={([v]) => updateContent("height", v)}
                    min={200}
                    max={600}
                    step={50}
                    className={darkMode ? "[&_[role=slider]]:bg-white" : ""}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Zoom: {(content.zoom as number) || 14}</Label>
                <Slider
                    value={[(content.zoom as number) || 14]}
                    onValueChange={([v]) => updateContent("zoom", v)}
                    min={8}
                    max={18}
                    step={1}
                    className={darkMode ? "[&_[role=slider]]:bg-white" : ""}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Style</Label>
                <Select value={(content.style as string) || "default"} onValueChange={(v) => updateContent("style", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center justify-between pt-2">
                <Label className={cn("text-xs", labelClass)}>Show Marker</Label>
                <Switch checked={(content.showMarker as boolean) ?? true} onCheckedChange={(v) => updateContent("showMarker", v)} />
            </div>
        </div>
    );
}

// HTML Editor
function HTMLEditor({
    block,
    updateContent,
    inputClass,
    labelClass,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
    inputClass: string;
    labelClass: string;
    darkMode: boolean;
}) {
    const content = (block as { content: Record<string, unknown> }).content;
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Custom HTML</Label>
                <Textarea
                    value={(content.code as string) || ""}
                    onChange={(e) => updateContent("code", e.target.value)}
                    rows={12}
                    placeholder="<!-- Your custom HTML here -->"
                    className={cn("text-sm font-mono resize-none", inputClass)}
                />
            </div>
            <p className="text-[10px] text-gray-500">
                ⚠️ Custom HTML is rendered as-is. Be careful with scripts.
            </p>
        </div>
    );
}

// Logo Cloud Editor
function LogoCloudEditor({
    block,
    updateContent,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
} & EditorProps) {
    const content = (block as { content: Record<string, unknown> }).content;
    const logos = (content.logos as Array<{ src: string; alt: string; link?: string }>) || [];

    const addLogo = () => {
        updateContent("logos", [...logos, { src: "", alt: "", link: "" }]);
    };

    const updateLogo = (index: number, field: string, value: string) => {
        const updated = [...logos];
        updated[index] = { ...updated[index], [field]: value };
        updateContent("logos", updated);
    };

    const removeLogo = (index: number) => {
        updateContent("logos", logos.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Heading</Label>
                <Input
                    value={(content.heading as string) || ""}
                    onChange={(e) => updateContent("heading", e.target.value)}
                    placeholder="Trusted By"
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Columns</Label>
                <Select value={String(content.columns || 5)} onValueChange={(v) => updateContent("columns", parseInt(v))}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center justify-between">
                <Label className={cn("text-xs", labelClass)}>Grayscale</Label>
                <Switch checked={(content.grayscale as boolean) ?? true} onCheckedChange={(v) => updateContent("grayscale", v)} />
            </div>
            <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs font-medium", labelClass)}>Logos</Label>
                    <Button size="sm" variant="ghost" onClick={addLogo} className="h-6 px-2 text-xs">
                        <HugeiconsIcon icon={Add01Icon} className="h-3 w-3 mr-1" /> Add
                    </Button>
                </div>
                {logos.map((logo, i) => (
                    <div key={i} className={cn("space-y-2 p-2 rounded border", darkMode ? "border-[#444]" : "border-gray-200")}>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500">Logo #{i + 1}</span>
                            <Button size="sm" variant="ghost" onClick={() => removeLogo(i)} className="h-5 w-5 p-0">
                                <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3 text-red-500" />
                            </Button>
                        </div>
                        <Input
                            value={logo.src}
                            onChange={(e) => updateLogo(i, "src", e.target.value)}
                            placeholder="Image URL"
                            className={cn("h-7 text-xs", inputClass)}
                        />
                        <Input
                            value={logo.alt}
                            onChange={(e) => updateLogo(i, "alt", e.target.value)}
                            placeholder="Alt text"
                            className={cn("h-7 text-xs", inputClass)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// FAQ Editor
function FAQEditor({
    block,
    updateContent,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
} & EditorProps) {
    const content = (block as { content: Record<string, unknown> }).content;
    const items = (content.items as Array<{ id: string; question: string; answer: string }>) || [];

    const addItem = () => {
        updateContent("items", [
            ...items,
            { id: crypto.randomUUID(), question: "", answer: "" },
        ]);
    };

    const updateItem = (index: number, field: string, value: string) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        updateContent("items", updated);
    };

    const removeItem = (index: number) => {
        updateContent("items", items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Heading</Label>
                <Input
                    value={(content.heading as string) || ""}
                    onChange={(e) => updateContent("heading", e.target.value)}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Description</Label>
                <Textarea
                    value={(content.description as string) || ""}
                    onChange={(e) => updateContent("description", e.target.value)}
                    rows={2}
                    className={cn("text-sm resize-none", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Layout</Label>
                <Select value={(content.layout as string) || "accordion"} onValueChange={(v) => updateContent("layout", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="accordion">Accordion</SelectItem>
                        <SelectItem value="grid">Grid</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs font-medium", labelClass)}>Questions</Label>
                    <Button size="sm" variant="ghost" onClick={addItem} className="h-6 px-2 text-xs">
                        <HugeiconsIcon icon={Add01Icon} className="h-3 w-3 mr-1" /> Add
                    </Button>
                </div>
                {items.map((item, i) => (
                    <div key={item.id} className={cn("space-y-2 p-2 rounded border", darkMode ? "border-[#444]" : "border-gray-200")}>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500">Q{i + 1}</span>
                            <Button size="sm" variant="ghost" onClick={() => removeItem(i)} className="h-5 w-5 p-0">
                                <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3 text-red-500" />
                            </Button>
                        </div>
                        <Input
                            value={item.question}
                            onChange={(e) => updateItem(i, "question", e.target.value)}
                            placeholder="Question"
                            className={cn("h-7 text-xs", inputClass)}
                        />
                        <Textarea
                            value={item.answer}
                            onChange={(e) => updateItem(i, "answer", e.target.value)}
                            placeholder="Answer"
                            rows={2}
                            className={cn("text-xs resize-none", inputClass)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Announcement Bar Editor
function AnnouncementBarEditor({
    block,
    updateContent,
    inputClass,
    labelClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
    inputClass: string;
    labelClass: string;
    darkMode: boolean;
}) {
    const content = (block as { content: Record<string, unknown> }).content;
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Text</Label>
                <Input
                    value={(content.text as string) || ""}
                    onChange={(e) => updateContent("text", e.target.value)}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Link (optional)</Label>
                <Input
                    value={(content.link as string) || ""}
                    onChange={(e) => updateContent("link", e.target.value)}
                    placeholder="/products"
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Background Color</Label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={(content.backgroundColor as string) || "#000000"}
                        onChange={(e) => updateContent("backgroundColor", e.target.value)}
                        className="h-8 w-12 p-1 cursor-pointer"
                    />
                    <Input
                        value={(content.backgroundColor as string) || ""}
                        onChange={(e) => updateContent("backgroundColor", e.target.value)}
                        className={cn("h-8 text-sm flex-1", inputClass)}
                    />
                </div>
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Text Color</Label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={(content.textColor as string) || "#ffffff"}
                        onChange={(e) => updateContent("textColor", e.target.value)}
                        className="h-8 w-12 p-1 cursor-pointer"
                    />
                    <Input
                        value={(content.textColor as string) || ""}
                        onChange={(e) => updateContent("textColor", e.target.value)}
                        className={cn("h-8 text-sm flex-1", inputClass)}
                    />
                </div>
            </div>
            <div className="flex items-center justify-between pt-2">
                <Label className={cn("text-xs", labelClass)}>Dismissible</Label>
                <Switch checked={(content.dismissible as boolean) ?? true} onCheckedChange={(v) => updateContent("dismissible", v)} />
            </div>
        </div>
    );
}

// Image Editor
function ImageEditor({
    block,
    updateContent,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
} & EditorProps) {
    const content = (block as { content: Record<string, unknown> }).content;
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Image URL</Label>
                <Input
                    value={(content.src as string) || ""}
                    onChange={(e) => updateContent("src", e.target.value)}
                    placeholder="https://..."
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Alt Text</Label>
                <Input
                    value={(content.alt as string) || ""}
                    onChange={(e) => updateContent("alt", e.target.value)}
                    placeholder="Image description"
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Link (optional)</Label>
                <Input
                    value={(content.link as string) || ""}
                    onChange={(e) => updateContent("link", e.target.value)}
                    placeholder="/products"
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Width</Label>
                <Select value={(content.width as string) || "contained"} onValueChange={(v) => updateContent("width", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="full">Full Width</SelectItem>
                        <SelectItem value="contained">Contained</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Aspect Ratio</Label>
                <Select value={(content.aspectRatio as string) || "auto"} onValueChange={(v) => updateContent("aspectRatio", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="1:1">Square (1:1)</SelectItem>
                        <SelectItem value="4:3">Standard (4:3)</SelectItem>
                        <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                        <SelectItem value="21:9">Ultrawide (21:9)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Caption</Label>
                <Input
                    value={(content.caption as string) || ""}
                    onChange={(e) => updateContent("caption", e.target.value)}
                    placeholder="Optional caption"
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
        </div>
    );
}

// Image Gallery Editor
function ImageGalleryEditor({
    block,
    updateContent,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
} & EditorProps) {
    const content = (block as { content: Record<string, unknown> }).content;
    const images = (content.images as Array<{ src: string; alt: string; caption?: string }>) || [];

    const addImage = () => {
        updateContent("images", [...images, { src: "", alt: "", caption: "" }]);
    };

    const updateImage = (index: number, field: string, value: string) => {
        const updated = [...images];
        updated[index] = { ...updated[index], [field]: value };
        updateContent("images", updated);
    };

    const removeImage = (index: number) => {
        updateContent("images", images.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Layout</Label>
                <Select value={(content.layout as string) || "grid"} onValueChange={(v) => updateContent("layout", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="grid">Grid</SelectItem>
                        <SelectItem value="masonry">Masonry</SelectItem>
                        <SelectItem value="carousel">Carousel</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                    <Label className={cn("text-xs", labelClass)}>Columns</Label>
                    <Select value={String(content.columns || 3)} onValueChange={(v) => updateContent("columns", parseInt(v))}>
                        <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="">
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className={cn("text-xs", labelClass)}>Gap</Label>
                    <Select value={(content.gap as string) || "medium"} onValueChange={(v) => updateContent("gap", v)}>
                        <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="">
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <Label className={cn("text-xs", labelClass)}>Lightbox</Label>
                <Switch checked={(content.lightbox as boolean) ?? true} onCheckedChange={(v) => updateContent("lightbox", v)} />
            </div>
            <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs font-medium", labelClass)}>Images</Label>
                    <Button size="sm" variant="ghost" onClick={addImage} className="h-6 px-2 text-xs">
                        <HugeiconsIcon icon={Add01Icon} className="h-3 w-3 mr-1" /> Add
                    </Button>
                </div>
                {images.map((img, i) => (
                    <div key={i} className={cn("space-y-2 p-2 rounded border", darkMode ? "border-[#444]" : "border-gray-200")}>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500">Image #{i + 1}</span>
                            <Button size="sm" variant="ghost" onClick={() => removeImage(i)} className="h-5 w-5 p-0">
                                <HugeiconsIcon icon={Delete02Icon} className="h-3 w-3 text-red-500" />
                            </Button>
                        </div>
                        <Input
                            value={img.src}
                            onChange={(e) => updateImage(i, "src", e.target.value)}
                            placeholder="Image URL"
                            className={cn("h-7 text-xs", inputClass)}
                        />
                        <Input
                            value={img.alt}
                            onChange={(e) => updateImage(i, "alt", e.target.value)}
                            placeholder="Alt text"
                            className={cn("h-7 text-xs", inputClass)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Video Editor
function VideoEditor({
    block,
    updateContent,
    inputClass,
    labelClass,
    selectClass,
    darkMode,
}: {
    block: PageBlock;
    updateContent: (key: string, value: unknown) => void;
} & EditorProps) {
    const content = (block as { content: Record<string, unknown> }).content;
    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Source</Label>
                <Select value={(content.source as string) || "youtube"} onValueChange={(v) => updateContent("source", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="vimeo">Vimeo</SelectItem>
                        <SelectItem value="custom">Custom URL</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Video URL</Label>
                <Input
                    value={(content.url as string) || ""}
                    onChange={(e) => updateContent("url", e.target.value)}
                    placeholder={content.source === "youtube" ? "https://youtube.com/watch?v=..." : "https://..."}
                    className={cn("h-8 text-sm", inputClass)}
                />
            </div>
            <div className="space-y-1.5">
                <Label className={cn("text-xs", labelClass)}>Aspect Ratio</Label>
                <Select value={(content.aspectRatio as string) || "16:9"} onValueChange={(v) => updateContent("aspectRatio", v)}>
                    <SelectTrigger className={cn("h-8 text-sm", selectClass)}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                        <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                        <SelectItem value="4:3">Standard (4:3)</SelectItem>
                        <SelectItem value="1:1">Square (1:1)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs", labelClass)}>Autoplay</Label>
                    <Switch checked={(content.autoplay as boolean) ?? false} onCheckedChange={(v) => updateContent("autoplay", v)} />
                </div>
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs", labelClass)}>Loop</Label>
                    <Switch checked={(content.loop as boolean) ?? false} onCheckedChange={(v) => updateContent("loop", v)} />
                </div>
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs", labelClass)}>Muted</Label>
                    <Switch checked={(content.muted as boolean) ?? false} onCheckedChange={(v) => updateContent("muted", v)} />
                </div>
                <div className="flex items-center justify-between">
                    <Label className={cn("text-xs", labelClass)}>Controls</Label>
                    <Switch checked={(content.controls as boolean) ?? true} onCheckedChange={(v) => updateContent("controls", v)} />
                </div>
            </div>
        </div>
    );
}