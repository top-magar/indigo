import dynamic from "next/dynamic"
import React from "react"
import { BlockSkeleton } from "./block-skeleton"
import { registerBlock } from "../registry"
import { Heading, Mail, Quote, Tag, Newspaper, CircleDot, Copyright, Bell, Megaphone, Shield, Timer, Building2, MoveHorizontal, Share2, HelpCircle, Star, FolderOpen } from "lucide-react"


registerBlock("hero", {
  component: dynamic(() => import("./hero").then(m => ({ default: m.Hero })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "text" },
    { name: "buttonText", label: "Button Text", type: "text" },
    { name: "backgroundImage", label: "Background Image", type: "image" },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "full", label: "Full" }, { value: "split", label: "Split" }] },
  ],
  defaultProps: { heading: "Welcome to our store", subheading: "Discover amazing products", buttonText: "Shop Now", buttonUrl: "#", backgroundImage: "", variant: "full" },
  icon: Heading,
  category: "marketing",
})

registerBlock("newsletter", {
  component: dynamic(() => import("./newsletter").then(m => ({ default: m.Newsletter })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "text" },
    { name: "buttonText", label: "Button Text", type: "text" },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "inline", label: "Inline" }, { value: "stacked", label: "Stacked" }, { value: "card", label: "Card" }] },
  ],
  defaultProps: { heading: "Stay in the loop", subheading: "Get updates on new products and sales.", buttonText: "Subscribe", variant: "stacked" },
  icon: Mail,
  category: "marketing",
})

registerBlock("newsletterForm", {
  component: dynamic(() => import("./newsletter-form").then(m => ({ default: m.NewsletterForm })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "description", label: "Description", type: "text" },
    { name: "buttonText", label: "Button Text", type: "text" },
  ],
  defaultProps: { heading: "Newsletter", description: "Stay updated.", buttonText: "Subscribe" },
  icon: Newspaper,
  category: "marketing",
})

registerBlock("testimonials", {
  component: dynamic(() => import("./testimonials").then(m => ({ default: m.Testimonials })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "items", label: "Items", type: "list", listFields: [{ key: "quote", label: "Quote", type: "text" }, { key: "author", label: "Author", type: "text" }, { key: "role", label: "Role", type: "text" }] },
    { name: "columns", label: "Columns", type: "number" },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "cards", label: "Cards" }, { value: "minimal", label: "Minimal" }] },
  ],
  defaultProps: { heading: "What our customers say", items: JSON.stringify([{ quote: "Amazing!", author: "Sarah M.", role: "Buyer" }]), columns: 3, variant: "cards" },
  icon: Quote,
  category: "marketing",
})

registerBlock("faq", {
  component: dynamic(() => import("./faq").then(m => ({ default: m.FAQ })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "items", label: "Items (JSON)", type: "textarea" },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "accordion", label: "Accordion" }, { value: "list", label: "List" }] },
  ],
  defaultProps: { heading: "Frequently Asked Questions", items: JSON.stringify([{ q: "Question?", a: "Answer." }]), variant: "accordion" },
  icon: HelpCircle,
  category: "marketing",
})

registerBlock("promoBanner", {
  component: dynamic(() => import("./promo-banner").then(m => ({ default: m.PromoBanner })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "text", label: "Text", type: "text" },
    { name: "buttonText", label: "Button Text", type: "text" },
    { name: "backgroundColor", label: "Background", type: "color" },
    { name: "textColor", label: "Text Color", type: "color" },
    { name: "dismissible", label: "Dismissible", type: "toggle" },
  ],
  defaultProps: { text: "Summer Sale — 20% off everything!", buttonText: "Shop Now", buttonUrl: "#", backgroundColor: "#000000", textColor: "#ffffff", dismissible: false },
  icon: Tag,
  category: "marketing",
})

registerBlock("announcement", {
  component: dynamic(() => import("./announcement").then(m => ({ default: m.Announcement })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "text", label: "Text", type: "text" },
    { name: "dismissible", label: "Dismissible", type: "toggle" },
  ],
  defaultProps: { text: "Free shipping on orders over $50!", dismissible: true },
  icon: Bell,
  category: "marketing",
})

registerBlock("announcementBar", {
  component: dynamic(() => import("./announcement-bar").then(m => ({ default: m.AnnouncementBar })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "text", label: "Text", type: "text" },
    { name: "backgroundColor", label: "Background", type: "color" },
    { name: "textColor", label: "Text Color", type: "color" },
    { name: "linkText", label: "Link Text", type: "text" },
    { name: "closeable", label: "Closeable", type: "toggle" },
  ],
  defaultProps: { text: "Free shipping on orders over $50", backgroundColor: "#000000", textColor: "#ffffff", link: "#", linkText: "Learn more", closeable: false },
  icon: Megaphone,
  category: "marketing",
})

registerBlock("countdownTimer", {
  component: dynamic(() => import("./countdown-timer").then(m => ({ default: m.CountdownTimer })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "targetDate", label: "Target Date (ISO)", type: "text" },
    { name: "expiredText", label: "Expired Text", type: "text" },
  ],
  defaultProps: { heading: "Sale Ends In", targetDate: "2026-12-31T23:59:59", expiredText: "This offer has expired." },
  icon: Timer,
  category: "marketing",
})

registerBlock("trustBadges", {
  component: dynamic(() => import("./trust-badges").then(m => ({ default: m.TrustBadges })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "badges", label: "Badges", type: "list", listFields: [{ key: "icon", label: "Icon (emoji)", type: "text" }, { key: "label", label: "Label", type: "text" }] },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "icons", label: "Icons" }, { value: "text", label: "Text" }] },
  ],
  defaultProps: { badges: JSON.stringify([{ icon: "🚚", label: "Free Shipping" }, { icon: "🔒", label: "Secure Payment" }, { icon: "↩️", label: "Easy Returns" }, { icon: "⭐", label: "5-Star Reviews" }]), variant: "icons" },
  icon: Shield,
  category: "marketing",
})

registerBlock("logoCloud", {
  component: dynamic(() => import("./logo-cloud").then(m => ({ default: m.LogoCloud })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "marketing",
  icon: Building2,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "logos", label: "Logos", type: "list", listFields: [{ key: "name", label: "Name", type: "text" }, { key: "imageUrl", label: "Image URL", type: "text" }] },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "marquee", label: "Marquee" }] },
    { name: "columns", label: "Columns", type: "number" },
  ],
  defaultProps: { heading: "Trusted by leading brands", logos: JSON.stringify([{ name: "Brand 1", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+1" }, { name: "Brand 2", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+2" }, { name: "Brand 3", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+3" }, { name: "Brand 4", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+4" }, { name: "Brand 5", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+5" }, { name: "Brand 6", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+6" }]), variant: "grid", columns: 4 },
})

registerBlock("marquee", {
  component: dynamic(() => import("./marquee").then(m => ({ default: m.Marquee })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "marketing",
  icon: MoveHorizontal,
  fields: [
    { name: "items", label: "Items", type: "list", listFields: [{ key: "text", label: "Text", type: "text" }] },
    { name: "speed", label: "Speed (seconds)", type: "number" },
    { name: "direction", label: "Direction", type: "select", options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }] },
    { name: "pauseOnHover", label: "Pause on Hover", type: "toggle" },
  ],
  defaultProps: { items: JSON.stringify([{ text: "Free Shipping" }, { text: "New Arrivals" }, { text: "Summer Sale" }, { text: "Shop Now" }]), speed: 30, direction: "left", pauseOnHover: true },
})

registerBlock("socialIcons", {
  component: dynamic(() => import("./social-icons").then(m => ({ default: m.SocialIcons })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "links", label: "Links", type: "list", listFields: [{ key: "platform", label: "Platform", type: "text" }, { key: "url", label: "URL", type: "text" }] },
  ],
  defaultProps: { links: JSON.stringify([{ platform: "twitter", url: "#" }, { platform: "instagram", url: "#" }]) },
  icon: CircleDot,
  category: "marketing",
})

registerBlock("socialLinks", {
  component: dynamic(() => import("./social-links").then(m => ({ default: m.SocialLinks })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "marketing",
  icon: Share2,
  fields: [
    { name: "links", label: "Links", type: "list", listFields: [{ key: "platform", label: "Platform", type: "text" }, { key: "url", label: "URL", type: "text" }] },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "icons", label: "Icons" }, { value: "pills", label: "Pills" }, { value: "text", label: "Text" }] },
    { name: "size", label: "Size", type: "select", options: [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }] },
  ],
  defaultProps: { links: JSON.stringify([{ platform: "facebook", url: "#" }, { platform: "instagram", url: "#" }, { platform: "twitter", url: "#" }]), variant: "icons", size: "md" },
})

registerBlock("copyrightBar", {
  component: dynamic(() => import("./copyright-bar").then(m => ({ default: m.CopyrightBar })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "text", label: "Text", type: "text" },
  ],
  defaultProps: { text: "© 2026 My Store. All rights reserved." },
  icon: Copyright,
  category: "marketing",
})

registerBlock("ctCustomerReviews", {
  component: dynamic(() => import("@/components/creative-tim/blocks/customer-overview-example-1").then(m => ({ default: m.default })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Section Title", type: "text" },
  ],
  defaultProps: { heading: "Our Customer's Opinion" },
  icon: Star,
  category: "marketing",
})

registerBlock("ctCategories", {
  component: dynamic(() => import("@/components/creative-tim/blocks/categories-with-full-background").then(m => ({ default: m.default })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Section Title", type: "text" },
  ],
  defaultProps: { heading: "Our Product Categories" },
  icon: FolderOpen,
  category: "marketing",
})
