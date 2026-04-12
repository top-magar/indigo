import dynamic from "next/dynamic"
import { registerBlock } from "../registry"
import { Heading, Pilcrow, Navigation, MousePointer, Image as ImageLucide, List, Newspaper, CircleDot, Copyright, Bell } from "lucide-react"

registerBlock("headingBlock", {
  component: dynamic(() => import("./heading").then(m => ({ default: m.HeadingBlock }))),
  fields: [
    { name: "text", label: "Text", type: "text" },
    { name: "level", label: "Level", type: "select", options: [{ value: "h1", label: "H1" }, { value: "h2", label: "H2" }, { value: "h3", label: "H3" }, { value: "h4", label: "H4" }] },
    { name: "alignment", label: "Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
  ],
  defaultProps: { text: "Heading", level: "h2", alignment: "left" },
  icon: Heading,
  category: "primitives",
})

registerBlock("paragraphBlock", {
  component: dynamic(() => import("./paragraph").then(m => ({ default: m.ParagraphBlock }))),
  fields: [
    { name: "text", label: "Text", type: "textarea" },
    { name: "alignment", label: "Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
  ],
  defaultProps: { text: "Paragraph text", alignment: "left" },
  icon: Pilcrow,
  category: "primitives",
})

registerBlock("navLinks", {
  component: dynamic(() => import("./nav-links").then(m => ({ default: m.NavLinks }))),
  fields: [
    { name: "links", label: "Links", type: "list", listFields: [{ key: "label", label: "Label", type: "text" }, { key: "url", label: "URL", type: "text" }] },
    { name: "direction", label: "Direction", type: "select", options: [{ value: "horizontal", label: "Horizontal" }, { value: "vertical", label: "Vertical" }] },
    { name: "gap", label: "Gap", type: "number" },
  ],
  defaultProps: { links: JSON.stringify([{ label: "Home", url: "#" }, { label: "Shop", url: "#" }, { label: "About", url: "#" }]), direction: "horizontal", gap: 16 },
  icon: Navigation,
  category: "primitives",
})

registerBlock("iconButton", {
  component: dynamic(() => import("./icon-button").then(m => ({ default: m.IconButton }))),
  fields: [
    { name: "icon", label: "Icon", type: "select", options: [{ value: "search", label: "Search" }, { value: "user", label: "User" }, { value: "shopping-bag", label: "Shopping Bag" }, { value: "menu", label: "Menu" }, { value: "x", label: "Close" }, { value: "heart", label: "Heart" }] },
    { name: "size", label: "Size", type: "number" },
    { name: "label", label: "Label", type: "text" },
  ],
  defaultProps: { icon: "search", size: 20, label: "" },
  icon: MousePointer,
  category: "primitives",
})

registerBlock("logo", {
  component: dynamic(() => import("./logo").then(m => ({ default: m.Logo }))),
  fields: [
    { name: "src", label: "Logo Image", type: "image" },
    { name: "alt", label: "Store Name", type: "text" },
    { name: "height", label: "Height", type: "number" },
  ],
  defaultProps: { src: "", alt: "My Store", height: 32 },
  icon: ImageLucide,
  category: "primitives",
})

registerBlock("linkGroup", {
  component: dynamic(() => import("./link-group").then(m => ({ default: m.LinkGroup }))),
  fields: [
    { name: "title", label: "Title", type: "text" },
    { name: "links", label: "Links", type: "list", listFields: [{ key: "label", label: "Label", type: "text" }, { key: "url", label: "URL", type: "text" }] },
  ],
  defaultProps: { title: "Links", links: JSON.stringify([{ label: "Link 1", url: "#" }, { label: "Link 2", url: "#" }]) },
  icon: List,
  category: "primitives",
})

registerBlock("newsletterForm", {
  component: dynamic(() => import("./newsletter-form").then(m => ({ default: m.NewsletterForm }))),
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "description", label: "Description", type: "text" },
    { name: "buttonText", label: "Button Text", type: "text" },
  ],
  defaultProps: { heading: "Newsletter", description: "Stay updated.", buttonText: "Subscribe" },
  icon: Newspaper,
  category: "primitives",
})

registerBlock("socialIcons", {
  component: dynamic(() => import("./social-icons").then(m => ({ default: m.SocialIcons }))),
  fields: [
    { name: "links", label: "Links", type: "list", listFields: [{ key: "platform", label: "Platform", type: "text" }, { key: "url", label: "URL", type: "text" }] },
  ],
  defaultProps: { links: JSON.stringify([{ platform: "twitter", url: "#" }, { platform: "instagram", url: "#" }]) },
  icon: CircleDot,
  category: "primitives",
})

registerBlock("copyrightBar", {
  component: dynamic(() => import("./copyright-bar").then(m => ({ default: m.CopyrightBar }))),
  fields: [
    { name: "text", label: "Text", type: "text" },
  ],
  defaultProps: { text: "© 2026 My Store. All rights reserved." },
  icon: Copyright,
  category: "primitives",
})

registerBlock("announcement", {
  component: dynamic(() => import("./announcement").then(m => ({ default: m.Announcement }))),
  fields: [
    { name: "text", label: "Text", type: "text" },
    { name: "dismissible", label: "Dismissible", type: "toggle" },
  ],
  defaultProps: { text: "Free shipping on orders over $50!", dismissible: true },
  icon: Bell,
  category: "primitives",
})
