import dynamic from "next/dynamic"
import React from "react"
import { BlockSkeleton } from "./block-skeleton"
import { registerBlock } from "../registry"
import { MousePointerClick, Navigation, MousePointer, Image as ImageLucide, List, PanelTop, MessageSquare, Mail, Minus } from "lucide-react"


registerBlock("button", {
  component: dynamic(() => import("./button").then(m => ({ default: m.Button })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "text", label: "Label", type: "text" },
    { name: "href", label: "URL", type: "text" },
    { name: "variant", label: "Style", type: "select", options: [{ value: "solid", label: "Solid" }, { value: "outline", label: "Outline" }, { value: "ghost", label: "Ghost" }] },
    { name: "size", label: "Size", type: "select", options: [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }] },
    { name: "color", label: "Color", type: "color" },
  ],
  defaultProps: { text: "Click me", href: "#", variant: "solid", size: "md", color: "#000000" },
  icon: MousePointerClick,
  category: "interactive",
})

registerBlock("iconButton", {
  component: dynamic(() => import("./icon-button").then(m => ({ default: m.IconButton })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "icon", label: "Icon", type: "select", options: [{ value: "search", label: "Search" }, { value: "user", label: "User" }, { value: "shopping-bag", label: "Shopping Bag" }, { value: "menu", label: "Menu" }, { value: "x", label: "Close" }, { value: "heart", label: "Heart" }] },
    { name: "size", label: "Size", type: "number" },
    { name: "label", label: "Label", type: "text" },
  ],
  defaultProps: { icon: "search", size: 20, label: "" },
  icon: MousePointer,
  category: "interactive",
})

registerBlock("navLinks", {
  component: dynamic(() => import("./nav-links").then(m => ({ default: m.NavLinks })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "links", label: "Links", type: "list", listFields: [{ key: "label", label: "Label", type: "text" }, { key: "url", label: "URL", type: "text" }] },
    { name: "direction", label: "Direction", type: "select", options: [{ value: "horizontal", label: "Horizontal" }, { value: "vertical", label: "Vertical" }] },
    { name: "gap", label: "Gap", type: "number" },
  ],
  defaultProps: { links: JSON.stringify([{ label: "Home", url: "#" }, { label: "Shop", url: "#" }, { label: "About", url: "#" }]), direction: "horizontal", gap: 16 },
  icon: Navigation,
  category: "interactive",
})

registerBlock("logo", {
  component: dynamic(() => import("./logo").then(m => ({ default: m.Logo })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "src", label: "Logo Image", type: "image" },
    { name: "alt", label: "Store Name", type: "text" },
    { name: "height", label: "Height", type: "number" },
  ],
  defaultProps: { src: "", alt: "My Store", height: 32 },
  icon: ImageLucide,
  category: "interactive",
})

registerBlock("linkGroup", {
  component: dynamic(() => import("./link-group").then(m => ({ default: m.LinkGroup })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "title", label: "Title", type: "text" },
    { name: "links", label: "Links", type: "list", listFields: [{ key: "label", label: "Label", type: "text" }, { key: "url", label: "URL", type: "text" }] },
  ],
  defaultProps: { title: "Links", links: JSON.stringify([{ label: "Link 1", url: "#" }, { label: "Link 2", url: "#" }]) },
  icon: List,
  category: "interactive",
})

registerBlock("tabs", {
  component: dynamic(() => import("./tabs").then(m => ({ default: m.Tabs })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "interactive",
  icon: PanelTop,
  fields: [
    { name: "tabs", label: "Tabs", type: "list", listFields: [{ key: "title", label: "Title", type: "text" }, { key: "content", label: "Content", type: "text" }] },
  ],
  defaultProps: { tabs: JSON.stringify([{ title: "Tab 1", content: "Content for tab 1." }, { title: "Tab 2", content: "Content for tab 2." }, { title: "Tab 3", content: "Content for tab 3." }]) },
})

registerBlock("form", {
  component: dynamic(() => import("./form").then(m => ({ default: m.Form })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "interactive",
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

registerBlock("popup", {
  component: dynamic(() => import("./popup").then(m => ({ default: m.Popup })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "interactive",
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

registerBlock("scrollProgress", {
  component: dynamic(() => import("./scroll-progress").then(m => ({ default: m.ScrollProgress })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "interactive",
  icon: Minus,
  fields: [
    { name: "color", label: "Color", type: "color" },
    { name: "height", label: "Height", type: "number" },
    { name: "position", label: "Position", type: "select", options: [{ value: "top", label: "Top" }, { value: "bottom", label: "Bottom" }] },
  ],
  defaultProps: { color: "#000000", height: 3, position: "top" },
})
