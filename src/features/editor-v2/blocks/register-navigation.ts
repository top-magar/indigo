import dynamic from "next/dynamic"
import React from "react"
import { BlockSkeleton } from "./block-skeleton"
import { registerBlock } from "../registry"
import { Store, LayoutGrid } from "lucide-react"

registerBlock("header", {
  component: dynamic(() => import("./header").then(m => ({ default: m.Header })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "layout", label: "Layout", type: "select", options: [
      { value: "logo-left", label: "Logo Left" },
      { value: "logo-center", label: "Logo Center" },
      { value: "minimal", label: "Minimal" },
      { value: "split-nav", label: "Split Nav" },
    ]},
    { name: "logo", label: "Logo", type: "image" },
    { name: "storeName", label: "Store Name", type: "text" },
    { name: "navLinks", label: "Nav Links", type: "list", listFields: [{ key: "label", label: "Label", type: "text" }, { key: "url", label: "URL", type: "text" }] },
    { name: "ctaText", label: "CTA Text", type: "text" },
    { name: "ctaUrl", label: "CTA URL", type: "text" },
    { name: "backgroundColor", label: "Background", type: "color" },
    { name: "sticky", label: "Sticky", type: "toggle" },
    { name: "transparent", label: "Transparent", type: "toggle", description: "Transparent on top, solid on scroll" },
    { name: "borderBottom", label: "Border Bottom", type: "toggle" },
    { name: "showSearch", label: "Show Search", type: "toggle" },
    { name: "showCart", label: "Show Cart", type: "toggle" },
    { name: "showAccount", label: "Show Account", type: "toggle" },
    { name: "announcementText", label: "Announcement", type: "text" },
    { name: "announcementBg", label: "Announcement BG", type: "color" },
  ],
  defaultProps: {
    layout: "logo-left", logo: "", storeName: "My Store",
    navLinks: JSON.stringify([{ label: "Shop", url: "#" }, { label: "About", url: "#" }, { label: "Contact", url: "#" }]),
    ctaText: "", ctaUrl: "", backgroundColor: "#ffffff", sticky: true, transparent: false,
    borderBottom: true, showSearch: true, showCart: true, showAccount: false, announcementText: "", announcementBg: "",
  },
  icon: Store,
  category: "navigation",
})

registerBlock("footer", {
  component: dynamic(() => import("./footer").then(m => ({ default: m.Footer })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "layout", label: "Layout", type: "select", options: [
      { value: "columns", label: "Columns" },
      { value: "minimal", label: "Minimal" },
      { value: "big-brand", label: "Big Brand" },
      { value: "centered", label: "Centered" },
    ]},
    { name: "logo", label: "Logo", type: "image" },
    { name: "storeName", label: "Store Name", type: "text" },
    { name: "description", label: "Description", type: "text" },
    { name: "columns", label: "Columns", type: "list", listFields: [{ key: "title", label: "Title", type: "text" }, { key: "links", label: "Links (one per line)", type: "text" }] },
    { name: "copyright", label: "Copyright", type: "text" },
    { name: "showNewsletter", label: "Show Newsletter", type: "toggle" },
    { name: "newsletterHeading", label: "Newsletter Heading", type: "text" },
    { name: "newsletterDescription", label: "Newsletter Description", type: "text" },
    { name: "socialLinks", label: "Social Links", type: "list", listFields: [{ key: "platform", label: "Platform", type: "text" }, { key: "url", label: "URL", type: "text" }] },
    { name: "showPaymentIcons", label: "Show Payment Icons", type: "toggle" },
    { name: "backgroundColor", label: "Background", type: "color" },
    { name: "textColor", label: "Text Color", type: "color" },
  ],
  defaultProps: {
    layout: "columns", logo: "", storeName: "My Store",
    description: "Your one-stop shop for amazing products.",
    columns: JSON.stringify([{ title: "Shop", links: "All Products\nNew Arrivals\nSale" }, { title: "Help", links: "FAQ\nContact\nShipping" }, { title: "Company", links: "About\nBlog\nCareers" }]),
    copyright: "© 2026 My Store. All rights reserved.", showNewsletter: true,
    newsletterHeading: "Newsletter", newsletterDescription: "Stay updated with our latest products.",
    socialLinks: JSON.stringify([{ platform: "twitter", url: "#" }, { platform: "instagram", url: "#" }, { platform: "facebook", url: "#" }]),
    showPaymentIcons: true, backgroundColor: "#111827", textColor: "#f9fafb",
  },
  icon: LayoutGrid,
  category: "navigation",
})
