/**
 * Store Page Builder Types
 * Comprehensive type definitions for the drag-and-drop page editor
 */

// =====================================================
// BLOCK TYPES
// =====================================================

export type BlockType =
    | "hero"
    | "featured-products"
    | "product-grid"
    | "category-grid"
    | "collection-showcase"
    | "banner"
    | "text"
    | "image"
    | "image-gallery"
    | "video"
    | "testimonials"
    | "newsletter"
    | "countdown"
    | "spacer"
    | "divider"
    | "rich-text"
    | "html"
    | "announcement-bar"
    | "logo-cloud"
    | "faq"
    | "contact-form"
    | "map"
    | "social-feed"
    | "custom";

// =====================================================
// BASE BLOCK INTERFACE
// =====================================================

export interface BaseBlock {
    id: string;
    type: BlockType;
    visible: boolean;
    settings: BlockSettings;
}

export interface BlockSettings {
    padding?: SpacingSettings;
    margin?: SpacingSettings;
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundOverlay?: string;
    borderRadius?: string;
    maxWidth?: "full" | "container" | "narrow";
    animation?: AnimationSettings;
    customClasses?: string;
    customId?: string;
}

export interface SpacingSettings {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface AnimationSettings {
    type: "none" | "fade-in" | "slide-up" | "slide-down" | "zoom-in";
    duration: number;
    delay: number;
}

// =====================================================
// SPECIFIC BLOCK TYPES
// =====================================================

export interface HeroBlock extends BaseBlock {
    type: "hero";
    content: {
        layout: "center" | "left" | "right" | "split";
        heading: string;
        subheading?: string;
        description?: string;
        primaryButton?: ButtonConfig;
        secondaryButton?: ButtonConfig;
        backgroundImage?: string;
        backgroundVideo?: string;
        overlayOpacity?: number;
        height: "small" | "medium" | "large" | "full";
        textColor?: string;
    };
}

export interface ButtonConfig {
    text: string;
    link: string;
    style: "primary" | "secondary" | "outline" | "ghost";
    openInNewTab?: boolean;
}

export interface FeaturedProductsBlock extends BaseBlock {
    type: "featured-products";
    content: {
        heading?: string;
        subheading?: string;
        source: "manual" | "latest" | "bestselling" | "collection";
        collectionId?: string;
        productIds?: string[];
        limit: number;
        columns: 2 | 3 | 4 | 5;
        showPrice: boolean;
        showAddToCart: boolean;
        showQuickView: boolean;
    };
}

export interface ProductGridBlock extends BaseBlock {
    type: "product-grid";
    content: {
        heading?: string;
        source: "all" | "category" | "collection" | "manual";
        categoryId?: string;
        collectionId?: string;
        productIds?: string[];
        limit: number;
        columns: 2 | 3 | 4 | 5;
        showFilters: boolean;
        showSorting: boolean;
        showPagination: boolean;
    };
}

export interface CategoryGridBlock extends BaseBlock {
    type: "category-grid";
    content: {
        heading?: string;
        subheading?: string;
        categoryIds?: string[];
        showAll: boolean;
        limit: number;
        columns: 2 | 3 | 4 | 6;
        style: "card" | "overlay" | "minimal";
        showProductCount: boolean;
    };
}

export interface CollectionShowcaseBlock extends BaseBlock {
    type: "collection-showcase";
    content: {
        collectionId: string;
        layout: "grid" | "carousel" | "featured";
        heading?: string;
        showDescription: boolean;
        productLimit: number;
    };
}

export interface BannerBlock extends BaseBlock {
    type: "banner";
    content: {
        layout: "full" | "split" | "overlay";
        image: string;
        imageAlt?: string;
        heading?: string;
        description?: string;
        button?: ButtonConfig;
        textPosition: "left" | "center" | "right";
        height: "small" | "medium" | "large";
        overlayColor?: string;
        overlayOpacity?: number;
    };
}

export interface TextBlock extends BaseBlock {
    type: "text";
    content: {
        text: string;
        alignment: "left" | "center" | "right";
        size: "small" | "medium" | "large";
    };
}

export interface RichTextBlock extends BaseBlock {
    type: "rich-text";
    content: {
        html: string;
        alignment: "left" | "center" | "right";
    };
}

export interface ImageBlock extends BaseBlock {
    type: "image";
    content: {
        src: string;
        alt: string;
        link?: string;
        width?: "auto" | "full" | "contained";
        aspectRatio?: "auto" | "1:1" | "4:3" | "16:9" | "21:9";
        caption?: string;
    };
}

export interface ImageGalleryBlock extends BaseBlock {
    type: "image-gallery";
    content: {
        images: Array<{
            src: string;
            alt: string;
            caption?: string;
        }>;
        layout: "grid" | "masonry" | "carousel";
        columns: 2 | 3 | 4;
        gap: "small" | "medium" | "large";
        lightbox: boolean;
    };
}

export interface VideoBlock extends BaseBlock {
    type: "video";
    content: {
        source: "youtube" | "vimeo" | "custom";
        url: string;
        autoplay: boolean;
        loop: boolean;
        muted: boolean;
        controls: boolean;
        aspectRatio: "16:9" | "4:3" | "1:1";
        poster?: string;
    };
}

export interface TestimonialsBlock extends BaseBlock {
    type: "testimonials";
    content: {
        heading?: string;
        layout: "grid" | "carousel" | "single";
        testimonials: Array<{
            id: string;
            quote: string;
            author: string;
            role?: string;
            company?: string;
            avatar?: string;
            rating?: number;
        }>;
        showRating: boolean;
        autoplay?: boolean;
    };
}

export interface NewsletterBlock extends BaseBlock {
    type: "newsletter";
    content: {
        heading: string;
        description?: string;
        placeholder: string;
        buttonText: string;
        successMessage: string;
        layout: "inline" | "stacked";
        backgroundColor?: string;
    };
}

export interface CountdownBlock extends BaseBlock {
    type: "countdown";
    content: {
        heading?: string;
        description?: string;
        endDate: string;
        showDays: boolean;
        showHours: boolean;
        showMinutes: boolean;
        showSeconds: boolean;
        expiredMessage: string;
        button?: ButtonConfig;
    };
}

export interface SpacerBlock extends BaseBlock {
    type: "spacer";
    content: {
        height: number;
        mobileHeight?: number;
    };
}

export interface DividerBlock extends BaseBlock {
    type: "divider";
    content: {
        style: "solid" | "dashed" | "dotted";
        color?: string;
        width: "full" | "medium" | "short";
        thickness: number;
    };
}

export interface AnnouncementBarBlock extends BaseBlock {
    type: "announcement-bar";
    content: {
        text: string;
        link?: string;
        backgroundColor: string;
        textColor: string;
        dismissible: boolean;
        icon?: string;
    };
}

export interface LogoCloudBlock extends BaseBlock {
    type: "logo-cloud";
    content: {
        heading?: string;
        logos: Array<{
            src: string;
            alt: string;
            link?: string;
        }>;
        grayscale: boolean;
        columns: 3 | 4 | 5 | 6;
    };
}

export interface FAQBlock extends BaseBlock {
    type: "faq";
    content: {
        heading?: string;
        description?: string;
        items: Array<{
            id: string;
            question: string;
            answer: string;
        }>;
        layout: "accordion" | "grid";
    };
}

export interface ContactFormBlock extends BaseBlock {
    type: "contact-form";
    content: {
        heading?: string;
        description?: string;
        fields: Array<{
            id: string;
            type: "text" | "email" | "phone" | "textarea" | "select";
            label: string;
            placeholder?: string;
            required: boolean;
            options?: string[];
        }>;
        submitText: string;
        successMessage: string;
        recipientEmail?: string;
    };
}

export interface MapBlock extends BaseBlock {
    type: "map";
    content: {
        address: string;
        latitude?: number;
        longitude?: number;
        zoom: number;
        height: number;
        showMarker: boolean;
        style: "default" | "silver" | "dark";
    };
}

export interface HTMLBlock extends BaseBlock {
    type: "html";
    content: {
        code: string;
    };
}

export interface CustomBlock extends BaseBlock {
    type: "custom";
    content: Record<string, unknown>;
}

// Union type for all blocks
export type PageBlock =
    | HeroBlock
    | FeaturedProductsBlock
    | ProductGridBlock
    | CategoryGridBlock
    | CollectionShowcaseBlock
    | BannerBlock
    | TextBlock
    | RichTextBlock
    | ImageBlock
    | ImageGalleryBlock
    | VideoBlock
    | TestimonialsBlock
    | NewsletterBlock
    | CountdownBlock
    | SpacerBlock
    | DividerBlock
    | AnnouncementBarBlock
    | LogoCloudBlock
    | FAQBlock
    | ContactFormBlock
    | MapBlock
    | HTMLBlock
    | CustomBlock;

// =====================================================
// PAGE TYPES
// =====================================================

export type PageType = "home" | "about" | "contact" | "custom" | "landing";
export type PageStatus = "draft" | "published" | "archived";

export interface StorePage {
    id: string;
    tenant_id: string;
    title: string;
    slug: string;
    page_type: PageType;
    status: PageStatus;
    is_homepage: boolean;
    meta_title?: string;
    meta_description?: string;
    blocks: PageBlock[];
    settings: PageSettings;
    craft_data?: string; // Serialized Craft.js editor state
    published_at?: string;
    created_at: string;
    updated_at: string;
}

export interface PageSettings {
    showHeader?: boolean;
    showFooter?: boolean;
    customHeaderColor?: string;
    customFooterColor?: string;
    bodyClass?: string;
}

export interface StorePageVersion {
    id: string;
    page_id: string;
    tenant_id: string;
    version_number: number;
    blocks: PageBlock[];
    settings: PageSettings;
    created_by?: string;
    created_at: string;
}

// =====================================================
// THEME TYPES
// =====================================================

export interface StoreTheme {
    id: string;
    tenant_id: string;
    theme_name: string;
    colors: ThemeColors;
    typography: ThemeTypography;
    layout: ThemeLayout;
    custom_css?: string;
    created_at: string;
    updated_at: string;
}

export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
}

export interface ThemeTypography {
    headingFont: string;
    bodyFont: string;
    baseFontSize: number;
}

export interface ThemeLayout {
    maxWidth: string;
    headerStyle: "default" | "centered" | "minimal";
    footerStyle: "default" | "minimal" | "expanded";
}

// =====================================================
// BLOCK TEMPLATE TYPES
// =====================================================

export interface BlockTemplate {
    id: string;
    tenant_id: string;
    name: string;
    description?: string;
    block_type: BlockType;
    block_data: PageBlock;
    thumbnail_url?: string;
    is_global: boolean;
    created_at: string;
    updated_at: string;
}

// =====================================================
// EDITOR STATE TYPES
// =====================================================

export interface EditorState {
    page: StorePage | null;
    selectedBlockId: string | null;
    isDragging: boolean;
    isPreviewMode: boolean;
    previewDevice: "desktop" | "tablet" | "mobile";
    undoStack: PageBlock[][];
    redoStack: PageBlock[][];
    hasUnsavedChanges: boolean;
}

export interface EditorAction {
    type: string;
    payload?: unknown;
}

// =====================================================
// BLOCK REGISTRY
// =====================================================

export interface BlockDefinition {
    type: BlockType;
    name: string;
    description: string;
    icon: string;
    category: "layout" | "content" | "commerce" | "media" | "forms" | "advanced";
    defaultContent: Partial<PageBlock["content"]>;
    defaultSettings: Partial<BlockSettings>;
}

export const BLOCK_CATEGORIES = {
    layout: "Layout",
    content: "Content",
    commerce: "Commerce",
    media: "Media",
    forms: "Forms",
    advanced: "Advanced",
} as const;
