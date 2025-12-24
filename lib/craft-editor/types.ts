/**
 * Craft.js Editor Type Definitions
 * Production-ready types for the visual page builder
 */

// =====================================================
// COMPONENT PROP TYPES
// =====================================================

export interface SpacingProps {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface ResponsiveVisibility {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
}

export interface BaseComponentProps {
    className?: string;
    visibility?: ResponsiveVisibility;
}

// Layout Components
export interface SectionProps extends BaseComponentProps {
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundOverlay?: number;
    padding?: SpacingProps;
    margin?: SpacingProps;
    minHeight?: number;
    maxWidth?: "full" | "container" | "narrow";
    verticalAlign?: "top" | "center" | "bottom";
}

export interface ContainerProps extends BaseComponentProps {
    width?: "full" | "auto" | "fixed";
    fixedWidth?: number;
    padding?: SpacingProps;
    backgroundColor?: string;
    borderRadius?: number;
    shadow?: "none" | "sm" | "md" | "lg" | "xl";
}

export interface GridProps extends BaseComponentProps {
    columns?: 1 | 2 | 3 | 4 | 5 | 6;
    gap?: number;
    alignItems?: "start" | "center" | "end" | "stretch";
}

export interface FlexProps extends BaseComponentProps {
    direction?: "row" | "column";
    justify?: "start" | "center" | "end" | "between" | "around";
    align?: "start" | "center" | "end" | "stretch";
    gap?: number;
    wrap?: boolean;
}

// Content Components
export interface TextProps extends BaseComponentProps {
    text?: string;
    tagName?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span";
    fontSize?: number;
    fontWeight?: "normal" | "medium" | "semibold" | "bold";
    textAlign?: "left" | "center" | "right";
    color?: string;
    lineHeight?: number;
}

export interface ButtonProps extends BaseComponentProps {
    text?: string;
    href?: string;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
    icon?: string;
    iconPosition?: "left" | "right";
}

export interface ImageProps extends BaseComponentProps {
    src?: string;
    alt?: string;
    width?: "full" | "auto" | "fixed";
    fixedWidth?: number;
    height?: "auto" | "fixed";
    fixedHeight?: number;
    objectFit?: "cover" | "contain" | "fill";
    borderRadius?: number;
    link?: string;
}

export interface DividerProps extends BaseComponentProps {
    style?: "solid" | "dashed" | "dotted";
    color?: string;
    thickness?: number;
    width?: "full" | "medium" | "short";
    margin?: number;
}

export interface SpacerProps extends BaseComponentProps {
    height?: number;
    mobileHeight?: number;
}

export interface IconProps extends BaseComponentProps {
    icon?: string;
    size?: number;
    color?: string;
}

// Commerce Components
export interface ProductGridProps extends BaseComponentProps {
    heading?: string;
    subheading?: string;
    source?: "all" | "category" | "collection" | "manual" | "featured";
    categoryId?: string;
    collectionId?: string;
    productIds?: string[];
    columns?: 2 | 3 | 4 | 5;
    limit?: number;
    showPrice?: boolean;
    showAddToCart?: boolean;
    showQuickView?: boolean;
    cardStyle?: "default" | "minimal" | "overlay";
}

export interface ProductCardProps extends BaseComponentProps {
    productId?: string;
    showPrice?: boolean;
    showAddToCart?: boolean;
    imageAspectRatio?: "square" | "portrait" | "landscape";
}

export interface PriceDisplayProps extends BaseComponentProps {
    price?: number;
    compareAtPrice?: number;
    currency?: string;
    showCurrency?: boolean;
    size?: "sm" | "md" | "lg";
}

export interface AddToCartButtonProps extends BaseComponentProps {
    productId?: string;
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
    showQuantity?: boolean;
}

// Media Components
export interface VideoProps extends BaseComponentProps {
    src?: string;
    provider?: "youtube" | "vimeo" | "custom";
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
    aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16";
    poster?: string;
}

export interface GalleryProps extends BaseComponentProps {
    images?: Array<{ src: string; alt: string; caption?: string }>;
    layout?: "grid" | "masonry" | "carousel";
    columns?: 2 | 3 | 4;
    gap?: number;
    lightbox?: boolean;
    showCaptions?: boolean;
}

export interface BackgroundImageProps extends BaseComponentProps {
    src?: string;
    position?: "center" | "top" | "bottom" | "left" | "right";
    size?: "cover" | "contain" | "auto";
    attachment?: "scroll" | "fixed";
    overlay?: string;
    overlayOpacity?: number;
}

// Section Components
export interface HeroProps extends BaseComponentProps {
    layout?: "center" | "left" | "right" | "split";
    backgroundImage?: string;
    backgroundColor?: string;
    overlayOpacity?: number;
    height?: "small" | "medium" | "large" | "full";
    heading?: string;
    subheading?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    textColor?: string;
}

export interface BannerProps extends BaseComponentProps {
    image?: string;
    heading?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    height?: "small" | "medium" | "large";
    textPosition?: "left" | "center" | "right";
    overlayColor?: string;
    overlayOpacity?: number;
}

export interface TestimonialsProps extends BaseComponentProps {
    heading?: string;
    layout?: "grid" | "carousel" | "single";
    testimonials?: Array<{
        id: string;
        quote: string;
        author: string;
        role?: string;
        avatar?: string;
        rating?: number;
    }>;
    showRating?: boolean;
    autoplay?: boolean;
}

export interface NewsletterProps extends BaseComponentProps {
    heading?: string;
    description?: string;
    placeholder?: string;
    buttonText?: string;
    successMessage?: string;
    layout?: "inline" | "stacked";
    backgroundColor?: string;
}

export interface FAQProps extends BaseComponentProps {
    heading?: string;
    description?: string;
    items?: Array<{ id: string; question: string; answer: string }>;
    layout?: "accordion" | "grid";
}

// =====================================================
// EDITOR STATE TYPES
// =====================================================

export interface EditorTheme {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        foreground: string;
        muted: string;
        border: string;
    };
    typography: {
        headingFont: string;
        bodyFont: string;
        baseFontSize: number;
    };
    spacing: {
        containerPadding: number;
        sectionGap: number;
    };
    borderRadius: {
        small: number;
        medium: number;
        large: number;
    };
}

export interface PageMeta {
    title: string;
    description: string;
    slug: string;
    ogImage?: string;
    noIndex?: boolean;
}

export interface EditorPage {
    id: string;
    tenantId: string;
    title: string;
    slug: string;
    pageType: "home" | "product" | "collection" | "landing" | "about" | "contact" | "custom";
    status: "draft" | "published" | "archived";
    isHomepage: boolean;
    meta: PageMeta;
    craftState: string; // Serialized Craft.js state
    theme?: Partial<EditorTheme>;
    version: number;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface EditorVersion {
    id: string;
    pageId: string;
    version: number;
    craftState: string;
    createdBy: string;
    createdAt: string;
}

// =====================================================
// COMPONENT REGISTRY TYPES
// =====================================================

export type ComponentCategory = "layout" | "content" | "commerce" | "media" | "sections" | "forms";

export interface ComponentDefinition {
    name: string;
    description: string;
    category: ComponentCategory;
    icon: string;
    defaultProps: Record<string, unknown>;
    isCanvas?: boolean;
    allowedChildren?: string[];
}

export type ComponentRegistry = Record<string, ComponentDefinition>;
