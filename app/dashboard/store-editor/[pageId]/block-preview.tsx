"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, StarIcon, PlayIcon, Add01Icon, Remove01Icon, Location01Icon } from "@hugeicons/core-free-icons";
import type { 
    PageBlock, HeroBlock, FeaturedProductsBlock, BannerBlock, TextBlock, CategoryGridBlock, 
    SpacerBlock, NewsletterBlock, ProductGridBlock, CollectionShowcaseBlock, TestimonialsBlock,
    CountdownBlock, ContactFormBlock, MapBlock, HTMLBlock, LogoCloudBlock, FAQBlock,
    AnnouncementBarBlock, ImageBlock, ImageGalleryBlock, VideoBlock, RichTextBlock, DividerBlock
} from "@/types/page-builder";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BLOCK_REGISTRY } from "@/lib/page-builder/block-registry";
import { useState, useEffect } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface BlockPreviewProps {
    block: PageBlock;
    isSelected: boolean;
    isHovered: boolean;
    isPreviewMode: boolean;
    onSelect: () => void;
    onHover: () => void;
    onLeave: () => void;
    products: Array<{ id: string; name: string; slug: string; price: number; images: unknown[] }>;
    categories: Array<{ id: string; name: string; slug: string }>;
    collections: Array<{ id: string; name: string; slug: string }>;
    storeSlug: string;
}

export function BlockPreview({
    block,
    isSelected,
    isHovered,
    isPreviewMode,
    onSelect,
    onHover,
    onLeave,
    products,
    categories,
    storeSlug,
}: BlockPreviewProps) {
    const settings = block.settings;
    const padding = settings.padding || { top: 0, right: 0, bottom: 0, left: 0 };

    const containerStyle: React.CSSProperties = {
        paddingTop: `${padding.top}px`,
        paddingBottom: `${padding.bottom}px`,
        paddingLeft: `${padding.left}px`,
        paddingRight: `${padding.right}px`,
        backgroundColor: settings.backgroundColor,
    };

    const maxWidthClass = {
        full: "w-full",
        container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        narrow: "max-w-3xl mx-auto px-4",
    }[settings.maxWidth || "container"];

    // Helper to get content safely
    const getContent = () => (block as { content: Record<string, unknown> }).content;

    // Hidden block indicator
    if (!block.visible && !isPreviewMode) {
        return (
            <div
                onClick={onSelect}
                onMouseEnter={onHover}
                onMouseLeave={onLeave}
                className={cn(
                    "relative border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-6 cursor-pointer transition-all rounded-lg",
                    isSelected && "border-primary bg-primary/5",
                    isHovered && !isSelected && "border-muted-foreground/40 bg-muted/50"
                )}
            >
                <p className="text-center text-sm text-gray-400">
                    Hidden: {BLOCK_REGISTRY[block.type]?.name || block.type}
                </p>
            </div>
        );
    }

    return (
        <div
            onClick={onSelect}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            className={cn(
                "relative transition-all group/block",
                !isPreviewMode && "cursor-pointer",
                isSelected && !isPreviewMode && "ring-2 ring-primary ring-inset",
                isHovered && !isSelected && !isPreviewMode && "ring-2 ring-primary/40 ring-inset"
            )}
            style={containerStyle}
            id={settings.customId}
        >
            {/* Selection Label */}
            {!isPreviewMode && (isSelected || isHovered) && (
                <div className={cn(
                    "absolute -top-px left-4 z-10 flex items-center gap-1.5 -translate-y-full px-2.5 py-1 rounded-t-lg text-xs font-medium transition-colors",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-primary/80 text-primary-foreground"
                )}>
                    <span>{BLOCK_REGISTRY[block.type]?.name || block.type}</span>
                </div>
            )}

            {/* Block Content */}
            {block.type === "hero" && (
                <HeroPreview block={block as HeroBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "featured-products" && (
                <FeaturedProductsPreview
                    block={block as FeaturedProductsBlock}
                    products={products}
                    maxWidthClass={maxWidthClass}
                />
            )}
            {block.type === "product-grid" && (
                <ProductGridPreview
                    block={block as ProductGridBlock}
                    products={products}
                    maxWidthClass={maxWidthClass}
                />
            )}
            {block.type === "banner" && (
                <BannerPreview block={block as BannerBlock} />
            )}
            {block.type === "text" && (
                <TextPreview block={block as TextBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "rich-text" && (
                <RichTextPreview block={block as RichTextBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "category-grid" && (
                <CategoryGridPreview
                    block={block as CategoryGridBlock}
                    categories={categories}
                    maxWidthClass={maxWidthClass}
                />
            )}
            {block.type === "collection-showcase" && (
                <CollectionShowcasePreview
                    block={block as CollectionShowcaseBlock}
                    products={products}
                    maxWidthClass={maxWidthClass}
                />
            )}
            {block.type === "spacer" && (
                <SpacerPreview block={block as SpacerBlock} isPreviewMode={isPreviewMode} />
            )}
            {block.type === "divider" && (
                <DividerPreview block={block as DividerBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "newsletter" && (
                <NewsletterPreview block={block as NewsletterBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "testimonials" && (
                <TestimonialsPreview block={block as TestimonialsBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "countdown" && (
                <CountdownPreview block={block as CountdownBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "contact-form" && (
                <ContactFormPreview block={block as ContactFormBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "map" && (
                <MapPreview block={block as MapBlock} />
            )}
            {block.type === "html" && (
                <HTMLPreview block={block as HTMLBlock} maxWidthClass={maxWidthClass} isPreviewMode={isPreviewMode} />
            )}
            {block.type === "logo-cloud" && (
                <LogoCloudPreview block={block as LogoCloudBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "faq" && (
                <FAQPreview block={block as FAQBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "announcement-bar" && (
                <AnnouncementBarPreview block={block as AnnouncementBarBlock} />
            )}
            {block.type === "image" && (
                <ImagePreview block={block as ImageBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "image-gallery" && (
                <ImageGalleryPreview block={block as ImageGalleryBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "video" && (
                <VideoPreview block={block as VideoBlock} maxWidthClass={maxWidthClass} />
            )}
        </div>
    );
}

// Hero Preview
function HeroPreview({ block, maxWidthClass }: { block: HeroBlock; maxWidthClass: string }) {
    const { content } = block;
    const heightClass = {
        small: "py-16",
        medium: "py-24",
        large: "py-32",
        full: "min-h-[80vh] flex items-center",
    }[content.height];

    const alignmentClass = {
        left: "text-left items-start",
        center: "text-center items-center",
        right: "text-right items-end",
        split: "text-left items-start",
    }[content.layout];

    return (
        <section
            className={cn("relative", heightClass)}
            style={{
                backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {content.backgroundImage && content.overlayOpacity && (
                <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: content.overlayOpacity / 100 }}
                />
            )}
            <div className={cn("relative", maxWidthClass)}>
                <div className={cn("flex flex-col gap-4", alignmentClass)}>
                    <h1
                        className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
                        style={{ color: content.textColor }}
                    >
                        {content.heading || "Your Heading Here"}
                    </h1>
                    {content.subheading && (
                        <p className="text-xl text-gray-600">{content.subheading}</p>
                    )}
                    {content.description && (
                        <p className="max-w-2xl text-lg text-gray-500">{content.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-4">
                        {content.primaryButton?.text && (
                            <Button size="lg" className="pointer-events-none">
                                {content.primaryButton.text}
                                <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />
                            </Button>
                        )}
                        {content.secondaryButton?.text && (
                            <Button size="lg" variant="outline" className="pointer-events-none">
                                {content.secondaryButton.text}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

// Featured Products Preview
function FeaturedProductsPreview({
    block,
    products,
    maxWidthClass,
}: {
    block: FeaturedProductsBlock;
    products: Array<{ id: string; name: string; price: number; images: unknown[] }>;
    maxWidthClass: string;
}) {
    const { content } = block;
    const displayProducts = products.slice(0, content.limit);
    const gridCols = {
        2: "grid-cols-2",
        3: "grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-2 lg:grid-cols-4",
        5: "grid-cols-2 lg:grid-cols-5",
    }[content.columns];

    return (
        <section className={maxWidthClass}>
            {(content.heading || content.subheading) && (
                <div className="mb-8">
                    {content.heading && (
                        <h2 className="text-2xl font-bold text-gray-900">{content.heading}</h2>
                    )}
                    {content.subheading && (
                        <p className="mt-2 text-gray-600">{content.subheading}</p>
                    )}
                </div>
            )}
            <div className={cn("grid gap-6", gridCols)}>
                {displayProducts.length > 0 ? (
                    displayProducts.map((product) => (
                        <div key={product.id} className="group">
                            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                {(product.images as Array<{ url: string }>)?.[0]?.url ? (
                                    <img
                                        src={(product.images as Array<{ url: string }>)[0].url}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-400">
                                        No image
                                    </div>
                                )}
                            </div>
                            <div className="mt-3">
                                <h3 className="font-medium text-gray-900">{product.name}</h3>
                                {content.showPrice && (
                                    <p className="text-sm text-gray-600">${product.price}</p>
                                )}
                                {content.showAddToCart && (
                                    <Button size="sm" variant="outline" className="mt-2 w-full pointer-events-none">
                                        Add to Cart
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    Array.from({ length: content.limit }).map((_, i) => (
                        <div key={i} className="group">
                            <div className="aspect-square rounded-lg bg-gray-100" />
                            <div className="mt-3 space-y-2">
                                <div className="h-4 w-3/4 rounded bg-gray-100" />
                                <div className="h-3 w-1/2 rounded bg-gray-100" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

// Banner Preview
function BannerPreview({ block }: { block: BannerBlock }) {
    const { content } = block;
    const heightClass = {
        small: "h-48",
        medium: "h-64",
        large: "h-96",
    }[content.height];

    const alignmentClass = {
        left: "items-start text-left",
        center: "items-center text-center",
        right: "items-end text-right",
    }[content.textPosition];

    return (
        <section
            className={cn("relative flex flex-col justify-center overflow-hidden", heightClass)}
            style={{
                backgroundImage: content.image ? `url(${content.image})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {!content.image && (
                <div className="absolute inset-0 bg-gray-200" />
            )}
            {content.overlayColor && (
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundColor: content.overlayColor,
                        opacity: (content.overlayOpacity || 40) / 100,
                    }}
                />
            )}
            <div className={cn("relative z-10 flex flex-col gap-4 p-8", alignmentClass)}>
                {content.heading && (
                    <h2 className="text-3xl font-bold text-white">{content.heading}</h2>
                )}
                {content.description && (
                    <p className="max-w-xl text-lg text-white/90">{content.description}</p>
                )}
                {content.button?.text && (
                    <Button variant="secondary" size="lg" className="pointer-events-none">
                        {content.button.text}
                    </Button>
                )}
            </div>
        </section>
    );
}

// Text Preview
function TextPreview({ block, maxWidthClass }: { block: TextBlock; maxWidthClass: string }) {
    const { content } = block;
    const sizeClass = {
        small: "text-sm",
        medium: "text-base",
        large: "text-lg",
    }[content.size];

    return (
        <section className={maxWidthClass}>
            <p className={cn(sizeClass, `text-${content.alignment}`, "text-gray-700")}>
                {content.text || "Enter your text..."}
            </p>
        </section>
    );
}

// Category Grid Preview
function CategoryGridPreview({
    block,
    categories,
    maxWidthClass,
}: {
    block: CategoryGridBlock;
    categories: Array<{ id: string; name: string; slug: string }>;
    maxWidthClass: string;
}) {
    const { content } = block;
    const displayCategories = content.showAll
        ? categories.slice(0, content.limit)
        : categories.filter((c) => content.categoryIds?.includes(c.id));

    const gridCols = {
        2: "grid-cols-2",
        3: "grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-2 lg:grid-cols-4",
        6: "grid-cols-2 lg:grid-cols-6",
    }[content.columns];

    return (
        <section className={maxWidthClass}>
            {content.heading && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">{content.heading}</h2>
                    {content.subheading && (
                        <p className="mt-2 text-gray-600">{content.subheading}</p>
                    )}
                </div>
            )}
            <div className={cn("grid gap-6", gridCols)}>
                {displayCategories.length > 0 ? (
                    displayCategories.map((category) => (
                        <div
                            key={category.id}
                            className={cn(
                                "group relative overflow-hidden rounded-xl border border-gray-200 p-6 transition-colors hover:bg-gray-50",
                                content.style === "overlay" && "bg-gray-50"
                            )}
                        >
                            <h3 className="text-lg font-semibold text-gray-900">
                                {category.name}
                            </h3>
                            <HugeiconsIcon
                                icon={ArrowRight01Icon}
                                className="mt-2 h-5 w-5 text-gray-400"
                            />
                        </div>
                    ))
                ) : (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                            <div className="h-5 w-24 rounded bg-gray-200" />
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

// Spacer Preview
function SpacerPreview({ block, isPreviewMode }: { block: SpacerBlock; isPreviewMode: boolean }) {
    return (
        <div 
            style={{ height: `${block.content.height}px` }}
            className={cn(!isPreviewMode && "bg-gray-50 border-y border-dashed border-gray-200")}
        >
            {!isPreviewMode && (
                <div className="h-full flex items-center justify-center">
                    <span className="text-xs text-gray-400">{block.content.height}px</span>
                </div>
            )}
        </div>
    );
}

// Newsletter Preview
function NewsletterPreview({ block, maxWidthClass }: { block: NewsletterBlock; maxWidthClass: string }) {
    const { content } = block;
    const isInline = content.layout === "inline";

    return (
        <section
            className={cn(maxWidthClass, "rounded-xl p-8")}
            style={{ backgroundColor: content.backgroundColor || "#f4f4f5" }}
        >
            <div className={cn("mx-auto", isInline ? "max-w-2xl" : "max-w-md text-center")}>
                <h2 className="text-2xl font-bold text-gray-900">{content.heading}</h2>
                {content.description && (
                    <p className="mt-2 text-gray-600">{content.description}</p>
                )}
                <div className={cn("mt-6", isInline ? "flex gap-2" : "space-y-3")}>
                    <Input
                        type="email"
                        placeholder={content.placeholder}
                        className={cn(isInline ? "flex-1" : "", "pointer-events-none")}
                    />
                    <Button className={cn(isInline ? "" : "w-full", "pointer-events-none")}>
                        {content.buttonText}
                    </Button>
                </div>
            </div>
        </section>
    );
}

// Product Grid Preview
function ProductGridPreview({
    block,
    products,
    maxWidthClass,
}: {
    block: ProductGridBlock;
    products: Array<{ id: string; name: string; price: number; images: unknown[] }>;
    maxWidthClass: string;
}) {
    const { content } = block;
    const displayProducts = products.slice(0, content.limit);
    const gridCols = {
        2: "grid-cols-2",
        3: "grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-2 lg:grid-cols-4",
        5: "grid-cols-2 lg:grid-cols-5",
    }[content.columns];

    return (
        <section className={maxWidthClass}>
            {content.heading && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">{content.heading}</h2>
                </div>
            )}
            {content.showFilters && (
                <div className="flex gap-4 mb-6 pb-4 border-b border-gray-200">
                    <div className="h-8 w-24 rounded bg-gray-100" />
                    <div className="h-8 w-24 rounded bg-gray-100" />
                    {content.showSorting && <div className="h-8 w-32 rounded bg-gray-100 ml-auto" />}
                </div>
            )}
            <div className={cn("grid gap-6", gridCols)}>
                {displayProducts.length > 0 ? (
                    displayProducts.map((product) => (
                        <div key={product.id} className="group">
                            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                {(product.images as Array<{ url: string }>)?.[0]?.url ? (
                                    <img
                                        src={(product.images as Array<{ url: string }>)[0].url}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-400">
                                        No image
                                    </div>
                                )}
                            </div>
                            <div className="mt-3">
                                <h3 className="font-medium text-gray-900">{product.name}</h3>
                                <p className="text-sm text-gray-600">${product.price}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    Array.from({ length: content.limit }).map((_, i) => (
                        <div key={i} className="group">
                            <div className="aspect-square rounded-lg bg-gray-100" />
                            <div className="mt-3 space-y-2">
                                <div className="h-4 w-3/4 rounded bg-gray-100" />
                                <div className="h-3 w-1/2 rounded bg-gray-100" />
                            </div>
                        </div>
                    ))
                )}
            </div>
            {content.showPagination && (
                <div className="flex justify-center gap-2 mt-8">
                    <div className="h-8 w-8 rounded bg-gray-200" />
                    <div className="h-8 w-8 rounded bg-gray-100" />
                    <div className="h-8 w-8 rounded bg-gray-100" />
                </div>
            )}
        </section>
    );
}

// Collection Showcase Preview
function CollectionShowcasePreview({
    block,
    products,
    maxWidthClass,
}: {
    block: CollectionShowcaseBlock;
    products: Array<{ id: string; name: string; price: number; images: unknown[] }>;
    maxWidthClass: string;
}) {
    const { content } = block;
    const displayProducts = products.slice(0, content.productLimit);

    return (
        <section className={maxWidthClass}>
            {content.heading && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">{content.heading}</h2>
                    {content.showDescription && (
                        <p className="mt-2 text-gray-600">Collection description goes here</p>
                    )}
                </div>
            )}
            <div className={cn(
                "grid gap-6",
                content.layout === "featured" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-2 lg:grid-cols-4"
            )}>
                {displayProducts.length > 0 ? (
                    displayProducts.map((product) => (
                        <div key={product.id} className="group">
                            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                {(product.images as Array<{ url: string }>)?.[0]?.url ? (
                                    <img
                                        src={(product.images as Array<{ url: string }>)[0].url}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-400">
                                        No image
                                    </div>
                                )}
                            </div>
                            <div className="mt-3">
                                <h3 className="font-medium text-gray-900">{product.name}</h3>
                                <p className="text-sm text-gray-600">${product.price}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Select a collection to display products
                    </div>
                )}
            </div>
        </section>
    );
}

// Rich Text Preview
function RichTextPreview({ block, maxWidthClass }: { block: RichTextBlock; maxWidthClass: string }) {
    const { content } = block;
    return (
        <section className={maxWidthClass}>
            <div 
                className={cn("prose prose-gray max-w-none", `text-${content.alignment}`)}
                dangerouslySetInnerHTML={{ __html: content.html || "<p>Enter your content...</p>" }}
            />
        </section>
    );
}

// Divider Preview
function DividerPreview({ block, maxWidthClass }: { block: DividerBlock; maxWidthClass: string }) {
    const { content } = block;
    const widthClass = {
        full: "w-full",
        medium: "w-2/3 mx-auto",
        short: "w-1/3 mx-auto",
    }[content.width];

    return (
        <div className={maxWidthClass}>
            <hr 
                className={cn("border-t", widthClass)}
                style={{ 
                    borderStyle: content.style,
                    borderColor: content.color || "#e5e7eb",
                    borderTopWidth: `${content.thickness}px`,
                }}
            />
        </div>
    );
}

// Testimonials Preview
function TestimonialsPreview({ block, maxWidthClass }: { block: TestimonialsBlock; maxWidthClass: string }) {
    const { content } = block;
    const testimonials = content.testimonials || [];

    return (
        <section className={maxWidthClass}>
            {content.heading && (
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">{content.heading}</h2>
                </div>
            )}
            <div className={cn(
                content.layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "max-w-2xl mx-auto"
            )}>
                {testimonials.length > 0 ? (
                    testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="bg-gray-50 rounded-xl p-6">
                            <span className="text-4xl text-gray-300 mb-4 block">"</span>
                            <p className="text-gray-700 mb-4">{testimonial.quote}</p>
                            {content.showRating && testimonial.rating && (
                                <div className="flex gap-1 mb-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <HugeiconsIcon 
                                            key={i} 
                                            icon={StarIcon} 
                                            className={cn("h-4 w-4", i < testimonial.rating! ? "text-yellow-400 fill-yellow-400" : "text-gray-300")}
                                        />
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                {testimonial.avatar ? (
                                    <img src={testimonial.avatar} alt={testimonial.author} className="w-10 h-10 rounded-full" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">{testimonial.author}</p>
                                    {testimonial.role && <p className="text-sm text-gray-500">{testimonial.role}</p>}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">Add testimonials to display</div>
                )}
            </div>
        </section>
    );
}

// Countdown Preview
function CountdownPreview({ block, maxWidthClass }: { block: CountdownBlock; maxWidthClass: string }) {
    const { content } = block;
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const endDate = new Date(content.endDate).getTime();
            const now = Date.now();
            const diff = endDate - now;

            if (diff <= 0) {
                setIsExpired(true);
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [content.endDate]);

    if (isExpired) {
        return (
            <section className={cn(maxWidthClass, "text-center py-8")}>
                <p className="text-xl text-gray-600">{content.expiredMessage}</p>
            </section>
        );
    }

    return (
        <section className={cn(maxWidthClass, "text-center")}>
            {content.heading && <h2 className="text-2xl font-bold text-gray-900 mb-2">{content.heading}</h2>}
            {content.description && <p className="text-gray-600 mb-6">{content.description}</p>}
            <div className="flex justify-center gap-4">
                {content.showDays && (
                    <div className="bg-gray-100 rounded-lg p-4 min-w-[80px]">
                        <div className="text-3xl font-bold text-gray-900">{timeLeft.days}</div>
                        <div className="text-sm text-gray-500">Days</div>
                    </div>
                )}
                {content.showHours && (
                    <div className="bg-gray-100 rounded-lg p-4 min-w-[80px]">
                        <div className="text-3xl font-bold text-gray-900">{timeLeft.hours}</div>
                        <div className="text-sm text-gray-500">Hours</div>
                    </div>
                )}
                {content.showMinutes && (
                    <div className="bg-gray-100 rounded-lg p-4 min-w-[80px]">
                        <div className="text-3xl font-bold text-gray-900">{timeLeft.minutes}</div>
                        <div className="text-sm text-gray-500">Minutes</div>
                    </div>
                )}
                {content.showSeconds && (
                    <div className="bg-gray-100 rounded-lg p-4 min-w-[80px]">
                        <div className="text-3xl font-bold text-gray-900">{timeLeft.seconds}</div>
                        <div className="text-sm text-gray-500">Seconds</div>
                    </div>
                )}
            </div>
            {content.button?.text && (
                <Button className="mt-6 pointer-events-none">{content.button.text}</Button>
            )}
        </section>
    );
}

// Contact Form Preview
function ContactFormPreview({ block, maxWidthClass }: { block: ContactFormBlock; maxWidthClass: string }) {
    const { content } = block;

    return (
        <section className={maxWidthClass}>
            <div className="max-w-lg mx-auto">
                {content.heading && <h2 className="text-2xl font-bold text-gray-900 mb-2">{content.heading}</h2>}
                {content.description && <p className="text-gray-600 mb-6">{content.description}</p>}
                <div className="space-y-4">
                    {content.fields?.map((field) => (
                        <div key={field.id} className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            {field.type === "textarea" ? (
                                <Textarea placeholder={field.placeholder} className="pointer-events-none" rows={4} />
                            ) : (
                                <Input type={field.type} placeholder={field.placeholder} className="pointer-events-none" />
                            )}
                        </div>
                    ))}
                    <Button className="w-full pointer-events-none">{content.submitText}</Button>
                </div>
            </div>
        </section>
    );
}

// Map Preview
function MapPreview({ block }: { block: MapBlock }) {
    const { content } = block;

    return (
        <div 
            className="relative bg-gray-200 flex items-center justify-center"
            style={{ height: `${content.height}px` }}
        >
            <div className="text-center">
                <HugeiconsIcon icon={Location01Icon} className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">{content.address || "Map Location"}</p>
                <p className="text-sm text-gray-500 mt-1">Map will display here</p>
            </div>
        </div>
    );
}

// HTML Preview
function HTMLPreview({ block, maxWidthClass, isPreviewMode }: { block: HTMLBlock; maxWidthClass: string; isPreviewMode: boolean }) {
    const { content } = block;

    if (isPreviewMode) {
        return (
            <section className={maxWidthClass}>
                <div dangerouslySetInnerHTML={{ __html: content.code }} />
            </section>
        );
    }

    return (
        <section className={maxWidthClass}>
            <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm text-gray-600 overflow-x-auto">
                <pre className="whitespace-pre-wrap">{content.code || "<!-- Custom HTML -->"}</pre>
            </div>
        </section>
    );
}

// Logo Cloud Preview
function LogoCloudPreview({ block, maxWidthClass }: { block: LogoCloudBlock; maxWidthClass: string }) {
    const { content } = block;
    const gridCols = {
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
        6: "grid-cols-6",
    }[content.columns];

    return (
        <section className={maxWidthClass}>
            {content.heading && (
                <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
                    {content.heading}
                </h2>
            )}
            <div className={cn("grid gap-8 items-center", gridCols)}>
                {content.logos?.length > 0 ? (
                    content.logos.map((logo, i) => (
                        <div key={i} className="flex items-center justify-center">
                            <img 
                                src={logo.src} 
                                alt={logo.alt} 
                                className={cn("h-12 object-contain", content.grayscale && "grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all")}
                            />
                        </div>
                    ))
                ) : (
                    Array.from({ length: content.columns }).map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-400">Logo {i + 1}</span>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

// FAQ Preview
function FAQPreview({ block, maxWidthClass }: { block: FAQBlock; maxWidthClass: string }) {
    const { content } = block;

    return (
        <section className={maxWidthClass}>
            {content.heading && (
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">{content.heading}</h2>
                    {content.description && <p className="mt-2 text-gray-600">{content.description}</p>}
                </div>
            )}
            {content.layout === "accordion" ? (
                <Accordion type="single" collapsible className="max-w-2xl mx-auto">
                    {content.items?.map((item) => (
                        <AccordionItem key={item.id} value={item.id}>
                            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                            <AccordionContent className="text-gray-600">{item.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {content.items?.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
                            <p className="text-gray-600">{item.answer}</p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

// Announcement Bar Preview
function AnnouncementBarPreview({ block }: { block: AnnouncementBarBlock }) {
    const { content } = block;

    return (
        <div 
            className="py-2 px-4 text-center text-sm"
            style={{ backgroundColor: content.backgroundColor, color: content.textColor }}
        >
            {content.text}
            {content.dismissible && (
                <button className="ml-4 opacity-70 hover:opacity-100 pointer-events-none">×</button>
            )}
        </div>
    );
}

// Image Preview
function ImagePreview({ block, maxWidthClass }: { block: ImageBlock; maxWidthClass: string }) {
    const { content } = block;
    const aspectRatioClass = {
        auto: "",
        "1:1": "aspect-square",
        "4:3": "aspect-[4/3]",
        "16:9": "aspect-video",
        "21:9": "aspect-[21/9]",
    }[content.aspectRatio || "auto"];

    const widthClass = {
        auto: "w-auto",
        full: "w-full",
        contained: "max-w-2xl mx-auto",
    }[content.width || "contained"];

    return (
        <section className={maxWidthClass}>
            <div className={cn(widthClass, aspectRatioClass)}>
                {content.src ? (
                    <img 
                        src={content.src} 
                        alt={content.alt} 
                        className={cn("w-full h-full object-cover rounded-lg", aspectRatioClass)}
                    />
                ) : (
                    <div className={cn("bg-gray-100 rounded-lg flex items-center justify-center", aspectRatioClass || "h-64")}>
                        <span className="text-gray-400">Add an image</span>
                    </div>
                )}
                {content.caption && (
                    <p className="text-sm text-gray-500 text-center mt-2">{content.caption}</p>
                )}
            </div>
        </section>
    );
}

// Image Gallery Preview
function ImageGalleryPreview({ block, maxWidthClass }: { block: ImageGalleryBlock; maxWidthClass: string }) {
    const { content } = block;
    const gridCols = {
        2: "grid-cols-2",
        3: "grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-2 lg:grid-cols-4",
    }[content.columns];

    const gapClass = {
        small: "gap-2",
        medium: "gap-4",
        large: "gap-6",
    }[content.gap];

    return (
        <section className={maxWidthClass}>
            <div className={cn("grid", gridCols, gapClass)}>
                {content.images?.length > 0 ? (
                    content.images.map((image, i) => (
                        <div key={i} className="aspect-square overflow-hidden rounded-lg">
                            <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
                        </div>
                    ))
                ) : (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-sm">Image {i + 1}</span>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

// Video Preview
function VideoPreview({ block, maxWidthClass }: { block: VideoBlock; maxWidthClass: string }) {
    const { content } = block;
    const aspectRatioClass = {
        "16:9": "aspect-video",
        "4:3": "aspect-[4/3]",
        "1:1": "aspect-square",
    }[content.aspectRatio];

    // Extract video ID for YouTube/Vimeo
    const getEmbedUrl = () => {
        if (!content.url) return null;
        
        if (content.source === "youtube") {
            const match = content.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
            if (match) return `https://www.youtube.com/embed/${match[1]}`;
        }
        if (content.source === "vimeo") {
            const match = content.url.match(/vimeo\.com\/(\d+)/);
            if (match) return `https://player.vimeo.com/video/${match[1]}`;
        }
        return content.url;
    };

    const embedUrl = getEmbedUrl();

    return (
        <section className={maxWidthClass}>
            <div className={cn("relative overflow-hidden rounded-lg bg-gray-900", aspectRatioClass)}>
                {embedUrl ? (
                    <iframe
                        src={embedUrl}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <HugeiconsIcon icon={PlayIcon} className="h-16 w-16 text-white/50 mx-auto mb-2" />
                            <p className="text-white/70">Add a video URL</p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
