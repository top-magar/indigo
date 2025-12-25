"use client";

import type { Config, Data, DefaultRootProps } from "@measured/puck";
import type { ReactNode } from "react";

// =====================================================
// TYPES
// =====================================================

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price: number | null;
    images: { url: string; alt: string }[];
}

export interface Collection {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    product_count?: number;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    product_count?: number;
}

// =====================================================
// STYLE HELPERS
// =====================================================

const styles = {
    primary: "var(--primary)",
    primaryForeground: "var(--primary-foreground)",
    secondary: "var(--secondary)",
    secondaryForeground: "var(--secondary-foreground)",
    muted: "var(--muted)",
    mutedForeground: "var(--muted-foreground)",
    background: "var(--background)",
    foreground: "var(--foreground)",
    border: "var(--border)",
    chart1: "var(--chart-1)",
    chart2: "var(--chart-2)",
    chart3: "var(--chart-3)",
    chart4: "var(--chart-4)",
    chart5: "var(--chart-5)",
    destructive: "var(--destructive)",
    radius: "var(--radius)",
};

// =====================================================
// ROOT PROPS - Wraps all page content
// =====================================================

export interface RootProps extends DefaultRootProps {
    showHeader: boolean;
    showFooter: boolean;
    headerStyle: "default" | "transparent" | "minimal";
    footerStyle: "default" | "minimal" | "none";
}

// =====================================================
// COMPONENT PROPS
// =====================================================

// Layout Components
export interface SectionProps {
    padding: "none" | "small" | "medium" | "large";
    background: "none" | "muted" | "primary" | "gradient";
    maxWidth: "full" | "container" | "narrow";
}

export interface GridProps {
    columns: 2 | 3 | 4 | 6;
    gap: "small" | "medium" | "large";
}

export interface FlexProps {
    direction: "row" | "column";
    align: "start" | "center" | "end" | "stretch";
    justify: "start" | "center" | "end" | "between" | "around";
    gap: "small" | "medium" | "large";
    wrap: boolean;
}

// Content Components
export interface HeroProps {
    layout: "center" | "left" | "split";
    title: string;
    subtitle: string;
    description: string;
    primaryButton: { label: string; href: string };
    secondaryButton: { label: string; href: string };
    backgroundImage: string;
    overlayOpacity: number;
    height: "small" | "medium" | "large" | "full";
    theme: "light" | "dark";
}

export interface HeadingProps {
    text: string;
    level: "h1" | "h2" | "h3" | "h4";
    align: "left" | "center" | "right";
}

export interface TextProps {
    content: string;
    align: "left" | "center" | "right";
    size: "small" | "medium" | "large";
}

export interface RichTextProps {
    content: string;
}

export interface ImageProps {
    src: string;
    alt: string;
    aspectRatio: "auto" | "1:1" | "4:3" | "16:9" | "21:9";
    rounded: boolean;
    shadow: boolean;
}

export interface ButtonProps {
    label: string;
    href: string;
    variant: "primary" | "secondary" | "outline" | "ghost";
    size: "small" | "medium" | "large";
    fullWidth: boolean;
}

export interface SpacerProps {
    height: number;
}

export interface DividerProps {
    style: "solid" | "dashed" | "gradient";
    width: "full" | "medium" | "short";
}

// Commerce Components
export interface ProductGridProps {
    source: "featured" | "collection" | "category" | "manual";
    collection?: { id: string; name: string };
    category?: { id: string; name: string };
    productIds?: string[];
    columns: 2 | 3 | 4;
    limit: number;
    showPrice: boolean;
    showAddToCart: boolean;
    cardStyle: "minimal" | "bordered" | "elevated";
    // Resolved data
    products?: Product[];
}

export interface CollectionGridProps {
    columns: 2 | 3 | 4;
    style: "card" | "overlay" | "minimal";
    showProductCount: boolean;
    // Resolved data
    collections?: Collection[];
}

export interface CategoryGridProps {
    columns: 2 | 3 | 4;
    style: "card" | "overlay" | "minimal";
    showProductCount: boolean;
    aspectRatio: "square" | "landscape" | "portrait";
    // Resolved data
    categories?: Category[];
}

export interface ProductCardProps {
    product?: { id: string; name: string };
    showPrice: boolean;
    showAddToCart: boolean;
    // Resolved data
    productData?: Product;
}

// Marketing Components
export interface BannerProps {
    image: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    textPosition: "left" | "center" | "right";
    height: "small" | "medium" | "large";
    overlayOpacity: number;
    theme: "light" | "dark";
}

export interface AnnouncementBarProps {
    text: string;
    link: string;
    theme: "primary" | "accent" | "warning" | "custom";
    customBgColor: string;
    customTextColor: string;
}

export interface NewsletterProps {
    title: string;
    description: string;
    buttonText: string;
    layout: "inline" | "stacked";
    theme: "light" | "dark" | "accent";
}

export interface TestimonialsProps {
    title: string;
    subtitle: string;
    layout: "grid" | "carousel";
    showRating: boolean;
    testimonials: {
        quote: string;
        author: string;
        role: string;
        rating: number;
        avatar?: string;
    }[];
}

export interface FAQProps {
    title: string;
    description: string;
    style: "accordion" | "cards" | "simple";
    items: { question: string; answer: string }[];
}

export interface LogoCloudProps {
    title: string;
    logos: { name: string; url: string }[];
    grayscale: boolean;
}

export interface StatsProps {
    title: string;
    stats: { value: string; label: string; description?: string }[];
    columns: 2 | 3 | 4;
}

export interface VideoProps {
    url: string;
    aspectRatio: "16:9" | "4:3" | "1:1";
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
    controls: boolean;
}

export interface CardProps {
    title: string;
    description: string;
    image?: string;
    link?: string;
    style: "default" | "bordered" | "elevated";
}

// =====================================================
// COMPONENT TYPE MAP
// =====================================================

type Components = {
    // Layout
    Section: SectionProps;
    Grid: GridProps;
    Flex: FlexProps;
    // Content
    Hero: HeroProps;
    Heading: HeadingProps;
    Text: TextProps;
    Image: ImageProps;
    Button: ButtonProps;
    Spacer: SpacerProps;
    Divider: DividerProps;
    Card: CardProps;
    Video: VideoProps;
    // Commerce
    ProductGrid: ProductGridProps;
    CollectionGrid: CollectionGridProps;
    CategoryGrid: CategoryGridProps;
    ProductCard: ProductCardProps;
    // Marketing
    Banner: BannerProps;
    AnnouncementBar: AnnouncementBarProps;
    Newsletter: NewsletterProps;
    Testimonials: TestimonialsProps;
    FAQ: FAQProps;
    LogoCloud: LogoCloudProps;
    Stats: StatsProps;
};

// =====================================================
// MOCK DATA FETCHERS (Replace with real API calls)
// =====================================================

const fetchProducts = async (options: { 
    source: string; 
    collectionId?: string; 
    categoryId?: string;
    productIds?: string[];
    limit: number;
}): Promise<Product[]> => {
    // In production, this would call your API
    // For now, return placeholder data
    return Array(options.limit).fill(null).map((_, i) => ({
        id: `product-${i}`,
        name: `Product ${i + 1}`,
        slug: `product-${i + 1}`,
        price: 29.99 + (i * 10),
        compare_at_price: i % 2 === 0 ? 39.99 + (i * 10) : null,
        images: [{ url: "", alt: `Product ${i + 1}` }],
    }));
};

const fetchCollections = async (): Promise<Collection[]> => {
    return [
        { id: "1", name: "New Arrivals", slug: "new-arrivals", image_url: null, product_count: 24 },
        { id: "2", name: "Best Sellers", slug: "best-sellers", image_url: null, product_count: 18 },
        { id: "3", name: "Sale", slug: "sale", image_url: null, product_count: 12 },
    ];
};

const fetchCategories = async (): Promise<Category[]> => {
    return [
        { id: "1", name: "Clothing", slug: "clothing", image_url: null, product_count: 45 },
        { id: "2", name: "Accessories", slug: "accessories", image_url: null, product_count: 32 },
        { id: "3", name: "Footwear", slug: "footwear", image_url: null, product_count: 28 },
    ];
};

// =====================================================
// PUCK CONFIGURATION
// =====================================================

export const puckConfig: Config<Components> = {
    // Root configuration - wraps all content
    root: {
        defaultProps: {
            title: "Page Title",
        },
        render: ({ children, puck }) => {
            return (
                <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                    {/* Store Header - shown in preview */}
                    {!puck.isEditing && (
                        <header style={{ 
                            padding: "16px 24px", 
                            borderBottom: `1px solid ${styles.border}`,
                            background: styles.background,
                        }}>
                            <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, fontSize: "18px" }}>Store Name</span>
                                <nav style={{ display: "flex", gap: "24px" }}>
                                    <a href="/products" style={{ color: styles.foreground, textDecoration: "none" }}>Shop</a>
                                    <a href="/collections" style={{ color: styles.foreground, textDecoration: "none" }}>Collections</a>
                                    <a href="/about" style={{ color: styles.foreground, textDecoration: "none" }}>About</a>
                                </nav>
                            </div>
                        </header>
                    )}
                    
                    {/* Main Content */}
                    <main style={{ flex: 1 }}>
                        {children}
                    </main>
                    
                    {/* Store Footer - shown in preview */}
                    {!puck.isEditing && (
                        <footer style={{ 
                            padding: "48px 24px", 
                            background: styles.muted,
                            marginTop: "auto",
                        }}>
                            <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
                                <p style={{ color: styles.mutedForeground, fontSize: "14px" }}>
                                    © 2025 Store Name. All rights reserved.
                                </p>
                            </div>
                        </footer>
                    )}
                </div>
            );
        },
    },

    // Component categories
    categories: {
        layout: {
            title: "Layout",
            components: ["Section", "Grid", "Flex", "Spacer", "Divider"],
        },
        content: {
            title: "Content",
            components: ["Hero", "Heading", "Text", "Image", "Button", "Card", "Video"],
        },
        commerce: {
            title: "Commerce",
            components: ["ProductGrid", "CollectionGrid", "CategoryGrid", "ProductCard"],
        },
        marketing: {
            title: "Marketing",
            components: ["Banner", "AnnouncementBar", "Newsletter", "Testimonials", "FAQ", "LogoCloud", "Stats"],
        },
    },

    components: {
        // =====================================================
        // LAYOUT COMPONENTS
        // =====================================================
        
        Section: {
            label: "Section",
            defaultProps: {
                padding: "medium",
                background: "none",
                maxWidth: "container",
            },
            fields: {
                padding: {
                    type: "select",
                    label: "Padding",
                    options: [
                        { label: "None", value: "none" },
                        { label: "Small", value: "small" },
                        { label: "Medium", value: "medium" },
                        { label: "Large", value: "large" },
                    ],
                },
                background: {
                    type: "select",
                    label: "Background",
                    options: [
                        { label: "None", value: "none" },
                        { label: "Muted", value: "muted" },
                        { label: "Primary", value: "primary" },
                        { label: "Gradient", value: "gradient" },
                    ],
                },
                maxWidth: {
                    type: "radio",
                    label: "Max Width",
                    options: [
                        { label: "Full", value: "full" },
                        { label: "Container", value: "container" },
                        { label: "Narrow", value: "narrow" },
                    ],
                },
            },
            render: ({ padding, background, maxWidth, puck }) => {
                const paddingMap = { none: "0", small: "32px", medium: "64px", large: "96px" };
                const maxWidthMap = { full: "100%", container: "1200px", narrow: "800px" };
                const bgMap = {
                    none: "transparent",
                    muted: styles.muted,
                    primary: styles.primary,
                    gradient: `linear-gradient(135deg, ${styles.chart1}, ${styles.chart2})`,
                };
                
                return (
                    <section
                        style={{
                            padding: `${paddingMap[padding]} 24px`,
                            background: bgMap[background],
                        }}
                    >
                        <div style={{ maxWidth: maxWidthMap[maxWidth], margin: "0 auto" }}>
                            <puck.renderDropZone zone="section-content" />
                        </div>
                    </section>
                );
            },
        },

        Grid: {
            label: "Grid",
            defaultProps: {
                columns: 3,
                gap: "medium",
            },
            fields: {
                columns: {
                    type: "select",
                    label: "Columns",
                    options: [
                        { label: "2 Columns", value: 2 },
                        { label: "3 Columns", value: 3 },
                        { label: "4 Columns", value: 4 },
                        { label: "6 Columns", value: 6 },
                    ],
                },
                gap: {
                    type: "radio",
                    label: "Gap",
                    options: [
                        { label: "Small", value: "small" },
                        { label: "Medium", value: "medium" },
                        { label: "Large", value: "large" },
                    ],
                },
            },
            render: ({ columns, gap, puck }) => {
                const gapMap = { small: "16px", medium: "24px", large: "32px" };
                
                return (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${columns}, 1fr)`,
                            gap: gapMap[gap],
                        }}
                    >
                        <puck.renderDropZone 
                            zone="grid-items" 
                            disallow={["Hero", "Section"]}
                        />
                    </div>
                );
            },
        },

        Flex: {
            label: "Flex Container",
            defaultProps: {
                direction: "row",
                align: "center",
                justify: "start",
                gap: "medium",
                wrap: true,
            },
            fields: {
                direction: {
                    type: "radio",
                    label: "Direction",
                    options: [
                        { label: "Row", value: "row" },
                        { label: "Column", value: "column" },
                    ],
                },
                align: {
                    type: "select",
                    label: "Align Items",
                    options: [
                        { label: "Start", value: "start" },
                        { label: "Center", value: "center" },
                        { label: "End", value: "end" },
                        { label: "Stretch", value: "stretch" },
                    ],
                },
                justify: {
                    type: "select",
                    label: "Justify Content",
                    options: [
                        { label: "Start", value: "start" },
                        { label: "Center", value: "center" },
                        { label: "End", value: "end" },
                        { label: "Space Between", value: "between" },
                        { label: "Space Around", value: "around" },
                    ],
                },
                gap: {
                    type: "radio",
                    label: "Gap",
                    options: [
                        { label: "Small", value: "small" },
                        { label: "Medium", value: "medium" },
                        { label: "Large", value: "large" },
                    ],
                },
                wrap: {
                    type: "radio",
                    label: "Wrap",
                    options: [
                        { label: "Yes", value: true },
                        { label: "No", value: false },
                    ],
                },
            },
            render: ({ direction, align, justify, gap, wrap, puck }) => {
                const gapMap = { small: "12px", medium: "24px", large: "36px" };
                const alignMap = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch" };
                const justifyMap = { start: "flex-start", center: "center", end: "flex-end", between: "space-between", around: "space-around" };
                
                return (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: direction,
                            alignItems: alignMap[align],
                            justifyContent: justifyMap[justify],
                            gap: gapMap[gap],
                            flexWrap: wrap ? "wrap" : "nowrap",
                        }}
                    >
                        <puck.renderDropZone zone="flex-items" />
                    </div>
                );
            },
        },

        Spacer: {
            label: "Spacer",
            defaultProps: { height: 64 },
            fields: {
                height: { type: "number", label: "Height (px)", min: 8, max: 200 },
            },
            render: ({ height }) => <div style={{ height: `${height}px` }} />,
        },

        Divider: {
            label: "Divider",
            defaultProps: { style: "solid", width: "full" },
            fields: {
                style: {
                    type: "radio",
                    label: "Style",
                    options: [
                        { label: "Solid", value: "solid" },
                        { label: "Dashed", value: "dashed" },
                        { label: "Gradient", value: "gradient" },
                    ],
                },
                width: {
                    type: "radio",
                    label: "Width",
                    options: [
                        { label: "Full", value: "full" },
                        { label: "Medium", value: "medium" },
                        { label: "Short", value: "short" },
                    ],
                },
            },
            render: ({ style, width }) => {
                const widthMap = { full: "100%", medium: "66%", short: "33%" };
                const isGradient = style === "gradient";
                
                return (
                    <div style={{ padding: "24px 0" }}>
                        <hr
                            style={{
                                width: widthMap[width],
                                margin: "0 auto",
                                border: "none",
                                height: isGradient ? "2px" : "1px",
                                background: isGradient
                                    ? `linear-gradient(90deg, transparent, ${styles.border}, transparent)`
                                    : styles.border,
                                borderStyle: isGradient ? undefined : style,
                            }}
                        />
                    </div>
                );
            },
        },


        // =====================================================
        // CONTENT COMPONENTS
        // =====================================================

        Hero: {
            label: "Hero Section",
            defaultProps: {
                layout: "center",
                title: "Welcome to Our Store",
                subtitle: "Discover amazing products",
                description: "Shop the latest collection with free shipping on orders over $50",
                primaryButton: { label: "Shop Now", href: "/products" },
                secondaryButton: { label: "", href: "" },
                backgroundImage: "",
                overlayOpacity: 40,
                height: "large",
                theme: "light",
            },
            fields: {
                layout: {
                    type: "radio",
                    label: "Layout",
                    options: [
                        { label: "Center", value: "center" },
                        { label: "Left", value: "left" },
                        { label: "Split", value: "split" },
                    ],
                },
                title: { type: "text", label: "Title" },
                subtitle: { type: "text", label: "Subtitle" },
                description: { type: "textarea", label: "Description" },
                primaryButton: {
                    type: "object",
                    label: "Primary Button",
                    objectFields: {
                        label: { type: "text", label: "Label" },
                        href: { type: "text", label: "Link" },
                    },
                },
                secondaryButton: {
                    type: "object",
                    label: "Secondary Button",
                    objectFields: {
                        label: { type: "text", label: "Label" },
                        href: { type: "text", label: "Link" },
                    },
                },
                backgroundImage: { type: "text", label: "Background Image URL" },
                height: {
                    type: "select",
                    label: "Height",
                    options: [
                        { label: "Small", value: "small" },
                        { label: "Medium", value: "medium" },
                        { label: "Large", value: "large" },
                        { label: "Full Screen", value: "full" },
                    ],
                },
                overlayOpacity: { type: "number", label: "Overlay Opacity (%)", min: 0, max: 100 },
                theme: {
                    type: "radio",
                    label: "Theme",
                    options: [
                        { label: "Light", value: "light" },
                        { label: "Dark", value: "dark" },
                    ],
                },
            },
            render: ({ layout, title, subtitle, description, primaryButton, secondaryButton, backgroundImage, height, overlayOpacity, theme }) => {
                const heightMap = { small: "300px", medium: "450px", large: "600px", full: "100vh" };
                const alignMap = { center: "center", left: "flex-start", split: "flex-start" };
                const isDark = theme === "dark" || backgroundImage;

                return (
                    <section
                        style={{
                            minHeight: heightMap[height],
                            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                            backgroundColor: isDark && !backgroundImage ? styles.primary : styles.background,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: alignMap[layout],
                            padding: "64px 24px",
                            textAlign: layout === "center" ? "center" : "left",
                        }}
                    >
                        {backgroundImage && (
                            <div style={{ position: "absolute", inset: 0, backgroundColor: "black", opacity: overlayOpacity / 100 }} />
                        )}
                        <div style={{ position: "relative", zIndex: 1, maxWidth: layout === "split" ? "50%" : "800px" }}>
                            {subtitle && (
                                <p style={{ fontSize: "14px", fontWeight: 600, color: styles.chart1, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    {subtitle}
                                </p>
                            )}
                            <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, marginBottom: "16px", lineHeight: 1.1, color: isDark ? styles.primaryForeground : styles.foreground }}>
                                {title}
                            </h1>
                            {description && (
                                <p style={{ fontSize: "18px", color: isDark ? "rgba(255,255,255,0.8)" : styles.mutedForeground, marginBottom: "32px", lineHeight: 1.6 }}>
                                    {description}
                                </p>
                            )}
                            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: layout === "center" ? "center" : "flex-start" }}>
                                {primaryButton?.label && (
                                    <a href={primaryButton.href || "#"} style={{ padding: "14px 28px", backgroundColor: isDark ? styles.background : styles.primary, color: isDark ? styles.foreground : styles.primaryForeground, borderRadius: "10px", fontWeight: 600, textDecoration: "none", fontSize: "15px" }}>
                                        {primaryButton.label}
                                    </a>
                                )}
                                {secondaryButton?.label && (
                                    <a href={secondaryButton.href || "#"} style={{ padding: "14px 28px", border: `2px solid ${isDark ? "rgba(255,255,255,0.3)" : styles.border}`, backgroundColor: "transparent", color: isDark ? styles.primaryForeground : styles.foreground, borderRadius: "10px", fontWeight: 600, textDecoration: "none", fontSize: "15px" }}>
                                        {secondaryButton.label}
                                    </a>
                                )}
                            </div>
                        </div>
                    </section>
                );
            },
        },

        Heading: {
            label: "Heading",
            defaultProps: {
                text: "Heading Text",
                level: "h2",
                align: "left",
            },
            fields: {
                text: { type: "text", label: "Text" },
                level: {
                    type: "select",
                    label: "Level",
                    options: [
                        { label: "H1", value: "h1" },
                        { label: "H2", value: "h2" },
                        { label: "H3", value: "h3" },
                        { label: "H4", value: "h4" },
                    ],
                },
                align: {
                    type: "radio",
                    label: "Alignment",
                    options: [
                        { label: "Left", value: "left" },
                        { label: "Center", value: "center" },
                        { label: "Right", value: "right" },
                    ],
                },
            },
            render: ({ text, level, align }) => {
                const sizeMap = { h1: "40px", h2: "32px", h3: "24px", h4: "20px" };
                if (level === "h1") return <h1 style={{ fontSize: sizeMap[level], fontWeight: 700, textAlign: align, color: styles.foreground, margin: "16px 0" }}>{text}</h1>;
                if (level === "h2") return <h2 style={{ fontSize: sizeMap[level], fontWeight: 700, textAlign: align, color: styles.foreground, margin: "16px 0" }}>{text}</h2>;
                if (level === "h3") return <h3 style={{ fontSize: sizeMap[level], fontWeight: 700, textAlign: align, color: styles.foreground, margin: "16px 0" }}>{text}</h3>;
                return <h4 style={{ fontSize: sizeMap[level], fontWeight: 700, textAlign: align, color: styles.foreground, margin: "16px 0" }}>{text}</h4>;
            },
        },

        Text: {
            label: "Text",
            defaultProps: {
                content: "Enter your text here. This is a versatile text block for paragraphs and descriptions.",
                align: "left",
                size: "medium",
            },
            fields: {
                content: { type: "textarea", label: "Content" },
                align: {
                    type: "radio",
                    label: "Alignment",
                    options: [
                        { label: "Left", value: "left" },
                        { label: "Center", value: "center" },
                        { label: "Right", value: "right" },
                    ],
                },
                size: {
                    type: "radio",
                    label: "Size",
                    options: [
                        { label: "Small", value: "small" },
                        { label: "Medium", value: "medium" },
                        { label: "Large", value: "large" },
                    ],
                },
            },
            render: ({ content, align, size }) => {
                const sizeMap = { small: "14px", medium: "16px", large: "18px" };
                return (
                    <p style={{ fontSize: sizeMap[size], textAlign: align, color: styles.foreground, lineHeight: 1.7, margin: "16px 0" }}>
                        {content}
                    </p>
                );
            },
        },

        Image: {
            label: "Image",
            defaultProps: {
                src: "",
                alt: "",
                aspectRatio: "auto",
                rounded: true,
                shadow: false,
            },
            fields: {
                src: { type: "text", label: "Image URL" },
                alt: { type: "text", label: "Alt Text" },
                aspectRatio: {
                    type: "select",
                    label: "Aspect Ratio",
                    options: [
                        { label: "Auto", value: "auto" },
                        { label: "Square", value: "1:1" },
                        { label: "4:3", value: "4:3" },
                        { label: "16:9", value: "16:9" },
                        { label: "21:9", value: "21:9" },
                    ],
                },
                rounded: { type: "radio", label: "Rounded", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
                shadow: { type: "radio", label: "Shadow", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
            },
            render: ({ src, alt, aspectRatio, rounded, shadow }) => {
                const ratioMap = { auto: "auto", "1:1": "1/1", "4:3": "4/3", "16:9": "16/9", "21:9": "21/9" };
                return (
                    <div
                        style={{
                            aspectRatio: ratioMap[aspectRatio],
                            backgroundColor: styles.muted,
                            borderRadius: rounded ? "12px" : "0",
                            overflow: "hidden",
                            boxShadow: shadow ? "0 10px 25px -5px rgba(0,0,0,0.1)" : undefined,
                        }}
                    >
                        {src ? (
                            <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <div style={{ width: "100%", height: "100%", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: styles.mutedForeground }}>
                                Image Placeholder
                            </div>
                        )}
                    </div>
                );
            },
        },

        Button: {
            label: "Button",
            defaultProps: {
                label: "Click Here",
                href: "#",
                variant: "primary",
                size: "medium",
                fullWidth: false,
            },
            fields: {
                label: { type: "text", label: "Label" },
                href: { type: "text", label: "Link" },
                variant: {
                    type: "select",
                    label: "Variant",
                    options: [
                        { label: "Primary", value: "primary" },
                        { label: "Secondary", value: "secondary" },
                        { label: "Outline", value: "outline" },
                        { label: "Ghost", value: "ghost" },
                    ],
                },
                size: {
                    type: "radio",
                    label: "Size",
                    options: [
                        { label: "Small", value: "small" },
                        { label: "Medium", value: "medium" },
                        { label: "Large", value: "large" },
                    ],
                },
                fullWidth: { type: "radio", label: "Full Width", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
            },
            render: ({ label, href, variant, size, fullWidth }) => {
                const sizeStyles = { small: { padding: "8px 16px", fontSize: "13px" }, medium: { padding: "12px 24px", fontSize: "14px" }, large: { padding: "16px 32px", fontSize: "16px" } };
                const variantStyles = {
                    primary: { backgroundColor: styles.primary, color: styles.primaryForeground, border: "none" },
                    secondary: { backgroundColor: styles.secondary, color: styles.secondaryForeground, border: "none" },
                    outline: { backgroundColor: "transparent", color: styles.foreground, border: `2px solid ${styles.border}` },
                    ghost: { backgroundColor: "transparent", color: styles.foreground, border: "none" },
                };
                return (
                    <a
                        href={href}
                        style={{
                            ...sizeStyles[size],
                            ...variantStyles[variant],
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "10px",
                            fontWeight: 600,
                            textDecoration: "none",
                            width: fullWidth ? "100%" : "auto",
                        }}
                    >
                        {label}
                    </a>
                );
            },
        },

        Card: {
            label: "Card",
            defaultProps: {
                title: "Card Title",
                description: "Card description goes here.",
                image: "",
                link: "",
                style: "bordered",
            },
            fields: {
                title: { type: "text", label: "Title" },
                description: { type: "textarea", label: "Description" },
                image: { type: "text", label: "Image URL" },
                link: { type: "text", label: "Link URL" },
                style: {
                    type: "radio",
                    label: "Style",
                    options: [
                        { label: "Default", value: "default" },
                        { label: "Bordered", value: "bordered" },
                        { label: "Elevated", value: "elevated" },
                    ],
                },
            },
            render: ({ title, description, image, style }) => {
                const styleMap = {
                    default: {},
                    bordered: { border: `1px solid ${styles.border}` },
                    elevated: { boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" },
                };
                return (
                    <div style={{ borderRadius: "12px", overflow: "hidden", background: styles.background, ...styleMap[style] }}>
                        {image && (
                            <div style={{ aspectRatio: "16/9", background: styles.muted }}>
                                <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                        )}
                        <div style={{ padding: "20px" }}>
                            <h3 style={{ fontWeight: 600, fontSize: "18px", marginBottom: "8px", color: styles.foreground }}>{title}</h3>
                            <p style={{ color: styles.mutedForeground, fontSize: "14px", lineHeight: 1.6 }}>{description}</p>
                        </div>
                    </div>
                );
            },
        },

        Video: {
            label: "Video",
            defaultProps: {
                url: "",
                aspectRatio: "16:9",
                autoplay: false,
                muted: true,
                loop: false,
                controls: true,
            },
            fields: {
                url: { type: "text", label: "Video URL" },
                aspectRatio: {
                    type: "select",
                    label: "Aspect Ratio",
                    options: [
                        { label: "16:9", value: "16:9" },
                        { label: "4:3", value: "4:3" },
                        { label: "1:1", value: "1:1" },
                    ],
                },
                autoplay: { type: "radio", label: "Autoplay", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
                muted: { type: "radio", label: "Muted", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
                loop: { type: "radio", label: "Loop", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
                controls: { type: "radio", label: "Controls", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
            },
            render: ({ url, aspectRatio, autoplay, muted, loop, controls }) => {
                const ratioMap = { "16:9": "16/9", "4:3": "4/3", "1:1": "1/1" };
                const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
                const isVimeo = url.includes("vimeo.com");

                const getEmbedUrl = () => {
                    if (isYouTube) {
                        const videoId = url.includes("youtu.be") ? url.split("/").pop() : new URLSearchParams(new URL(url).search).get("v");
                        return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&controls=${controls ? 1 : 0}`;
                    }
                    if (isVimeo) {
                        const videoId = url.split("/").pop();
                        return `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}&muted=${muted ? 1 : 0}&loop=${loop ? 1 : 0}`;
                    }
                    return url;
                };

                return (
                    <div style={{ aspectRatio: ratioMap[aspectRatio], backgroundColor: styles.muted, borderRadius: "12px", overflow: "hidden" }}>
                        {url ? (
                            isYouTube || isVimeo ? (
                                <iframe src={getEmbedUrl()} style={{ width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                            ) : (
                                <video src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} autoPlay={autoplay} muted={muted} loop={loop} controls={controls} />
                            )
                        ) : (
                            <div style={{ width: "100%", height: "100%", minHeight: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: styles.mutedForeground, gap: "8px" }}>
                                <span style={{ fontSize: "32px" }}>▶</span>
                                <span>Video Placeholder</span>
                            </div>
                        )}
                    </div>
                );
            },
        },


        // =====================================================
        // COMMERCE COMPONENTS
        // =====================================================

        ProductGrid: {
            label: "Product Grid",
            defaultProps: {
                source: "featured",
                collection: undefined,
                category: undefined,
                productIds: [],
                columns: 4,
                limit: 4,
                showPrice: true,
                showAddToCart: true,
                cardStyle: "bordered",
                products: [],
            },
            fields: {
                source: {
                    type: "select",
                    label: "Product Source",
                    options: [
                        { label: "Featured Products", value: "featured" },
                        { label: "From Collection", value: "collection" },
                        { label: "From Category", value: "category" },
                        { label: "Manual Selection", value: "manual" },
                    ],
                },
                columns: {
                    type: "select",
                    label: "Columns",
                    options: [
                        { label: "2 Columns", value: 2 },
                        { label: "3 Columns", value: 3 },
                        { label: "4 Columns", value: 4 },
                    ],
                },
                limit: { type: "number", label: "Number of Products", min: 1, max: 12 },
                showPrice: { type: "radio", label: "Show Price", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
                showAddToCart: { type: "radio", label: "Show Add to Cart", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
                cardStyle: {
                    type: "radio",
                    label: "Card Style",
                    options: [
                        { label: "Minimal", value: "minimal" },
                        { label: "Bordered", value: "bordered" },
                        { label: "Elevated", value: "elevated" },
                    ],
                },
            },
            resolveData: async ({ props }, { changed }) => {
                // Only fetch if source or limit changed
                if (!changed.source && !changed.limit && !changed.collection && !changed.category) {
                    return { props };
                }

                const products = await fetchProducts({
                    source: props.source,
                    collectionId: props.collection?.id,
                    categoryId: props.category?.id,
                    productIds: props.productIds,
                    limit: props.limit,
                });

                return {
                    props: {
                        ...props,
                        products,
                    },
                };
            },
            render: ({ columns, showPrice, showAddToCart, cardStyle, products = [], limit }) => {
                const displayProducts = products.length > 0 ? products : Array(limit).fill(null).map((_, i) => ({
                    id: `placeholder-${i}`,
                    name: `Product ${i + 1}`,
                    slug: `product-${i + 1}`,
                    price: 29.99 + (i * 10),
                    compare_at_price: i % 2 === 0 ? 39.99 + (i * 10) : null,
                    images: [],
                }));

                const cardStyles = {
                    minimal: {},
                    bordered: { border: `1px solid ${styles.border}`, borderRadius: "12px" },
                    elevated: { boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", borderRadius: "12px" },
                };

                return (
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "24px" }}>
                        {displayProducts.map((product) => (
                            <div key={product.id} style={{ ...cardStyles[cardStyle], overflow: "hidden" }}>
                                <div style={{ aspectRatio: "1", backgroundColor: styles.muted, borderRadius: cardStyle === "minimal" ? "12px" : "0", marginBottom: cardStyle === "minimal" ? "16px" : "0", display: "flex", alignItems: "center", justifyContent: "center", color: styles.mutedForeground }}>
                                    {product.images?.[0]?.url ? (
                                        <img src={product.images[0].url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        "Product Image"
                                    )}
                                </div>
                                <div style={{ padding: cardStyle === "minimal" ? "0" : "16px" }}>
                                    <h3 style={{ fontWeight: 600, fontSize: "16px", color: styles.foreground, marginBottom: "8px" }}>{product.name}</h3>
                                    {showPrice && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ fontWeight: 600, color: styles.foreground }}>${product.price.toFixed(2)}</span>
                                            {product.compare_at_price && (
                                                <span style={{ fontSize: "14px", color: styles.mutedForeground, textDecoration: "line-through" }}>${product.compare_at_price.toFixed(2)}</span>
                                            )}
                                        </div>
                                    )}
                                    {showAddToCart && (
                                        <button style={{ marginTop: "12px", width: "100%", padding: "10px", backgroundColor: styles.primary, color: styles.primaryForeground, borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 500 }}>
                                            Add to Cart
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            },
        },

        CollectionGrid: {
            label: "Collection Grid",
            defaultProps: {
                columns: 3,
                style: "overlay",
                showProductCount: true,
                collections: [],
            },
            fields: {
                columns: {
                    type: "select",
                    label: "Columns",
                    options: [
                        { label: "2 Columns", value: 2 },
                        { label: "3 Columns", value: 3 },
                        { label: "4 Columns", value: 4 },
                    ],
                },
                style: {
                    type: "radio",
                    label: "Style",
                    options: [
                        { label: "Card", value: "card" },
                        { label: "Overlay", value: "overlay" },
                        { label: "Minimal", value: "minimal" },
                    ],
                },
                showProductCount: { type: "radio", label: "Show Product Count", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
            },
            resolveData: async ({ props }) => {
                const collections = await fetchCollections();
                return { props: { ...props, collections } };
            },
            render: ({ columns, style, showProductCount, collections = [] }) => {
                const displayCollections = collections.length > 0 ? collections : [
                    { id: "1", name: "New Arrivals", slug: "new", image_url: null, product_count: 24 },
                    { id: "2", name: "Best Sellers", slug: "best", image_url: null, product_count: 18 },
                    { id: "3", name: "Sale", slug: "sale", image_url: null, product_count: 12 },
                ];

                return (
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "24px" }}>
                        {displayCollections.map((collection) => (
                            <a
                                key={collection.id}
                                href={`/collections/${collection.slug}`}
                                style={{
                                    position: "relative",
                                    aspectRatio: "1",
                                    backgroundColor: style === "overlay" ? styles.primary : styles.muted,
                                    borderRadius: "16px",
                                    overflow: "hidden",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: style === "card" ? "flex-end" : "center",
                                    alignItems: "center",
                                    padding: "24px",
                                    textDecoration: "none",
                                    border: style === "minimal" ? `1px solid ${styles.border}` : undefined,
                                }}
                            >
                                {style === "overlay" && (
                                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
                                )}
                                <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                                    <h3 style={{ fontWeight: 700, fontSize: "20px", color: style === "overlay" ? "#ffffff" : styles.foreground, marginBottom: showProductCount ? "4px" : "0" }}>
                                        {collection.name}
                                    </h3>
                                    {showProductCount && (
                                        <p style={{ fontSize: "14px", color: style === "overlay" ? "rgba(255,255,255,0.8)" : styles.mutedForeground }}>
                                            {collection.product_count} products
                                        </p>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                );
            },
        },

        CategoryGrid: {
            label: "Category Grid",
            defaultProps: {
                columns: 3,
                style: "card",
                showProductCount: true,
                aspectRatio: "square",
                categories: [],
            },
            fields: {
                columns: {
                    type: "select",
                    label: "Columns",
                    options: [
                        { label: "2 Columns", value: 2 },
                        { label: "3 Columns", value: 3 },
                        { label: "4 Columns", value: 4 },
                    ],
                },
                style: {
                    type: "radio",
                    label: "Style",
                    options: [
                        { label: "Card", value: "card" },
                        { label: "Overlay", value: "overlay" },
                        { label: "Minimal", value: "minimal" },
                    ],
                },
                showProductCount: { type: "radio", label: "Show Product Count", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
                aspectRatio: {
                    type: "radio",
                    label: "Aspect Ratio",
                    options: [
                        { label: "Square", value: "square" },
                        { label: "Landscape", value: "landscape" },
                        { label: "Portrait", value: "portrait" },
                    ],
                },
            },
            resolveData: async ({ props }) => {
                const categories = await fetchCategories();
                return { props: { ...props, categories } };
            },
            render: ({ columns, style, showProductCount, aspectRatio, categories = [] }) => {
                const displayCategories = categories.length > 0 ? categories : [
                    { id: "1", name: "Clothing", slug: "clothing", image_url: null, product_count: 45 },
                    { id: "2", name: "Accessories", slug: "accessories", image_url: null, product_count: 32 },
                    { id: "3", name: "Footwear", slug: "footwear", image_url: null, product_count: 28 },
                ];

                const ratioMap = { square: "1/1", landscape: "4/3", portrait: "3/4" };

                return (
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "24px" }}>
                        {displayCategories.map((category) => (
                            <a
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                style={{
                                    position: "relative",
                                    aspectRatio: ratioMap[aspectRatio],
                                    backgroundColor: style === "overlay" ? styles.primary : styles.muted,
                                    borderRadius: "16px",
                                    overflow: "hidden",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: style === "card" ? "flex-end" : "center",
                                    alignItems: "center",
                                    padding: "24px",
                                    textDecoration: "none",
                                    border: style === "minimal" ? `1px solid ${styles.border}` : undefined,
                                }}
                            >
                                {style === "overlay" && (
                                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
                                )}
                                <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                                    <h3 style={{ fontWeight: 700, fontSize: "20px", color: style === "overlay" ? "#ffffff" : styles.foreground, marginBottom: showProductCount ? "4px" : "0" }}>
                                        {category.name}
                                    </h3>
                                    {showProductCount && (
                                        <p style={{ fontSize: "14px", color: style === "overlay" ? "rgba(255,255,255,0.8)" : styles.mutedForeground }}>
                                            {category.product_count} products
                                        </p>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                );
            },
        },

        ProductCard: {
            label: "Single Product",
            defaultProps: {
                product: undefined,
                showPrice: true,
                showAddToCart: true,
                productData: undefined,
            },
            fields: {
                product: {
                    type: "external",
                    label: "Select Product",
                    placeholder: "Search for a product...",
                    fetchList: async ({ query }) => {
                        // In production, this would search your products API
                        const products = await fetchProducts({ source: "featured", limit: 10 });
                        return products
                            .filter(p => !query || p.name.toLowerCase().includes(query.toLowerCase()))
                            .map(p => ({ id: p.id, title: p.name, description: `$${p.price}` }));
                    },
                    mapProp: (result) => ({ id: result.id, name: result.title }),
                    getItemSummary: (item) => item?.name || "No product selected",
                },
                showPrice: { type: "radio", label: "Show Price", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
                showAddToCart: { type: "radio", label: "Show Add to Cart", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
            },
            resolveData: async ({ props }, { changed }) => {
                if (!changed.product || !props.product?.id) return { props };
                
                const products = await fetchProducts({ source: "manual", productIds: [props.product.id], limit: 1 });
                return { props: { ...props, productData: products[0] } };
            },
            render: ({ showPrice, showAddToCart, productData, product }) => {
                const displayProduct = productData || {
                    id: "placeholder",
                    name: product?.name || "Select a Product",
                    price: 0,
                    compare_at_price: null,
                    images: [],
                };

                return (
                    <div style={{ border: `1px solid ${styles.border}`, borderRadius: "12px", overflow: "hidden" }}>
                        <div style={{ aspectRatio: "1", backgroundColor: styles.muted, display: "flex", alignItems: "center", justifyContent: "center", color: styles.mutedForeground }}>
                            {displayProduct.images?.[0]?.url ? (
                                <img src={displayProduct.images[0].url} alt={displayProduct.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                "Product Image"
                            )}
                        </div>
                        <div style={{ padding: "16px" }}>
                            <h3 style={{ fontWeight: 600, fontSize: "16px", color: styles.foreground, marginBottom: "8px" }}>{displayProduct.name}</h3>
                            {showPrice && displayProduct.price > 0 && (
                                <p style={{ fontWeight: 600, color: styles.foreground }}>${displayProduct.price.toFixed(2)}</p>
                            )}
                            {showAddToCart && (
                                <button style={{ marginTop: "12px", width: "100%", padding: "10px", backgroundColor: styles.primary, color: styles.primaryForeground, borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 500 }}>
                                    Add to Cart
                                </button>
                            )}
                        </div>
                    </div>
                );
            },
        },


        // =====================================================
        // MARKETING COMPONENTS
        // =====================================================

        Banner: {
            label: "Banner",
            defaultProps: {
                image: "",
                title: "Special Offer",
                description: "Limited time only - save up to 50%",
                buttonText: "Shop Now",
                buttonLink: "/sale",
                textPosition: "center",
                height: "medium",
                overlayOpacity: 40,
                theme: "light",
            },
            fields: {
                image: { type: "text", label: "Background Image URL" },
                title: { type: "text", label: "Title" },
                description: { type: "textarea", label: "Description" },
                buttonText: { type: "text", label: "Button Text" },
                buttonLink: { type: "text", label: "Button Link" },
                textPosition: {
                    type: "radio",
                    label: "Text Position",
                    options: [
                        { label: "Left", value: "left" },
                        { label: "Center", value: "center" },
                        { label: "Right", value: "right" },
                    ],
                },
                height: {
                    type: "select",
                    label: "Height",
                    options: [
                        { label: "Small", value: "small" },
                        { label: "Medium", value: "medium" },
                        { label: "Large", value: "large" },
                    ],
                },
                overlayOpacity: { type: "number", label: "Overlay Opacity (%)", min: 0, max: 100 },
                theme: {
                    type: "radio",
                    label: "Theme",
                    options: [
                        { label: "Light", value: "light" },
                        { label: "Dark", value: "dark" },
                    ],
                },
            },
            render: ({ image, title, description, buttonText, buttonLink, textPosition, height, overlayOpacity, theme }) => {
                const heightMap = { small: "200px", medium: "300px", large: "400px" };
                const alignMap = { left: "flex-start", center: "center", right: "flex-end" };
                const isDark = theme === "dark" || image;

                return (
                    <section
                        style={{
                            minHeight: heightMap[height],
                            backgroundImage: image ? `url(${image})` : undefined,
                            backgroundColor: isDark && !image ? styles.primary : styles.muted,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: alignMap[textPosition],
                            padding: "48px 24px",
                            textAlign: textPosition,
                        }}
                    >
                        {image && <div style={{ position: "absolute", inset: 0, backgroundColor: "black", opacity: overlayOpacity / 100 }} />}
                        <div style={{ position: "relative", zIndex: 1, maxWidth: "600px" }}>
                            {title && <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "12px", color: isDark ? styles.primaryForeground : styles.foreground }}>{title}</h2>}
                            {description && <p style={{ color: isDark ? "rgba(255,255,255,0.8)" : styles.mutedForeground, marginBottom: "20px", lineHeight: 1.6 }}>{description}</p>}
                            {buttonText && (
                                <a href={buttonLink || "#"} style={{ display: "inline-block", padding: "12px 24px", backgroundColor: isDark ? styles.background : styles.primary, color: isDark ? styles.foreground : styles.primaryForeground, borderRadius: "8px", fontWeight: 600, textDecoration: "none" }}>
                                    {buttonText}
                                </a>
                            )}
                        </div>
                    </section>
                );
            },
        },

        AnnouncementBar: {
            label: "Announcement Bar",
            defaultProps: {
                text: "🎉 Free shipping on orders over $50!",
                link: "",
                theme: "primary",
                customBgColor: "#000000",
                customTextColor: "#ffffff",
            },
            fields: {
                text: { type: "text", label: "Text" },
                link: { type: "text", label: "Link URL" },
                theme: {
                    type: "select",
                    label: "Theme",
                    options: [
                        { label: "Primary", value: "primary" },
                        { label: "Accent", value: "accent" },
                        { label: "Warning", value: "warning" },
                        { label: "Custom", value: "custom" },
                    ],
                },
                customBgColor: { type: "text", label: "Custom Background" },
                customTextColor: { type: "text", label: "Custom Text Color" },
            },
            // resolveFields removed - Puck handles conditional fields differently
            render: ({ text, link, theme, customBgColor, customTextColor }) => {
                const themeStyles = {
                    primary: { bg: styles.primary, text: styles.primaryForeground },
                    accent: { bg: styles.chart1, text: "#ffffff" },
                    warning: { bg: styles.chart4, text: styles.primary },
                    custom: { bg: customBgColor, text: customTextColor },
                };
                const t = themeStyles[theme];

                return (
                    <div style={{ padding: "12px 24px", backgroundColor: t.bg, color: t.text, textAlign: "center", fontSize: "14px", fontWeight: 500 }}>
                        {link ? (
                            <a href={link} style={{ color: t.text, textDecoration: "none" }}>
                                {text} <span style={{ marginLeft: "6px" }}>→</span>
                            </a>
                        ) : (
                            text
                        )}
                    </div>
                );
            },
        },

        Newsletter: {
            label: "Newsletter",
            defaultProps: {
                title: "Subscribe to Our Newsletter",
                description: "Get the latest updates, exclusive offers, and new arrivals delivered to your inbox.",
                buttonText: "Subscribe",
                layout: "inline",
                theme: "light",
            },
            fields: {
                title: { type: "text", label: "Title" },
                description: { type: "textarea", label: "Description" },
                buttonText: { type: "text", label: "Button Text" },
                layout: {
                    type: "radio",
                    label: "Layout",
                    options: [
                        { label: "Inline", value: "inline" },
                        { label: "Stacked", value: "stacked" },
                    ],
                },
                theme: {
                    type: "radio",
                    label: "Theme",
                    options: [
                        { label: "Light", value: "light" },
                        { label: "Dark", value: "dark" },
                        { label: "Accent", value: "accent" },
                    ],
                },
            },
            render: ({ title, description, buttonText, layout, theme }) => {
                const themeStyles = {
                    light: { bg: styles.muted, text: styles.foreground, subtext: styles.mutedForeground },
                    dark: { bg: styles.primary, text: styles.primaryForeground, subtext: "rgba(255,255,255,0.7)" },
                    accent: { bg: styles.chart1, text: "#ffffff", subtext: "rgba(255,255,255,0.8)" },
                };
                const t = themeStyles[theme];

                return (
                    <section style={{ padding: "80px 24px", backgroundColor: t.bg }}>
                        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
                            {title && <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "12px", color: t.text }}>{title}</h2>}
                            {description && <p style={{ color: t.subtext, marginBottom: "32px", lineHeight: 1.6 }}>{description}</p>}
                            <div style={{ display: "flex", flexDirection: layout === "stacked" ? "column" : "row", gap: "12px", justifyContent: "center", maxWidth: "450px", margin: "0 auto" }}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    style={{
                                        flex: 1,
                                        padding: "14px 18px",
                                        border: theme === "light" ? `1px solid ${styles.border}` : "none",
                                        borderRadius: "10px",
                                        backgroundColor: theme === "light" ? styles.background : "rgba(255,255,255,0.1)",
                                        color: theme === "light" ? styles.foreground : "#ffffff",
                                        fontSize: "15px",
                                    }}
                                />
                                <button
                                    style={{
                                        padding: "14px 28px",
                                        backgroundColor: theme === "light" ? styles.primary : styles.background,
                                        color: theme === "light" ? styles.primaryForeground : styles.foreground,
                                        borderRadius: "10px",
                                        border: "none",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {buttonText}
                                </button>
                            </div>
                        </div>
                    </section>
                );
            },
        },

        Testimonials: {
            label: "Testimonials",
            defaultProps: {
                title: "What Our Customers Say",
                subtitle: "Real reviews from real customers",
                layout: "grid",
                showRating: true,
                testimonials: [
                    { quote: "Amazing products and exceptional customer service!", author: "Sarah M.", role: "Verified Buyer", rating: 5 },
                    { quote: "Fast shipping and quality exceeded expectations.", author: "John D.", role: "Verified Buyer", rating: 5 },
                    { quote: "Great selection and competitive prices.", author: "Emily R.", role: "Verified Buyer", rating: 4 },
                ],
            },
            fields: {
                title: { type: "text", label: "Title" },
                subtitle: { type: "text", label: "Subtitle" },
                layout: {
                    type: "radio",
                    label: "Layout",
                    options: [
                        { label: "Grid", value: "grid" },
                        { label: "Carousel", value: "carousel" },
                    ],
                },
                showRating: { type: "radio", label: "Show Rating", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
                testimonials: {
                    type: "array",
                    label: "Testimonials",
                    min: 1,
                    max: 6,
                    getItemSummary: (item) => item.author || "Testimonial",
                    arrayFields: {
                        quote: { type: "textarea", label: "Quote" },
                        author: { type: "text", label: "Author" },
                        role: { type: "text", label: "Role" },
                        rating: { type: "number", label: "Rating", min: 1, max: 5 },
                    },
                    defaultItemProps: { quote: "Great product!", author: "Customer", role: "Verified Buyer", rating: 5 },
                },
            },
            render: ({ title, subtitle, layout, showRating, testimonials }) => (
                <section style={{ padding: "80px 24px", backgroundColor: styles.muted }}>
                    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "48px" }}>
                            {subtitle && <p style={{ fontSize: "14px", fontWeight: 600, color: styles.chart1, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{subtitle}</p>}
                            {title && <h2 style={{ fontSize: "32px", fontWeight: 700, color: styles.foreground }}>{title}</h2>}
                        </div>
                        <div style={{ display: layout === "grid" ? "grid" : "flex", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", overflowX: layout === "carousel" ? "auto" : undefined }}>
                            {testimonials.map((t, i) => (
                                <div key={i} style={{ padding: "24px", backgroundColor: styles.background, borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", minWidth: layout === "carousel" ? "320px" : undefined }}>
                                    {showRating && (
                                        <div style={{ marginBottom: "16px", display: "flex", gap: "2px" }}>
                                            {Array(5).fill(null).map((_, j) => (
                                                <span key={j} style={{ color: j < t.rating ? styles.chart4 : styles.border, fontSize: "18px" }}>★</span>
                                            ))}
                                        </div>
                                    )}
                                    <p style={{ color: styles.foreground, marginBottom: "20px", fontSize: "15px", lineHeight: 1.7, fontStyle: "italic" }}>"{t.quote}"</p>
                                    <div>
                                        <p style={{ fontWeight: 600, color: styles.foreground }}>{t.author}</p>
                                        <p style={{ fontSize: "13px", color: styles.mutedForeground }}>{t.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ),
        },

        FAQ: {
            label: "FAQ",
            defaultProps: {
                title: "Frequently Asked Questions",
                description: "Find answers to common questions about our products and services.",
                style: "accordion",
                items: [
                    { question: "What is your return policy?", answer: "We offer a hassle-free 30-day return policy on all items." },
                    { question: "How long does shipping take?", answer: "Standard shipping takes 5-7 business days. Express shipping is available." },
                    { question: "Do you ship internationally?", answer: "Yes! We ship to over 50 countries worldwide." },
                ],
            },
            fields: {
                title: { type: "text", label: "Title" },
                description: { type: "textarea", label: "Description" },
                style: {
                    type: "radio",
                    label: "Style",
                    options: [
                        { label: "Accordion", value: "accordion" },
                        { label: "Cards", value: "cards" },
                        { label: "Simple", value: "simple" },
                    ],
                },
                items: {
                    type: "array",
                    label: "FAQ Items",
                    min: 1,
                    max: 10,
                    getItemSummary: (item) => item.question || "Question",
                    arrayFields: {
                        question: { type: "text", label: "Question" },
                        answer: { type: "textarea", label: "Answer" },
                    },
                    defaultItemProps: { question: "New question?", answer: "Answer here." },
                },
            },
            render: ({ title, description, style, items }) => (
                <section style={{ padding: "80px 24px", backgroundColor: styles.muted }}>
                    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                        <div style={{ textAlign: "center", marginBottom: "48px" }}>
                            {title && <h2 style={{ fontSize: "32px", fontWeight: 700, color: styles.foreground, marginBottom: "12px" }}>{title}</h2>}
                            {description && <p style={{ color: styles.mutedForeground, lineHeight: 1.6 }}>{description}</p>}
                        </div>
                        {style === "accordion" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {items.map((item, i) => (
                                    <details key={i} style={{ border: `1px solid ${styles.border}`, borderRadius: "12px", backgroundColor: styles.background, overflow: "hidden" }}>
                                        <summary style={{ padding: "18px 20px", cursor: "pointer", fontWeight: 600, fontSize: "15px", color: styles.foreground, listStyle: "none" }}>{item.question}</summary>
                                        <div style={{ padding: "0 20px 18px", color: styles.mutedForeground, lineHeight: 1.7 }}>{item.answer}</div>
                                    </details>
                                ))}
                            </div>
                        )}
                        {style === "cards" && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
                                {items.map((item, i) => (
                                    <div key={i} style={{ padding: "24px", backgroundColor: styles.background, borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                                        <h4 style={{ fontWeight: 600, fontSize: "15px", color: styles.foreground, marginBottom: "12px" }}>{item.question}</h4>
                                        <p style={{ color: styles.mutedForeground, fontSize: "14px", lineHeight: 1.6 }}>{item.answer}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {style === "simple" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                                {items.map((item, i) => (
                                    <div key={i}>
                                        <h4 style={{ fontWeight: 600, fontSize: "16px", color: styles.foreground, marginBottom: "8px" }}>{item.question}</h4>
                                        <p style={{ color: styles.mutedForeground, lineHeight: 1.7 }}>{item.answer}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            ),
        },

        LogoCloud: {
            label: "Logo Cloud",
            defaultProps: {
                title: "Trusted by leading brands",
                logos: [
                    { name: "Brand 1", url: "" },
                    { name: "Brand 2", url: "" },
                    { name: "Brand 3", url: "" },
                    { name: "Brand 4", url: "" },
                    { name: "Brand 5", url: "" },
                ],
                grayscale: true,
            },
            fields: {
                title: { type: "text", label: "Title" },
                grayscale: { type: "radio", label: "Grayscale", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
                logos: {
                    type: "array",
                    label: "Logos",
                    min: 1,
                    max: 10,
                    getItemSummary: (item) => item.name || "Logo",
                    arrayFields: {
                        name: { type: "text", label: "Name" },
                        url: { type: "text", label: "Image URL" },
                    },
                    defaultItemProps: { name: "Brand", url: "" },
                },
            },
            render: ({ title, logos, grayscale }) => (
                <section style={{ padding: "64px 24px", backgroundColor: styles.background }}>
                    <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
                        {title && <p style={{ fontSize: "14px", color: styles.mutedForeground, marginBottom: "32px" }}>{title}</p>}
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "48px" }}>
                            {logos.map((logo, i) => (
                                <div key={i} style={{ filter: grayscale ? "grayscale(100%)" : undefined, opacity: grayscale ? 0.6 : 1 }}>
                                    {logo.url ? (
                                        <img src={logo.url} alt={logo.name} style={{ height: "32px", objectFit: "contain" }} />
                                    ) : (
                                        <div style={{ padding: "8px 24px", backgroundColor: styles.muted, borderRadius: "8px", color: styles.mutedForeground, fontSize: "14px" }}>
                                            {logo.name}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ),
        },

        Stats: {
            label: "Stats",
            defaultProps: {
                title: "",
                stats: [
                    { value: "10K+", label: "Happy Customers", description: "" },
                    { value: "500+", label: "Products", description: "" },
                    { value: "99%", label: "Satisfaction Rate", description: "" },
                    { value: "24/7", label: "Support", description: "" },
                ],
                columns: 4,
            },
            fields: {
                title: { type: "text", label: "Title" },
                columns: {
                    type: "select",
                    label: "Columns",
                    options: [
                        { label: "2 Columns", value: 2 },
                        { label: "3 Columns", value: 3 },
                        { label: "4 Columns", value: 4 },
                    ],
                },
                stats: {
                    type: "array",
                    label: "Stats",
                    min: 1,
                    max: 6,
                    getItemSummary: (item) => item.label || "Stat",
                    arrayFields: {
                        value: { type: "text", label: "Value" },
                        label: { type: "text", label: "Label" },
                        description: { type: "text", label: "Description" },
                    },
                    defaultItemProps: { value: "100+", label: "Label", description: "" },
                },
            },
            render: ({ title, stats, columns }) => (
                <section style={{ padding: "64px 24px", backgroundColor: styles.background }}>
                    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                        {title && <h2 style={{ fontSize: "28px", fontWeight: 700, textAlign: "center", marginBottom: "48px", color: styles.foreground }}>{title}</h2>}
                        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "32px", textAlign: "center" }}>
                            {stats.map((stat, i) => (
                                <div key={i}>
                                    <div style={{ fontSize: "40px", fontWeight: 700, color: styles.chart1, marginBottom: "8px" }}>{stat.value}</div>
                                    <div style={{ fontWeight: 600, color: styles.foreground, marginBottom: "4px" }}>{stat.label}</div>
                                    {stat.description && <div style={{ fontSize: "14px", color: styles.mutedForeground }}>{stat.description}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ),
        },
    },
};

export default puckConfig;
