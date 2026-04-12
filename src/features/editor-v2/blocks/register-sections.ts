import dynamic from "next/dynamic"
import { registerBlock } from "../registry"
import { Heading, HelpCircle, Mail, Quote, Play, Code, Building2, PanelTop, MessageSquare, MapPin, Minus, Share2, Table, MoveHorizontal } from "lucide-react"
import React from "react"
import { BlockSkeleton } from "./block-skeleton"


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
  category: "sections",
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
  category: "sections",
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
  category: "sections",
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
  category: "sections",
})

registerBlock("form", {
  component: dynamic(() => import("./form").then(m => ({ default: m.Form })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "sections",
  icon: Mail,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "buttonText", label: "Button Text", type: "text" },
    { name: "successMessage", label: "Success Message", type: "text" },
    { name: "recipientEmail", label: "Recipient Email", type: "text" },
    { name: "fields", label: "Form Fields", type: "list", listFields: [
      { key: "label", label: "Label", type: "text" },
      { key: "type", label: "Type", type: "text" },
    ]},
  ],
  defaultProps: { heading: "Contact Us", buttonText: "Send Message", successMessage: "Thanks! We'll be in touch.", recipientEmail: "", fields: JSON.stringify([{label:"Name",type:"text"},{label:"Email",type:"email"},{label:"Message",type:"textarea"}]) },
})

registerBlock("video", {
  component: dynamic(() => import("./video").then(m => ({ default: m.Video })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "sections",
  icon: Play,
  fields: [
    { name: "url", label: "Video URL", type: "text" },
    { name: "aspectRatio", label: "Aspect Ratio", type: "select", options: [{ value: "16:9", label: "16:9" }, { value: "4:3", label: "4:3" }, { value: "1:1", label: "1:1" }] },
    { name: "autoplay", label: "Autoplay", type: "toggle" },
    { name: "muted", label: "Muted", type: "toggle" },
  ],
  defaultProps: { url: "", aspectRatio: "16:9", autoplay: false, muted: false },
})

registerBlock("customCode", {
  component: dynamic(() => import("./custom-code").then(m => ({ default: m.CustomCode })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "sections",
  icon: Code,
  fields: [
    { name: "html", label: "HTML", type: "textarea" },
    { name: "css", label: "CSS", type: "textarea" },
  ],
  defaultProps: { html: "", css: "" },
})

registerBlock("logoCloud", {
  component: dynamic(() => import("./logo-cloud").then(m => ({ default: m.LogoCloud })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "sections",
  icon: Building2,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "logos", label: "Logos", type: "list", listFields: [{ key: "name", label: "Name", type: "text" }, { key: "imageUrl", label: "Image URL", type: "text" }] },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "marquee", label: "Marquee" }] },
    { name: "columns", label: "Columns", type: "number" },
  ],
  defaultProps: { heading: "Trusted by leading brands", logos: JSON.stringify([{ name: "Brand 1", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+1" }, { name: "Brand 2", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+2" }, { name: "Brand 3", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+3" }, { name: "Brand 4", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+4" }, { name: "Brand 5", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+5" }, { name: "Brand 6", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+6" }]), variant: "grid", columns: 4 },
})

registerBlock("tabs", {
  component: dynamic(() => import("./tabs").then(m => ({ default: m.Tabs })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "sections",
  icon: PanelTop,
  fields: [
    { name: "tabs", label: "Tabs", type: "list", listFields: [{ key: "title", label: "Title", type: "text" }, { key: "content", label: "Content", type: "text" }] },
  ],
  defaultProps: { tabs: JSON.stringify([{ title: "Tab 1", content: "Content for tab 1." }, { title: "Tab 2", content: "Content for tab 2." }, { title: "Tab 3", content: "Content for tab 3." }]) },
})

registerBlock("popup", {
  component: dynamic(() => import("./popup").then(m => ({ default: m.Popup })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "sections",
  icon: MessageSquare,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "content", label: "Content", type: "textarea" },
    { name: "buttonText", label: "Button Text", type: "text" },
    { name: "trigger", label: "Trigger", type: "select", options: [{ value: "button", label: "Button" }, { value: "timer", label: "Timer" }, { value: "scroll", label: "Scroll" }] },
    { name: "timerDelay", label: "Timer Delay (s)", type: "number" },
    { name: "scrollPercent", label: "Scroll %", type: "number" },
  ],
  defaultProps: { heading: "Special Offer!", content: "<p>Don't miss out on our exclusive deal.</p>", buttonText: "Learn More", trigger: "button", timerDelay: 3, scrollPercent: 50 },
})

registerBlock("map", {
  component: dynamic(() => import("./map").then(m => ({ default: m.Map })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "sections",
  icon: MapPin,
  fields: [
    { name: "address", label: "Address", type: "text" },
    { name: "zoom", label: "Zoom", type: "number" },
    { name: "height", label: "Height", type: "number" },
  ],
  defaultProps: { address: "", zoom: 14, height: 300 },
})

registerBlock("scrollProgress", {
  component: dynamic(() => import("./scroll-progress").then(m => ({ default: m.ScrollProgress })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "sections",
  icon: Minus,
  fields: [
    { name: "color", label: "Color", type: "color" },
    { name: "height", label: "Height", type: "number" },
    { name: "position", label: "Position", type: "select", options: [{ value: "top", label: "Top" }, { value: "bottom", label: "Bottom" }] },
  ],
  defaultProps: { color: "#000000", height: 3, position: "top" },
})

registerBlock("socialLinks", {
  component: dynamic(() => import("./social-links").then(m => ({ default: m.SocialLinks })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "sections",
  icon: Share2,
  fields: [
    { name: "links", label: "Links", type: "list", listFields: [{ key: "platform", label: "Platform", type: "text" }, { key: "url", label: "URL", type: "text" }] },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "icons", label: "Icons" }, { value: "pills", label: "Pills" }, { value: "text", label: "Text" }] },
    { name: "size", label: "Size", type: "select", options: [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }] },
  ],
  defaultProps: { links: JSON.stringify([{ platform: "facebook", url: "#" }, { platform: "instagram", url: "#" }, { platform: "twitter", url: "#" }]), variant: "icons", size: "md" },
})

registerBlock("comparisonTable", {
  component: dynamic(() => import("./comparison-table").then(m => ({ default: m.ComparisonTable })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "sections",
  icon: Table,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "columns", label: "Columns (JSON)", type: "textarea" },
    { name: "rows", label: "Rows (JSON)", type: "textarea" },
  ],
  defaultProps: { heading: "Compare Plans", columns: JSON.stringify([{ name: "Basic", highlighted: false }, { name: "Pro", highlighted: true }, { name: "Enterprise", highlighted: false }]), rows: JSON.stringify([{ feature: "Products", values: [true, true, true] }, { feature: "Analytics", values: [false, true, true] }, { feature: "Support", values: [false, true, true] }, { feature: "Custom Domain", values: [false, false, true] }, { feature: "API Access", values: [false, false, true] }]) },
})

registerBlock("marquee", {
  component: dynamic(() => import("./marquee").then(m => ({ default: m.Marquee })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "sections",
  icon: MoveHorizontal,
  fields: [
    { name: "items", label: "Items", type: "list", listFields: [{ key: "text", label: "Text", type: "text" }] },
    { name: "speed", label: "Speed (seconds)", type: "number" },
    { name: "direction", label: "Direction", type: "select", options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }] },
    { name: "pauseOnHover", label: "Pause on Hover", type: "toggle" },
  ],
  defaultProps: { items: JSON.stringify([{ text: "Free Shipping" }, { text: "New Arrivals" }, { text: "Summer Sale" }, { text: "Shop Now" }]), speed: 30, direction: "left", pauseOnHover: true },
})
