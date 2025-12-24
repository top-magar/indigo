/**
 * Block Registry
 * Defines all available blocks for the page builder with their default configurations
 */

import type { BlockDefinition, BlockType, PageBlock } from "@/types/page-builder";

export const BLOCK_REGISTRY: Record<BlockType, BlockDefinition> = {
    // Layout Blocks
    hero: {
        type: "hero",
        name: "Hero Section",
        description: "Large banner with heading, text, and call-to-action buttons",
        icon: "Layout01Icon",
        category: "layout",
        defaultContent: {
            layout: "center",
            heading: "Welcome to Our Store",
            subheading: "Discover amazing products",
            description: "",
            primaryButton: { text: "Shop Now", link: "/products", style: "primary" },
            height: "large",
        },
        defaultSettings: {
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            maxWidth: "full",
        },
    },
    banner: {
        type: "banner",
        name: "Banner",
        description: "Promotional banner with image and text overlay",
        icon: "Image01Icon",
        category: "layout",
        defaultContent: {
            layout: "overlay",
            image: "",
            heading: "Special Offer",
            description: "Limited time only",
            textPosition: "center",
            height: "medium",
            overlayOpacity: 40,
        },
        defaultSettings: {
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
        },
    },
    spacer: {
        type: "spacer",
        name: "Spacer",
        description: "Add vertical space between sections",
        icon: "ArrowExpand01Icon",
        category: "layout",
        defaultContent: {
            height: 64,
            mobileHeight: 32,
        },
        defaultSettings: {},
    },
    divider: {
        type: "divider",
        name: "Divider",
        description: "Horizontal line to separate content",
        icon: "MinusSignIcon",
        category: "layout",
        defaultContent: {
            style: "solid",
            width: "full",
            thickness: 1,
        },
        defaultSettings: {
            padding: { top: 16, right: 0, bottom: 16, left: 0 },
        },
    },

    // Commerce Blocks
    "featured-products": {
        type: "featured-products",
        name: "Featured Products",
        description: "Showcase selected products in a grid",
        icon: "Star01Icon",
        category: "commerce",
        defaultContent: {
            heading: "Featured Products",
            source: "latest",
            limit: 4,
            columns: 4,
            showPrice: true,
            showAddToCart: true,
            showQuickView: false,
        },
        defaultSettings: {
            padding: { top: 64, right: 0, bottom: 64, left: 0 },
            maxWidth: "container",
        },
    },
    "product-grid": {
        type: "product-grid",
        name: "Product Grid",
        description: "Display products with filtering and pagination",
        icon: "GridIcon",
        category: "commerce",
        defaultContent: {
            heading: "All Products",
            source: "all",
            limit: 12,
            columns: 4,
            showFilters: true,
            showSorting: true,
            showPagination: true,
        },
        defaultSettings: {
            padding: { top: 48, right: 0, bottom: 48, left: 0 },
            maxWidth: "container",
        },
    },
    "category-grid": {
        type: "category-grid",
        name: "Category Grid",
        description: "Display product categories",
        icon: "Folder01Icon",
        category: "commerce",
        defaultContent: {
            heading: "Shop by Category",
            showAll: true,
            limit: 6,
            columns: 3,
            style: "card",
            showProductCount: true,
        },
        defaultSettings: {
            padding: { top: 48, right: 0, bottom: 48, left: 0 },
            maxWidth: "container",
        },
    },
    "collection-showcase": {
        type: "collection-showcase",
        name: "Collection Showcase",
        description: "Feature a specific collection",
        icon: "Album01Icon",
        category: "commerce",
        defaultContent: {
            collectionId: "",
            layout: "grid",
            showDescription: true,
            productLimit: 4,
        },
        defaultSettings: {
            padding: { top: 48, right: 0, bottom: 48, left: 0 },
            maxWidth: "container",
        },
    },

    // Content Blocks
    text: {
        type: "text",
        name: "Text",
        description: "Simple text block",
        icon: "TextIcon",
        category: "content",
        defaultContent: {
            text: "Enter your text here...",
            alignment: "left",
            size: "medium",
        },
        defaultSettings: {
            padding: { top: 24, right: 0, bottom: 24, left: 0 },
            maxWidth: "container",
        },
    },
    "rich-text": {
        type: "rich-text",
        name: "Rich Text",
        description: "Formatted text with headings, lists, and links",
        icon: "TextAlignLeftIcon",
        category: "content",
        defaultContent: {
            html: "<p>Enter your content here...</p>",
            alignment: "left",
        },
        defaultSettings: {
            padding: { top: 24, right: 0, bottom: 24, left: 0 },
            maxWidth: "container",
        },
    },
    testimonials: {
        type: "testimonials",
        name: "Testimonials",
        description: "Customer reviews and testimonials",
        icon: "Quote01Icon",
        category: "content",
        defaultContent: {
            heading: "What Our Customers Say",
            layout: "carousel",
            testimonials: [
                {
                    id: "1",
                    quote: "Amazing products and great customer service!",
                    author: "John Doe",
                    role: "Verified Buyer",
                    rating: 5,
                },
            ],
            showRating: true,
            autoplay: true,
        },
        defaultSettings: {
            padding: { top: 64, right: 0, bottom: 64, left: 0 },
            maxWidth: "container",
        },
    },
    faq: {
        type: "faq",
        name: "FAQ",
        description: "Frequently asked questions accordion",
        icon: "HelpCircleIcon",
        category: "content",
        defaultContent: {
            heading: "Frequently Asked Questions",
            items: [
                { id: "1", question: "What is your return policy?", answer: "We offer a 30-day return policy on all items." },
            ],
            layout: "accordion",
        },
        defaultSettings: {
            padding: { top: 48, right: 0, bottom: 48, left: 0 },
            maxWidth: "container",
        },
    },
    "logo-cloud": {
        type: "logo-cloud",
        name: "Logo Cloud",
        description: "Display partner or brand logos",
        icon: "Building01Icon",
        category: "content",
        defaultContent: {
            heading: "Trusted By",
            logos: [],
            grayscale: true,
            columns: 5,
        },
        defaultSettings: {
            padding: { top: 48, right: 0, bottom: 48, left: 0 },
            maxWidth: "container",
        },
    },
    "announcement-bar": {
        type: "announcement-bar",
        name: "Announcement Bar",
        description: "Top banner for announcements and promotions",
        icon: "Megaphone01Icon",
        category: "content",
        defaultContent: {
            text: "Free shipping on orders over $50!",
            backgroundColor: "#000000",
            textColor: "#ffffff",
            dismissible: true,
        },
        defaultSettings: {
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            maxWidth: "full",
        },
    },

    // Media Blocks
    image: {
        type: "image",
        name: "Image",
        description: "Single image with optional link",
        icon: "Image01Icon",
        category: "media",
        defaultContent: {
            src: "",
            alt: "",
            width: "contained",
            aspectRatio: "auto",
        },
        defaultSettings: {
            padding: { top: 24, right: 0, bottom: 24, left: 0 },
            maxWidth: "container",
        },
    },
    "image-gallery": {
        type: "image-gallery",
        name: "Image Gallery",
        description: "Grid or carousel of images",
        icon: "Gallery01Icon",
        category: "media",
        defaultContent: {
            images: [],
            layout: "grid",
            columns: 3,
            gap: "medium",
            lightbox: true,
        },
        defaultSettings: {
            padding: { top: 48, right: 0, bottom: 48, left: 0 },
            maxWidth: "container",
        },
    },
    video: {
        type: "video",
        name: "Video",
        description: "Embed YouTube, Vimeo, or custom video",
        icon: "Video01Icon",
        category: "media",
        defaultContent: {
            source: "youtube",
            url: "",
            autoplay: false,
            loop: false,
            muted: false,
            controls: true,
            aspectRatio: "16:9",
        },
        defaultSettings: {
            padding: { top: 24, right: 0, bottom: 24, left: 0 },
            maxWidth: "container",
        },
    },

    // Form Blocks
    newsletter: {
        type: "newsletter",
        name: "Newsletter",
        description: "Email signup form",
        icon: "Mail01Icon",
        category: "forms",
        defaultContent: {
            heading: "Subscribe to Our Newsletter",
            description: "Get the latest updates and exclusive offers",
            placeholder: "Enter your email",
            buttonText: "Subscribe",
            successMessage: "Thanks for subscribing!",
            layout: "inline",
        },
        defaultSettings: {
            padding: { top: 64, right: 0, bottom: 64, left: 0 },
            maxWidth: "narrow",
            backgroundColor: "#f4f4f5",
        },
    },
    "contact-form": {
        type: "contact-form",
        name: "Contact Form",
        description: "Contact form with customizable fields",
        icon: "ContactIcon",
        category: "forms",
        defaultContent: {
            heading: "Get in Touch",
            description: "We'd love to hear from you",
            fields: [
                { id: "name", type: "text", label: "Name", required: true },
                { id: "email", type: "email", label: "Email", required: true },
                { id: "message", type: "textarea", label: "Message", required: true },
            ],
            submitText: "Send Message",
            successMessage: "Thanks for your message! We'll get back to you soon.",
        },
        defaultSettings: {
            padding: { top: 48, right: 0, bottom: 48, left: 0 },
            maxWidth: "narrow",
        },
    },

    // Advanced Blocks
    countdown: {
        type: "countdown",
        name: "Countdown Timer",
        description: "Countdown to a specific date/time",
        icon: "Clock01Icon",
        category: "advanced",
        defaultContent: {
            heading: "Sale Ends In",
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            showDays: true,
            showHours: true,
            showMinutes: true,
            showSeconds: true,
            expiredMessage: "Sale has ended",
        },
        defaultSettings: {
            padding: { top: 48, right: 0, bottom: 48, left: 0 },
            maxWidth: "container",
        },
    },
    map: {
        type: "map",
        name: "Map",
        description: "Google Maps embed",
        icon: "Location01Icon",
        category: "advanced",
        defaultContent: {
            address: "",
            zoom: 14,
            height: 400,
            showMarker: true,
            style: "default",
        },
        defaultSettings: {
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            maxWidth: "full",
        },
    },
    html: {
        type: "html",
        name: "Custom HTML",
        description: "Add custom HTML code",
        icon: "Code01Icon",
        category: "advanced",
        defaultContent: {
            code: "<!-- Your custom HTML here -->",
        },
        defaultSettings: {
            padding: { top: 24, right: 0, bottom: 24, left: 0 },
            maxWidth: "container",
        },
    },
    "social-feed": {
        type: "social-feed",
        name: "Social Feed",
        description: "Display social media posts",
        icon: "Share01Icon",
        category: "advanced",
        defaultContent: {},
        defaultSettings: {
            padding: { top: 48, right: 0, bottom: 48, left: 0 },
            maxWidth: "container",
        },
    },
    custom: {
        type: "custom",
        name: "Custom Block",
        description: "Custom block with JSON configuration",
        icon: "Settings01Icon",
        category: "advanced",
        defaultContent: {},
        defaultSettings: {},
    },
};

/**
 * Create a new block with default values
 */
export function createBlock(type: BlockType): PageBlock {
    const definition = BLOCK_REGISTRY[type];
    
    return {
        id: crypto.randomUUID(),
        type,
        visible: true,
        settings: definition.defaultSettings,
        content: definition.defaultContent,
    } as PageBlock;
}

/**
 * Get blocks grouped by category
 */
export function getBlocksByCategory() {
    const categories: Record<string, BlockDefinition[]> = {
        layout: [],
        commerce: [],
        content: [],
        media: [],
        forms: [],
        advanced: [],
    };

    Object.values(BLOCK_REGISTRY).forEach((block) => {
        categories[block.category].push(block);
    });

    return categories;
}

/**
 * Validate block structure
 */
export function validateBlock(block: PageBlock): boolean {
    if (!block.id || !block.type) return false;
    if (!(block.type in BLOCK_REGISTRY)) return false;
    return true;
}
