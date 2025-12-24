"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, StarIcon, PlayIcon, Location01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import type { 
    PageBlock, HeroBlock, FeaturedProductsBlock, BannerBlock, TextBlock, CategoryGridBlock, 
    SpacerBlock, NewsletterBlock, ProductGridBlock, CollectionShowcaseBlock, TestimonialsBlock,
    CountdownBlock, ContactFormBlock, MapBlock, HTMLBlock, LogoCloudBlock, FAQBlock,
    AnnouncementBarBlock, ImageBlock, ImageGalleryBlock, VideoBlock, RichTextBlock, DividerBlock
} from "@/types/page-builder";
import type { Product } from "@/lib/supabase/types";
import { ProductCard } from "./product-card";

// Simplified category type for page renderer
interface CategoryForRenderer {
    id: string;
    name: string;
    slug: string;
    image_url?: string | null;
}

interface PageRendererProps {
    blocks: PageBlock[];
    products: Product[];
    categories: CategoryForRenderer[];
    storeSlug: string;
    currency: string;
}

export function PageRenderer({ blocks, products, categories, storeSlug, currency }: PageRendererProps) {
    return (
        <div>
            {blocks
                .filter((block) => block.visible)
                .map((block) => (
                    <BlockRenderer
                        key={block.id}
                        block={block}
                        products={products}
                        categories={categories}
                        storeSlug={storeSlug}
                        currency={currency}
                    />
                ))}
        </div>
    );
}

interface BlockRendererProps {
    block: PageBlock;
    products: Product[];
    categories: CategoryForRenderer[];
    storeSlug: string;
    currency: string;
}

function BlockRenderer({ block, products, categories, storeSlug, currency }: BlockRendererProps) {
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

    return (
        <div style={containerStyle} id={settings.customId} className={settings.customClasses}>
            {block.type === "hero" && (
                <HeroRenderer block={block as HeroBlock} maxWidthClass={maxWidthClass} storeSlug={storeSlug} />
            )}
            {block.type === "featured-products" && (
                <FeaturedProductsRenderer
                    block={block as FeaturedProductsBlock}
                    products={products}
                    maxWidthClass={maxWidthClass}
                    storeSlug={storeSlug}
                />
            )}
            {block.type === "product-grid" && (
                <ProductGridRenderer
                    block={block as ProductGridBlock}
                    products={products}
                    maxWidthClass={maxWidthClass}
                    storeSlug={storeSlug}
                />
            )}
            {block.type === "banner" && (
                <BannerRenderer block={block as BannerBlock} storeSlug={storeSlug} />
            )}
            {block.type === "text" && (
                <TextRenderer block={block as TextBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "rich-text" && (
                <RichTextRenderer block={block as RichTextBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "category-grid" && (
                <CategoryGridRenderer
                    block={block as CategoryGridBlock}
                    categories={categories}
                    maxWidthClass={maxWidthClass}
                    storeSlug={storeSlug}
                />
            )}
            {block.type === "collection-showcase" && (
                <CollectionShowcaseRenderer
                    block={block as CollectionShowcaseBlock}
                    products={products}
                    maxWidthClass={maxWidthClass}
                    storeSlug={storeSlug}
                />
            )}
            {block.type === "spacer" && (
                <SpacerRenderer block={block as SpacerBlock} />
            )}
            {block.type === "divider" && (
                <DividerRenderer block={block as DividerBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "newsletter" && (
                <NewsletterRenderer block={block as NewsletterBlock} maxWidthClass={maxWidthClass} storeSlug={storeSlug} />
            )}
            {block.type === "testimonials" && (
                <TestimonialsRenderer block={block as TestimonialsBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "countdown" && (
                <CountdownRenderer block={block as CountdownBlock} maxWidthClass={maxWidthClass} storeSlug={storeSlug} />
            )}
            {block.type === "contact-form" && (
                <ContactFormRenderer block={block as ContactFormBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "map" && (
                <MapRenderer block={block as MapBlock} />
            )}
            {block.type === "html" && (
                <HTMLRenderer block={block as HTMLBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "logo-cloud" && (
                <LogoCloudRenderer block={block as LogoCloudBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "faq" && (
                <FAQRenderer block={block as FAQBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "announcement-bar" && (
                <AnnouncementBarRenderer block={block as AnnouncementBarBlock} storeSlug={storeSlug} />
            )}
            {block.type === "image" && (
                <ImageRenderer block={block as ImageBlock} maxWidthClass={maxWidthClass} storeSlug={storeSlug} />
            )}
            {block.type === "image-gallery" && (
                <ImageGalleryRenderer block={block as ImageGalleryBlock} maxWidthClass={maxWidthClass} />
            )}
            {block.type === "video" && (
                <VideoRenderer block={block as VideoBlock} maxWidthClass={maxWidthClass} />
            )}
        </div>
    );
}

// Hero Renderer
function HeroRenderer({ block, maxWidthClass, storeSlug }: { block: HeroBlock; maxWidthClass: string; storeSlug: string }) {
    const { content } = block;
    const heightClass = {
        small: "py-16",
        medium: "py-24",
        large: "py-32",
        full: "min-h-screen flex items-center",
    }[content.height];

    const alignmentClass = {
        left: "text-left items-start",
        center: "text-center items-center",
        right: "text-right items-end",
        split: "text-left items-start",
    }[content.layout];

    const resolveLink = (link: string) => {
        if (link.startsWith("http")) return link;
        if (link.startsWith("/")) return `/store/${storeSlug}${link}`;
        return `/store/${storeSlug}/${link}`;
    };

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
                        {content.heading}
                    </h1>
                    {content.subheading && (
                        <p className="text-xl text-muted-foreground">{content.subheading}</p>
                    )}
                    {content.description && (
                        <p className="max-w-2xl text-lg text-muted-foreground">{content.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-4">
                        {content.primaryButton?.text && (
                            <Button size="lg" asChild>
                                <Link href={resolveLink(content.primaryButton.link)}>
                                    {content.primaryButton.text}
                                    <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        )}
                        {content.secondaryButton?.text && (
                            <Button size="lg" variant="outline" asChild>
                                <Link href={resolveLink(content.secondaryButton.link)}>
                                    {content.secondaryButton.text}
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

// Featured Products Renderer
function FeaturedProductsRenderer({
    block,
    products,
    maxWidthClass,
    storeSlug,
}: {
    block: FeaturedProductsBlock;
    products: Product[];
    maxWidthClass: string;
    storeSlug: string;
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
                        <h2 className="text-2xl font-bold">{content.heading}</h2>
                    )}
                    {content.subheading && (
                        <p className="mt-2 text-muted-foreground">{content.subheading}</p>
                    )}
                </div>
            )}
            <div className={cn("grid gap-6", gridCols)}>
                {displayProducts.map((product) => (
                    <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
                ))}
            </div>
        </section>
    );
}

// Banner Renderer
function BannerRenderer({ block, storeSlug }: { block: BannerBlock; storeSlug: string }) {
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

    const resolveLink = (link: string) => {
        if (link.startsWith("http")) return link;
        if (link.startsWith("/")) return `/store/${storeSlug}${link}`;
        return `/store/${storeSlug}/${link}`;
    };

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
                <div className="absolute inset-0 bg-muted" />
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
                    <Button variant="secondary" size="lg" asChild>
                        <Link href={resolveLink(content.button.link)}>
                            {content.button.text}
                        </Link>
                    </Button>
                )}
            </div>
        </section>
    );
}

// Text Renderer
function TextRenderer({ block, maxWidthClass }: { block: TextBlock; maxWidthClass: string }) {
    const { content } = block;
    const sizeClass = {
        small: "text-sm",
        medium: "text-base",
        large: "text-lg",
    }[content.size];

    return (
        <section className={maxWidthClass}>
            <p className={cn(sizeClass, `text-${content.alignment}`)}>
                {content.text}
            </p>
        </section>
    );
}

// Category Grid Renderer
function CategoryGridRenderer({
    block,
    categories,
    maxWidthClass,
    storeSlug,
}: {
    block: CategoryGridBlock;
    categories: CategoryForRenderer[];
    maxWidthClass: string;
    storeSlug: string;
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
                    <h2 className="text-2xl font-bold">{content.heading}</h2>
                    {content.subheading && (
                        <p className="mt-2 text-muted-foreground">{content.subheading}</p>
                    )}
                </div>
            )}
            <div className={cn("grid gap-6", gridCols)}>
                {displayCategories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/store/${storeSlug}/category/${category.slug}`}
                        className={cn(
                            "group relative overflow-hidden rounded-xl border p-6 transition-colors hover:bg-muted",
                            content.style === "overlay" && "bg-muted/50"
                        )}
                    >
                        <h3 className="text-lg font-semibold group-hover:text-primary">
                            {category.name}
                        </h3>
                        <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            className="mt-2 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                        />
                    </Link>
                ))}
            </div>
        </section>
    );
}

// Spacer Renderer
function SpacerRenderer({ block }: { block: SpacerBlock }) {
    return <div style={{ height: `${block.content.height}px` }} className="md:block" />;
}

// Newsletter Renderer
function NewsletterRenderer({ block, maxWidthClass, storeSlug }: { block: NewsletterBlock; maxWidthClass: string; storeSlug: string }) {
    const { content } = block;
    const isInline = content.layout === "inline";
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        
        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, storeSlug }),
            });
            
            if (res.ok) {
                setStatus("success");
                setEmail("");
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    return (
        <section
            className={cn(maxWidthClass, "rounded-xl p-8")}
            style={{ backgroundColor: content.backgroundColor || "#f4f4f5" }}
        >
            <div className={cn("mx-auto", isInline ? "max-w-2xl" : "max-w-md text-center")}>
                <h2 className="text-2xl font-bold">{content.heading}</h2>
                {content.description && (
                    <p className="mt-2 text-muted-foreground">{content.description}</p>
                )}
                {status === "success" ? (
                    <p className="mt-6 text-green-600 font-medium">{content.successMessage}</p>
                ) : (
                    <form
                        className={cn("mt-6", isInline ? "flex gap-2" : "space-y-3")}
                        onSubmit={handleSubmit}
                    >
                        <Input
                            type="email"
                            placeholder={content.placeholder}
                            className={isInline ? "flex-1" : ""}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button type="submit" className={isInline ? "" : "w-full"} disabled={status === "loading"}>
                            {status === "loading" ? "..." : content.buttonText}
                        </Button>
                    </form>
                )}
            </div>
        </section>
    );
}

// Product Grid Renderer
function ProductGridRenderer({
    block,
    products,
    maxWidthClass,
    storeSlug,
}: {
    block: ProductGridBlock;
    products: Product[];
    maxWidthClass: string;
    storeSlug: string;
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
                    <h2 className="text-2xl font-bold">{content.heading}</h2>
                </div>
            )}
            <div className={cn("grid gap-6", gridCols)}>
                {displayProducts.map((product) => (
                    <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
                ))}
            </div>
        </section>
    );
}

// Collection Showcase Renderer
function CollectionShowcaseRenderer({
    block,
    products,
    maxWidthClass,
    storeSlug,
}: {
    block: CollectionShowcaseBlock;
    products: Product[];
    maxWidthClass: string;
    storeSlug: string;
}) {
    const { content } = block;
    const displayProducts = products.slice(0, content.productLimit);

    return (
        <section className={maxWidthClass}>
            {content.heading && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold">{content.heading}</h2>
                    {content.showDescription && (
                        <p className="mt-2 text-muted-foreground">Explore our curated collection</p>
                    )}
                </div>
            )}
            <div className={cn(
                "grid gap-6",
                content.layout === "featured" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-2 lg:grid-cols-4"
            )}>
                {displayProducts.map((product) => (
                    <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
                ))}
            </div>
        </section>
    );
}

// Rich Text Renderer
function RichTextRenderer({ block, maxWidthClass }: { block: RichTextBlock; maxWidthClass: string }) {
    const { content } = block;
    return (
        <section className={maxWidthClass}>
            <div 
                className={cn("prose prose-gray max-w-none dark:prose-invert", `text-${content.alignment}`)}
                dangerouslySetInnerHTML={{ __html: content.html }}
            />
        </section>
    );
}

// Divider Renderer
function DividerRenderer({ block, maxWidthClass }: { block: DividerBlock; maxWidthClass: string }) {
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
                    borderColor: content.color || "currentColor",
                    borderTopWidth: `${content.thickness}px`,
                }}
            />
        </div>
    );
}

// Testimonials Renderer
function TestimonialsRenderer({ block, maxWidthClass }: { block: TestimonialsBlock; maxWidthClass: string }) {
    const { content } = block;
    const testimonials = content.testimonials || [];

    return (
        <section className={maxWidthClass}>
            {content.heading && (
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold">{content.heading}</h2>
                </div>
            )}
            <div className={cn(
                content.layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "max-w-2xl mx-auto"
            )}>
                {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-muted/50 rounded-xl p-6">
                        <span className="text-4xl text-muted-foreground/30 mb-4 block">"</span>
                        <p className="text-foreground mb-4">{testimonial.quote}</p>
                        {content.showRating && testimonial.rating && (
                            <div className="flex gap-1 mb-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <HugeiconsIcon 
                                        key={i} 
                                        icon={StarIcon} 
                                        className={cn("h-4 w-4", i < testimonial.rating! ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30")}
                                    />
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            {testimonial.avatar ? (
                                <img src={testimonial.avatar} alt={testimonial.author} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-muted" />
                            )}
                            <div>
                                <p className="font-medium">{testimonial.author}</p>
                                {testimonial.role && <p className="text-sm text-muted-foreground">{testimonial.role}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// Countdown Renderer
function CountdownRenderer({ block, maxWidthClass, storeSlug }: { block: CountdownBlock; maxWidthClass: string; storeSlug: string }) {
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

    const resolveLink = (link: string) => {
        if (link.startsWith("http")) return link;
        if (link.startsWith("/")) return `/store/${storeSlug}${link}`;
        return `/store/${storeSlug}/${link}`;
    };

    if (isExpired) {
        return (
            <section className={cn(maxWidthClass, "text-center py-8")}>
                <p className="text-xl text-muted-foreground">{content.expiredMessage}</p>
            </section>
        );
    }

    return (
        <section className={cn(maxWidthClass, "text-center")}>
            {content.heading && <h2 className="text-2xl font-bold mb-2">{content.heading}</h2>}
            {content.description && <p className="text-muted-foreground mb-6">{content.description}</p>}
            <div className="flex justify-center gap-4">
                {content.showDays && (
                    <div className="bg-muted rounded-lg p-4 min-w-[80px]">
                        <div className="text-3xl font-bold">{timeLeft.days}</div>
                        <div className="text-sm text-muted-foreground">Days</div>
                    </div>
                )}
                {content.showHours && (
                    <div className="bg-muted rounded-lg p-4 min-w-[80px]">
                        <div className="text-3xl font-bold">{timeLeft.hours}</div>
                        <div className="text-sm text-muted-foreground">Hours</div>
                    </div>
                )}
                {content.showMinutes && (
                    <div className="bg-muted rounded-lg p-4 min-w-[80px]">
                        <div className="text-3xl font-bold">{timeLeft.minutes}</div>
                        <div className="text-sm text-muted-foreground">Minutes</div>
                    </div>
                )}
                {content.showSeconds && (
                    <div className="bg-muted rounded-lg p-4 min-w-[80px]">
                        <div className="text-3xl font-bold">{timeLeft.seconds}</div>
                        <div className="text-sm text-muted-foreground">Seconds</div>
                    </div>
                )}
            </div>
            {content.button?.text && (
                <Button className="mt-6" asChild>
                    <Link href={resolveLink(content.button.link)}>{content.button.text}</Link>
                </Button>
            )}
        </section>
    );
}

// Contact Form Renderer
function ContactFormRenderer({ block, maxWidthClass }: { block: ContactFormBlock; maxWidthClass: string }) {
    const { content } = block;
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("loading");
        
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            
            if (res.ok) {
                setStatus("success");
                e.currentTarget.reset();
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    return (
        <section className={maxWidthClass}>
            <div className="max-w-lg mx-auto">
                {content.heading && <h2 className="text-2xl font-bold mb-2">{content.heading}</h2>}
                {content.description && <p className="text-muted-foreground mb-6">{content.description}</p>}
                {status === "success" ? (
                    <p className="text-green-600 font-medium py-8 text-center">{content.successMessage}</p>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {content.fields?.map((field) => (
                            <div key={field.id} className="space-y-1.5">
                                <label className="text-sm font-medium">
                                    {field.label} {field.required && <span className="text-destructive">*</span>}
                                </label>
                                {field.type === "textarea" ? (
                                    <Textarea name={field.id} placeholder={field.placeholder} required={field.required} rows={4} />
                                ) : (
                                    <Input type={field.type} name={field.id} placeholder={field.placeholder} required={field.required} />
                                )}
                            </div>
                        ))}
                        <Button type="submit" className="w-full" disabled={status === "loading"}>
                            {status === "loading" ? "Sending..." : content.submitText}
                        </Button>
                    </form>
                )}
            </div>
        </section>
    );
}

// Map Renderer
function MapRenderer({ block }: { block: MapBlock }) {
    const { content } = block;
    const encodedAddress = encodeURIComponent(content.address);
    
    return (
        <div style={{ height: `${content.height}px` }} className="relative">
            <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}&zoom=${content.zoom}`}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />
        </div>
    );
}

// HTML Renderer
function HTMLRenderer({ block, maxWidthClass }: { block: HTMLBlock; maxWidthClass: string }) {
    const { content } = block;
    return (
        <section className={maxWidthClass}>
            <div dangerouslySetInnerHTML={{ __html: content.code }} />
        </section>
    );
}

// Logo Cloud Renderer
function LogoCloudRenderer({ block, maxWidthClass }: { block: LogoCloudBlock; maxWidthClass: string }) {
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
                <h2 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
                    {content.heading}
                </h2>
            )}
            <div className={cn("grid gap-8 items-center", gridCols)}>
                {content.logos?.map((logo, i) => (
                    <div key={i} className="flex items-center justify-center">
                        {logo.link ? (
                            <a href={logo.link} target="_blank" rel="noopener noreferrer">
                                <img 
                                    src={logo.src} 
                                    alt={logo.alt} 
                                    className={cn("h-12 object-contain", content.grayscale && "grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all")}
                                />
                            </a>
                        ) : (
                            <img 
                                src={logo.src} 
                                alt={logo.alt} 
                                className={cn("h-12 object-contain", content.grayscale && "grayscale opacity-60")}
                            />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

// FAQ Renderer
function FAQRenderer({ block, maxWidthClass }: { block: FAQBlock; maxWidthClass: string }) {
    const { content } = block;

    return (
        <section className={maxWidthClass}>
            {content.heading && (
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold">{content.heading}</h2>
                    {content.description && <p className="mt-2 text-muted-foreground">{content.description}</p>}
                </div>
            )}
            {content.layout === "accordion" ? (
                <Accordion type="single" collapsible className="max-w-2xl mx-auto">
                    {content.items?.map((item) => (
                        <AccordionItem key={item.id} value={item.id}>
                            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {content.items?.map((item) => (
                        <div key={item.id} className="bg-muted/50 rounded-lg p-6">
                            <h3 className="font-semibold mb-2">{item.question}</h3>
                            <p className="text-muted-foreground">{item.answer}</p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

// Announcement Bar Renderer
function AnnouncementBarRenderer({ block, storeSlug }: { block: AnnouncementBarBlock; storeSlug: string }) {
    const { content } = block;
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const resolveLink = (link: string) => {
        if (!link) return undefined;
        if (link.startsWith("http")) return link;
        if (link.startsWith("/")) return `/store/${storeSlug}${link}`;
        return `/store/${storeSlug}/${link}`;
    };

    const linkHref = content.link ? resolveLink(content.link) : undefined;

    return (
        <div 
            className="py-2 px-4 text-center text-sm relative"
            style={{ backgroundColor: content.backgroundColor, color: content.textColor }}
        >
            {linkHref ? (
                <Link href={linkHref} className="hover:underline">
                    {content.text}
                </Link>
            ) : (
                <span>{content.text}</span>
            )}
            {content.dismissible && (
                <button 
                    onClick={() => setDismissed(true)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                    aria-label="Dismiss"
                >
                    ×
                </button>
            )}
        </div>
    );
}

// Image Renderer
function ImageRenderer({ block, maxWidthClass, storeSlug }: { block: ImageBlock; maxWidthClass: string; storeSlug: string }) {
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

    const resolveLink = (link: string) => {
        if (!link) return undefined;
        if (link.startsWith("http")) return link;
        if (link.startsWith("/")) return `/store/${storeSlug}${link}`;
        return `/store/${storeSlug}/${link}`;
    };

    const imageElement = (
        <img 
            src={content.src} 
            alt={content.alt} 
            className={cn("w-full h-full object-cover rounded-lg", aspectRatioClass)}
        />
    );

    return (
        <section className={maxWidthClass}>
            <div className={cn(widthClass, aspectRatioClass)}>
                {content.link ? (
                    <Link href={resolveLink(content.link) as string}>
                        {imageElement}
                    </Link>
                ) : (
                    imageElement
                )}
                {content.caption && (
                    <p className="text-sm text-muted-foreground text-center mt-2">{content.caption}</p>
                )}
            </div>
        </section>
    );
}

// Image Gallery Renderer
function ImageGalleryRenderer({ block, maxWidthClass }: { block: ImageGalleryBlock; maxWidthClass: string }) {
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
                {content.images?.map((image, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-lg">
                        <img src={image.src} alt={image.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                ))}
            </div>
        </section>
    );
}

// Video Renderer
function VideoRenderer({ block, maxWidthClass }: { block: VideoBlock; maxWidthClass: string }) {
    const { content } = block;
    const aspectRatioClass = {
        "16:9": "aspect-video",
        "4:3": "aspect-[4/3]",
        "1:1": "aspect-square",
    }[content.aspectRatio];

    const getEmbedUrl = () => {
        if (!content.url) return null;
        
        if (content.source === "youtube") {
            const match = content.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
            if (match) {
                let url = `https://www.youtube.com/embed/${match[1]}?`;
                if (content.autoplay) url += "autoplay=1&";
                if (content.loop) url += "loop=1&";
                if (content.muted) url += "mute=1&";
                if (!content.controls) url += "controls=0&";
                return url;
            }
        }
        if (content.source === "vimeo") {
            const match = content.url.match(/vimeo\.com\/(\d+)/);
            if (match) {
                let url = `https://player.vimeo.com/video/${match[1]}?`;
                if (content.autoplay) url += "autoplay=1&";
                if (content.loop) url += "loop=1&";
                if (content.muted) url += "muted=1&";
                return url;
            }
        }
        return content.url;
    };

    const embedUrl = getEmbedUrl();

    return (
        <section className={maxWidthClass}>
            <div className={cn("relative overflow-hidden rounded-lg bg-black", aspectRatioClass)}>
                {embedUrl ? (
                    <iframe
                        src={embedUrl}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <HugeiconsIcon icon={PlayIcon} className="h-16 w-16 text-white/50" />
                    </div>
                )}
            </div>
        </section>
    );
}