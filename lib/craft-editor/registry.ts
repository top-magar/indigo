/**
 * Component Registry
 * Centralized registry for all Craft.js components
 */

import type { ComponentRegistry, ComponentCategory } from "./types";

export const COMPONENT_REGISTRY: ComponentRegistry = {
    // Layout Components
    Section: {
        name: "Section",
        description: "Full-width section container",
        category: "layout",
        icon: "LayoutTopIcon",
        isCanvas: true,
        defaultProps: {
            backgroundColor: "transparent",
            padding: { top: 48, right: 24, bottom: 48, left: 24 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            minHeight: 200,
            maxWidth: "container",
            verticalAlign: "top",
        },
    },
    Container: {
        name: "Container",
        description: "Flexible container for content",
        category: "layout",
        icon: "GridIcon",
        isCanvas: true,
        defaultProps: {
            width: "full",
            padding: { top: 16, right: 16, bottom: 16, left: 16 },
            backgroundColor: "transparent",
            borderRadius: 0,
            shadow: "none",
        },
    },
    Grid: {
        name: "Grid",
        description: "Responsive grid layout",
        category: "layout",
        icon: "GridIcon",
        isCanvas: true,
        defaultProps: {
            columns: 3,
            gap: 24,
            alignItems: "stretch",
        },
    },
    Flex: {
        name: "Flex",
        description: "Flexible box layout",
        category: "layout",
        icon: "ArrowExpand01Icon",
        isCanvas: true,
        defaultProps: {
            direction: "row",
            justify: "start",
            align: "center",
            gap: 16,
            wrap: true,
        },
    },

    // Content Components
    Text: {
        name: "Text",
        description: "Editable text block",
        category: "content",
        icon: "TextIcon",
        defaultProps: {
            text: "Edit this text",
            tagName: "p",
            fontSize: 16,
            fontWeight: "normal",
            textAlign: "left",
            color: "inherit",
            lineHeight: 1.6,
        },
    },
    Heading: {
        name: "Heading",
        description: "Section heading",
        category: "content",
        icon: "TextIcon",
        defaultProps: {
            text: "Heading",
            tagName: "h2",
            fontSize: 32,
            fontWeight: "bold",
            textAlign: "left",
            color: "inherit",
            lineHeight: 1.2,
        },
    },
    Button: {
        name: "Button",
        description: "Call-to-action button",
        category: "content",
        icon: "Cursor01Icon",
        defaultProps: {
            text: "Click me",
            href: "#",
            variant: "primary",
            size: "md",
            fullWidth: false,
        },
    },
    Image: {
        name: "Image",
        description: "Image with optional link",
        category: "content",
        icon: "Image01Icon",
        defaultProps: {
            src: "",
            alt: "Image",
            width: "full",
            height: "auto",
            objectFit: "cover",
            borderRadius: 8,
        },
    },
    Divider: {
        name: "Divider",
        description: "Horizontal divider line",
        category: "content",
        icon: "MinusSignIcon",
        defaultProps: {
            style: "solid",
            color: "#e5e7eb",
            thickness: 1,
            width: "full",
            margin: 24,
        },
    },
    Spacer: {
        name: "Spacer",
        description: "Vertical spacing",
        category: "content",
        icon: "ArrowExpand01Icon",
        defaultProps: {
            height: 48,
            mobileHeight: 24,
        },
    },

    // Commerce Components
    ProductGrid: {
        name: "Product Grid",
        description: "Display products in a grid",
        category: "commerce",
        icon: "GridIcon",
        defaultProps: {
            heading: "Featured Products",
            subheading: "Check out our latest collection",
            source: "featured",
            columns: 4,
            limit: 8,
            showPrice: true,
            showAddToCart: true,
            showQuickView: false,
            cardStyle: "default",
        },
    },
    ProductCard: {
        name: "Product Card",
        description: "Single product display",
        category: "commerce",
        icon: "StarIcon",
        defaultProps: {
            showPrice: true,
            showAddToCart: true,
            imageAspectRatio: "square",
        },
    },
    AddToCart: {
        name: "Add to Cart",
        description: "Add to cart button",
        category: "commerce",
        icon: "ShoppingCart01Icon",
        defaultProps: {
            variant: "primary",
            size: "md",
            fullWidth: false,
            showQuantity: false,
        },
    },

    // Media Components
    Video: {
        name: "Video",
        description: "Embedded video player",
        category: "media",
        icon: "PlayIcon",
        defaultProps: {
            provider: "youtube",
            autoplay: false,
            loop: false,
            muted: false,
            controls: true,
            aspectRatio: "16:9",
        },
    },
    Gallery: {
        name: "Gallery",
        description: "Image gallery",
        category: "media",
        icon: "Image01Icon",
        defaultProps: {
            images: [],
            layout: "grid",
            columns: 3,
            gap: 16,
            lightbox: true,
            showCaptions: false,
        },
    },

    // Section Components
    Hero: {
        name: "Hero",
        description: "Hero section with CTA",
        category: "sections",
        icon: "LayoutTopIcon",
        isCanvas: true,
        defaultProps: {
            layout: "center",
            backgroundColor: "#f8fafc",
            overlayOpacity: 0,
            height: "large",
            heading: "Welcome to Our Store",
            subheading: "Discover amazing products",
            description: "Shop the latest collection with free shipping on orders over $50",
            primaryButtonText: "Shop Now",
            primaryButtonLink: "/products",
            secondaryButtonText: "Learn More",
            secondaryButtonLink: "/about",
            textColor: "#0f172a",
        },
    },
    Banner: {
        name: "Banner",
        description: "Promotional banner",
        category: "sections",
        icon: "Image01Icon",
        defaultProps: {
            heading: "Special Offer",
            description: "Get 20% off on all products",
            buttonText: "Shop Now",
            buttonLink: "#",
            height: "medium",
            textPosition: "center",
            overlayColor: "#000000",
            overlayOpacity: 40,
        },
    },
    Testimonials: {
        name: "Testimonials",
        description: "Customer testimonials",
        category: "sections",
        icon: "Comment01Icon",
        defaultProps: {
            heading: "What Our Customers Say",
            layout: "carousel",
            testimonials: [],
            showRating: true,
            autoplay: true,
        },
    },
    Newsletter: {
        name: "Newsletter",
        description: "Email signup form",
        category: "forms",
        icon: "Mail01Icon",
        defaultProps: {
            heading: "Subscribe to Our Newsletter",
            description: "Get the latest updates and exclusive offers",
            placeholder: "Enter your email",
            buttonText: "Subscribe",
            successMessage: "Thanks for subscribing!",
            layout: "inline",
        },
    },
    FAQ: {
        name: "FAQ",
        description: "Frequently asked questions",
        category: "sections",
        icon: "Comment01Icon",
        defaultProps: {
            heading: "Frequently Asked Questions",
            description: "Find answers to common questions",
            items: [],
            layout: "accordion",
        },
    },
};

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
    layout: "Layout",
    content: "Content",
    commerce: "Commerce",
    media: "Media",
    sections: "Sections",
    forms: "Forms",
};

export const CATEGORY_ORDER: ComponentCategory[] = [
    "sections",
    "layout",
    "content",
    "commerce",
    "media",
    "forms",
];

export function getComponentsByCategory(): Record<ComponentCategory, Array<{ type: string } & ComponentRegistry[string]>> {
    const result: Record<ComponentCategory, Array<{ type: string } & ComponentRegistry[string]>> = {
        layout: [],
        content: [],
        commerce: [],
        media: [],
        sections: [],
        forms: [],
    };

    Object.entries(COMPONENT_REGISTRY).forEach(([type, def]) => {
        result[def.category].push({ type, ...def });
    });

    return result;
}

export function getComponentDefinition(type: string) {
    return COMPONENT_REGISTRY[type];
}
